import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Edges } from '@react-three/drei'
import type { Group } from 'three'

interface CubeProps {
  autoRotate: boolean
}

export function Cube({ autoRotate }: CubeProps) {
  const groupRef = useRef<Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.x += delta * 0.2
      groupRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial transparent opacity={0} />
        <Edges color="#ffffff" />
      </mesh>
    </group>
  )
}
