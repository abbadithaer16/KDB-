import { fetchBinary } from '../data'
import { useEffect, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { DataTexture, DoubleSide, LinearFilter, MeshBasicMaterial, PlaneGeometry, RGBAFormat, Vector3 } from 'three'
import type { Mesh } from 'three'
import { TOKENS, rig } from '../rig'
import { anchors } from '../anchors'

type Meta = { y: number; x0: number; z0: number; d: number; nx: number; nz: number }
const BASE = import.meta.env.BASE_URL
const COLORS: Record<number, string> = { 1: TOKENS.capGrey, 2: TOKENS.capWhite, 3: TOKENS.deepNuclei, 4: '#7A6F68' }

/**
 * The scene 1 cut face: a true cross-section of the model at the cut height
 * (pipeline/build_section.mjs), drawn flat on the lower half when the top is lifted.
 */
export function Section() {
  const [data, setData] = useState<{ meta: Meta; tex: DataTexture } | null>(null)
  useEffect(() => {
    let alive = true
    Promise.all([fetch(`${BASE}data/section.json`).then((r) => r.json()), fetchBinary('data/section.bin')])
      .then(([meta, buf]: [Meta, ArrayBuffer]) => {
        if (!alive) return
        const cls = new Uint8Array(buf)
        const rgba = new Uint8Array(cls.length * 4)
        const rgb = Object.fromEntries(Object.entries(COLORS).map(([k, hex]) => [k, [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))]))
        for (let i = 0; i < cls.length; i++) {
          const c = rgb[cls[i]]
          if (!c) continue
          rgba[i * 4] = c[0]; rgba[i * 4 + 1] = c[1]; rgba[i * 4 + 2] = c[2]; rgba[i * 4 + 3] = 255
        }
        const tex = new DataTexture(rgba, meta.nx, meta.nz, RGBAFormat)
        tex.magFilter = LinearFilter
        tex.minFilter = LinearFilter
        tex.flipY = false
        tex.needsUpdate = true
        // Label anchors from the map itself: grey ribbon at the front-left edge, white matter inside.
        const at = (ix: number, iz: number) => new Vector3(meta.x0 + (ix + 0.5) * meta.d, meta.y, meta.z0 + (iz + 0.5) * meta.d)
        let grey: Vector3 | null = null
        let gScore = -Infinity
        let wx = 0, wz = 0, wn = 0
        for (let iz = 0; iz < meta.nz; iz++) for (let ix = 0; ix < meta.nx; ix++) {
          const v = cls[iz * meta.nx + ix]
          const p = at(ix, iz)
          if (v === 1 && p.z > 0) { const s = p.z * 1.0 - p.x * 0.6; if (s > gScore) { gScore = s; grey = p } }
          if (v === 2 && p.z > 0.2 && p.z < 0.5 && p.x > -0.5 && p.x < -0.1) { wx += p.x; wz += p.z; wn++ }
        }
        if (grey) anchors['living-fold-section:grey'] = grey.add(new Vector3(0.01, 0, -0.012))
        if (wn) anchors['living-fold-section:white'] = new Vector3(wx / wn, meta.y, wz / wn)
        setData({ meta, tex })
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  const mesh = useMemo(() => {
    if (!data) return null
    const { meta, tex } = data
    const w = meta.nx * meta.d
    const h = meta.nz * meta.d
    const g = new PlaneGeometry(w, h)
    g.rotateX(-Math.PI / 2) // into the xz plane, facing up
    // Texture rows run along +z from z0; after the rotation the plane's v runs along -z, so flip.
    g.scale(1, 1, -1)
    g.translate(meta.x0 + w / 2, meta.y + 0.0006, meta.z0 + h / 2)
    const m = new MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.5, side: DoubleSide, toneMapped: true })
    m.color.setScalar(0.86)
    const o = { g, m }
    return o
  }, [data])
  const ref = useMemo(() => ({ current: null as Mesh | null }), [])
  useFrame(() => { if (ref.current) ref.current.visible = rig.lift > 0.02 })
  useEffect(() => () => { mesh?.g.dispose(); mesh?.m.dispose(); data?.tex.dispose() }, [mesh, data])
  if (!mesh) return null
  return <mesh ref={(m) => { ref.current = m }} geometry={mesh.g} material={mesh.m} renderOrder={1} />
}
