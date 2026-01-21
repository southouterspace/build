import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, desc, and, sql, inArray } from "drizzle-orm";
import { z } from "zod";
import type { Env, Auth } from "../lib/auth";
import type { Database } from "../lib/db";
import * as schema from "@shared/schema";
import { CreateRequestSchema, UpdateRequestSchema, CreateCommentSchema } from "@shared/types";

type Variables = {
  db: Database;
  auth: Auth;
  user: { id: string; email: string; role: string } | null;
};

export const requestsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// Auth middleware
requestsRoutes.use("*", async (c, next) => {
  const auth = c.get("auth");
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("user", session?.user as Variables["user"] | null);
  await next();
});

// List requests
requestsRoutes.get(
  "/",
  zValidator(
    "query",
    z.object({
      status: z.string().optional(),
      category: z.string().optional(),
      tag: z.string().optional(),
      search: z.string().optional(),
      sort: z.enum(["newest", "oldest", "most_upvoted", "priority"]).optional(),
      limit: z.coerce.number().min(1).max(100).optional(),
      offset: z.coerce.number().min(0).optional(),
    })
  ),
  async (c) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const db = c.get("db");
    const { status, category, tag, search, sort = "newest", limit = 50, offset = 0 } = c.req.valid("query");

    // Build base query
    let query = db.select().from(schema.requests);

    const conditions = [];
    if (status) {
      conditions.push(eq(schema.requests.status, status as typeof schema.requests.status.enumValues[number]));
    }
    if (category) {
      conditions.push(eq(schema.requests.category, category as typeof schema.requests.category.enumValues[number]));
    }
    if (search) {
      conditions.push(
        sql`(${schema.requests.title} LIKE ${"%" + search + "%"} OR ${schema.requests.description} LIKE ${"%" + search + "%"})`
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    // Sorting
    const orderBy =
      sort === "oldest"
        ? schema.requests.createdAt
        : sort === "most_upvoted"
          ? desc(schema.requests.upvoteCount)
          : sort === "priority"
            ? desc(schema.requests.priorityScore)
            : desc(schema.requests.createdAt);

    const requests = await query.orderBy(orderBy).limit(limit).offset(offset);

    // Get tags for each request
    const requestIds = requests.map((r) => r.id);
    const requestTagsData =
      requestIds.length > 0
        ? await db
            .select({
              requestId: schema.requestTags.requestId,
              tagId: schema.tags.id,
              tagName: schema.tags.name,
              tagColor: schema.tags.color,
            })
            .from(schema.requestTags)
            .innerJoin(schema.tags, eq(schema.requestTags.tagId, schema.tags.id))
            .where(inArray(schema.requestTags.requestId, requestIds))
        : [];

    // Get user upvotes
    const userUpvotes =
      requestIds.length > 0
        ? await db
            .select({ requestId: schema.upvotes.requestId })
            .from(schema.upvotes)
            .where(and(eq(schema.upvotes.userId, user.id), inArray(schema.upvotes.requestId, requestIds)))
        : [];
    const upvotedSet = new Set(userUpvotes.map((u) => u.requestId));

    // Group tags by request
    const tagsByRequest = new Map<string, { id: string; name: string; color: string }[]>();
    for (const rt of requestTagsData) {
      if (!tagsByRequest.has(rt.requestId)) {
        tagsByRequest.set(rt.requestId, []);
      }
      tagsByRequest.get(rt.requestId)!.push({
        id: rt.tagId,
        name: rt.tagName,
        color: rt.tagColor,
      });
    }

    // Filter by tag if specified
    let filteredRequests = requests;
    if (tag) {
      filteredRequests = requests.filter((r) => tagsByRequest.get(r.id)?.some((t) => t.name === tag));
    }

    const result = filteredRequests.map((r) => ({
      ...r,
      tags: tagsByRequest.get(r.id) || [],
      hasUpvoted: upvotedSet.has(r.id),
    }));

    return c.json({ requests: result });
  }
);

// Get single request
requestsRoutes.get("/:id", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = c.get("db");
  const id = c.req.param("id");

  const [request] = await db.select().from(schema.requests).where(eq(schema.requests.id, id)).limit(1);

  if (!request) {
    return c.json({ error: "Request not found" }, 404);
  }

  // Get tags
  const tags = await db
    .select({
      id: schema.tags.id,
      name: schema.tags.name,
      color: schema.tags.color,
    })
    .from(schema.requestTags)
    .innerJoin(schema.tags, eq(schema.requestTags.tagId, schema.tags.id))
    .where(eq(schema.requestTags.requestId, id));

  // Get custom field values
  const customFields = await db
    .select({
      fieldId: schema.customFieldValues.fieldId,
      name: schema.customFieldDefinitions.name,
      label: schema.customFieldDefinitions.label,
      value: schema.customFieldValues.value,
    })
    .from(schema.customFieldValues)
    .innerJoin(schema.customFieldDefinitions, eq(schema.customFieldValues.fieldId, schema.customFieldDefinitions.id))
    .where(eq(schema.customFieldValues.requestId, id));

  // Check if user has upvoted
  const [upvote] = await db
    .select()
    .from(schema.upvotes)
    .where(and(eq(schema.upvotes.requestId, id), eq(schema.upvotes.userId, user.id)))
    .limit(1);

  // Get comments (filter internal if viewer)
  const commentsQuery = db
    .select({
      id: schema.comments.id,
      content: schema.comments.content,
      isInternal: schema.comments.isInternal,
      createdAt: schema.comments.createdAt,
      userId: schema.comments.userId,
      userName: schema.users.name,
    })
    .from(schema.comments)
    .innerJoin(schema.users, eq(schema.comments.userId, schema.users.id))
    .where(eq(schema.comments.requestId, id))
    .orderBy(desc(schema.comments.createdAt));

  let comments = await commentsQuery;
  if (user.role !== "admin") {
    comments = comments.filter((c) => !c.isInternal);
  }

  // Get status history
  const history = await db
    .select({
      id: schema.statusHistory.id,
      fromStatus: schema.statusHistory.fromStatus,
      toStatus: schema.statusHistory.toStatus,
      createdAt: schema.statusHistory.createdAt,
      changedByName: schema.users.name,
    })
    .from(schema.statusHistory)
    .innerJoin(schema.users, eq(schema.statusHistory.changedBy, schema.users.id))
    .where(eq(schema.statusHistory.requestId, id))
    .orderBy(desc(schema.statusHistory.createdAt));

  return c.json({
    request: {
      ...request,
      tags,
      customFields,
      hasUpvoted: !!upvote,
      comments,
      statusHistory: history,
    },
  });
});

