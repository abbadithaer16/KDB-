import { Color, MathUtils, Vector3 } from 'three'

/**
 * The rig: every value that changes per frame, owned by exactly one writer at a time. GSAP
 * timelines (director.ts) write it during transitions; resting beats set it directly. The render
 * loop only reads it. Nothing here goes through React state.
 */
export type World = 'brain' | 'neuron' | 'synapse'
export type Pose = { pos: Vector3; target: Vector3; up: Vector3; fov: number }
export type PoseName = 'top' | 'built' | 'lifted' | 'lateral' | 'parting' | 'medial' | 'mtg' | 'memoryVia' | 'memory' | 'emotion' | 'mind'

export const TOKENS = {
  abyss: new Color('#07080A'),
  charcoal: new Color('#15171B'),
  plate: new Color('#E6E5E0'),
  violet: '#9C86F0',
  violetInk: '#5B3FB0',
  ink: '#1E2024',
  rim: '#8F86B3',
  amber: '#E3A857',
  greyMatter: '#A89A8E',
  whiteMatter: '#D6CEC3',
  deepNuclei: '#A0948A',
  dimmed: '#2E2B29',
  capGrey: '#8E8178',
  capWhite: '#CFC6BA',
}

export const makePose = (): Pose => ({ pos: new Vector3(0, 0, 6), target: new Vector3(), up: new Vector3(0, 1, 0), fov: 26 })

export const rig = {
  world: 'brain' as World,
  /** Resting pose by name (recomputed for the current aspect each frame), or null while a timeline owns `pose`. */
  poseName: 'top' as PoseName | null,
  pose: makePose(),
  // Brain world
  contours: 1, // number of horizontal sections shown, from the top
  contourOpacity: 1,
  contourInk: 0, // 0 violet (scene 1) .. 1 ink (scene 5)
  build: 0, // 0..1 slabs fill and close into the solid brain
  lift: 0, // 0..1 the top above the horizontal cut lifts
  part: 0, // 0..1 the left hemisphere moves aside along the midline
  shell: 0, // 0..1 cortex becomes a translucent shell (or the cut-away window on phones)
  line: 0, // 0..1 the front-to-back sweep that redraws the brain as line work
  landmark: 0, // 0..1 the central and lateral sulci are traced
  threads: 0, // 0..1 scene 5 synthesis threads
  plate: 0, // 0..1 the light ground of scene 5 (UI switches to ink above 0.5)
  bg: TOKENS.abyss.clone(),
  // Neuron world (scene 3): the approved proof's timeline time
  neuronT: 0,
  /** Reduced motion replay: the signal plays with the camera held on the full-length frame. */
  neuronStatic: false,
  // Synapse world: event time
  synT: 0,
}

export type RigNumbers = {
  [K in keyof typeof rig as (typeof rig)[K] extends number ? K : never]: number
}

// ---- Brain framing ------------------------------------------------------------------------------

/** Brain bounds from the model (x anterior -0.97 .. posterior 0.83, y -0.87 .. 0.79, z ±0.7). */
export const BRAIN = { cx: -0.07, cy: -0.04, cz: 0, w: 1.8, h: 1.66, d: 1.4, top: 0.79 }

type Fit = { az: number; el: number; fov: number; cx: number; cy: number; frac: number; maxW: number; centre?: Vector3; w?: number; h?: number; up?: Vector3; scale?: number }

const deg = MathUtils.degToRad

/** A camera that frames the brain (or a given box) at a set screen position and share of the frame. */
export function fit(f: Fit, aspect: number, out: Pose = makePose()): Pose {
  const dir = new Vector3(Math.sin(deg(f.az)) * Math.cos(deg(f.el)), Math.sin(deg(f.el)), Math.cos(deg(f.az)) * Math.cos(deg(f.el)))
  const up = f.up ?? new Vector3(0, 1, 0)
  const right = new Vector3().crossVectors(up, dir).normalize()
  const camUp = new Vector3().crossVectors(dir, right).normalize()
  const w = f.w ?? BRAIN.w
  const h = f.h ?? BRAIN.h
  let hWorld = h / f.frac
  if (w / (hWorld * aspect) > f.maxW) hWorld = w / f.maxW / aspect
  hWorld *= f.scale ?? 1
  const wWorld = hWorld * aspect
  const tan = Math.tan(deg(f.fov / 2))
  const centre = f.centre ?? new Vector3(BRAIN.cx, BRAIN.cy, BRAIN.cz)
  out.target.copy(centre).addScaledVector(right, -(f.cx - 0.5) * wWorld).addScaledVector(camUp, (f.cy - 0.5) * hWorld)
  out.pos.copy(out.target).addScaledVector(dir, hWorld / (2 * tan) + BRAIN.d * 0.2)
  out.up.copy(camUp)
  out.fov = f.fov
  return out
}

