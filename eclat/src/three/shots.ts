import * as THREE from 'three'
import type { Piece } from '../lib/state'

/**
 * Camera choreography. Each piece has a list of keyed "shots" over its scroll
 * parameter t ∈ [0,1]. Sampling is a pure function of t, so motion is fully
 * deterministic and reversible; damping is applied afterwards in the Director.
 *
 * Units are millimetres (the models are built at real-world scale).
 * frame = screen-space offset of the subject as a fraction of the viewport
 * (+x moves the subject right, +y moves it up) — lets typography own one side.
 */
export type V3 = [number, number, number]
export interface Shot {
  t: number
  pos: V3
  tgt: V3
  fov: number
  frame: [number, number]
  spin: number // object rotation (rad) about its display axis
  light: number // key-light emphasis 0..1.5
}

type Set = { wide: Shot[]; tall: Shot[] }

const S = (t: number, pos: V3, tgt: V3, fov: number, frame: [number, number], spin: number, light = 1): Shot => ({
  t,
  pos,
  tgt,
  fov,
  frame,
  spin,
  light,
})

export const SHOTS: Record<Piece, Set> = {
  /* ---------------- RING — hero + THE DIAMOND ---------------- */
  ring: {
    wide: [
      S(0.0, [0, 9, 84], [0, 3.2, 0], 30, [0, 0.11], -0.62, 1),
      S(0.12, [-14, 12, 74], [0, 4, 0], 30, [0.06, 0.04], -0.36, 1),
      // I — silhouette, subject right, copy left
      S(0.27, [-36, 17, 58], [0, 4.2, 0], 30, [0.2, 0], -0.1, 1.05),
      // II — facets, macro over the crown, copy right
      S(0.5, [7, 37, 15], [0, 13.8, 0], 28, [-0.19, 0], 0.32, 1.25),
      // III — claws, side macro at the girdle, copy left
      S(0.72, [23, 16.8, 18], [0, 13.2, 0], 28, [0.2, 0.0], 0.95, 1.15),
      // IV — from beneath the gallery, copy right
      S(0.88, [-20, 0, 40], [0, 11, 0], 30, [-0.17, -0.02], 1.38, 1.05),
      S(1.0, [0, 10, 92], [0, 4, 0], 30, [0, 0.02], 2.1, 0.9),
    ],
    tall: [
      S(0.0, [0, 9, 118], [0, 3.2, 0], 34, [0, 0.16], -0.62, 1),
      S(0.12, [-12, 12, 106], [0, 4, 0], 34, [0, 0.16], -0.36, 1),
      S(0.27, [-44, 18, 82], [0, 4.2, 0], 34, [0, 0.17], -0.1, 1.05),
      S(0.5, [8, 46, 21], [0, 13.8, 0], 32, [0, 0.19], 0.32, 1.25),
      S(0.72, [28, 17, 25], [0, 13.2, 0], 32, [0, 0.19], 0.95, 1.15),
      S(0.88, [-18, 0, 40], [0, 11, 0], 34, [0, 0.16], 1.38, 1.05),
      S(1.0, [0, 10, 128], [0, 4, 0], 34, [0, 0.16], 2.1, 0.9),
    ],
  },
  /* ---------------- NECKLACE — on the velvet form ---------------- */
  necklace: {
    wide: [
      S(0.0, [70, 40, 560], [0, -6, 0], 26, [0.2, 0], 0, 0.6),
      // down the chain from the shoulder
      S(0.3, [120, 34, 300], [26, -6, 64], 26, [0.2, 0], 0, 0.9),
      // pendant, three-quarter
      S(0.58, [56, -22, 196], [0, -43.6, 97], 26, [0.2, 0.02], 0, 1.1),
      // macro front
      S(0.8, [12, -38, 140], [0, -43.6, 97], 26, [0.21, 0.02], 0, 1.25),
      // orbit to profile — rope gallery and claws
      S(1.0, [-34, -36, 128], [0, -43.6, 97], 26, [0.2, 0.02], 0, 1.2),
    ],
    tall: [
      S(0.0, [70, 30, 760], [0, -10, 0], 30, [0, 0.16], 0, 0.6),
      S(0.3, [120, 30, 420], [24, -10, 60], 30, [0, 0.16], 0, 0.9),
      S(0.58, [56, -24, 250], [0, -43.6, 97], 30, [0, 0.17], 0, 1.1),
      S(0.8, [12, -38, 172], [0, -43.6, 97], 30, [0, 0.18], 0, 1.25),
      S(1.0, [-40, -36, 158], [0, -43.6, 97], 30, [0, 0.18], 0, 1.2),
    ],
  },
  /* ---------------- BRACELET — studio reveal ---------------- */
  bracelet: {
    wide: [
      S(0.0, [0, 200, 120], [0, 0, 0], 28, [0, 0], 0.5, 0.55),
      S(0.3, [-120, 80, 120], [0, 0, 0], 28, [0.18, 0], -0.1, 1),
      // macro along the line of stones
      S(0.62, [56, 50, 104], [4, 1, 16], 28, [-0.21, 0], -0.6, 1.2),
      // the clasp (turntable brings it round to the camera)
      S(0.82, [-44, 42, 78], [-4, 1.5, 20], 28, [0.23, 0], -1.75, 1.15),
      S(1.0, [0, 140, 150], [0, 0, 0], 28, [0, 0], -2.6, 1),
    ],
    tall: [
      S(0.0, [0, 280, 170], [0, 0, 0], 32, [0, 0.14], 0.5, 0.55),
      S(0.3, [-170, 110, 170], [0, 0, 0], 32, [0, 0.15], -0.1, 1),
      S(0.62, [52, 46, 104], [6, 1, 22], 32, [0, 0.17], -0.6, 1.2),
      S(0.82, [-44, 48, 86], [-4, 1.5, 22], 32, [0, 0.17], -1.75, 1.15),
      S(1.0, [0, 200, 210], [0, 0, 0], 32, [0, 0.14], -2.6, 1),
    ],
  },
}

