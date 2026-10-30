import gsap from 'gsap'
import { BEATS } from './content'
import { TOKENS, blendPose, brainPose, copyPose, makePose, rig } from './rig'
import type { PoseName, World } from './rig'
import { T as NT } from './neuron/choreography'
import { SYN_END } from './synapse/timing'
import { COARSE, ui } from './state'

/**
 * The director owns navigation: one input moves one beat; transitions are GSAP timelines that
 * write the rig and can be interrupted (next completes the move at once, previous cuts back).
 * Every beat has a resting state, so deep links, refreshes and "previous" land on exactly the
 * same frame as arriving by the choreography.
 */

type Rest = {
  world: World
  pose?: PoseName
  bg: typeof TOKENS.abyss
  values: Partial<Record<'contours' | 'contourOpacity' | 'contourInk' | 'build' | 'lift' | 'part' | 'shell' | 'line' | 'landmark' | 'threads' | 'plate' | 'neuronT' | 'synT', number>>
}

const PLANES = 44
/** The opening shows the top sections nested, as a contour map seen from above. */
const READY_PLANES = 7
const ZERO = { lift: 0, part: 0, shell: 0, line: 0, landmark: 0, threads: 0, plate: 0, contourInk: 0 }

export const REST: Record<string, Rest> = {
  'living-fold': { world: 'brain', pose: 'top', bg: TOKENS.abyss, values: { ...ZERO, contours: READY_PLANES, contourOpacity: 1, build: 0 } },
  'living-fold-built': { world: 'brain', pose: 'built', bg: TOKENS.abyss, values: { ...ZERO, contours: PLANES, contourOpacity: 0, build: 1 } },
  'living-fold-section': { world: 'brain', pose: 'lifted', bg: TOKENS.abyss, values: { ...ZERO, contours: PLANES, contourOpacity: 0, build: 1, lift: 1 } },
  architecture: { world: 'brain', pose: 'lateral', bg: TOKENS.charcoal, values: { ...ZERO, contourOpacity: 0, build: 1, landmark: 1 } },
  'architecture-midline': { world: 'brain', pose: 'medial', bg: TOKENS.charcoal, values: { ...ZERO, contourOpacity: 0, build: 1, part: 1 } },
  signal: { world: 'neuron', bg: TOKENS.abyss, values: { neuronT: 0 } },
  'signal-axon': { world: 'neuron', bg: TOKENS.abyss, values: { neuronT: NT.end } },
  'signal-synapse': { world: 'synapse', bg: TOKENS.abyss, values: { synT: SYN_END } },
  memory: { world: 'brain', pose: 'memory', bg: TOKENS.charcoal, values: { ...ZERO, contourOpacity: 0, build: 1, shell: 1 } },
  'memory-emotion': { world: 'brain', pose: 'emotion', bg: TOKENS.charcoal, values: { ...ZERO, contourOpacity: 0, build: 1, shell: 1 } },
  mind: { world: 'brain', pose: 'mind', bg: TOKENS.plate, values: { ...ZERO, contours: PLANES, contourOpacity: 0, contourInk: 1, build: 1, line: 1, plate: 1, threads: 1 } },
}

let tl: gsap.core.Timeline | null = null
let aspect = 16 / 9
export const setAspect = (a: number) => { aspect = a }

const dipEl = () => document.querySelector<HTMLElement>('.dip')

/** Apply a beat's resting state immediately. */
function applyRest(id: string) {
  const r = REST[id]
  rig.world = r.world
  rig.poseName = r.pose ?? null
  if (r.pose) brainPose(r.pose, aspect, rig.pose)
  Object.assign(rig, r.values)
  rig.bg.copy(r.bg)
}

function setHash(index: number) {
  const id = BEATS[index].beat.id
  if (decodeURIComponent(window.location.hash.slice(1)) !== id) history.replaceState(null, '', `#${id}`)
}

/** Settle on a beat: state, hash, announcement. */
function arrive(index: number) {
  tl = null
  ui.set({ beat: index, transitioning: false, cortex: 'translucent' })
  setHash(index)
}

/** Cut to a beat through a short dip to the ground colour (previous, deep links, reduced motion). */
export function cutTo(index: number, duration = 0.45) {
  tl?.kill()
  tl = null
  const el = dipEl()
  ui.set({ transitioning: true, selected: null, explore: false })
  if (!el || duration === 0) {
    applyRest(BEATS[index].beat.id)
    arrive(index)
    return
  }
  gsap.killTweensOf(el)
  tl = gsap.timeline({ onComplete: () => arrive(index) })
    .to(el, { opacity: 1, duration: duration * 0.4, ease: 'power1.in' })
    .add(() => applyRest(BEATS[index].beat.id))
    .to(el, { opacity: 0, duration: duration * 0.6, ease: 'power1.out' })
}

