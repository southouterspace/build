import type {
  RequestWithDetails,
  CreateRequestInput,
  UpdateRequestInput,
  CreateTagInput,
  CreateCustomFieldInput,
  UpdateCustomFieldInput,
  CreateCommentInput,
  CustomFieldDefinition,
  Organization,
  Inbox,
  OrgMembership,
  CreateInboxInput,
  UpdateInboxInput,
  InviteMemberInput,
  Role,
} from "@shared/types";

const API_BASE = "/api";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

// Organization & Tenant Context
export const orgApi = {
  get: () => fetchApi<{ org: Organization; membership: OrgMembership }>("/admin/org"),

  update: (data: { name?: string; slug?: string }) =>
    fetchApi<{ org: Organization }>("/admin/org", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  create: (data: { name: string; slug: string }) =>
    fetchApi<{ org: Organization }>("/admin/orgs", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Members
export const membersApi = {
  list: () =>
    fetchApi<{
      members: {
        id: string;
        userId: string;
        role: Role;
        createdAt: string;
        user: { id: string; name: string; email: string };
      }[];
    }>("/admin/members"),

  invite: (data: InviteMemberInput) =>
    fetchApi<{
      member: {
        id: string;
        userId: string;
        role: Role;
        createdAt: string;
        user: { id: string; name: string; email: string };
      };
    }>("/admin/members", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateRole: (id: string, role: Role) =>
    fetchApi<{ member: OrgMembership }>(`/admin/members/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  remove: (id: string) =>
    fetchApi<{ success: boolean }>(`/admin/members/${id}`, {
      method: "DELETE",
    }),
};

// Inboxes
export const inboxesApi = {
  list: () => fetchApi<{ inboxes: (Inbox & { emailAddress: string })[] }>("/inboxes"),

  get: (id: string) => fetchApi<{ inbox: Inbox & { emailAddress: string } }>(`/inboxes/${id}`),

  create: (data: CreateInboxInput) =>
    fetchApi<{ inbox: Inbox }>("/inboxes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateInboxInput) =>
    fetchApi<{ inbox: Inbox }>(`/inboxes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/inboxes/${id}`, {
      method: "DELETE",
    }),
};

// Requests
export const requestsApi = {
  list: (params?: {
    status?: string;
    category?: string;
    tag?: string;
    search?: string;
    sort?: string;
    inboxId?: string;
    limit?: number;
    offset?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, String(value));
      });
    }
    const query = searchParams.toString();
    return fetchApi<{ requests: RequestWithDetails[] }>(`/requests${query ? `?${query}` : ""}`);
  },

  get: (id: string) => fetchApi<{ request: RequestWithDetails }>(`/requests/${id}`),

  create: (data: CreateRequestInput) =>
    fetchApi<{ request: RequestWithDetails }>("/requests", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateRequestInput) =>
    fetchApi<{ request: RequestWithDetails }>(`/requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/requests/${id}`, {
      method: "DELETE",
    }),

  toggleUpvote: (id: string) =>
    fetchApi<{ upvoted: boolean }>(`/requests/${id}/upvote`, {
      method: "POST",
    }),

  addComment: (id: string, data: CreateCommentInput) =>
    fetchApi<{ comment: unknown }>(`/requests/${id}/comments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Tags
export const tagsApi = {
  list: () => fetchApi<{ tags: { id: string; name: string; color: string }[] }>("/tags"),

  create: (data: CreateTagInput) =>
    fetchApi<{ tag: { id: string; name: string; color: string } }>("/tags", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateTagInput>) =>
    fetchApi<{ tag: { id: string; name: string; color: string } }>(`/tags/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/tags/${id}`, {
      method: "DELETE",
    }),
};

// Custom Fields
export const customFieldsApi = {
  list: (inboxId?: string) => {
    const query = inboxId ? `?inboxId=${inboxId}` : "";
    return fetchApi<{ fields: CustomFieldDefinition[] }>(`/custom-fields${query}`);
  },

  create: (data: CreateCustomFieldInput) =>
    fetchApi<{ field: CustomFieldDefinition }>("/custom-fields", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateCustomFieldInput) =>
    fetchApi<{ field: CustomFieldDefinition }>(`/custom-fields/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/custom-fields/${id}`, {
      method: "DELETE",
    }),

  reorder: (ids: string[]) =>
    fetchApi<{ success: boolean }>("/custom-fields/reorder", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
};
