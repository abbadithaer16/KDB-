import { Box3, MathUtils, Vector3 } from 'three'
import type { NeuronData, PathLookup } from './data'
import { START_SEGMENT_UM, UM } from './data'

/**
 * T5 timing (seconds), from checkpoint3-revision.md §3. Camera pose and signal front are pure
 * functions of the timeline time `t`, so seeking, interrupting or replaying always lands on the
 * same frame.
 */
export const T = { toTrigger: 1.8, fire: 2.2, chase: 3.1, close: 4.0, pulled: 6.2, arrive: 7.2, end: 9.2 } as const
export const SIGNAL_S = T.arrive - T.fire // 5.0 s over the recorded path ("Slowed down")

const ease2 = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2) // power2.inOut
const clamp01 = (x: number) => MathUtils.clamp(x, 0, 1)
const smooth = (x: number) => x * x * (3 - 2 * x)

/**
 * Front position along the path (um) at signal time s (0..SIGNAL_S). The unmyelinated start is
 * continuous; along the myelinated part the front dwells at each node (where the signal is
 * renewed) and crosses each internode quickly. Equal brightness at every node is the shader's job.
 */
export function frontArc(s: number, nodes: number[], length: number) {
  if (s <= 0) return 0
  if (s >= SIGNAL_S) return length
  const tStart = 0.35
  if (s < tStart) return (START_SEGMENT_UM * s) / tStart
  const slot = (SIGNAL_S - tStart) / nodes.length
  const k = Math.min(Math.floor((s - tStart) / slot), nodes.length - 1)
  const f = (s - tStart - k * slot) / slot
  const a = nodes[k]
  const b = k + 1 < nodes.length ? nodes[k + 1] : length
  return f < 0.55 ? a : a + (b - a) * smooth((f - 0.55) / 0.45)
}

export type Pose = { pos: Vector3; target: Vector3; fov: number; up: Vector3 }

export type Frame = { cx: number; cy: number; frac: number }

/** Fit a world-space box into the frame at a given screen position and share of the frame. */
export function fit(box: Box3, aspect: number, fov: number, az: number, el: number, frame: Frame): Pose {
  const size = box.getSize(new Vector3())
  const centre = box.getCenter(new Vector3())
  const tan = Math.tan(MathUtils.degToRad(fov / 2))
  // Projected size seen from this direction (the cell is thin in depth, so width/height suffice).
  const w = Math.abs(size.x * Math.cos(az)) + Math.abs(size.z * Math.sin(az))
  let hWorld = size.y / frame.frac
  const maxW = aspect < 0.9 ? 0.86 : 0.5
  if (w / (hWorld * aspect) > maxW) hWorld = w / maxW / aspect
  const wWorld = hWorld * aspect
  const dist = hWorld / (2 * tan) + size.z
  const right = new Vector3(Math.cos(az), 0, -Math.sin(az))
  const target = centre
    .clone()
    .addScaledVector(right, -(frame.cx - 0.5) * wWorld)
    .add(new Vector3(0, (frame.cy - 0.5) * hWorld, 0))
  const dir = new Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el))
  return { pos: target.clone().addScaledVector(dir, dist), target, fov, up: new Vector3(0, 1, 0) }
}

export function boxes(d: NeuronData) {
  const all = new Box3()
  const dend = new Box3()
  const v = new Vector3()
  for (const s of d.sections) {
    for (const [x, y, z] of s.pts) {
      v.set(x, y, z).multiplyScalar(UM)
      all.expandByPoint(v)
      if (s.type !== 2) dend.expandByPoint(v)
    }
  }
  return { all, dend }
}

