import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useSession } from "../lib/auth-client";
import { tagsApi, customFieldsApi } from "../lib/api";
import type { FieldType } from "@shared/types";

function AdminPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const queryClient = useQueryClient();

  // Tags state
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6B7280");

  // Custom fields state
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [fieldName, setFieldName] = useState("");
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldDescription, setFieldDescription] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>("text");
  const [fieldOptions, setFieldOptions] = useState("");
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldAiExtracted, setFieldAiExtracted] = useState(true);

  const { data: tagsData } = useQuery({
    queryKey: ["tags"],
    queryFn: () => tagsApi.list(),
    enabled: !!session?.user,
  });

  const { data: fieldsData } = useQuery({
    queryKey: ["custom-fields"],
    queryFn: () => customFieldsApi.list(),
    enabled: !!session?.user,
  });

  const createTagMutation = useMutation({
    mutationFn: () => tagsApi.create({ name: newTagName, color: newTagColor }),
    onSuccess: () => {
      setNewTagName("");
      setNewTagColor("#6B7280");
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: (id: string) => tagsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  const createFieldMutation = useMutation({
    mutationFn: () =>
      customFieldsApi.create({
        name: fieldName,
        label: fieldLabel,
        description: fieldDescription || undefined,
        fieldType,
        options: fieldType === "select" || fieldType === "multi_select"
          ? fieldOptions.split(",").map((o) => o.trim()).filter(Boolean)
          : undefined,
        isRequired: fieldRequired,
        isAiExtracted: fieldAiExtracted,
      }),
    onSuccess: () => {
      setShowFieldForm(false);
      resetFieldForm();
      queryClient.invalidateQueries({ queryKey: ["custom-fields"] });
    },
  });

  const deleteFieldMutation = useMutation({
    mutationFn: (id: string) => customFieldsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-fields"] });
    },
  });

  const resetFieldForm = () => {
    setFieldName("");
    setFieldLabel("");
    setFieldDescription("");
    setFieldType("text");
    setFieldOptions("");
    setFieldRequired(false);
    setFieldAiExtracted(true);
  };

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

  if (session.user.role !== "admin") {
    return <Navigate to="/requests" />;
  }

  const tags = tagsData?.tags || [];
  const fields = fieldsData?.fields || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Settings</h1>

      {/* Tags Section */}
      <div className="bg-white shadow sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Tags</h2>
          <p className="mt-1 text-sm text-gray-500">
            Tags are used to categorize requests by division or team.
          </p>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm"
                style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
              >
                {tag.name}
                <button
                  onClick={() => deleteTagMutation.mutate(tag.id)}
                  className="ml-2 hover:opacity-70"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
            {tags.length === 0 && <p className="text-sm text-gray-500">No tags yet.</p>}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newTagName.trim()) createTagMutation.mutate();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Tag name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <input
              type="color"
              value={newTagColor}
              onChange={(e) => setNewTagColor(e.target.value)}
              className="w-10 h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
            />
            <button
              type="submit"
              disabled={!newTagName.trim() || createTagMutation.isPending}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              Add Tag
            </button>
          </form>
        </div>
      </div>

      {/* Custom Fields Section */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Custom Fields</h2>
            <p className="mt-1 text-sm text-gray-500">
              Define additional fields for request forms and AI extraction.
            </p>
          </div>
          <button
            onClick={() => setShowFieldForm(true)}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add Field
          </button>
        </div>

        <div className="px-4 py-5 sm:px-6">
          {fields.length === 0 ? (
            <p className="text-sm text-gray-500">No custom fields defined yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {fields.map((field) => (
                <li key={field.id} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{field.label}</p>
                    <p className="text-xs text-gray-500">
                      {field.name} · {field.fieldType}
                      {field.isRequired && " · Required"}
                      {field.isAiExtracted && " · AI extracted"}
                    </p>
                    {field.options && (
                      <p className="text-xs text-gray-400 mt-1">
                        Options: {field.options.join(", ")}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteFieldMutation.mutate(field.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Add Field Modal */}
        {showFieldForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Custom Field</h3>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createFieldMutation.mutate();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Field Name (snake_case)
                  </label>
                  <input
                    type="text"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                    placeholder="customer_tier"
                    pattern="^[a-z_]+$"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Display Label</label>
                  <input
                    type="text"
                    value={fieldLabel}
                    onChange={(e) => setFieldLabel(e.target.value)}
                    placeholder="Customer Tier"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
                  <input
                    type="text"
                    value={fieldDescription}
                    onChange={(e) => setFieldDescription(e.target.value)}
                    placeholder="Help text for this field"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Field Type</label>
                  <select
                    value={fieldType}
                    onChange={(e) => setFieldType(e.target.value as FieldType)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="text">Text</option>
                    <option value="textarea">Text Area</option>
                    <option value="number">Number</option>
                    <option value="select">Select (dropdown)</option>
                    <option value="multi_select">Multi-select</option>
                    <option value="date">Date</option>
                    <option value="boolean">Checkbox</option>
                  </select>
                </div>

                {(fieldType === "select" || fieldType === "multi_select") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Options (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={fieldOptions}
                      onChange={(e) => setFieldOptions(e.target.value)}
                      placeholder="Option 1, Option 2, Option 3"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={fieldRequired}
                      onChange={(e) => setFieldRequired(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Required</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={fieldAiExtracted}
                      onChange={(e) => setFieldAiExtracted(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">AI Extracted</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowFieldForm(false);
                      resetFieldForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createFieldMutation.isPending}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {createFieldMutation.isPending ? "Creating..." : "Create Field"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});
