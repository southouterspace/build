import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createAuth, type Env } from "./lib/auth";
import { createDb, type Database } from "./lib/db";
import type { Auth } from "./lib/auth";
import type { TenantContext } from "./lib/tenant";
import { authRoutes } from "./routes/auth";
import { requestsRoutes } from "./routes/requests";
import { tagsRoutes } from "./routes/tags";
import { customFieldsRoutes } from "./routes/custom-fields";
import { inboxesRoutes } from "./routes/inboxes";
import { adminRoutes } from "./routes/admin";
import { handleEmail } from "./email-handler";

// Extend Hono context with our types
export type Variables = {
  db: Database;
  auth: Auth;
  tenant: TenantContext | null;
};

export type AppContext = { Bindings: Env; Variables: Variables };

const app = new Hono<AppContext>();

// Middleware
app.use("*", logger());
app.use(
  "/api/*",
  cors({
    origin: (origin) => origin,
    credentials: true,
  })
);

// Inject db and auth into context for all API routes
app.use("/api/*", async (c, next) => {
  const db = createDb(c.env.DB);
  const auth = createAuth(c.env);
  c.set("db", db);
  c.set("auth", auth);
  await next();
});

// Routes
app.route("/api/auth", authRoutes);
app.route("/api/requests", requestsRoutes);
app.route("/api/tags", tagsRoutes);
app.route("/api/custom-fields", customFieldsRoutes);
app.route("/api/inboxes", inboxesRoutes);
app.route("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (c) => c.json({ status: "ok" }));

// Export both fetch and email handlers for Cloudflare Workers
export default {
  fetch: app.fetch,
  email: handleEmail,
};
