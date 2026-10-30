import { BufferGeometry, Float32BufferAttribute, Vector3 } from 'three'
import type { NeuronData } from './data'
import { NODE_GAP_UM, PathLookup, UM } from './data'

/** kind attribute: what each vertex belongs to (drives the shader). */
export const KIND = { dendrite: 0, axon: 1, path: 2, myelin: 4, paranode: 5 } as const

type Ring = { c: Vector3; r: number; arc: number; para?: boolean }

/**
 * Tubes through the recorded points, built with parallel-transported frames. Each vertex stores
 * its centre, radial direction and recorded radius; the vertex shader places it, so the radius
 * can be held at a minimum on-screen width in distant views without changing the data.
 */
class TubeBuilder {
  center: number[] = []
  dir: number[] = []
  radius: number[] = []
  arc: number[] = []
  kind: number[] = []
  index: number[] = []
  constructor(private segments: number) {}

  add(rings: Ring[], kind: number, capEnd: boolean) {
    if (rings.length < 2) return
    const S = this.segments
    const base = this.center.length / 3
    let normal = new Vector3()
    const tangent = new Vector3()
    const prevT = new Vector3()
    for (let i = 0; i < rings.length; i++) {
      const a = rings[Math.max(i - 1, 0)].c
      const b = rings[Math.min(i + 1, rings.length - 1)].c
      tangent.subVectors(b, a).normalize()
      if (i === 0) {
        const helper = Math.abs(tangent.y) < 0.9 ? new Vector3(0, 1, 0) : new Vector3(1, 0, 0)
        normal = new Vector3().crossVectors(tangent, helper).normalize()
      } else {
        // Parallel transport: rotate the previous normal by the change in tangent.
        const axis = new Vector3().crossVectors(prevT, tangent)
        const s = axis.length()
        if (s > 1e-6) normal.applyAxisAngle(axis.normalize(), Math.asin(Math.min(1, s)))
      }
      prevT.copy(tangent)
      const binormal = new Vector3().crossVectors(tangent, normal).normalize()
      for (let k = 0; k < S; k++) {
        const t = (k / S) * Math.PI * 2
        const d = new Vector3().addScaledVector(normal, Math.cos(t)).addScaledVector(binormal, Math.sin(t))
        this.push(rings[i], d, rings[i].para ? KIND.paranode : kind)
      }
    }
    for (let i = 0; i < rings.length - 1; i++) {
      for (let k = 0; k < S; k++) {
        const a = base + i * S + k
        const b = base + i * S + ((k + 1) % S)
        const c = a + S
        const d = b + S
        this.index.push(a, b, c, b, d, c) // counter-clockwise from outside
      }
    }
    if (capEnd) {
      // A rounded tip: one vertex pushed out along the last tangent by the radius.
      const last = rings[rings.length - 1]
      const tip = this.center.length / 3
      this.push(last, tangent.clone(), kind)
      const ring = base + (rings.length - 1) * S
      for (let k = 0; k < S; k++) this.index.push(ring + k, ring + ((k + 1) % S), tip)
    }
  }

  private push(r: Ring, d: Vector3, kind: number) {
    this.center.push(r.c.x, r.c.y, r.c.z)
    this.dir.push(d.x, d.y, d.z)
    this.radius.push(r.r)
    this.arc.push(r.arc)
    this.kind.push(kind)
  }

  build() {
    const g = new BufferGeometry()
    // `position` holds the centre so bounding volumes stay correct; the shader offsets it.
    g.setAttribute('position', new Float32BufferAttribute(this.center, 3))
    g.setAttribute('normal', new Float32BufferAttribute(this.dir, 3))
    g.setAttribute('aRadius', new Float32BufferAttribute(this.radius, 1))
    g.setAttribute('aArc', new Float32BufferAttribute(this.arc, 1))
    g.setAttribute('aKind', new Float32BufferAttribute(this.kind, 1))
    g.setIndex(this.index)
    g.computeBoundingSphere()
    return g
  }
}

export function neuronGeometry(d: NeuronData, segments: number) {
  const b = new TubeBuilder(segments)
  for (const s of d.sections) {
    const rings = s.pts.map(([x, y, z, r], i) => ({ c: new Vector3(x, y, z), r, arc: s.arc[i] }))
    const onPath = s.arc.some((a) => a >= 0)
    const kind = s.type === 2 ? (onPath ? KIND.path : KIND.axon) : KIND.dendrite
    b.add(rings, kind, true)
  }
  return b.build()
}

/** Illustrative sheaths between node positions, following the recorded path exactly. */
export function myelinGeometry(path: PathLookup, nodes: number[], sheathRadius: number, segments: number) {
  const b = new TubeBuilder(segments)
  const p = new Vector3()
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i] + NODE_GAP_UM / 2
    const z = (i + 1 < nodes.length ? nodes[i + 1] : path.length) - (i + 1 < nodes.length ? NODE_GAP_UM / 2 : 0)
    if (z - a < 6) continue
    const arcs: number[] = []
    for (let arc = a; arc < z; arc += 2) arcs.push(arc)
    arcs.push(z)
    const rings: Ring[] = arcs.map((arc) => {
      // Paranodes: the sheath tapers over its last 3 um at each end.
      const taper = Math.max(0, Math.min(1, (arc - a) / 3, (z - arc) / 3))
      return { c: path.at(arc, p).clone().divideScalar(UM), r: sheathRadius * (0.55 + 0.45 * taper), arc, para: taper < 1 }
    })
    b.add(rings, KIND.myelin, false)
  }
  return b.build()
}
