import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import type { Env, Auth } from "../lib/auth";
import type { Database } from "../lib/db";
import * as schema from "@shared/schema";
import { CreateTagSchema } from "@shared/types";

type Variables = {
  db: Database;
  auth: Auth;
  user: { id: string; email: string; role: string } | null;
};

export const tagsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// Auth middleware
tagsRoutes.use("*", async (c, next) => {
  const auth = c.get("auth");
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("user", session?.user as Variables["user"] | null);
  await next();
});

// List tags
tagsRoutes.get("/", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = c.get("db");
  const tags = await db.select().from(schema.tags).orderBy(schema.tags.name);

  return c.json({ tags });
});

// Create tag (admin only)
tagsRoutes.post("/", zValidator("json", CreateTagSchema), async (c) => {
  const user = c.get("user");
  if (!user || user.role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const db = c.get("db");
  const data = c.req.valid("json");

  const [tag] = await db
    .insert(schema.tags)
    .values({
      name: data.name,
      color: data.color ?? "#6B7280",
    })
    .returning();

  return c.json({ tag }, 201);
});

// Update tag (admin only)
tagsRoutes.patch("/:id", zValidator("json", CreateTagSchema.partial()), async (c) => {
  const user = c.get("user");
  if (!user || user.role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const db = c.get("db");
  const id = c.req.param("id");
  const data = c.req.valid("json");

  const [tag] = await db
    .update(schema.tags)
    .set(data)
    .where(eq(schema.tags.id, id))
    .returning();

  if (!tag) {
    return c.json({ error: "Tag not found" }, 404);
  }

  return c.json({ tag });
});

// Delete tag (admin only)
tagsRoutes.delete("/:id", async (c) => {
  const user = c.get("user");
  if (!user || user.role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const db = c.get("db");
  const id = c.req.param("id");

  await db.delete(schema.tags).where(eq(schema.tags.id, id));

  return c.json({ success: true });
});
