import { sqliteTable, text, integer, uniqueIndex, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ============ ORGANIZATIONS (TENANTS) ============

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // URL-safe identifier, used for subdomains
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============ AUTH & USERS (Better Auth managed + extensions) ============

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false),
  image: text("image"),
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

// ============ ORG MEMBERSHIPS ============

export const orgMemberships = sqliteTable(
  "org_memberships",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["admin", "viewer"] }).notNull().default("viewer"),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("org_memberships_unique").on(table.userId, table.orgId),
    index("org_memberships_org_idx").on(table.orgId),
  ]
);

// ============ INBOXES ============

export const inboxes = sqliteTable(
  "inboxes",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(), // "Feature Requests", "Support", "Bug Reports"
    slug: text("slug").notNull(), // "requests", "help", "bugs" → {slug}@{org}.fettle.app
    description: text("description"), // Shown on submit form
    isDefault: integer("is_default", { mode: "boolean" }).default(false),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("inboxes_org_slug_unique").on(table.orgId, table.slug),
    index("inboxes_org_idx").on(table.orgId),
  ]
);

// ============ TAGS (org-scoped) ============

export const tags = sqliteTable(
  "tags",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color").notNull().default("#6B7280"),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("tags_org_name_unique").on(table.orgId, table.name),
    index("tags_org_idx").on(table.orgId),
  ]
);

// ============ REQUESTS ============

export const requests = sqliteTable(
  "requests",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    inboxId: text("inbox_id").notNull().references(() => inboxes.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),

    // Source
    requesterEmail: text("requester_email").notNull(),
    requesterUserId: text("requester_user_id").references(() => users.id),
    source: text("source", { enum: ["email", "form"] }).notNull().default("form"),
    originalEmailId: text("original_email_id"),

    // Classification
    category: text("category", {
      enum: ["feature", "bug", "data", "integration", "other"],
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
  },
  (table) => [
    index("requests_org_idx").on(table.orgId),
    index("requests_inbox_idx").on(table.inboxId),
    index("requests_status_idx").on(table.status),
  ]
);

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

export const customFieldDefinitions = sqliteTable(
  "custom_field_definitions",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    inboxId: text("inbox_id").references(() => inboxes.id, { onDelete: "cascade" }), // nullable = org-wide field
    name: text("name").notNull(), // snake_case identifier
    label: text("label").notNull(), // Display label
    description: text("description"), // Help text, also fed to AI
    fieldType: text("field_type", {
      enum: ["text", "textarea", "number", "select", "multi_select", "date", "boolean"],
    }).notNull(),
    options: text("options", { mode: "json" }).$type<string[]>(), // For select/multi_select
    isRequired: integer("is_required", { mode: "boolean" }).default(false),
    isAiExtracted: integer("is_ai_extracted", { mode: "boolean" }).default(true),
    displayOrder: integer("display_order").default(0),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("custom_fields_org_inbox_name_unique").on(table.orgId, table.inboxId, table.name),
    index("custom_fields_org_idx").on(table.orgId),
    index("custom_fields_inbox_idx").on(table.inboxId),
  ]
);

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

export const comments = sqliteTable(
  "comments",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    requestId: text("request_id").notNull().references(() => requests.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    isInternal: integer("is_internal", { mode: "boolean" }).default(false),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => [index("comments_request_idx").on(table.requestId)]
);

// ============ STATUS HISTORY ============

export const statusHistory = sqliteTable(
  "status_history",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    requestId: text("request_id").notNull().references(() => requests.id, { onDelete: "cascade" }),
    fromStatus: text("from_status"),
    toStatus: text("to_status").notNull(),
    changedBy: text("changed_by").notNull().references(() => users.id),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => [index("status_history_request_idx").on(table.requestId)]
);

// ============ RELATIONS ============

export const organizationsRelations = relations(organizations, ({ many }) => ({
  memberships: many(orgMemberships),
  inboxes: many(inboxes),
  tags: many(tags),
  requests: many(requests),
  customFieldDefinitions: many(customFieldDefinitions),
}));

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  memberships: many(orgMemberships),
  requests: many(requests),
  upvotes: many(upvotes),
  comments: many(comments),
}));

export const orgMembershipsRelations = relations(orgMemberships, ({ one }) => ({
  user: one(users, {
    fields: [orgMemberships.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [orgMemberships.orgId],
    references: [organizations.id],
  }),
}));

export const inboxesRelations = relations(inboxes, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [inboxes.orgId],
    references: [organizations.id],
  }),
  requests: many(requests),
  customFieldDefinitions: many(customFieldDefinitions),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [tags.orgId],
    references: [organizations.id],
  }),
  requestTags: many(requestTags),
}));

export const requestsRelations = relations(requests, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [requests.orgId],
    references: [organizations.id],
  }),
  inbox: one(inboxes, {
    fields: [requests.inboxId],
    references: [inboxes.id],
  }),
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

export const customFieldDefinitionsRelations = relations(customFieldDefinitions, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [customFieldDefinitions.orgId],
    references: [organizations.id],
  }),
  inbox: one(inboxes, {
    fields: [customFieldDefinitions.inboxId],
    references: [inboxes.id],
  }),
  values: many(customFieldValues),
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
