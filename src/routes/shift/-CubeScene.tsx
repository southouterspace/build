import { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Cube } from './-Cube'

export function CubeScene() {
  const [autoRotate, setAutoRotate] = useState(true)

  const handleInteractionStart = useCallback(() => {
    setAutoRotate(false)
  }, [])

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      style={{ background: 'transparent' }}
    >
      <Cube autoRotate={autoRotate} />
      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.05}
        minDistance={2.5}
        maxDistance={10}
        onStart={handleInteractionStart}
      />
    </Canvas>
  )
}
