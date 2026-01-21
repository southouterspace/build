import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createAuth, type Env } from "./lib/auth";
import { createDb } from "./lib/db";
import { authRoutes } from "./routes/auth";
import { requestsRoutes } from "./routes/requests";
import { tagsRoutes } from "./routes/tags";
import { customFieldsRoutes } from "./routes/custom-fields";
import { webhooksRoutes } from "./routes/webhooks";

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use("*", logger());
app.use(
  "/api/*",
  cors({
    origin: (origin) => origin,
    credentials: true,
  })
);

// Inject db and auth into context
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
app.route("/api/webhooks", webhooksRoutes);

// Health check
app.get("/api/health", (c) => c.json({ status: "ok" }));

export default app;