/** Hero intro: the camera starts further out, low, and turned away. */
export const INTRO_FROM: { wide: Shot; tall: Shot } = {
  wide: S(0, [34, 2, 150], [0, 6, 0], 30, [0, 0.11], -1.4, 0),
  tall: S(0, [34, 2, 196], [0, 6, 0], 34, [0, 0.16], -1.4, 0),
}

/** Inspection framing for the product detail / 360° modes. */
export const INSPECT: Record<Piece, { pos: V3; tgt: V3; fov: number; min: number; max: number }> = {
  ring: { pos: [34, 22, 64], tgt: [0, 4, 0], fov: 30, min: 30, max: 220 },
  necklace: { pos: [44, -28, 180], tgt: [0, -43.6, 97], fov: 28, min: 26, max: 320 },
  bracelet: { pos: [0, 120, 140], tgt: [0, 1, 0], fov: 28, min: 50, max: 320 },
}

/* ------------------------------------------------------------------------- */
const smooth = (u: number) => u * u * (3 - 2 * u)
const ease = (u: number) => THREE.MathUtils.lerp(u, smooth(u), 0.7)
const lerp = THREE.MathUtils.lerp

function catmull(p0: number, p1: number, p2: number, p3: number, u: number) {
  const u2 = u * u
  const u3 = u2 * u
  return 0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 + (-p0 + 3 * p1 - 3 * p2 + p3) * u3)
}

export interface Pose {
  pos: THREE.Vector3
  tgt: THREE.Vector3
  fov: number
  frame: THREE.Vector2
  spin: number
  light: number
}

export const makePose = (): Pose => ({
  pos: new THREE.Vector3(),
  tgt: new THREE.Vector3(),
  fov: 30,
  frame: new THREE.Vector2(),
  spin: 0,
  light: 1,
})

export function sampleShots(keys: Shot[], tRaw: number, out: Pose): Pose {
  const t = THREE.MathUtils.clamp(tRaw, 0, 1)
  let i = 0
  while (i < keys.length - 2 && t > keys[i + 1].t) i++
  const a = keys[i]
  const b = keys[i + 1]
  const u = ease(THREE.MathUtils.clamp((t - a.t) / Math.max(1e-6, b.t - a.t), 0, 1))
  const pa = keys[Math.max(0, i - 1)]
  const pb = keys[Math.min(keys.length - 1, i + 2)]
  for (let k = 0; k < 3; k++) {
    out.pos.setComponent(k, catmull(pa.pos[k], a.pos[k], b.pos[k], pb.pos[k], u))
    out.tgt.setComponent(k, catmull(pa.tgt[k], a.tgt[k], b.tgt[k], pb.tgt[k], u))
  }
  out.fov = lerp(a.fov, b.fov, u)
  out.frame.set(lerp(a.frame[0], b.frame[0], u), lerp(a.frame[1], b.frame[1], u))
  out.spin = lerp(a.spin, b.spin, u)
  out.light = lerp(a.light, b.light, u)
  return out
}

export function setPose(out: Pose, s: Shot) {
  out.pos.set(...s.pos)
  out.tgt.set(...s.tgt)
  out.fov = s.fov
  out.frame.set(...s.frame)
  out.spin = s.spin
  out.light = s.light
  return out
}

export function lerpPose(a: Pose, b: Pose, u: number, out: Pose) {
  out.pos.lerpVectors(a.pos, b.pos, u)
  out.tgt.lerpVectors(a.tgt, b.tgt, u)
  out.fov = lerp(a.fov, b.fov, u)
  out.frame.lerpVectors(a.frame, b.frame, u)
  out.spin = lerp(a.spin, b.spin, u)
  out.light = lerp(a.light, b.light, u)
  return out
}
