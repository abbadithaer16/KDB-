import { useEffect, useMemo, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CatmullRomCurve3, Color, Vector3 } from 'three'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { TOKENS, rig } from '../rig'
import { COARSE } from '../state'

const BASE = import.meta.env.BASE_URL
type Plane = { y: number; start: number; count: number }

/**
 * Horizontal sections cut from the model's outer surfaces (pipeline/build_brain_data.mjs). They
 * stack from the top in scene 1 and fade as the slabs fill.
 */
export function Contours() {
  const [data, setData] = useState<{ geo: LineSegmentsGeometry; cumulative: number[] } | null>(null)
  useEffect(() => {
    let alive = true
    Promise.all([fetch(`${BASE}data/contours.json`).then((r) => r.json()), fetch(`${BASE}data/contours.bin`).then((r) => r.arrayBuffer())])
      .then(([meta, buf]: [{ scale: number; planes: Plane[] }, ArrayBuffer]) => {
        if (!alive) return
        const raw = new Int16Array(buf)
        const pos = new Float32Array((raw.length / 4) * 6)
        const cumulative: number[] = [0]
        for (const p of meta.planes) {
          for (let s = p.start; s < p.start + p.count; s++) {
            const o = s * 6
            pos[o] = raw[s * 4] * meta.scale
            pos[o + 1] = p.y
            pos[o + 2] = raw[s * 4 + 1] * meta.scale
            pos[o + 3] = raw[s * 4 + 2] * meta.scale
            pos[o + 4] = p.y
            pos[o + 5] = raw[s * 4 + 3] * meta.scale
          }
          cumulative.push(p.start + p.count)
        }
        const geo = new LineSegmentsGeometry()
        geo.setPositions(pos)
        setData({ geo, cumulative })
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])
  const mat = useMemo(() => new LineMaterial({ color: TOKENS.violet, linewidth: COARSE ? 1.2 : 1.4, transparent: true, opacity: 1, depthWrite: false }), [])
  const line = useMemo(() => (data ? new LineSegments2(data.geo, mat) : null), [data, mat])
  const { size } = useThree()
  useEffect(() => { mat.resolution.set(size.width, size.height) }, [size, mat])
  const violet = useMemo(() => new Color(TOKENS.violet), [])
  const ink = useMemo(() => new Color(TOKENS.ink), [])
  useFrame(() => {
    if (!line || !data) return
    const show = rig.world === 'brain' && rig.contourOpacity > 0.005 && rig.lift < 0.01
    line.visible = show
    if (!show) return
    const n = Math.min(rig.contours, data.cumulative.length - 1)
    const whole = Math.floor(n)
    const a = data.cumulative[whole]
    const b = data.cumulative[Math.min(whole + 1, data.cumulative.length - 1)]
    data.geo.instanceCount = Math.round(a + (b - a) * (n - whole))
    mat.opacity = rig.contourOpacity
    mat.color.copy(violet).lerp(ink, rig.contourInk)
  })
  useEffect(() => () => { data?.geo.dispose(); mat.dispose() }, [data, mat])
  return line ? <primitive object={line} renderOrder={5} /> : null
}

/** The central and lateral sulci, traced where the model's lobe meshes meet (scene 2). */
export function Landmarks() {
  const [lines, setLines] = useState<{ line: Line2; n: number }[]>([])
  const mat = useMemo(() => new LineMaterial({ color: TOKENS.violet, linewidth: COARSE ? 2 : 2.6, transparent: true, depthTest: false, depthWrite: false }), [])
  useEffect(() => {
    let alive = true
    fetch(`${BASE}data/landmarks.json`)
      .then((r) => r.json())
      .then((d: Record<string, { points: number[][] }>) => {
        if (!alive) return
        setLines(
          Object.values(d).map(({ points }) => {
            const curve = new CatmullRomCurve3(points.map(([x, y, z]) => new Vector3(x, y, z)), false, 'centripetal')
            const pts = curve.getPoints(120)
            const g = new LineGeometry()
            g.setPositions(pts.flatMap((p) => [p.x, p.y, p.z]))
            return { line: new Line2(g, mat), n: pts.length - 1 }
          }),
        )
      })
      .catch(() => {})
    return () => { alive = false }
  }, [mat])
  const { size } = useThree()
  useEffect(() => { mat.resolution.set(size.width, size.height) }, [size, mat])
  useFrame(() => {
    const show = rig.world === 'brain' && rig.landmark > 0.001 && rig.part < 0.001
    for (const { line, n } of lines) {
      line.visible = show
      // The two folds are traced one after the other, overlapping.
      ;(line.geometry as LineGeometry).instanceCount = Math.round(n * Math.min(1, rig.landmark * 1.6))
    }
    mat.opacity = Math.min(1, rig.landmark * 3)
  })
  return (
    <group>
      {lines.map(({ line }, i) => <primitive key={i} object={line} renderOrder={6} />)}
    </group>
  )
}