// Create request
requestsRoutes.post("/", zValidator("json", CreateRequestSchema), async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = c.get("db");
  const data = c.req.valid("json");

  const [request] = await db
    .insert(schema.requests)
    .values({
      title: data.title,
      description: data.description,
      category: data.category,
      productArea: data.productArea,
      requesterEmail: user.email,
      requesterUserId: user.id,
      source: "form",
      status: "new",
    })
    .returning();

  // Add tags if provided
  if (data.tags?.length) {
    const existingTags = await db.select().from(schema.tags).where(inArray(schema.tags.name, data.tags));

    const existingTagNames = new Set(existingTags.map((t) => t.name));
    const newTagNames = data.tags.filter((t) => !existingTagNames.has(t));

    // Create new tags
    if (newTagNames.length > 0) {
      await db.insert(schema.tags).values(newTagNames.map((name) => ({ name })));
    }

    // Get all tag IDs
    const allTags = await db.select().from(schema.tags).where(inArray(schema.tags.name, data.tags));

    // Link tags to request
    await db.insert(schema.requestTags).values(
      allTags.map((tag) => ({
        requestId: request.id,
        tagId: tag.id,
      }))
    );
  }

  // Save custom field values
  if (data.customFields && Object.keys(data.customFields).length > 0) {
    const fieldDefs = await db.select().from(schema.customFieldDefinitions);
    const fieldMap = new Map(fieldDefs.map((f) => [f.name, f.id]));

    const values = Object.entries(data.customFields)
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

  // Record initial status
  await db.insert(schema.statusHistory).values({
    requestId: request.id,
    fromStatus: null,
    toStatus: "new",
    changedBy: user.id,
  });

  return c.json({ request }, 201);
});

