import { useState, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { CubeScene } from './-CubeScene'
import { Controls } from './-Controls'
import type { ViewDirection, ProjectionType } from './-types'

export const Route = createFileRoute('/shift/')({
  component: ShiftPage,
})

function ShiftPage() {
  const [projection, setProjection] = useState<ProjectionType>('perspective')
  const [pendingView, setPendingView] = useState<ViewDirection | null>(null)

  const handleViewApplied = useCallback(() => {
    setPendingView(null)
  }, [])

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black">
      <CubeScene
        projection={projection}
        pendingView={pendingView}
        onViewApplied={handleViewApplied}
      />
      <Controls
        projection={projection}
        onProjectionChange={setProjection}
        onViewChange={setPendingView}
      />
    </div>
  )
}
