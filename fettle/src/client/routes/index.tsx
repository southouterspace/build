import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useSession } from "../lib/auth-client";

function IndexPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (session?.user) {
    return <Navigate to="/requests" />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Fettle
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Request management for product teams
        </p>
        <p className="mt-2 text-gray-500">
          Capture, organize, and prioritize requests from across your organization.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a
            href="/login"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Sign in
          </a>
          <a
            href="/register"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Get started
          </a>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Email Intake</h3>
          <p className="mt-2 text-sm text-gray-500">
            Forward emails to auto-create tickets with AI-powered field extraction.
          </p>
        </div>
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Upvoting</h3>
          <p className="mt-2 text-sm text-gray-500">
            Let stakeholders vote on requests to surface demand signals.
          </p>
        </div>
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Custom Fields</h3>
          <p className="mt-2 text-sm text-gray-500">
            Define your own schema to capture business-specific details.
          </p>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: IndexPage,
});
