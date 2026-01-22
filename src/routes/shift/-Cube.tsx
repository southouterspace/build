import { useRef, useState, useMemo, useCallback } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Edges } from '@react-three/drei'
import { MeshStandardMaterial } from 'three'
import type { Group } from 'three'

interface CubeProps {
  autoRotate: boolean
}

export function Cube({ autoRotate }: CubeProps) {
  const groupRef = useRef<Group>(null)
  const [solidFaces, setSolidFaces] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
  ])

  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.x += delta * 0.2
      groupRef.current.rotation.y += delta * 0.3
    }
  })

  const materials = useMemo(() => {
    return solidFaces.map((isSolid) => {
      if (isSolid) {
        return new MeshStandardMaterial({ color: '#ffffff' })
      }
      return new MeshStandardMaterial({ transparent: true, opacity: 0 })
    })
  }, [solidFaces])

  const handleClick = useCallback((event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    const faceIndex = event.faceIndex
    if (faceIndex != null) {
      const cubeFace = Math.floor(faceIndex / 2)
      setSolidFaces((prev) => {
        const next = [...prev]
        next[cubeFace] = !next[cubeFace]
        return next
      })
    }
  }, [])

  return (
    <group ref={groupRef}>
      <mesh material={materials} onClick={handleClick}>
        <boxGeometry args={[2, 2, 2]} />
        <Edges color="#ffffff" />
      </mesh>
    </group>
  )
}