// Update request (admin only for most fields)
requestsRoutes.patch("/:id", zValidator("json", UpdateRequestSchema), async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = c.get("db");
  const id = c.req.param("id");
  const data = c.req.valid("json");

  const [existing] = await db.select().from(schema.requests).where(eq(schema.requests.id, id)).limit(1);

  if (!existing) {
    return c.json({ error: "Request not found" }, 404);
  }

  // Viewers can only edit their own requests when status is "new"
  const isOwner = existing.requesterUserId === user.id;
  const isAdmin = user.role === "admin";
  const canEdit = isAdmin || (isOwner && existing.status === "new");

  if (!canEdit) {
    return c.json({ error: "Forbidden" }, 403);
  }

  // Only admins can change certain fields
  const adminOnlyFields = ["status", "businessImpact", "effortEstimate", "targetQuarter"];
  if (!isAdmin) {
    for (const field of adminOnlyFields) {
      if (field in data) {
        return c.json({ error: `Only admins can modify ${field}` }, 403);
      }
    }
  }

  // Handle status change
  if (data.status && data.status !== existing.status) {
    await db.insert(schema.statusHistory).values({
      requestId: id,
      fromStatus: existing.status,
      toStatus: data.status,
      changedBy: user.id,
    });
  }

  // Update request
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.productArea !== undefined) updateData.productArea = data.productArea;
  if (data.businessImpact !== undefined) updateData.businessImpact = data.businessImpact;
  if (data.effortEstimate !== undefined) updateData.effortEstimate = data.effortEstimate;
  if (data.status !== undefined) {
    updateData.status = data.status;
    updateData.statusChangedAt = new Date();
  }
  if (data.targetQuarter !== undefined) updateData.targetQuarter = data.targetQuarter;

  // Recalculate priority score if relevant fields changed
  if (data.businessImpact !== undefined || data.effortEstimate !== undefined) {
    const impactScore = { high: 3, medium: 2, low: 1 }[data.businessImpact ?? existing.businessImpact ?? "low"] ?? 1;
    const effortPenalty = { xs: 0, s: 1, m: 2, l: 3, xl: 4 }[data.effortEstimate ?? existing.effortEstimate ?? "m"] ?? 2;
    updateData.priorityScore = impactScore * 10 + existing.upvoteCount - effortPenalty;
  }

  const [updated] = await db.update(schema.requests).set(updateData).where(eq(schema.requests.id, id)).returning();

  // Update tags if provided
  if (data.tags !== undefined) {
    // Remove existing
    await db.delete(schema.requestTags).where(eq(schema.requestTags.requestId, id));

    if (data.tags.length > 0) {
      // Get or create tags
      const existingTags = await db.select().from(schema.tags).where(inArray(schema.tags.name, data.tags));
      const existingTagNames = new Set(existingTags.map((t) => t.name));
      const newTagNames = data.tags.filter((t) => !existingTagNames.has(t));

      if (newTagNames.length > 0) {
        await db.insert(schema.tags).values(newTagNames.map((name) => ({ name })));
      }

      const allTags = await db.select().from(schema.tags).where(inArray(schema.tags.name, data.tags));
      await db.insert(schema.requestTags).values(
        allTags.map((tag) => ({
          requestId: id,
          tagId: tag.id,
        }))
      );
    }
  }

  return c.json({ request: updated });
});

// Delete request (admin only)
requestsRoutes.delete("/:id", async (c) => {
  const user = c.get("user");
  if (!user || user.role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const db = c.get("db");
  const id = c.req.param("id");

  await db.delete(schema.requests).where(eq(schema.requests.id, id));

  return c.json({ success: true });
});

// Toggle upvote
requestsRoutes.post("/:id/upvote", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = c.get("db");
  const id = c.req.param("id");

  const [existing] = await db
    .select()
    .from(schema.upvotes)
    .where(and(eq(schema.upvotes.requestId, id), eq(schema.upvotes.userId, user.id)))
    .limit(1);

  if (existing) {
    // Remove upvote
    await db.delete(schema.upvotes).where(eq(schema.upvotes.id, existing.id));
    await db
      .update(schema.requests)
      .set({ upvoteCount: sql`${schema.requests.upvoteCount} - 1` })
      .where(eq(schema.requests.id, id));
    return c.json({ upvoted: false });
  } else {
    // Add upvote
    await db.insert(schema.upvotes).values({ requestId: id, userId: user.id });
    await db
      .update(schema.requests)
      .set({ upvoteCount: sql`${schema.requests.upvoteCount} + 1` })
      .where(eq(schema.requests.id, id));
    return c.json({ upvoted: true });
  }
});

// Add comment
requestsRoutes.post("/:id/comments", zValidator("json", CreateCommentSchema), async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = c.get("db");
  const id = c.req.param("id");
  const data = c.req.valid("json");

  // Only admins can post internal comments
  if (data.isInternal && user.role !== "admin") {
    return c.json({ error: "Only admins can post internal comments" }, 403);
  }

  const [comment] = await db
    .insert(schema.comments)
    .values({
      requestId: id,
      userId: user.id,
      content: data.content,
      isInternal: data.isInternal ?? false,
    })
    .returning();

  return c.json({ comment }, 201);
});
