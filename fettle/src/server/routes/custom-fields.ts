import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import type { Env, Auth } from "../lib/auth";
import type { Database } from "../lib/db";
import * as schema from "@shared/schema";
import { CreateCustomFieldSchema, UpdateCustomFieldSchema } from "@shared/types";

type Variables = {
  db: Database;
  auth: Auth;
  user: { id: string; email: string; role: string } | null;
};

export const customFieldsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// Auth middleware
customFieldsRoutes.use("*", async (c, next) => {
  const auth = c.get("auth");
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("user", session?.user as Variables["user"] | null);
  await next();
});

// List custom field definitions
customFieldsRoutes.get("/", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = c.get("db");
  const fields = await db
    .select()
    .from(schema.customFieldDefinitions)
    .orderBy(schema.customFieldDefinitions.displayOrder);

  return c.json({ fields });
});

// Create custom field definition (admin only)
customFieldsRoutes.post("/", zValidator("json", CreateCustomFieldSchema), async (c) => {
  const user = c.get("user");
  if (!user || user.role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const db = c.get("db");
  const data = c.req.valid("json");

  // Validate that select/multi_select have options
  if ((data.fieldType === "select" || data.fieldType === "multi_select") && (!data.options || data.options.length === 0)) {
    return c.json({ error: "Select fields require at least one option" }, 400);
  }

  const [field] = await db
    .insert(schema.customFieldDefinitions)
    .values({
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
  const user = c.get("user");
  if (!user || user.role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const db = c.get("db");
  const id = c.req.param("id");
  const data = c.req.valid("json");

  // Validate options for select types
  if (data.fieldType && (data.fieldType === "select" || data.fieldType === "multi_select")) {
    if (!data.options || data.options.length === 0) {
      return c.json({ error: "Select fields require at least one option" }, 400);
    }
  }

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

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

  if (!field) {
    return c.json({ error: "Custom field not found" }, 404);
  }

  return c.json({ field });
});

// Delete custom field definition (admin only)
customFieldsRoutes.delete("/:id", async (c) => {
  const user = c.get("user");
  if (!user || user.role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const db = c.get("db");
  const id = c.req.param("id");

  // This will cascade delete all values
  await db.delete(schema.customFieldDefinitions).where(eq(schema.customFieldDefinitions.id, id));

  return c.json({ success: true });
});

// Reorder custom fields (admin only)
customFieldsRoutes.post("/reorder", zValidator("json", zValidator("json", { ids: ["string"] } as any)), async (c) => {
  const user = c.get("user");
  if (!user || user.role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const db = c.get("db");
  const { ids } = await c.req.json<{ ids: string[] }>();

  // Update display order based on array position
  for (let i = 0; i < ids.length; i++) {
    await db
      .update(schema.customFieldDefinitions)
      .set({ displayOrder: i })
      .where(eq(schema.customFieldDefinitions.id, ids[i]));
  }

  return c.json({ success: true });
});
