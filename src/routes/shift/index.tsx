import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/shift/')({
  component: ShiftPage,
})

function ShiftPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight">Shift</h1>
    </div>
  )
}
