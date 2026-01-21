import Anthropic from "@anthropic-ai/sdk";
import type { CustomFieldDefinition, AiExtractionResult } from "@shared/types";

export function createAiClient(apiKey: string) {
  return new Anthropic({ apiKey });
}

export async function extractRequestFromEmail(
  client: Anthropic,
  email: { from: string; subject: string; body: string },
  customFields: CustomFieldDefinition[]
): Promise<AiExtractionResult> {
  const customFieldsSchema = customFields
    .filter((f) => f.isAiExtracted)
    .map((f) => {
      let typeHint = f.fieldType;
      if (f.options?.length) {
        typeHint = `one of: ${f.options.join(", ")}` as typeof f.fieldType;
      }
      return `  "${f.name}": ${typeHint}${f.description ? ` // ${f.description}` : ""}`;
    })
    .join("\n");

  const prompt = `Extract structured fields from this email request.

From: ${email.from}
Subject: ${email.subject}
Body: ${email.body}

Return JSON matching this schema:

BASE FIELDS:
{
  "title": "concise summary (max 80 chars)",
  "description": "full context and requirements",
  "category": "feature" | "bug" | "data" | "integration" | "other" | null,
  "productArea": "inferred area or null",
  "tags": ["inferred division/team based on sender or content"],
  "urgencyHint": "critical" | "standard" | "low" | null
}
${
  customFieldsSchema
    ? `
CUSTOM FIELDS (extract if mentioned or inferable, omit if not determinable):
{
${customFieldsSchema}
}
`
    : ""
}
Guidelines:
- Title should be actionable: "Add PDF export to dashboards" not "PDF question"
- Category: bug = something broken, feature = new capability, data = reports/exports
- Tags: infer from sender domain, signature, or explicit mentions (marketing, sales, engineering, etc.)
- Urgency: critical only if explicit deadline or blocking language

Return ONLY valid JSON, no markdown or explanation.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from AI");
  }

  try {
    const parsed = JSON.parse(content.text);
    return {
      title: parsed.title || email.subject,
      description: parsed.description || email.body,
      category: parsed.category || null,
      productArea: parsed.productArea || null,
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      urgencyHint: parsed.urgencyHint || null,
      customFields: parsed.customFields || {},
    };
  } catch {
    // Fallback if AI response isn't valid JSON
    return {
      title: email.subject,
      description: email.body,
      category: null,
      productArea: null,
      tags: [],
      urgencyHint: null,
    };
  }
}