/** All poses for the current aspect ratio. */
export function poses(d: NeuronData, path: PathLookup, aspect: number) {
  const { all, dend } = boxes(d)
  const portrait = aspect < 0.9
  const az = MathUtils.degToRad(24)
  const el = MathUtils.degToRad(6)
  // Opening: a three-quarter "specimen" frame on a 56 mm-equivalent lens; the axon leaves the
  // bottom of the frame and is revealed in full at the end.
  const neuronBox = dend.clone()
  neuronBox.min.y -= 0.15 * (dend.max.y - dend.min.y)
  const openAz = MathUtils.degToRad(50)
  const neuron = fit(neuronBox, aspect, 30, openAz, MathUtils.degToRad(-10), portrait ? { cx: 0.5, cy: 0.45, frac: 0.6 } : { cx: 0.63, cy: 0.52, frac: 0.84 })
  // Reveal: the whole recorded cell on a flatter lens, so the true length reads at once.
  const whole = fit(all, aspect, 30, az, el, portrait ? { cx: 0.5, cy: 0.41, frac: 0.55 } : { cx: 0.64, cy: 0.5, frac: 0.86 })
  const side = new Vector3(Math.sin(az), 0, Math.cos(az))
  // Trigger zone: a macro frame from slightly below and to the front, so basal dendrites pass in
  // the foreground and the cell body sits above the trigger zone.
  const focus = path.at(15)
  const holdDir = new Vector3(Math.sin(az - 0.5) * Math.cos(-0.17), Math.sin(-0.17), Math.cos(az - 0.5) * Math.cos(-0.17))
  const holdH = portrait ? 3.2 : 1.7 // frame height in world units (100 um each)
  const holdDist = holdH / (2 * Math.tan(MathUtils.degToRad(14)))
  const holdRight = new Vector3().crossVectors(holdDir.clone().negate(), new Vector3(0, 1, 0)).normalize()
  const holdTarget = focus.clone().addScaledVector(holdRight, portrait ? 0 : -0.13 * holdH * aspect).add(new Vector3(0, portrait ? 0.12 * holdH : 0.04 * holdH, 0))
  const hold: Pose = { target: holdTarget, pos: holdTarget.clone().addScaledVector(holdDir, holdDist), fov: 28, up: new Vector3(0, 1, 0) }
  return { neuron, whole, side, path, hold, aspect, trigger: focus }
}

/** Portrait chase framing (tunable from ?chase=side,lead,lift,back,roll in debug builds). */
export const CHASE = { pSide: -0.42, pLead: 140, pLift: 0.14, pBack: 20, pRoll: 1.2 }
if (typeof window !== 'undefined') {
  const q = new URLSearchParams(window.location.search).get('chase')
  if (q) {
    const [pSide, pLead, pLift, pBack, pRoll] = q.split(',').map(Number)
    Object.assign(CHASE, { pSide, pLead, pLift, pBack, pRoll })
  }
}

const tmpA = new Vector3()
const tmpT = new Vector3()
const tmpN = new Vector3()

/**
 * Chase pose at camera arc `a` (um): the camera leads the signal, beside and a little ahead of
 * it, looking back up the recorded axon. The front comes towards the lens and the nodes it has
 * renewed recede behind it, so the frame shows both the event and its progression.
 */
export function trackPose(path: PathLookup, side: Vector3, a: number, out: Pose, portrait = false) {
  path.tangent(Math.max(a, 60), 90, tmpT)
  tmpN.crossVectors(tmpT, side).normalize()
  // Landscape: the camera works from the far side so the near end of the axon falls low right,
  // away from the text column. Portrait: the front is kept at the centre of the frame.
  const s = portrait ? CHASE.pSide : -0.42
  path.at(a + (portrait ? CHASE.pLead : 140), tmpA)
  out.pos.copy(tmpA).addScaledVector(side, s).addScaledVector(tmpN, portrait ? CHASE.pLift : 0.14)
  path.at(Math.max(a - (portrait ? CHASE.pBack : 40), 0), out.target)
  // Roll so the axon crosses the frame on a diagonal (landscape: near end low right, clear of
  // the text column) rather than running to a vanishing point.
  const roll = portrait ? CHASE.pRoll : 0.55
  out.up.copy(tmpN).multiplyScalar(Math.cos(roll)).addScaledVector(side, Math.sin(roll)).normalize()
  out.fov = 30
  return out
}

function blend(a: Pose, b: Pose, w: number, out: Pose) {
  out.pos.lerpVectors(a.pos, b.pos, w)
  out.target.lerpVectors(a.target, b.target, w)
  out.fov = MathUtils.lerp(a.fov, b.fov, w)
  out.up.lerpVectors(a.up, b.up, w).normalize()
  return out
}

const panR = new Vector3()
const dA = new Vector3()
const dB = new Vector3()
/**
 * Rise from the chase to the full-cell frame: the viewing direction turns and the distance grows
 * geometrically around a moving target, so the subject stays in frame instead of sliding across
 * the text column while the camera rolls upright.
 */