/** Tween the rig's pose from its current value to a named pose, as an arc. */
function poseTo(t: gsap.core.Timeline, to: PoseName, at: number, duration: number, ease: string, from?: PoseName) {
  const a = makePose()
  const b = makePose()
  const k = { v: 0 }
  t.add(() => {
    rig.poseName = null
    if (from) brainPose(from, aspect, a)
    else copyPose(rig.pose, a)
    brainPose(to, aspect, b)
    k.v = 0
  }, at)
  t.to(k, { v: 1, duration, ease, onUpdate: () => blendPose(a, b, k.v, rig.pose) }, at)
  t.add(() => { rig.poseName = to }, at + duration)
}

function dipIn(t: gsap.core.Timeline, at: number, d = 0.35) {
  const el = dipEl()
  if (el) t.to(el, { opacity: 1, duration: d, ease: 'power1.in' }, at)
}
function dipOut(t: gsap.core.Timeline, at: number, d = 0.5) {
  const el = dipEl()
  if (el) t.to(el, { opacity: 0, duration: d, ease: 'power1.out' }, at)
}
function bgTo(t: gsap.core.Timeline, color: typeof TOKENS.abyss, at: number, duration: number, ease = 'none') {
  t.to(rig.bg, { r: color.r, g: color.g, b: color.b, duration, ease }, at)
}

/** The choreographed move into beat `to` from the beat before it (choreography.md). */
function choreograph(toId: string): gsap.core.Timeline {
  const t = gsap.timeline({ paused: true })
  switch (toId) {
    case 'living-fold-built':
      // Contours stack, the map tilts into a stack in depth, slabs fill and close into the brain.
      t.to(rig, { contours: PLANES, duration: 2.4, ease: 'none' }, 0)
      poseTo(t, 'built', 2.0, 3.2, 'power2.inOut', 'top')
      t.to(rig, { build: 1, duration: 2.4, ease: 'power1.inOut' }, 4.6)
      t.to(rig, { contourOpacity: 0, duration: 1.4, ease: 'power1.in' }, 5.6)
      t.to({}, { duration: 0.5 }, 7.0)
      break
    case 'living-fold-section':
      t.to(rig, { lift: 1, duration: 1.4, ease: 'power3.inOut' }, 0)
      poseTo(t, 'lifted', 0, 1.4, 'power3.inOut')
      break
    case 'architecture':
      t.to(rig, { lift: 0, duration: 1.0, ease: 'power2.inOut' }, 0)
      poseTo(t, 'lateral', 0.6, 2.4, 'power2.inOut')
      bgTo(t, TOKENS.charcoal, 0.4, 2.0)
      // The landmark folds are traced before any label appears.
      t.to(rig, { landmark: 1, duration: 2.2, ease: 'power1.inOut' }, 3.0)
      break
    case 'architecture-midline':
      t.to(rig, { landmark: 0, duration: 0.4 }, 0)
      poseTo(t, 'parting', 0, 1.4, 'power2.inOut')
      t.to(rig, { part: 1, duration: 1.8, ease: 'power2.inOut' }, 1.2)
      poseTo(t, 'medial', 2.6, 1.6, 'power3.inOut')
      break
    case 'signal':
      // Back to the lateral surface, then a descent onto the middle temporal gyrus; the scale
      // changes at a cut, not in a continuous zoom.
      t.to(rig, { part: 0, duration: 1.0, ease: 'power2.inOut' }, 0)
      poseTo(t, 'lateral', 0, 1.0, 'power2.inOut')
      poseTo(t, 'mtg', 1.0, 2.0, 'power2.in')
      dipIn(t, 2.6, 0.4)
      t.add(() => { rig.world = 'neuron'; rig.neuronT = 0; rig.bg.copy(TOKENS.abyss) }, 3.0)
      dipOut(t, 3.0, 0.9)
      t.to({}, { duration: 0.5 }, 3.9)
      break
    case 'signal-axon':
      t.fromTo(rig, { neuronT: 0 }, { neuronT: NT.end, duration: NT.end, ease: 'none' }, 0)
      break
    case 'signal-synapse':
      dipIn(t, 0, 0.35)
      t.add(() => { rig.world = 'synapse'; rig.synT = 0 }, 0.35)
      dipOut(t, 0.35, 0.5)
      t.fromTo(rig, { synT: 0 }, { synT: SYN_END, duration: SYN_END, ease: 'none' }, 0.45)
      break
    case 'memory':
      dipIn(t, 0, 0.4)
      t.add(() => {
        rig.world = 'brain'
        Object.assign(rig, { build: 1, contourOpacity: 0, lift: 0, part: 0, line: 0, landmark: 0, shell: 0 })
        rig.bg.copy(TOKENS.charcoal)
        rig.poseName = 'memoryVia'
        brainPose('memoryVia', aspect, rig.pose)
      }, 0.4)
      dipOut(t, 0.4, 0.6)
      poseTo(t, 'memory', 0.6, 3.0, 'power2.inOut', 'memoryVia')
      t.to(rig, { shell: 1, duration: 2.2, ease: 'power1.inOut' }, 1.2)
      break
    case 'memory-emotion':
      poseTo(t, 'emotion', 0, 1.6, 'power2.inOut')
      break
    case 'mind':
      t.to(rig, { shell: 0, duration: 1.4, ease: 'power2.inOut' }, 0)
      poseTo(t, 'mind', 0, 1.4, 'power2.inOut')
      t.set(rig, { contourInk: 1, contours: PLANES }, 1.4)
      t.to(rig, { line: 1, duration: 5.6, ease: 'sine.inOut' }, 1.4)
      bgTo(t, TOKENS.plate, 1.4, 5.6, 'sine.inOut')
      t.to(rig, { plate: 1, duration: 5.6, ease: 'sine.inOut' }, 1.4)
      t.to(rig, { threads: 1, duration: 1.4, ease: 'power1.out' }, 6.2)
      break
  }
  return t
}

