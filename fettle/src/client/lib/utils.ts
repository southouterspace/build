import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeDate(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  triaged: "bg-yellow-100 text-yellow-800",
  planned: "bg-purple-100 text-purple-800",
  in_progress: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  declined: "bg-gray-100 text-gray-800",
};

export const categoryColors: Record<string, string> = {
  feature: "bg-indigo-100 text-indigo-800",
  bug: "bg-red-100 text-red-800",
  data: "bg-cyan-100 text-cyan-800",
  integration: "bg-pink-100 text-pink-800",
  other: "bg-gray-100 text-gray-800",
};

export const impactColors: Record<string, string> = {
  high: "text-red-600",
  medium: "text-yellow-600",
  low: "text-green-600",
};
