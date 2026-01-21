import { Hono } from "hono";
import { Resend } from "resend";
import type { Env } from "../lib/auth";
import type { Database } from "../lib/db";
import { createDb } from "../lib/db";
import { createAiClient, extractRequestFromEmail } from "../lib/ai";
import * as schema from "@shared/schema";
import { eq, inArray } from "drizzle-orm";
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

  const { id: emailId, from, subject } = payload.data;

  // Fetch full email body from Resend API
  const resend = new Resend(c.env.RESEND_API_KEY);

  let emailBody = "";
  try {
    // Note: This is a simplified version - Resend API may require different endpoint
    const response = await fetch(`https://api.resend.com/emails/${emailId}`, {
      headers: {
        Authorization: `Bearer ${c.env.RESEND_API_KEY}`,
      },
    });

    if (response.ok) {
      const emailData = await response.json() as { text?: string; html?: string };
      emailBody = emailData.text || emailData.html || "";
    }
  } catch (error) {
    console.error("Failed to fetch email body:", error);
    emailBody = `Subject: ${subject}`;
  }

  // Get custom field definitions for AI extraction
  const customFieldDefs = await db.select().from(schema.customFieldDefinitions);

  // Extract request data using AI
  const aiClient = createAiClient(c.env.ANTHROPIC_API_KEY);
  const extracted = await extractRequestFromEmail(
    aiClient,
    { from, subject, body: emailBody },
    customFieldDefs as CustomFieldDefinition[]
  );

  // Create the request
  const [request] = await db
    .insert(schema.requests)
    .values({
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

  // Add tags
  if (extracted.tags.length > 0) {
    // Get or create tags
    const existingTags = await db
      .select()
      .from(schema.tags)
      .where(inArray(schema.tags.name, extracted.tags));

    const existingTagNames = new Set(existingTags.map((t) => t.name));
    const newTagNames = extracted.tags.filter((t) => !existingTagNames.has(t));

    if (newTagNames.length > 0) {
      await db.insert(schema.tags).values(newTagNames.map((name) => ({ name })));
    }

    const allTags = await db
      .select()
      .from(schema.tags)
      .where(inArray(schema.tags.name, extracted.tags));

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

  // Try to link to existing user
  const [existingUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, from))
    .limit(1);

  if (existingUser) {
    await db
      .update(schema.requests)
      .set({ requesterUserId: existingUser.id })
      .where(eq(schema.requests.id, request.id));
  }

  // Send confirmation email
  try {
    await resend.emails.send({
      from: "requests@yourdomain.com", // Configure this
      to: from,
      subject: `Re: ${subject}`,
      text: `Thank you for your request. We've received it and assigned it ID: ${request.id}.

Title: ${extracted.title}
Category: ${extracted.category || "Uncategorized"}

You can track your request at: ${c.env.BETTER_AUTH_URL}/requests/${request.id}

Best regards,
The Product Team`,
    });
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
  }

  return c.json({ received: true, requestId: request.id });
});
