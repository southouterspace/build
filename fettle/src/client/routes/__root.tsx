import { createRootRoute, Outlet, Link } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useSession, signOut } from "../lib/auth-client";
import { orgApi } from "../lib/api";
import { createContext, useContext } from "react";
import type { Organization, OrgMembership } from "@shared/types";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

// Tenant context for sharing org/membership data
interface TenantContextType {
  org: Organization | null;
  membership: OrgMembership | null;
  isAdmin: boolean;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType>({
  org: null,
  membership: null,
  isAdmin: false,
  isLoading: true,
});

export function useTenant() {
  return useContext(TenantContext);
}

function TenantProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  const { data: orgData, isLoading } = useQuery({
    queryKey: ["org"],
    queryFn: () => orgApi.get(),
    enabled: !!session?.user,
    retry: false,
  });

  const value: TenantContextType = {
    org: orgData?.org ?? null,
    membership: orgData?.membership ?? null,
    isAdmin: orgData?.membership?.role === "admin",
    isLoading: !!session?.user && isLoading,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

function RootLayout() {
  const { data: session, isPending } = useSession();

  return (
    <QueryClientProvider client={queryClient}>
      <TenantProvider>
        <RootLayoutContent session={session} isPending={isPending} />
      </TenantProvider>
    </QueryClientProvider>
  );
}

function RootLayoutContent({
  session,
  isPending,
}: {
  session: { user: { name: string; email: string; role?: string } } | null;
  isPending: boolean;
}) {
  const { org, isAdmin } = useTenant();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900">
                Fettle
              </Link>
              {org && (
                <span className="ml-2 text-sm text-gray-500">/ {org.name}</span>
              )}
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
                  {isAdmin && (
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
                    {isAdmin && (
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
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
