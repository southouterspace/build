import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight">Build</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        A collection of tools for working with data.
      </p>

      <div className="mt-12 grid gap-6">
        <Link
          to="/charter"
          className="group rounded-lg border bg-card p-6 transition-colors hover:border-primary"
        >
          <h2 className="text-xl font-semibold group-hover:text-primary">
            Charter
          </h2>
          <p className="mt-2 text-muted-foreground">
            Visualize CSV and Excel data as interactive charts. Supports area,
            bar, line, radar, and radial charts with multiple variants.
          </p>
        </Link>
      </div>
    </div>
  )
}