/** Move to beat `index`. Forward by one beat plays the choreography; anything else cuts. */
export function go(index: number) {
  const s = ui.get()
  if (index < 0 || index >= BEATS.length) return
  if (s.explore) ui.set({ explore: false })
  if (index === s.beat + 1 && !s.reduced) {
    tl?.kill()
    const id = BEATS[index].beat.id
    ui.set({ transitioning: true, selected: null })
    tl = choreograph(id)
    tl.eventCallback('onComplete', () => { applyRest(id); arrive(index) })
    tl.play()
    ui.set({ beat: index })
    setHash(index)
    return
  }
  cutTo(index, s.reduced ? 0.3 : 0.45)
}

export const director = {
  next() {
    const s = ui.get()
    if (s.transitioning && tl) {
      // Interrupt: complete the move at once (behind a short dip); the input is consumed.
      const running = tl
      const el = dipEl()
      if (!el) { running.progress(1); return }
      gsap.killTweensOf(el)
      gsap.timeline()
        .to(el, { opacity: 1, duration: 0.12 })
        .add(() => running.progress(1))
        .to(el, { opacity: 0, duration: 0.2 })
      return
    }
    if (s.beat === BEATS.length - 1) { cutTo(0, 0.6); return } // "Start again"
    go(s.beat + 1)
  },
  previous() {
    const s = ui.get()
    if (s.transitioning) {
      // Previous during a move cuts back to where it started.
      cutTo(Math.max(0, s.beat - 1))
      return
    }
    if (s.beat > 0) cutTo(s.beat - 1)
  },
  first: () => cutTo(0),
  last: () => cutTo(BEATS.length - 1),
  /** Deep link or hashchange: rest directly on the beat. */
  jump: (index: number) => cutTo(index, 0),
  /** Replay the signal or the synaptic release; with reduced motion, the event plays without camera motion. */
  replay() {
    const id = BEATS[ui.get().beat].beat.id
    if (id !== 'signal-axon' && id !== 'signal-synapse') return
    tl?.kill()
    ui.set({ transitioning: true })
    const t = gsap.timeline({ onComplete: () => { applyRest(id); arrive(ui.get().beat) } })
    if (id === 'signal-axon') {
      rig.neuronStatic = ui.get().reduced
      const from = ui.get().reduced ? NT.fire : NT.toTrigger
      t.fromTo(rig, { neuronT: from }, { neuronT: NT.end, duration: NT.end - from, ease: 'none' })
      t.add(() => { rig.neuronStatic = false })
    } else t.fromTo(rig, { synT: 0 }, { synT: SYN_END, duration: SYN_END, ease: 'none' })
    tl = t
  },
  applyRest,
}

/** Phones and low-power devices get the cut-away window in scene 4 instead of the shell. */
export const CUTAWAY = COARSE
