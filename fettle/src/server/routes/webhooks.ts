import { Hono } from "hono";
import { Resend } from "resend";
import type { Env } from "../lib/auth";
import type { Database } from "../lib/db";
import { createDb } from "../lib/db";
import { createAiClient, extractRequestFromEmail } from "../lib/ai";
import { resolveInboxFromEmail, getFieldsForInbox } from "../lib/tenant";
import * as schema from "@shared/schema";
import { eq, and, inArray } from "drizzle-orm";
import type { CustomFieldDefinition } from "@shared/types";

type Variables = {
  db: Database;
};

export const webhooksRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// Resend inbound email webhook
webhooksRoutes.post("/inbound", async (c) => {
  const db = createDb(c.env.DB);

  // Parse webhook payload
  const payload = await c.req.json<{
    type: string;
    data: {
      id: string;
      from: string;
      to: string[];
      subject: string;
      created_at: string;
    };
  }>();

  if (payload.type !== "email.received") {
    return c.json({ received: true });
  }

  const { id: emailId, from, to, subject } = payload.data;

  // Resolve org and inbox from email address
  const toAddress = to[0]; // Primary recipient
  const appDomain = c.env.APP_DOMAIN || "fettle.app";
  const resolved = await resolveInboxFromEmail(db, toAddress, appDomain);

  if (!resolved) {
    console.error(`Could not resolve inbox for email: ${toAddress}`);
    return c.json({ error: "Unknown recipient" }, 400);
  }

  const { org, inbox } = resolved;

  // Fetch full email body from Resend API
  const resend = new Resend(c.env.RESEND_API_KEY);

  let emailBody = "";
  try {
    const response = await fetch(`https://api.resend.com/emails/${emailId}`, {
      headers: {
        Authorization: `Bearer ${c.env.RESEND_API_KEY}`,
      },
    });

    if (response.ok) {
      const emailData = (await response.json()) as { text?: string; html?: string };
      emailBody = emailData.text || emailData.html || "";
    }
  } catch (error) {
    console.error("Failed to fetch email body:", error);
    emailBody = `Subject: ${subject}`;
  }

  // Get custom field definitions for AI extraction (org-wide + inbox-specific)
  const customFieldDefs = await getFieldsForInbox(db, org.id, inbox.id);

  // Extract request data using AI
  const aiClient = createAiClient(c.env.ANTHROPIC_API_KEY);
  const extracted = await extractRequestFromEmail(aiClient, { from, subject, body: emailBody }, customFieldDefs as CustomFieldDefinition[]);

  // Create the request
  const [request] = await db
    .insert(schema.requests)
    .values({
      orgId: org.id,
      inboxId: inbox.id,
      title: extracted.title,
      description: extracted.description,
      requesterEmail: from,
      source: "email",
      originalEmailId: emailId,
      category: extracted.category,
      productArea: extracted.productArea,
      status: "new",
    })
    .returning();

  // Add tags (scoped to org)
  if (extracted.tags.length > 0) {
    // Get existing tags in this org
    const existingTags = await db
      .select()
      .from(schema.tags)
      .where(and(eq(schema.tags.orgId, org.id), inArray(schema.tags.name, extracted.tags)));

    const existingTagNames = new Set(existingTags.map((t) => t.name));
    const newTagNames = extracted.tags.filter((t) => !existingTagNames.has(t));

    // Create new tags for this org
    if (newTagNames.length > 0) {
      await db.insert(schema.tags).values(
        newTagNames.map((name) => ({
          orgId: org.id,
          name,
        }))
      );
    }

    // Get all matching tags
    const allTags = await db
      .select()
      .from(schema.tags)
      .where(and(eq(schema.tags.orgId, org.id), inArray(schema.tags.name, extracted.tags)));

    if (allTags.length > 0) {
      await db.insert(schema.requestTags).values(
        allTags.map((tag) => ({
          requestId: request.id,
          tagId: tag.id,
        }))
      );
    }
  }

  // Save custom field values
  if (extracted.customFields && Object.keys(extracted.customFields).length > 0) {
    const fieldMap = new Map(customFieldDefs.map((f) => [f.name, f.id]));

    const values = Object.entries(extracted.customFields)
      .filter(([name]) => fieldMap.has(name))
      .map(([name, value]) => ({
        requestId: request.id,
        fieldId: fieldMap.get(name)!,
        value: typeof value === "object" ? JSON.stringify(value) : String(value),
      }));

    if (values.length > 0) {
      await db.insert(schema.customFieldValues).values(values);
    }
  }

  // Try to link to existing user who is a member of this org
  const [existingMember] = await db
    .select({
      userId: schema.users.id,
    })
    .from(schema.users)
    .innerJoin(schema.orgMemberships, eq(schema.users.id, schema.orgMemberships.userId))
    .where(and(eq(schema.users.email, from), eq(schema.orgMemberships.orgId, org.id)))
    .limit(1);

  if (existingMember) {
    await db.update(schema.requests).set({ requesterUserId: existingMember.userId }).where(eq(schema.requests.id, request.id));
  }

  // Send confirmation email
  try {
    const fromEmail = `${inbox.slug}@${org.slug}.${appDomain}`;
    const trackingUrl = `${c.env.BETTER_AUTH_URL}/${org.slug}/requests/${request.id}`;

    await resend.emails.send({
      from: fromEmail,
      to: from,
      subject: `Re: ${subject}`,
      text: `Thank you for your request. We've received it and assigned it ID: ${request.id}.

Title: ${extracted.title}
Category: ${extracted.category || "Uncategorized"}

You can track your request at: ${trackingUrl}

Best regards,
${org.name}`,
    });
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
  }

  return c.json({ received: true, requestId: request.id });
});
