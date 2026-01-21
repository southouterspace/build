import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, and, or, isNull } from "drizzle-orm";
import { z } from "zod";
import type { AppContext } from "../index";
import { getTenantContext, isAdmin } from "../lib/tenant";
import * as schema from "@shared/schema";
import { CreateCustomFieldSchema, UpdateCustomFieldSchema } from "@shared/types";

export const customFieldsRoutes = new Hono<AppContext>();

// List custom field definitions for current org
// Optionally filter by inboxId query param
customFieldsRoutes.get("/", async (c) => {
  const db = c.get("db");
  const auth = c.get("auth");
  const tenant = await getTenantContext(c, db, auth);

  if (!tenant) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const inboxId = c.req.query("inboxId");

  let fields;
  if (inboxId) {
    // Get org-wide fields + inbox-specific fields
    fields = await db
      .select()
      .from(schema.customFieldDefinitions)
      .where(
        and(
          eq(schema.customFieldDefinitions.orgId, tenant.org.id),
          or(isNull(schema.customFieldDefinitions.inboxId), eq(schema.customFieldDefinitions.inboxId, inboxId))
        )
      )
      .orderBy(schema.customFieldDefinitions.displayOrder);
  } else {
    // Get all org fields
    fields = await db
      .select()
      .from(schema.customFieldDefinitions)
      .where(eq(schema.customFieldDefinitions.orgId, tenant.org.id))
      .orderBy(schema.customFieldDefinitions.displayOrder);
  }

  return c.json({ fields });
});

// Create custom field definition (admin only)
customFieldsRoutes.post("/", zValidator("json", CreateCustomFieldSchema), async (c) => {
  const db = c.get("db");
  const auth = c.get("auth");
  const tenant = await getTenantContext(c, db, auth);

  if (!tenant) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!isAdmin(tenant)) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const data = c.req.valid("json");

  // Validate inboxId belongs to org if provided
  if (data.inboxId) {
    const [inbox] = await db
      .select()
      .from(schema.inboxes)
      .where(and(eq(schema.inboxes.id, data.inboxId), eq(schema.inboxes.orgId, tenant.org.id)))
      .limit(1);

    if (!inbox) {
      return c.json({ error: "Inbox not found" }, 404);
    }
  }

  // Validate that select/multi_select have options
  if ((data.fieldType === "select" || data.fieldType === "multi_select") && (!data.options || data.options.length === 0)) {
    return c.json({ error: "Select fields require at least one option" }, 400);
  }

  // Check for duplicate field name within org (and same inbox scope)
  const [existing] = await db
    .select()
    .from(schema.customFieldDefinitions)
    .where(
      and(
        eq(schema.customFieldDefinitions.orgId, tenant.org.id),
        eq(schema.customFieldDefinitions.name, data.name),
        data.inboxId ? eq(schema.customFieldDefinitions.inboxId, data.inboxId) : isNull(schema.customFieldDefinitions.inboxId)
      )
    )
    .limit(1);

  if (existing) {
    return c.json({ error: "A custom field with this name already exists" }, 400);
  }

  const [field] = await db
    .insert(schema.customFieldDefinitions)
    .values({
      orgId: tenant.org.id,
      inboxId: data.inboxId ?? null,
      name: data.name,
      label: data.label,
      description: data.description,
      fieldType: data.fieldType,
      options: data.options ?? null,
      isRequired: data.isRequired ?? false,
      isAiExtracted: data.isAiExtracted ?? true,
      displayOrder: data.displayOrder ?? 0,
    })
    .returning();

  return c.json({ field }, 201);
});

