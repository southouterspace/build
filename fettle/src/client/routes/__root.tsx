import { createRootRoute, Outlet, Link } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSession, signOut } from "../lib/auth-client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

function RootLayout() {
  const { data: session, isPending } = useSession();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="text-xl font-bold text-gray-900">
                  Fettle
                </Link>
                {session?.user && (
                  <div className="ml-10 flex items-center space-x-4">
                    <Link
                      to="/requests"
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium [&.active]:text-indigo-600"
                    >
                      Requests
                    </Link>
                    <Link
                      to="/submit"
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium [&.active]:text-indigo-600"
                    >
                      Submit
                    </Link>
                    {session.user.role === "admin" && (
                      <Link
                        to="/admin"
                        className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium [&.active]:text-indigo-600"
                      >
                        Admin
                      </Link>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center">
                {isPending ? (
                  <div className="text-sm text-gray-500">Loading...</div>
                ) : session?.user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {session.user.name}
                      {session.user.role === "admin" && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                          Admin
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => signOut()}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/login"
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
        <main>
          <Outlet />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
