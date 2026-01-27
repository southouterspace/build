import { useRef, useState, useMemo, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  BoxGeometry,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  MeshStandardMaterial,
  Raycaster,
  Vector2,
} from 'three'
import type { Group, Mesh } from 'three'

interface CubeProps {
  autoRotate: boolean
  onInteraction: () => void
}

const boxGeo = new BoxGeometry(2, 2, 2)
const edgesGeo = new EdgesGeometry(boxGeo)
const edgesMat = new LineBasicMaterial({ color: '#ffffff' })
const edges = new LineSegments(edgesGeo, edgesMat)

export function Cube({ autoRotate, onInteraction }: CubeProps) {
  const groupRef = useRef<Group>(null)
  const meshRef = useRef<Mesh>(null)
  const pointerRef = useRef<{ x: number; y: number; time: number } | null>(
    null,
  )

  const [solidFaces, setSolidFaces] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
  ])

  const { camera, gl } = useThree()

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
      return new MeshStandardMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      })
    })
  }, [solidFaces])

  const handlePointerDown = useCallback((e: PointerEvent) => {
    pointerRef.current = { x: e.clientX, y: e.clientY, time: Date.now() }
  }, [])

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      const start = pointerRef.current
      if (!start) return
      pointerRef.current = null

      const dx = e.clientX - start.x
      const dy = e.clientY - start.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const elapsed = Date.now() - start.time

      if (elapsed > 300 || dist > 10) return

      const rect = gl.domElement.getBoundingClientRect()
      const mouse = new Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      const raycaster = new Raycaster()
      raycaster.setFromCamera(mouse, camera)

      if (!meshRef.current) return
      const intersects = raycaster.intersectObject(meshRef.current)
      if (intersects.length > 0 && intersects[0].faceIndex != null) {
        const cubeFace = Math.floor(intersects[0].faceIndex / 2)
        onInteraction()
        setSolidFaces((prev) => {
          const next = [...prev]
          next[cubeFace] = !next[cubeFace]
          return next
        })
      }
    },
    [camera, gl, onInteraction],
  )

  useEffect(() => {
    const canvas = gl.domElement
    canvas.addEventListener('pointerdown', handlePointerDown)
    canvas.addEventListener('pointerup', handlePointerUp)
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown)
      canvas.removeEventListener('pointerup', handlePointerUp)
    }
  }, [gl, handlePointerDown, handlePointerUp])

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} material={materials} geometry={boxGeo} />
      <primitive object={edges} />
    </group>
  )
}
