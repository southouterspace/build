import { eq, and, or, isNull } from "drizzle-orm";
import type { Context } from "hono";
import type { Database } from "./db";
import type { Auth } from "./auth";
import * as schema from "@shared/schema";
import type { SessionContext, Role } from "@shared/types";

export interface TenantContext extends SessionContext {
  db: Database;
}

/**
 * Get the tenant context for the current request.
 * Returns null if the user is not authenticated or not a member of any org.
 */
export async function getTenantContext(
  c: Context,
  db: Database,
  auth: Auth
): Promise<TenantContext | null> {
  // Get authenticated user
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) {
    return null;
  }

  // Get user's org membership (for now, get their first/only org)
  // In the future, this could be determined by subdomain or header
  const [membership] = await db
    .select({
      id: schema.orgMemberships.id,
      role: schema.orgMemberships.role,
      orgId: schema.orgMemberships.orgId,
      orgName: schema.organizations.name,
      orgSlug: schema.organizations.slug,
      orgCreatedAt: schema.organizations.createdAt,
    })
    .from(schema.orgMemberships)
    .innerJoin(schema.organizations, eq(schema.orgMemberships.orgId, schema.organizations.id))
    .where(eq(schema.orgMemberships.userId, session.user.id))
    .limit(1);

  if (!membership) {
    return null;
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
    org: {
      id: membership.orgId,
      name: membership.orgName,
      slug: membership.orgSlug,
      createdAt: membership.orgCreatedAt!,
    },
    membership: {
      id: membership.id,
      role: membership.role as Role,
    },
    db,
  };
}

/**
 * Resolve an inbox from an email address.
 * Supports multiple formats:
 * - {inbox}@{org}.fettle.app (subdomain format)
 * - {inbox}+{org}@inbound.fettle.app (plus addressing)
 * - {inbox}-{org}@inbound.fettle.app (prefix format)
 */
export async function resolveInboxFromEmail(
  db: Database,
  toAddress: string,
  appDomain: string = "fettle.app"
): Promise<{ org: typeof schema.organizations.$inferSelect; inbox: typeof schema.inboxes.$inferSelect } | null> {
  const email = toAddress.toLowerCase();

  // Pattern 1: {inbox}@{org}.{domain} (subdomain format)
  const subdomainMatch = email.match(new RegExp(`^([^@]+)@([^.]+)\\.${appDomain.replace(".", "\\.")}$`));
  if (subdomainMatch) {
    const [, inboxSlug, orgSlug] = subdomainMatch;
    return resolveByOrgAndInboxSlug(db, orgSlug, inboxSlug);
  }

  // Pattern 2: {inbox}+{org}@inbound.{domain} (plus addressing)
  const plusMatch = email.match(new RegExp(`^([^+]+)\\+([^@]+)@inbound\\.${appDomain.replace(".", "\\.")}$`));
  if (plusMatch) {
    const [, inboxSlug, orgSlug] = plusMatch;
    return resolveByOrgAndInboxSlug(db, orgSlug, inboxSlug);
  }

  // Pattern 3: {inbox}-{org}@inbound.{domain} (prefix format)
  const prefixMatch = email.match(new RegExp(`^([^-]+)-([^@]+)@inbound\\.${appDomain.replace(".", "\\.")}$`));
  if (prefixMatch) {
    const [, inboxSlug, orgSlug] = prefixMatch;
    return resolveByOrgAndInboxSlug(db, orgSlug, inboxSlug);
  }

  return null;
}

async function resolveByOrgAndInboxSlug(
  db: Database,
  orgSlug: string,
  inboxSlug: string
): Promise<{ org: typeof schema.organizations.$inferSelect; inbox: typeof schema.inboxes.$inferSelect } | null> {
  // Get org
  const [org] = await db
    .select()
    .from(schema.organizations)
    .where(eq(schema.organizations.slug, orgSlug))
    .limit(1);

  if (!org) return null;

  // Try to find specific inbox, fall back to default
  let [inbox] = await db
    .select()
    .from(schema.inboxes)
    .where(and(eq(schema.inboxes.orgId, org.id), eq(schema.inboxes.slug, inboxSlug)))
    .limit(1);

  // Fall back to default inbox if specific one not found
  if (!inbox) {
    [inbox] = await db
      .select()
      .from(schema.inboxes)
      .where(and(eq(schema.inboxes.orgId, org.id), eq(schema.inboxes.isDefault, true)))
      .limit(1);
  }

  if (!inbox) return null;

  return { org, inbox };
}

/**
 * Get custom fields applicable to a specific inbox.
 * Includes org-wide fields (inboxId = null) and inbox-specific fields.
 */
export async function getFieldsForInbox(
  db: Database,
  orgId: string,
  inboxId: string
) {
  return db
    .select()
    .from(schema.customFieldDefinitions)
    .where(
      and(
        eq(schema.customFieldDefinitions.orgId, orgId),
        or(
          isNull(schema.customFieldDefinitions.inboxId),
          eq(schema.customFieldDefinitions.inboxId, inboxId)
        )
      )
    )
    .orderBy(schema.customFieldDefinitions.displayOrder);
}

/**
 * Check if user has admin role in their org
 */
export function isAdmin(ctx: TenantContext): boolean {
  return ctx.membership.role === "admin";
}
