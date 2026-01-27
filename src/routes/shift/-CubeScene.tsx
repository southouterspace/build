import { useState, useCallback, useRef, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { TrackballControls } from '@react-three/drei'
import { Vector3 } from 'three'
import { Cube } from './-Cube'
import type { ViewDirection, ProjectionType } from './-types'

interface CubeSceneProps {
  projection: ProjectionType
  pendingView: ViewDirection | null
  onViewApplied: () => void
}

const CAMERA_DISTANCE = 5

const VIEW_POSITIONS: Record<ViewDirection, [number, number, number]> = {
  front: [0, 0, CAMERA_DISTANCE],
  back: [0, 0, -CAMERA_DISTANCE],
  left: [-CAMERA_DISTANCE, 0, 0],
  right: [CAMERA_DISTANCE, 0, 0],
}

function CameraSnap({
  view,
  onApplied,
}: {
  view: ViewDirection | null
  onApplied: () => void
}) {
  const { camera } = useThree()

  useEffect(() => {
    if (!view) return
    const [x, y, z] = VIEW_POSITIONS[view]
    camera.position.set(x, y, z)
    camera.lookAt(new Vector3(0, 0, 0))
    camera.updateProjectionMatrix()
    onApplied()
  }, [view, camera, onApplied])

  return null
}

export function CubeScene({
  projection,
  pendingView,
  onViewApplied,
}: CubeSceneProps) {
  const [autoRotate, setAutoRotate] = useState(true)
  const controlsRef = useRef(null)

  const handleInteractionStart = useCallback(() => {
    setAutoRotate(false)
  }, [])

  const perspectiveCamera = {
    position: [0, 0, CAMERA_DISTANCE] as [number, number, number],
    fov: 75,
  }

  const orthoCamera = {
    position: [0, 0, CAMERA_DISTANCE] as [number, number, number],
    zoom: 150,
    near: 0.1,
    far: 1000,
  }

  return (
    <Canvas
      key={projection}
      orthographic={projection === 'orthographic'}
      camera={projection === 'orthographic' ? orthoCamera : perspectiveCamera}
      style={{
        width: '100%',
        height: '100%',
        touchAction: 'none',
      }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, -5, -5]} intensity={0.5} />
      <CameraSnap view={pendingView} onApplied={onViewApplied} />
      <Cube autoRotate={autoRotate} onInteraction={handleInteractionStart} />
      <TrackballControls
        ref={controlsRef}
        noPan
        noZoom={false}
        minDistance={2.5}
        maxDistance={10}
        dynamicDampingFactor={0.05}
        onStart={handleInteractionStart}
      />
    </Canvas>
  )
}
