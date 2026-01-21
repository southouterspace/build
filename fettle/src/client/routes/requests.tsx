import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useSession } from "../lib/auth-client";
import { requestsApi, tagsApi } from "../lib/api";
import { cn, statusColors, categoryColors, formatRelativeDate } from "../lib/utils";

function RequestsPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    status: "",
    category: "",
    tag: "",
    search: "",
    sort: "newest" as const,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["requests", filters],
    queryFn: () => requestsApi.list(filters),
    enabled: !!session?.user,
  });

  const { data: tagsData } = useQuery({
    queryKey: ["tags"],
    queryFn: () => tagsApi.list(),
    enabled: !!session?.user,
  });

  const upvoteMutation = useMutation({
    mutationFn: (id: string) => requestsApi.toggleUpvote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });

  if (sessionPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return <Navigate to="/login" />;
  }

  const requests = data?.requests || [];
  const tags = tagsData?.tags || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Requests</h1>
        <Link
          to="/submit"
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Submit Request
        </Link>
      </div>

      {/* Filters */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <input
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="triaged">Triaged</option>
          <option value="planned">Planned</option>
          <option value="in_progress">In Progress</option>
          <option value="delivered">Delivered</option>
          <option value="declined">Declined</option>
        </select>
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">All categories</option>
          <option value="feature">Feature</option>
          <option value="bug">Bug</option>
          <option value="data">Data</option>
          <option value="integration">Integration</option>
          <option value="other">Other</option>
        </select>
        <select
          value={filters.tag}
          onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">All tags</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.name}>
              {tag.name}
            </option>
          ))}
        </select>
        <select
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value as typeof filters.sort })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="most_upvoted">Most Upvoted</option>
          <option value="priority">Priority</option>
        </select>
      </div>

      {/* Requests list */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No requests found.{" "}
            <Link to="/submit" className="text-indigo-600 hover:text-indigo-500">
              Submit one?
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {requests.map((request) => (
              <li key={request.id}>
                <Link
                  to="/requests/$id"
                  params={{ id: request.id }}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            upvoteMutation.mutate(request.id);
                          }}
                          className={cn(
                            "flex flex-col items-center justify-center w-12 h-12 rounded-md border text-sm font-medium transition-colors",
                            request.hasUpvoted
                              ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                              : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                          )}
                        >
                          <svg
                            className="w-4 h-4"
                            fill={request.hasUpvoted ? "currentColor" : "none"}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                          <span>{request.upvoteCount}</span>
                        </button>
                        <div>
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {request.title}
                          </p>
                          <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                            {request.description}
                          </p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex flex-col items-end space-y-1">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            statusColors[request.status]
                          )}
                        >
                          {request.status.replace("_", " ")}
                        </span>
                        {request.category && (
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                              categoryColors[request.category]
                            )}
                          >
                            {request.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {request.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                            style={{
                              backgroundColor: `${tag.color}20`,
                              color: tag.color,
                            }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatRelativeDate(request.createdAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/requests")({
  component: RequestsPage,
});
