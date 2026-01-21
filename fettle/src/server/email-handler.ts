import PostalMime from "postal-mime";
import type { Env } from "./lib/auth";
import { createDb } from "./lib/db";
import { createAiClient, extractRequestFromEmail } from "./lib/ai";
import { resolveInboxFromEmail, getFieldsForInbox } from "./lib/tenant";
import * as schema from "@shared/schema";
import { eq, and, inArray } from "drizzle-orm";
import type { CustomFieldDefinition } from "@shared/types";
import { Resend } from "resend";

// Cloudflare Email Message type
interface EmailMessage {
  readonly from: string;
  readonly to: string;
  readonly raw: ReadableStream<Uint8Array>;
  readonly rawSize: number;
  readonly headers: Headers;
  setReject(reason: string): void;
  forward(to: string, headers?: Headers): Promise<void>;
}

/**
 * Cloudflare Email Worker handler
 * Receives emails and processes them into requests
 */
export async function handleEmail(message: EmailMessage, env: Env): Promise<void> {
  const db = createDb(env.DB);
  const appDomain = env.APP_DOMAIN || "fettle.app";

  // Parse the email address to determine org/inbox
  const resolved = await resolveInboxFromEmail(db, message.to, appDomain);

  if (!resolved) {
    console.error(`Could not resolve inbox for email: ${message.to}`);
    message.setReject(`Unknown recipient: ${message.to}`);
    return;
  }

  const { org, inbox } = resolved;

  // Parse the raw email content
  const parser = new PostalMime();
  const rawEmail = await new Response(message.raw).arrayBuffer();
  const parsed = await parser.parse(rawEmail);

  const from = message.from;
  const subject = parsed.subject || "(no subject)";
  const emailBody = parsed.text || parsed.html || "";

  // Generate a unique ID for this email
  const emailId = `cf-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

  // Get custom field definitions for AI extraction (org-wide + inbox-specific)
  const customFieldDefs = await getFieldsForInbox(db, org.id, inbox.id);

  // Extract request data using AI
  const aiClient = createAiClient(env.ANTHROPIC_API_KEY);
  const extracted = await extractRequestFromEmail(
    aiClient,
    { from, subject, body: emailBody },
    customFieldDefs as CustomFieldDefinition[]
  );

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
    await db
      .update(schema.requests)
      .set({ requesterUserId: existingMember.userId })
      .where(eq(schema.requests.id, request.id));
  }

  // Send confirmation email via Resend
  if (env.RESEND_API_KEY) {
    try {
      const resend = new Resend(env.RESEND_API_KEY);
      const fromEmail = `${inbox.slug}@${org.slug}.${appDomain}`;
      const trackingUrl = `${env.BETTER_AUTH_URL}/requests/${request.id}`;

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
  }

  console.log(`Processed email from ${from} -> request ${request.id} in ${org.slug}/${inbox.slug}`);
}
