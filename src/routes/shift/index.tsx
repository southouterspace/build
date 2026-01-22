import { createFileRoute } from '@tanstack/react-router'
import { CubeScene } from './-CubeScene'

export const Route = createFileRoute('/shift/')({
  component: ShiftPage,
})

function ShiftPage() {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black">
      <CubeScene />
    </div>
  )
}
