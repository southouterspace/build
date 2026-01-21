import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, and } from "drizzle-orm";
import type { AppContext } from "../index";
import { getTenantContext, isAdmin } from "../lib/tenant";
import * as schema from "@shared/schema";
import { CreateTagSchema } from "@shared/types";

export const tagsRoutes = new Hono<AppContext>();

// List tags for current org
tagsRoutes.get("/", async (c) => {
  const db = c.get("db");
  const auth = c.get("auth");
  const tenant = await getTenantContext(c, db, auth);

  if (!tenant) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const tags = await db
    .select()
    .from(schema.tags)
    .where(eq(schema.tags.orgId, tenant.org.id))
    .orderBy(schema.tags.name);

  return c.json({ tags });
});

// Create tag (admin only)
tagsRoutes.post("/", zValidator("json", CreateTagSchema), async (c) => {
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

  // Check for duplicate tag name within org
  const [existing] = await db
    .select()
    .from(schema.tags)
    .where(and(eq(schema.tags.orgId, tenant.org.id), eq(schema.tags.name, data.name)))
    .limit(1);

  if (existing) {
    return c.json({ error: "A tag with this name already exists" }, 400);
  }

  const [tag] = await db
    .insert(schema.tags)
    .values({
      orgId: tenant.org.id,
      name: data.name,
      color: data.color ?? "#6B7280",
    })
    .returning();

  return c.json({ tag }, 201);
});

// Update tag (admin only)
tagsRoutes.patch("/:id", zValidator("json", CreateTagSchema.partial()), async (c) => {
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

  // Verify tag belongs to org
  const [existing] = await db
    .select()
    .from(schema.tags)
    .where(and(eq(schema.tags.id, id), eq(schema.tags.orgId, tenant.org.id)))
    .limit(1);

  if (!existing) {
    return c.json({ error: "Tag not found" }, 404);
  }

  // Check for duplicate name if changing
  if (data.name && data.name !== existing.name) {
    const [duplicate] = await db
      .select()
      .from(schema.tags)
      .where(and(eq(schema.tags.orgId, tenant.org.id), eq(schema.tags.name, data.name)))
      .limit(1);

    if (duplicate) {
      return c.json({ error: "A tag with this name already exists" }, 400);
    }
  }

  const [tag] = await db
    .update(schema.tags)
    .set(data)
    .where(eq(schema.tags.id, id))
    .returning();

  return c.json({ tag });
});

// Delete tag (admin only)
tagsRoutes.delete("/:id", async (c) => {
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

  // Verify tag belongs to org
  const [existing] = await db
    .select()
    .from(schema.tags)
    .where(and(eq(schema.tags.id, id), eq(schema.tags.orgId, tenant.org.id)))
    .limit(1);

  if (!existing) {
    return c.json({ error: "Tag not found" }, 404);
  }

  await db.delete(schema.tags).where(eq(schema.tags.id, id));

  return c.json({ success: true });
});
