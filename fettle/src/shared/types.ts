import { z } from "zod";

// ============ ENUMS ============

export const CategoryEnum = z.enum(["feature", "bug", "data", "integration", "other"]);
export type Category = z.infer<typeof CategoryEnum>;

export const StatusEnum = z.enum(["new", "triaged", "planned", "in_progress", "delivered", "declined"]);
export type Status = z.infer<typeof StatusEnum>;

export const BusinessImpactEnum = z.enum(["high", "medium", "low"]);
export type BusinessImpact = z.infer<typeof BusinessImpactEnum>;

export const EffortEstimateEnum = z.enum(["xs", "s", "m", "l", "xl"]);
export type EffortEstimate = z.infer<typeof EffortEstimateEnum>;

export const RoleEnum = z.enum(["admin", "viewer"]);
export type Role = z.infer<typeof RoleEnum>;

export const FieldTypeEnum = z.enum(["text", "textarea", "number", "select", "multi_select", "date", "boolean"]);
export type FieldType = z.infer<typeof FieldTypeEnum>;

// ============ ORGANIZATION SCHEMAS ============

export const CreateOrganizationSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
});
export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;

export const UpdateOrganizationSchema = CreateOrganizationSchema.partial();
export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;

// ============ INBOX SCHEMAS ============

export const CreateInboxSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
});
export type CreateInboxInput = z.infer<typeof CreateInboxSchema>;

export const UpdateInboxSchema = CreateInboxSchema.partial();
export type UpdateInboxInput = z.infer<typeof UpdateInboxSchema>;

// ============ REQUEST SCHEMAS ============

export const CreateRequestSchema = z.object({
  inboxId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  category: CategoryEnum.nullable().optional(),
  productArea: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  urgencyHint: z.enum(["critical", "standard", "low"]).nullable().optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});
export type CreateRequestInput = z.infer<typeof CreateRequestSchema>;

export const UpdateRequestSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  category: CategoryEnum.nullable().optional(),
  productArea: z.string().nullable().optional(),
  businessImpact: BusinessImpactEnum.nullable().optional(),
  effortEstimate: EffortEstimateEnum.nullable().optional(),
  status: StatusEnum.optional(),
  targetQuarter: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});
export type UpdateRequestInput = z.infer<typeof UpdateRequestSchema>;

// ============ TAG SCHEMAS ============

export const CreateTagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});
export type CreateTagInput = z.infer<typeof CreateTagSchema>;

// ============ CUSTOM FIELD SCHEMAS ============

export const CreateCustomFieldSchema = z.object({
  inboxId: z.string().uuid().nullable().optional(), // null = org-wide field
  name: z.string().min(1).max(50).regex(/^[a-z_]+$/),
  label: z.string().min(1).max(100),
  description: z.string().optional(),
  fieldType: FieldTypeEnum,
  options: z.array(z.string()).optional(),
  isRequired: z.boolean().optional(),
  isAiExtracted: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});
export type CreateCustomFieldInput = z.infer<typeof CreateCustomFieldSchema>;

export const UpdateCustomFieldSchema = CreateCustomFieldSchema.partial();
export type UpdateCustomFieldInput = z.infer<typeof UpdateCustomFieldSchema>;

// ============ COMMENT SCHEMAS ============

export const CreateCommentSchema = z.object({
  content: z.string().min(1),
  isInternal: z.boolean().optional(),
});
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;

// ============ MEMBERSHIP SCHEMAS ============

export const InviteMemberSchema = z.object({
  email: z.string().email(),
  role: RoleEnum,
});
export type InviteMemberInput = z.infer<typeof InviteMemberSchema>;

// ============ AI EXTRACTION SCHEMA ============

export const AiExtractionResultSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: CategoryEnum.nullable(),
  productArea: z.string().nullable(),
  tags: z.array(z.string()),
  urgencyHint: z.enum(["critical", "standard", "low"]).nullable(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});
export type AiExtractionResult = z.infer<typeof AiExtractionResultSchema>;

// ============ API RESPONSE TYPES ============

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

export interface Inbox {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  description: string | null;
  isDefault: boolean;
  createdAt: Date;
  emailAddress?: string; // Computed: {slug}@{org.slug}.fettle.app
}

export interface OrgMembership {
  id: string;
  userId: string;
  orgId: string;
  role: Role;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface RequestWithDetails {
  id: string;
  orgId: string;
  inboxId: string;
  title: string;
  description: string;
  requesterEmail: string;
  requesterUserId: string | null;
  source: "email" | "form";
  category: Category | null;
  productArea: string | null;
  businessImpact: BusinessImpact | null;
  effortEstimate: EffortEstimate | null;
  priorityScore: number;
  upvoteCount: number;
  status: Status;
  statusChangedAt: Date | null;
  targetQuarter: string | null;
  createdAt: Date;
  updatedAt: Date;
  inbox?: Inbox;
  tags: { id: string; name: string; color: string }[];
  customFields: { fieldId: string; name: string; label: string; value: string | null }[];
  hasUpvoted?: boolean;
}

export interface CustomFieldDefinition {
  id: string;
  orgId: string;
  inboxId: string | null;
  name: string;
  label: string;
  description: string | null;
  fieldType: FieldType;
  options: string[] | null;
  isRequired: boolean;
  isAiExtracted: boolean;
  displayOrder: number;
}

// ============ SESSION CONTEXT ============

export interface SessionContext {
  user: {
    id: string;
    email: string;
    name: string;
  };
  org: Organization;
  membership: {
    id: string;
    role: Role;
  };
}