/** Anchor for the scene 2 → 3 descent: the left middle temporal gyrus, set from the model at load. */
export const mtgPoint = new Vector3(-0.1, -0.3, 0.62)
/** Centre of the deep structures shown in scene 4, set from the model at load. */
export const deepCentre = new Vector3(0, -0.2, 0.2)

export function brainPose(name: PoseName, aspect: number, out: Pose = makePose()): Pose {
  const portrait = aspect < 0.9
  const P = (land: Omit<Fit, 'maxW'>, port: Partial<Fit>) => fit({ maxW: portrait ? 0.86 : 0.46, ...land, ...(portrait ? port : {}) }, aspect, out)
  switch (name) {
    case 'top':
      // Straight down onto the top section, anterior up: reads as a precise line drawing.
      return P({ az: 0, el: 89.5, fov: 22, cx: 0.63, cy: 0.5, frac: 0.72, w: BRAIN.d, h: BRAIN.w, up: new Vector3(-1, 0, 0), centre: new Vector3(BRAIN.cx, BRAIN.top - 0.1, 0) }, { cx: 0.5, cy: 0.47, frac: 0.42 })
    case 'built':
      return P({ az: -40, el: 18, fov: 26, cx: 0.63, cy: 0.52, frac: 0.6 }, { cx: 0.5, cy: 0.47, frac: 0.3 })
    case 'lifted':
      return P({ az: -34, el: 38, fov: 26, cx: 0.63, cy: 0.52, frac: 0.5, h: BRAIN.h * 1.3, centre: new Vector3(BRAIN.cx, BRAIN.cy + 0.22, 0) }, { cx: 0.5, cy: 0.45, frac: 0.26 })
    case 'lateral':
      return P({ az: 0, el: -3, fov: 26, cx: 0.55, cy: 0.56, frac: 0.6 }, { cx: 0.5, cy: 0.46, frac: 0.3 })
    case 'parting':
      return P({ az: 30, el: 12, fov: 26, cx: 0.55, cy: 0.54, frac: 0.5 }, { cx: 0.5, cy: 0.46, frac: 0.26 })
    case 'medial':
      return P({ az: 0, el: 2, fov: 26, cx: 0.58, cy: 0.56, frac: 0.6 }, { cx: 0.5, cy: 0.46, frac: 0.3 })
    case 'mtg': {
      // Close over the middle temporal gyrus: the dolly ends a few centimetres from the surface.
      const o = fit({ az: 0, el: -5, fov: 26, cx: 0.5, cy: 0.5, frac: 0.6, maxW: 1, centre: mtgPoint, h: 0.12, w: 0.12 }, aspect, out)
      return o
    }
    case 'memoryVia':
      return P({ az: 70, el: 10, fov: 28, cx: 0.6, cy: 0.52, frac: 0.6 }, { cx: 0.5, cy: 0.45, frac: 0.3 })
    case 'memory':
      return P({ az: 18, el: -14, fov: 28, cx: 0.6, cy: 0.52, frac: 0.7, centre: new Vector3(BRAIN.cx * 0.5 + deepCentre.x * 0.5, BRAIN.cy * 0.5 + deepCentre.y * 0.5, deepCentre.z * 0.3) }, { cx: 0.5, cy: 0.44, frac: 0.34 })
    case 'emotion':
      return P({ az: 8, el: -14, fov: 28, cx: 0.6, cy: 0.52, frac: 0.7, scale: 0.88, centre: new Vector3(BRAIN.cx * 0.5 + deepCentre.x * 0.5, BRAIN.cy * 0.5 + deepCentre.y * 0.5, deepCentre.z * 0.3) }, { cx: 0.5, cy: 0.44, frac: 0.36 })
    case 'mind':
      return P({ az: 0, el: 0, fov: 24, cx: 0.63, cy: 0.52, frac: 0.58 }, { cx: 0.5, cy: 0.44, frac: 0.3 })
  }
}

// ---- Pose interpolation ------------------------------------------------------------------------

const dA = new Vector3()
const dB = new Vector3()
/**
 * Orbit-style blend: the target moves in a straight line, the viewing direction turns on the
 * sphere, and the distance changes geometrically, so moves read as camera arcs, not slides.
 */
export function blendPose(a: Pose, b: Pose, k: number, out: Pose): Pose {
  out.target.lerpVectors(a.target, b.target, k)
  dA.subVectors(a.pos, a.target)
  dB.subVectors(b.pos, b.target)
  const la = dA.length()
  const lb = dB.length()
  const dist = la * Math.pow(lb / la, k)
  out.pos.copy(dA.normalize().lerp(dB.normalize(), k).normalize()).multiplyScalar(dist).add(out.target)
  out.up.lerpVectors(a.up, b.up, k).normalize()
  out.fov = MathUtils.lerp(a.fov, b.fov, k)
  return out
}

export const copyPose = (from: Pose, to: Pose) => {
  to.pos.copy(from.pos)
  to.target.copy(from.target)
  to.up.copy(from.up)
  to.fov = from.fov
  return to
}
