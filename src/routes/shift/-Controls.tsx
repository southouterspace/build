import type { ViewDirection, ProjectionType } from './-types'

interface ControlsProps {
  projection: ProjectionType
  onProjectionChange: (type: ProjectionType) => void
  onViewChange: (view: ViewDirection) => void
}

const views: { label: string; value: ViewDirection }[] = [
  { label: 'F', value: 'front' },
  { label: 'B', value: 'back' },
  { label: 'L', value: 'left' },
  { label: 'R', value: 'right' },
]

export function Controls({
  projection,
  onProjectionChange,
  onViewChange,
}: ControlsProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-md">
        {views.map((v) => (
          <button
            key={v.value}
            onClick={() => onViewChange(v.value)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white/70 transition-colors hover:bg-white/20 hover:text-white"
          >
            {v.label}
          </button>
        ))}
        <div className="mx-1 h-4 w-px bg-white/20" />
        <button
          onClick={() =>
            onProjectionChange(
              projection === 'perspective' ? 'orthographic' : 'perspective',
            )
          }
          className="flex h-8 items-center justify-center rounded-full px-3 text-xs font-medium text-white/70 transition-colors hover:bg-white/20 hover:text-white"
        >
          {projection === 'perspective' ? 'Persp' : 'Ortho'}
        </button>
      </div>
    </div>
  )
}