// Update custom field definition (admin only)
customFieldsRoutes.patch("/:id", zValidator("json", UpdateCustomFieldSchema), async (c) => {
  const db = c.get("db");
  const auth = c.get("auth");
  const tenant = await getTenantContext(c, db, auth);

  if (!tenant) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!isAdmin(tenant)) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const id = c.req.param("id");
  const data = c.req.valid("json");

  // Verify field belongs to org
  const [existing] = await db
    .select()
    .from(schema.customFieldDefinitions)
    .where(and(eq(schema.customFieldDefinitions.id, id), eq(schema.customFieldDefinitions.orgId, tenant.org.id)))
    .limit(1);

  if (!existing) {
    return c.json({ error: "Custom field not found" }, 404);
  }

  // Validate new inboxId if changing
  if (data.inboxId !== undefined && data.inboxId !== null) {
    const [inbox] = await db
      .select()
      .from(schema.inboxes)
      .where(and(eq(schema.inboxes.id, data.inboxId), eq(schema.inboxes.orgId, tenant.org.id)))
      .limit(1);

    if (!inbox) {
      return c.json({ error: "Inbox not found" }, 404);
    }
  }

  // Validate options for select types
  const effectiveFieldType = data.fieldType ?? existing.fieldType;
  if (effectiveFieldType === "select" || effectiveFieldType === "multi_select") {
    const effectiveOptions = data.options ?? existing.options;
    if (!effectiveOptions || effectiveOptions.length === 0) {
      return c.json({ error: "Select fields require at least one option" }, 400);
    }
  }

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (data.inboxId !== undefined) updateData.inboxId = data.inboxId;
  if (data.name !== undefined) updateData.name = data.name;
  if (data.label !== undefined) updateData.label = data.label;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.fieldType !== undefined) updateData.fieldType = data.fieldType;
  if (data.options !== undefined) updateData.options = data.options;
  if (data.isRequired !== undefined) updateData.isRequired = data.isRequired;
  if (data.isAiExtracted !== undefined) updateData.isAiExtracted = data.isAiExtracted;
  if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;

  const [field] = await db
    .update(schema.customFieldDefinitions)
    .set(updateData)
    .where(eq(schema.customFieldDefinitions.id, id))
    .returning();

  return c.json({ field });
});

// Delete custom field definition (admin only)
customFieldsRoutes.delete("/:id", async (c) => {
  const db = c.get("db");
  const auth = c.get("auth");
  const tenant = await getTenantContext(c, db, auth);

  if (!tenant) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!isAdmin(tenant)) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const id = c.req.param("id");

  // Verify field belongs to org
  const [existing] = await db
    .select()
    .from(schema.customFieldDefinitions)
    .where(and(eq(schema.customFieldDefinitions.id, id), eq(schema.customFieldDefinitions.orgId, tenant.org.id)))
    .limit(1);

  if (!existing) {
    return c.json({ error: "Custom field not found" }, 404);
  }

  // This will cascade delete all values
  await db.delete(schema.customFieldDefinitions).where(eq(schema.customFieldDefinitions.id, id));

  return c.json({ success: true });
});

// Reorder custom fields (admin only)
const ReorderSchema = z.object({
  ids: z.array(z.string().uuid()),
});

customFieldsRoutes.post("/reorder", zValidator("json", ReorderSchema), async (c) => {
  const db = c.get("db");
  const auth = c.get("auth");
  const tenant = await getTenantContext(c, db, auth);

  if (!tenant) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!isAdmin(tenant)) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const { ids } = c.req.valid("json");

  // Verify all fields belong to org
  const fields = await db
    .select({ id: schema.customFieldDefinitions.id })
    .from(schema.customFieldDefinitions)
    .where(eq(schema.customFieldDefinitions.orgId, tenant.org.id));

  const orgFieldIds = new Set(fields.map((f) => f.id));
  const invalidIds = ids.filter((id) => !orgFieldIds.has(id));

  if (invalidIds.length > 0) {
    return c.json({ error: "Some field IDs are invalid or don't belong to this organization" }, 400);
  }

  // Update display order based on array position
  for (let i = 0; i < ids.length; i++) {
    await db
      .update(schema.customFieldDefinitions)
      .set({ displayOrder: i })
      .where(eq(schema.customFieldDefinitions.id, ids[i]));
  }

  return c.json({ success: true });
});
