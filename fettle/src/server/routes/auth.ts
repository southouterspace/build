import { Hono } from "hono";
import type { Env } from "../lib/auth";
import type { Auth } from "../lib/auth";
import type { Database } from "../lib/db";

type Variables = {
  db: Database;
  auth: Auth;
};

export const authRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// Better Auth handles all auth routes
authRoutes.all("/*", async (c) => {
  const auth = c.get("auth");
  return auth.handler(c.req.raw);
});
