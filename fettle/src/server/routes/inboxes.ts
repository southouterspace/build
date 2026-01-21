import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, and } from "drizzle-orm";
import type { AppContext } from "../index";
import { getTenantContext, isAdmin } from "../lib/tenant";
import * as schema from "@shared/schema";
import { CreateInboxSchema, UpdateInboxSchema } from "@shared/types";

export const inboxesRoutes = new Hono<AppContext>();

// List inboxes for current org
inboxesRoutes.get("/", async (c) => {
  const db = c.get("db");
  const auth = c.get("auth");
  const tenant = await getTenantContext(c, db, auth);

  if (!tenant) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const inboxes = await db
    .select()
    .from(schema.inboxes)
    .where(eq(schema.inboxes.orgId, tenant.org.id))
    .orderBy(schema.inboxes.name);

  // Add computed email address
  const inboxesWithEmail = inboxes.map((inbox) => ({
    ...inbox,
    emailAddress: `${inbox.slug}@${tenant.org.slug}.fettle.app`,
  }));

  return c.json({ inboxes: inboxesWithEmail });
});

// Get single inbox
inboxesRoutes.get("/:id", async (c) => {
  const db = c.get("db");
  const auth = c.get("auth");
  const tenant = await getTenantContext(c, db, auth);

  if (!tenant) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");
  const [inbox] = await db
    .select()
    .from(schema.inboxes)
    .where(and(eq(schema.inboxes.id, id), eq(schema.inboxes.orgId, tenant.org.id)))
    .limit(1);

  if (!inbox) {
    return c.json({ error: "Inbox not found" }, 404);
  }

  return c.json({
    inbox: {
      ...inbox,
      emailAddress: `${inbox.slug}@${tenant.org.slug}.fettle.app`,
    },
  });
});

// Create inbox (admin only)
inboxesRoutes.post("/", zValidator("json", CreateInboxSchema), async (c) => {
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

  // Check if slug already exists for this org
  const [existing] = await db
    .select()
    .from(schema.inboxes)
    .where(and(eq(schema.inboxes.orgId, tenant.org.id), eq(schema.inboxes.slug, data.slug)))
    .limit(1);

  if (existing) {
    return c.json({ error: "An inbox with this slug already exists" }, 400);
  }

  // If setting as default, unset other defaults
  if (data.isDefault) {
    await db
      .update(schema.inboxes)
      .set({ isDefault: false })
      .where(eq(schema.inboxes.orgId, tenant.org.id));
  }

  const [inbox] = await db
    .insert(schema.inboxes)
    .values({
      orgId: tenant.org.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      isDefault: data.isDefault ?? false,
    })
    .returning();

  return c.json(
    {
      inbox: {
        ...inbox,
        emailAddress: `${inbox.slug}@${tenant.org.slug}.fettle.app`,
      },
    },
    201
  );
});

// Update inbox (admin only)
inboxesRoutes.patch("/:id", zValidator("json", UpdateInboxSchema), async (c) => {
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

  // Verify inbox belongs to org
  const [existing] = await db
    .select()
    .from(schema.inboxes)
    .where(and(eq(schema.inboxes.id, id), eq(schema.inboxes.orgId, tenant.org.id)))
    .limit(1);

  if (!existing) {
    return c.json({ error: "Inbox not found" }, 404);
  }

  // Check slug uniqueness if changing
  if (data.slug && data.slug !== existing.slug) {
    const [duplicate] = await db
      .select()
      .from(schema.inboxes)
      .where(and(eq(schema.inboxes.orgId, tenant.org.id), eq(schema.inboxes.slug, data.slug)))
      .limit(1);

    if (duplicate) {
      return c.json({ error: "An inbox with this slug already exists" }, 400);
    }
  }

  // If setting as default, unset other defaults
  if (data.isDefault) {
    await db
      .update(schema.inboxes)
      .set({ isDefault: false })
      .where(eq(schema.inboxes.orgId, tenant.org.id));
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;

  const [inbox] = await db
    .update(schema.inboxes)
    .set(updateData)
    .where(eq(schema.inboxes.id, id))
    .returning();

  return c.json({
    inbox: {
      ...inbox,
      emailAddress: `${inbox.slug}@${tenant.org.slug}.fettle.app`,
    },
  });
});

// Delete inbox (admin only)
inboxesRoutes.delete("/:id", async (c) => {
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

  // Verify inbox belongs to org and isn't the only one
  const orgInboxes = await db
    .select()
    .from(schema.inboxes)
    .where(eq(schema.inboxes.orgId, tenant.org.id));

  if (orgInboxes.length <= 1) {
    return c.json({ error: "Cannot delete the only inbox" }, 400);
  }

  const inbox = orgInboxes.find((i) => i.id === id);
  if (!inbox) {
    return c.json({ error: "Inbox not found" }, 404);
  }

  // Delete inbox (cascade will handle requests, custom fields)
  await db.delete(schema.inboxes).where(eq(schema.inboxes.id, id));

  // If deleted inbox was default, set another as default
  if (inbox.isDefault) {
    const [remaining] = await db
      .select()
      .from(schema.inboxes)
      .where(eq(schema.inboxes.orgId, tenant.org.id))
      .limit(1);

    if (remaining) {
      await db
        .update(schema.inboxes)
        .set({ isDefault: true })
        .where(eq(schema.inboxes.id, remaining.id));
    }
  }

  return c.json({ success: true });
});
