import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ============ AUTH & USERS (Better Auth managed + extensions) ============

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false),
  image: text("image"),
  role: text("role", { enum: ["admin", "viewer"] }).notNull().default("viewer"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============ TAGS ============

export const tags = sqliteTable("tags", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  color: text("color").notNull().default("#6B7280"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============ REQUESTS ============

export const requests = sqliteTable("requests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull(),

  // Source
  requesterEmail: text("requester_email").notNull(),
  requesterUserId: text("requester_user_id").references(() => users.id),
  source: text("source", { enum: ["email", "form"] }).notNull().default("form"),
  originalEmailId: text("original_email_id"),

  // Classification
  category: text("category", {
    enum: ["feature", "bug", "data", "integration", "other"]
  }),
  productArea: text("product_area"),

  // Prioritization (admin-set)
  businessImpact: text("business_impact", { enum: ["high", "medium", "low"] }),
  effortEstimate: text("effort_estimate", { enum: ["xs", "s", "m", "l", "xl"] }),
  priorityScore: integer("priority_score").default(0),
  upvoteCount: integer("upvote_count").default(0),

  // Lifecycle
  status: text("status", {
    enum: ["new", "triaged", "planned", "in_progress", "delivered", "declined"],
  }).notNull().default("new"),
  statusChangedAt: integer("status_changed_at", { mode: "timestamp" }),
  targetQuarter: text("target_quarter"),

  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============ REQUEST TAGS (many-to-many) ============

export const requestTags = sqliteTable(
  "request_tags",
  {
    requestId: text("request_id").notNull().references(() => requests.id, { onDelete: "cascade" }),
    tagId: text("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [uniqueIndex("request_tags_unique").on(table.requestId, table.tagId)]
);

// ============ CUSTOM FIELD DEFINITIONS ============

export const customFieldDefinitions = sqliteTable("custom_field_definitions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  label: text("label").notNull(),
  description: text("description"),
  fieldType: text("field_type", {
    enum: ["text", "textarea", "number", "select", "multi_select", "date", "boolean"],
  }).notNull(),
  options: text("options", { mode: "json" }).$type<string[]>(),
  isRequired: integer("is_required", { mode: "boolean" }).default(false),
  isAiExtracted: integer("is_ai_extracted", { mode: "boolean" }).default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============ CUSTOM FIELD VALUES ============

export const customFieldValues = sqliteTable(
  "custom_field_values",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    requestId: text("request_id").notNull().references(() => requests.id, { onDelete: "cascade" }),
    fieldId: text("field_id").notNull().references(() => customFieldDefinitions.id, { onDelete: "cascade" }),
    value: text("value"),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => [uniqueIndex("custom_field_values_unique").on(table.requestId, table.fieldId)]
);

// ============ UPVOTES ============

export const upvotes = sqliteTable(
  "upvotes",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    requestId: text("request_id").notNull().references(() => requests.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => [uniqueIndex("upvotes_unique").on(table.requestId, table.userId)]
);

// ============ COMMENTS ============

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  requestId: text("request_id").notNull().references(() => requests.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isInternal: integer("is_internal", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============ STATUS HISTORY ============

export const statusHistory = sqliteTable("status_history", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  requestId: text("request_id").notNull().references(() => requests.id, { onDelete: "cascade" }),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  changedBy: text("changed_by").notNull().references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============ RELATIONS ============

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  requests: many(requests),
  upvotes: many(upvotes),
  comments: many(comments),
}));

export const requestsRelations = relations(requests, ({ one, many }) => ({
  requester: one(users, {
    fields: [requests.requesterUserId],
    references: [users.id],
  }),
  tags: many(requestTags),
  customFields: many(customFieldValues),
  upvotes: many(upvotes),
  comments: many(comments),
  statusHistory: many(statusHistory),
}));

export const requestTagsRelations = relations(requestTags, ({ one }) => ({
  request: one(requests, {
    fields: [requestTags.requestId],
    references: [requests.id],
  }),
  tag: one(tags, {
    fields: [requestTags.tagId],
    references: [tags.id],
  }),
}));

export const customFieldValuesRelations = relations(customFieldValues, ({ one }) => ({
  request: one(requests, {
    fields: [customFieldValues.requestId],
    references: [requests.id],
  }),
  definition: one(customFieldDefinitions, {
    fields: [customFieldValues.fieldId],
    references: [customFieldDefinitions.id],
  }),
}));

export const upvotesRelations = relations(upvotes, ({ one }) => ({
  request: one(requests, {
    fields: [upvotes.requestId],
    references: [requests.id],
  }),
  user: one(users, {
    fields: [upvotes.userId],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  request: one(requests, {
    fields: [comments.requestId],
    references: [requests.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const statusHistoryRelations = relations(statusHistory, ({ one }) => ({
  request: one(requests, {
    fields: [statusHistory.requestId],
    references: [requests.id],
  }),
  changedByUser: one(users, {
    fields: [statusHistory.changedBy],
    references: [users.id],
  }),
}));
