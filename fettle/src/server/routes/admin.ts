import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, and } from "drizzle-orm";
import type { AppContext } from "../index";
import { getTenantContext, isAdmin } from "../lib/tenant";
import * as schema from "@shared/schema";
import { CreateOrganizationSchema, UpdateOrganizationSchema, InviteMemberSchema } from "@shared/types";

export const adminRoutes = new Hono<AppContext>();

// Get current organization
adminRoutes.get("/org", async (c) => {
  const db = c.get("db");
  const auth = c.get("auth");
  const tenant = await getTenantContext(c, db, auth);

  if (!tenant) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  return c.json({ org: tenant.org, membership: tenant.membership });
});

// Update organization (admin only)
adminRoutes.patch("/org", zValidator("json", UpdateOrganizationSchema), async (c) => {
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

  // Check slug uniqueness if changing
  if (data.slug && data.slug !== tenant.org.slug) {
    const [existing] = await db
      .select()
      .from(schema.organizations)
      .where(eq(schema.organizations.slug, data.slug))
      .limit(1);

    if (existing) {
      return c.json({ error: "An organization with this slug already exists" }, 400);
    }
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.slug !== undefined) updateData.slug = data.slug;

  const [org] = await db
    .update(schema.organizations)
    .set(updateData)
    .where(eq(schema.organizations.id, tenant.org.id))
    .returning();

  return c.json({ org });
});

// List organization members (admin only)
adminRoutes.get("/members", async (c) => {
  const db = c.get("db");
  const auth = c.get("auth");
  const tenant = await getTenantContext(c, db, auth);

  if (!tenant) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!isAdmin(tenant)) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const members = await db
    .select({
      id: schema.orgMemberships.id,
      userId: schema.orgMemberships.userId,
      role: schema.orgMemberships.role,
      createdAt: schema.orgMemberships.createdAt,
      userName: schema.users.name,
      userEmail: schema.users.email,
    })
    .from(schema.orgMemberships)
    .innerJoin(schema.users, eq(schema.orgMemberships.userId, schema.users.id))
    .where(eq(schema.orgMemberships.orgId, tenant.org.id))
    .orderBy(schema.users.name);

  return c.json({
    members: members.map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      createdAt: m.createdAt,
      user: {
        id: m.userId,
        name: m.userName,
        email: m.userEmail,
      },
    })),
  });
});

// Invite member (admin only) - creates membership if user exists
adminRoutes.post("/members", zValidator("json", InviteMemberSchema), async (c) => {
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

  // Check if user exists
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, data.email))
    .limit(1);

  if (!user) {
    return c.json({ error: "User not found. They must sign up first." }, 404);
  }

  // Check if already a member
  const [existing] = await db
    .select()
    .from(schema.orgMemberships)
    .where(and(eq(schema.orgMemberships.userId, user.id), eq(schema.orgMemberships.orgId, tenant.org.id)))
    .limit(1);

  if (existing) {
    return c.json({ error: "User is already a member of this organization" }, 400);
  }

  // Create membership
  const [membership] = await db
    .insert(schema.orgMemberships)
    .values({
      userId: user.id,
      orgId: tenant.org.id,
      role: data.role,
    })
    .returning();

  return c.json(
    {
      member: {
        id: membership.id,
        userId: user.id,
        role: membership.role,
        createdAt: membership.createdAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    },
    201
  );
});

// Update member role (admin only)
adminRoutes.patch("/members/:id", zValidator("json", InviteMemberSchema.pick({ role: true })), async (c) => {
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

  // Verify membership belongs to org
  const [existing] = await db
    .select()
    .from(schema.orgMemberships)
    .where(and(eq(schema.orgMemberships.id, id), eq(schema.orgMemberships.orgId, tenant.org.id)))
    .limit(1);

  if (!existing) {
    return c.json({ error: "Member not found" }, 404);
  }

  // Prevent demoting yourself if you're the only admin
  if (existing.userId === tenant.user.id && data.role !== "admin") {
    const adminCount = await db
      .select()
      .from(schema.orgMemberships)
      .where(and(eq(schema.orgMemberships.orgId, tenant.org.id), eq(schema.orgMemberships.role, "admin")));

    if (adminCount.length <= 1) {
      return c.json({ error: "Cannot demote the only admin" }, 400);
    }
  }

  const [membership] = await db
    .update(schema.orgMemberships)
    .set({ role: data.role })
    .where(eq(schema.orgMemberships.id, id))
    .returning();

  return c.json({ member: { ...membership } });
});

// Remove member (admin only)
adminRoutes.delete("/members/:id", async (c) => {
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

  // Verify membership belongs to org
  const [existing] = await db
    .select()
    .from(schema.orgMemberships)
    .where(and(eq(schema.orgMemberships.id, id), eq(schema.orgMemberships.orgId, tenant.org.id)))
    .limit(1);

  if (!existing) {
    return c.json({ error: "Member not found" }, 404);
  }

  // Prevent removing yourself if you're the only admin
  if (existing.userId === tenant.user.id) {
    const adminCount = await db
      .select()
      .from(schema.orgMemberships)
      .where(and(eq(schema.orgMemberships.orgId, tenant.org.id), eq(schema.orgMemberships.role, "admin")));

    if (adminCount.length <= 1) {
      return c.json({ error: "Cannot remove the only admin" }, 400);
    }
  }

  await db.delete(schema.orgMemberships).where(eq(schema.orgMemberships.id, id));

  return c.json({ success: true });
});

// Create organization (for superadmin/provisioning - in real app, protect this)
adminRoutes.post("/orgs", zValidator("json", CreateOrganizationSchema), async (c) => {
  const db = c.get("db");
  const auth = c.get("auth");

  // Get authenticated user
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const data = c.req.valid("json");

  // Check slug uniqueness
  const [existing] = await db
    .select()
    .from(schema.organizations)
    .where(eq(schema.organizations.slug, data.slug))
    .limit(1);

  if (existing) {
    return c.json({ error: "An organization with this slug already exists" }, 400);
  }

  // Create org
  const [org] = await db
    .insert(schema.organizations)
    .values({
      name: data.name,
      slug: data.slug,
    })
    .returning();

  // Add creating user as admin
  await db.insert(schema.orgMemberships).values({
    userId: session.user.id,
    orgId: org.id,
    role: "admin",
  });

  // Create default inbox
  await db.insert(schema.inboxes).values({
    orgId: org.id,
    name: "Requests",
    slug: "requests",
    description: "General requests inbox",
    isDefault: true,
  });

  return c.json({ org }, 201);
});
