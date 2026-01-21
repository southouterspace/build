import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useSession } from "../lib/auth-client";
import { requestsApi } from "../lib/api";
import { cn, statusColors, categoryColors, formatDate, formatRelativeDate, impactColors } from "../lib/utils";
import type { Status } from "@shared/types";

function RequestDetailPage() {
  const { id } = Route.useParams();
  const { data: session, isPending: sessionPending } = useSession();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["request", id],
    queryFn: () => requestsApi.get(id),
    enabled: !!session?.user,
  });

  const upvoteMutation = useMutation({
    mutationFn: () => requestsApi.toggleUpvote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request", id] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: () => requestsApi.addComment(id, { content: comment, isInternal }),
    onSuccess: () => {
      setComment("");
      setIsInternal(false);
      queryClient.invalidateQueries({ queryKey: ["request", id] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: Status) => requestsApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request", id] });
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Loading request...</div>
      </div>
    );
  }

  const request = data?.request;
  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Request not found</div>
      </div>
    );
  }

  const isAdmin = session.user.role === "admin";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <button
                onClick={() => upvoteMutation.mutate()}
                className={cn(
                  "flex flex-col items-center justify-center w-16 h-16 rounded-lg border text-sm font-medium transition-colors",
                  request.hasUpvoted
                    ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                )}
              >
                <svg
                  className="w-5 h-5"
                  fill={request.hasUpvoted ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                <span className="text-lg">{request.upvoteCount}</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Submitted by {request.requesterEmail} · {formatRelativeDate(request.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className={cn("px-3 py-1 rounded-full text-sm font-medium", statusColors[request.status])}>
                {request.status.replace("_", " ")}
              </span>
              {request.category && (
                <span className={cn("px-3 py-1 rounded-full text-sm font-medium", categoryColors[request.category])}>
                  {request.category}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Description</h2>
          <p className="text-gray-900 whitespace-pre-wrap">{request.description}</p>
        </div>

        {/* Tags */}
        {request.tags.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {request.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Custom Fields */}
        {request.customFields.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h2 className="text-sm font-medium text-gray-500 mb-3">Additional Details</h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              {request.customFields.map((field) => (
                <div key={field.fieldId}>
                  <dt className="text-sm font-medium text-gray-500">{field.label}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{field.value || "-"}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Admin Details */}
        {isAdmin && (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6 bg-gray-50">
            <h2 className="text-sm font-medium text-gray-500 mb-3">Admin Details</h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Business Impact</dt>
                <dd className={cn("mt-1 text-sm font-medium", impactColors[request.businessImpact || ""] || "text-gray-400")}>
                  {request.businessImpact || "Not set"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Effort</dt>
                <dd className="mt-1 text-sm text-gray-900">{request.effortEstimate?.toUpperCase() || "Not set"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Priority Score</dt>
                <dd className="mt-1 text-sm text-gray-900">{request.priorityScore}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Target</dt>
                <dd className="mt-1 text-sm text-gray-900">{request.targetQuarter || "Not set"}</dd>
              </div>
            </dl>

            <div className="mt-4">
              <label className="text-sm font-medium text-gray-500">Change Status</label>
              <select
                value={request.status}
                onChange={(e) => statusMutation.mutate(e.target.value as Status)}
                className="mt-1 block w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="new">New</option>
                <option value="triaged">Triaged</option>
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="delivered">Delivered</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          </div>
        )}

        {/* Status History */}
        {request.statusHistory && request.statusHistory.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h2 className="text-sm font-medium text-gray-500 mb-3">History</h2>
            <ul className="space-y-3">
              {request.statusHistory.map((entry: any) => (
                <li key={entry.id} className="text-sm text-gray-600">
                  <span className="font-medium">{entry.changedByName}</span> changed status
                  {entry.fromStatus && (
                    <>
                      {" "}from <span className="font-medium">{entry.fromStatus}</span>
                    </>
                  )}
                  {" "}to <span className="font-medium">{entry.toStatus}</span>
                  <span className="text-gray-400"> · {formatDate(entry.createdAt)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Comments */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h2 className="text-sm font-medium text-gray-500 mb-3">Comments</h2>

          {request.comments && request.comments.length > 0 ? (
            <ul className="space-y-4 mb-6">
              {request.comments.map((c: any) => (
                <li
                  key={c.id}
                  className={cn("p-3 rounded-lg", c.isInternal ? "bg-yellow-50 border border-yellow-100" : "bg-gray-50")}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{c.userName}</span>
                    <span className="text-xs text-gray-500">{formatRelativeDate(c.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{c.content}</p>
                  {c.isInternal && (
                    <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      Internal
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 mb-6">No comments yet.</p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (comment.trim()) commentMutation.mutate();
            }}
          >
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <div className="mt-3 flex items-center justify-between">
              {isAdmin && (
                <label className="flex items-center text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  Internal comment (admin only)
                </label>
              )}
              <button
                type="submit"
                disabled={!comment.trim() || commentMutation.isPending}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {commentMutation.isPending ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/requests/$id")({
  component: RequestDetailPage,
});
