import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-6">
          <Link to="/" className="text-lg font-semibold">
            Build
          </Link>
          <div className="flex gap-4">
            <Link
              to="/charter"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground"
            >
              Charter
            </Link>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  )
}
