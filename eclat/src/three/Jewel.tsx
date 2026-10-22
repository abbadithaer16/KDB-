import { useBinaryUrl } from '../lib/binary'
import { asset } from '../lib/asset'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useGLTF, MeshRefractionMaterial } from '@react-three/drei'
import { metalMaterial, velvetMaterial } from './materials'

/**
 * The GLBs are meshopt-compressed with KHR_mesh_quantization (normalized int16
 * positions). three-mesh-bvh builds its BVH from the raw typed array, so a gem's
 * BVH must be built from de-quantized float positions or the traced stone ends
 * up ~32k× larger than the visible one.
 */
function floatGeometry(src: THREE.BufferGeometry): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry()
  for (const name of ['position', 'normal'] as const) {
    const a = src.getAttribute(name) as THREE.BufferAttribute | undefined
    if (!a) continue
    const out = new Float32Array(a.count * 3)
    for (let i = 0; i < a.count; i++) {
      out[i * 3] = a.getX(i)
      out[i * 3 + 1] = a.getY(i)
      out[i * 3 + 2] = a.getZ(i)
    }
    g.setAttribute(name, new THREE.BufferAttribute(out, 3))
  }
  if (src.index) g.setIndex(src.index.clone())
  g.computeBoundingBox()
  g.computeBoundingSphere()
  return g
}

export interface GemTuning {
  bounces: number
  aberration: number
  brightness: number
  /** shared colour multiplier — mutate it per frame to fade the stones with the light */
  color?: THREE.Color
}

/**
 * Loads one of the ÉCLAT GLBs and re-materials it:
 *  · metal_*  → shared physical metal (live yellow/white switch)
 *  · velvet   → display-bust velvet
 *  · diamond  → drei MeshRefractionMaterial (BVH ray-traced internal bounces,
 *               chromatic dispersion). Works for single meshes and the
 *               EXT_mesh_gpu_instancing stones of the bracelet.
 */
export function Jewel({ url, env, gem }: { url: string; env: THREE.Texture; gem: GemTuning }) {
  const gltf = useGLTF(useBinaryUrl(url))

  const { gems } = useMemo(() => {
    const scene = gltf.scene
    scene.updateMatrixWorld(true)
    const inv = new THREE.Matrix4().copy(scene.matrixWorld).invert()
    const found: { src: THREE.Mesh; rel: THREE.Matrix4 }[] = []
    scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      const name = (m.material as THREE.Material).name || ''
      if (name === 'diamond') {
        found.push({ src: m, rel: new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld) })
        m.visible = false
      } else if (name.startsWith('metal')) {
        m.material = metalMaterial
      } else if (name === 'velvet') {
        m.material = velvetMaterial
      }
      m.frustumCulled = !(m as THREE.InstancedMesh).isInstancedMesh
    })
    return { gems: found }
  }, [gltf])

  return (
    <>
      <primitive object={gltf.scene} />
      {gems.map(({ src, rel }) => (
        <Gem key={src.uuid} src={src} rel={rel} env={env} gem={gem} />
      ))}
    </>
  )
}

function Gem({
  src,
  rel,
  env,
  gem,
}: {
  src: THREE.Mesh
  rel: THREE.Matrix4
  env: THREE.Texture
  gem: GemTuning
}) {
  const ref = useRef<THREE.Mesh>(null!)
  const inst = (src as THREE.InstancedMesh).isInstancedMesh ? (src as THREE.InstancedMesh) : null
  const color = useMemo(() => gem.color ?? new THREE.Color(gem.brightness, gem.brightness, gem.brightness), [gem])
  const geometry = useMemo(() => floatGeometry(src.geometry), [src])

  useLayoutEffect(() => {
    const m = ref.current
    m.matrixAutoUpdate = false
    m.matrix.copy(rel)
    m.matrixWorldNeedsUpdate = true
    if (inst) {
      const im = m as unknown as THREE.InstancedMesh
      im.instanceMatrix.copy(inst.instanceMatrix)
      im.instanceMatrix.needsUpdate = true
      im.count = inst.count
    }
  }, [inst, rel])

  const material = (
    <MeshRefractionMaterial
      envMap={env}
      bounces={gem.bounces}
      ior={2.42}
      fresnel={1}
      aberrationStrength={gem.aberration}
      fastChroma
      color={color}
      toneMapped={false}
    />
  )

  if (inst) {
    return (
      <instancedMesh
        ref={ref as unknown as React.Ref<THREE.InstancedMesh>}
        args={[geometry, undefined, inst.count]}
        frustumCulled={false}
      >
        {material}
      </instancedMesh>
    )
  }
  return (
    <mesh ref={ref} geometry={geometry}>
      {material}
    </mesh>
  )
}

// only the hero piece is critical; the necklace and bracelet stream in after the intro
if (import.meta.env.VITE_PACKED !== '1') useGLTF.preload(asset('models/ring.glb'))
