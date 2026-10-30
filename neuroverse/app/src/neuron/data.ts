import { Vector3 } from 'three'

/** One world unit is 100 um. Neuron data is in micrometres. */
export const UM = 0.01

export type Section = { type: number; pts: [number, number, number, number][]; arc: number[] }
export type NeuronData = {
  id: number
  name: string
  soma_radius: number
  sections: Section[]
  path: [number, number, number][]
  path_length: number
  path_branch_arcs: number[]
  stats: { points: number; kept: number; tolerance_um: number }
}

export async function loadNeuron(): Promise<NeuronData> {
  const r = await fetch(`${import.meta.env.BASE_URL}data/neuron.json`)
  if (!r.ok) throw new Error('Neuron data missing: run `npm run data` first (see README).')
  return r.json()
}

/** Arc-length lookup along the recorded signal path (micrometres in, world units out). */
export class PathLookup {
  readonly pts: Vector3[]
  readonly arcs: number[]
  readonly length: number
  constructor(path: [number, number, number][]) {
    this.pts = path.map(([x, y, z]) => new Vector3(x, y, z).multiplyScalar(UM))
    this.arcs = [0]
    for (let i = 1; i < this.pts.length; i++) this.arcs.push(this.arcs[i - 1] + this.pts[i].distanceTo(this.pts[i - 1]) / UM)
    this.length = this.arcs[this.arcs.length - 1]
  }
  private index(arc: number) {
    const a = Math.min(Math.max(arc, 0), this.length)
    let lo = 0
    let hi = this.arcs.length - 1
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (this.arcs[mid] <= a) lo = mid
      else hi = mid
    }
    const t = (a - this.arcs[lo]) / Math.max(this.arcs[hi] - this.arcs[lo], 1e-6)
    return { lo, hi, t }
  }
  at(arc: number, out = new Vector3()) {
    const { lo, hi, t } = this.index(arc)
    return out.lerpVectors(this.pts[lo], this.pts[hi], t)
  }
  /** Direction of travel averaged over a window, so the camera does not twitch at recorded kinks. */
  tangent(arc: number, window = 40, out = new Vector3()) {
    return out.subVectors(this.at(arc + window), this.at(arc - window)).normalize()
  }
}

/**
 * Illustrative myelin layout on the recorded path: an unmyelinated start segment, then
 * internodes close to 85 um, with nodes placed at every recorded branch point so no collateral
 * leaves through a sheath. Lengths are illustrative and labelled so on screen.
 */
export const START_SEGMENT_UM = 40
export const INTERNODE_UM = 85
export const NODE_GAP_UM = 5

export function nodeArcs(d: NeuronData) {
  const L = d.path_length
  const fixed = [START_SEGMENT_UM, ...d.path_branch_arcs.filter((a) => a > START_SEGMENT_UM + 10 && a < L - 10), L]
  const sorted = [...new Set(fixed)].sort((a, b) => a - b)
  const nodes: number[] = []
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i]
    const b = sorted[i + 1]
    const n = Math.max(1, Math.round((b - a) / INTERNODE_UM))
    for (let k = 0; k < n; k++) nodes.push(a + ((b - a) * k) / n)
  }
  return nodes // node positions; the last internode ends at the reconstruction's end
}