function pullBack(a: Pose, b: Pose, w: number, out: Pose) {
  out.target.lerpVectors(a.target, b.target, w)
  dA.subVectors(a.pos, a.target)
  dB.subVectors(b.pos, b.target)
  const dist = dA.length() * Math.pow(dB.length() / dA.length(), w)
  out.pos.copy(dA.normalize().lerp(dB.normalize(), w).normalize()).multiplyScalar(dist).add(out.target)
  out.fov = MathUtils.lerp(a.fov, b.fov, w)
  out.up.lerpVectors(a.up, b.up, Math.min(1, w * 1.6)).normalize()
  return out
}

/** The camera at timeline time t. */
export function cameraAt(
  t: number,
  P: ReturnType<typeof poses>,
  out: Pose,
  scratch: Pose = { pos: new Vector3(), target: new Vector3(), fov: 40, up: new Vector3(0, 1, 0) },
) {
  const L = P.path.length
  // The camera travels at the front's average speed, lagging 0.3 s, eased in at the start.
  // The camera leads at the front's average speed, eased in at the start.
  const s = t - T.fire
  const camArc = s <= 0 ? 0 : (L * (s - 0.6 * (1 - Math.exp(-s / 0.6)))) / SIGNAL_S
  const portrait = P.aspect < 0.9
  let pan = 0 // share of frame width the moving shots are shifted right, clear of the text column
  if (t <= T.toTrigger) {
    blend(P.neuron, P.hold, ease2(clamp01(t / T.toTrigger)), out)
  } else if (t <= T.fire) {
    blend(P.hold, P.hold, 0, out)
  } else if (t <= T.chase) {
    // The camera swings round behind the signal to follow it.
    trackPose(P.path, P.side, camArc, scratch, portrait)
    const w = ease2(clamp01((t - T.fire) / (T.chase - T.fire)))
    blend(P.hold, scratch, w, out)
    pan = w
  } else if (t <= T.close) {
    trackPose(P.path, P.side, camArc, out, portrait)
    pan = 1
  } else {
    trackPose(P.path, P.side, camArc, scratch, portrait)
    const w = ease2(clamp01((t - T.close) / (T.pulled - T.close)))
    pullBack(scratch, P.whole, w, out)
    pan = 1 - w
  }
  if (pan > 0 && P.aspect >= 0.9) {
    const dist = out.pos.distanceTo(out.target)
    const width = 2 * dist * Math.tan(MathUtils.degToRad(out.fov / 2)) * P.aspect
    panR.subVectors(out.target, out.pos).cross(out.up).normalize()
    // Turn the camera (move only the target), so near and far parts shift alike.
    out.target.addScaledVector(panR, -0.16 * width * pan)
  }
  return out
}

/** Path trace after arrival: full at arrival, settling to a faint 0.35 over 2 s. */
export const traceAt = (t: number) => (t < T.arrive ? 0 : MathUtils.lerp(1, 0.35, smooth(clamp01((t - T.arrive) / 2))))

/** Everything except the signal path falls into shadow while the signal is the subject. */
export const dimAt = (t: number) => (t <= 0.4 ? 0 : t < T.toTrigger ? smooth((t - 0.4) / (T.toTrigger - 0.4)) : t < T.arrive ? 1 : MathUtils.lerp(1, 0.75, smooth(clamp01((t - T.arrive) / 2))))

/**
 * Depth of field (desktop tier only), as a function of time: none on resting frames; focus on the
 * trigger zone at the hold and on the signal front during the chase; sharp again before arrival.
 * Returns the bokeh scale; `focusOut` receives the world focus point.
 */
export function focusAt(t: number, P: ReturnType<typeof poses>, front: Vector3, focusOut: Vector3) {
  if (t <= 0.2 || t >= T.pulled) {
    focusOut.copy(P.whole.target)
    return 0
  }
  if (t <= T.fire) {
    focusOut.copy(P.trigger)
    return 5 * smooth(clamp01((t - 0.2) / (T.toTrigger - 0.2)))
  }
  if (t <= T.chase) {
    const w = smooth(clamp01((t - T.fire) / (T.chase - T.fire)))
    focusOut.lerpVectors(P.trigger, front, w)
    return 5 - w
  }
  focusOut.copy(front)
  return t <= T.close ? 4 : 4 * (1 - smooth(clamp01((t - T.close) / (T.pulled - T.close))))
}

/** Time at which the front first reaches `arc` (for composing stills on a chosen node). */
export function timeForArc(arc: number, nodes: number[], length: number) {
  let lo = 0
  let hi = SIGNAL_S
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    if (frontArc(mid, nodes, length) >= arc) hi = mid
    else lo = mid
  }
  return T.fire + hi
}
