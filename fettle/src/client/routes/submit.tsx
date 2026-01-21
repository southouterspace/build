import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useSession } from "../lib/auth-client";
import { requestsApi, tagsApi, customFieldsApi } from "../lib/api";
import type { CustomFieldDefinition } from "@shared/types";

function DynamicField({
  definition,
  value,
  onChange,
}: {
  definition: CustomFieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (definition.fieldType) {
    case "text":
      return (
        <input
          type="text"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      );
    case "textarea":
      return (
        <textarea
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      );
    case "number":
      return (
        <input
          type="number"
          value={(value as number) || ""}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      );
    case "select":
      return (
        <select
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value || null)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Select...</option>
          {definition.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    case "multi_select":
      const selected = (value as string[]) || [];
      return (
        <div className="mt-1 flex flex-wrap gap-2">
          {definition.options?.map((opt) => (
            <label key={opt} className="inline-flex items-center">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange([...selected, opt]);
                  } else {
                    onChange(selected.filter((s) => s !== opt));
                  }
                }}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{opt}</span>
            </label>
          ))}
        </div>
      );
    case "date":
      return (
        <input
          type="date"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value || null)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      );
    case "boolean":
      return (
        <label className="mt-1 inline-flex items-center">
          <input
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Yes</span>
        </label>
      );
    default:
      return null;
  }
}

function SubmitPage() {
  const navigate = useNavigate();
  const { data: session, isPending: sessionPending } = useSession();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [productArea, setProductArea] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [urgencyHint, setUrgencyHint] = useState("");
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>({});
  const [error, setError] = useState("");

  const { data: tagsData } = useQuery({
    queryKey: ["tags"],
    queryFn: () => tagsApi.list(),
    enabled: !!session?.user,
  });

  const { data: customFieldsData } = useQuery({
    queryKey: ["custom-fields"],
    queryFn: () => customFieldsApi.list(),
    enabled: !!session?.user,
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      requestsApi.create({
        title,
        description,
        category: category || null,
        productArea: productArea || null,
        tags: selectedTags,
        urgencyHint: urgencyHint as "critical" | "standard" | "low" | null,
        customFields: customFieldValues,
      }),
    onSuccess: (data) => {
      navigate({ to: "/requests/$id", params: { id: data.request.id } });
    },
    onError: (err) => {
      setError(err.message);
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

  const tags = tagsData?.tags || [];
  const customFields = customFieldsData?.fields || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    // Validate required custom fields
    for (const field of customFields) {
      if (field.isRequired && !customFieldValues[field.name]) {
        setError(`${field.label} is required`);
        return;
      }
    }

    submitMutation.mutate();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h1 className="text-2xl font-bold text-gray-900">Submit a Request</h1>
          <p className="mt-1 text-sm text-gray-500">
            Describe what you need and we'll add it to the backlog.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="border-t border-gray-200 px-4 py-5 sm:px-6 space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of your request"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Describe what you need, why it's important, and any relevant context..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select category...</option>
                <option value="feature">Feature Request</option>
                <option value="bug">Bug Report</option>
                <option value="data">Data / Reporting</option>
                <option value="integration">Integration</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="urgency" className="block text-sm font-medium text-gray-700">
                How urgent is this?
              </label>
              <select
                id="urgency"
                value={urgencyHint}
                onChange={(e) => setUrgencyHint(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select urgency...</option>
                <option value="critical">Critical - Blocking work</option>
                <option value="standard">Standard - Would be nice</option>
                <option value="low">Low - Whenever possible</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="productArea" className="block text-sm font-medium text-gray-700">
              Product Area
            </label>
            <input
              type="text"
              id="productArea"
              value={productArea}
              onChange={(e) => setProductArea(e.target.value)}
              placeholder="e.g., Dashboard, Reports, Settings"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Division / Team</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <label
                    key={tag.id}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
                      selectedTags.includes(tag.name)
                        ? "ring-2 ring-offset-1"
                        : "hover:opacity-80"
                    }`}
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                      ...(selectedTags.includes(tag.name) ? { ringColor: tag.color } : {}),
                    }}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selectedTags.includes(tag.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTags([...selectedTags, tag.name]);
                        } else {
                          setSelectedTags(selectedTags.filter((t) => t !== tag.name));
                        }
                      }}
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Custom Fields */}
          {customFields.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Additional Information</h3>
              <div className="space-y-4">
                {customFields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                      {field.isRequired && <span className="text-red-500"> *</span>}
                    </label>
                    {field.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{field.description}</p>
                    )}
                    <DynamicField
                      definition={field}
                      value={customFieldValues[field.name]}
                      onChange={(value) =>
                        setCustomFieldValues({ ...customFieldValues, [field.name]: value })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/submit")({
  component: SubmitPage,
});
