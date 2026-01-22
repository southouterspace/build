import { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { TrackballControls } from '@react-three/drei'
import { Cube } from './-Cube'

export function CubeScene() {
  const [autoRotate, setAutoRotate] = useState(true)

  const handleInteractionStart = useCallback(() => {
    setAutoRotate(false)
  }, [])

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      style={{
        width: '100%',
        height: '100%',
        touchAction: 'none',
      }}
    >
      <Cube autoRotate={autoRotate} />
      <TrackballControls
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
