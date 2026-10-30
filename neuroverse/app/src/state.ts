import { useSyncExternalStore } from 'react'
import { BEATS, beatIndexById } from './content'

/**
 * UI state for transitions between UI states only (the presentation state machine). Per-frame
 * values live in the mutable `rig` object (rig.ts), never here.
 */
export type CortexMode = 'translucent' | 'hidden' | 'solid'
export type UIState = {
  /** Index into BEATS: the single source of truth for where the presentation is. */
  beat: number
  transitioning: boolean
  explore: boolean
  selected: string | null
  brainReady: boolean
  neuronReady: boolean
  help: boolean
  textVersion: boolean
  webgl: boolean
  cortex: CortexMode
  reduced: boolean
}

const initialBeat = () => {
  if (typeof window === 'undefined') return 0
  const i = beatIndexById(decodeURIComponent(window.location.hash.slice(1)))
  return i >= 0 ? i : 0
}

const mq = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null

let state: UIState = {
  beat: initialBeat(),
  transitioning: false,
  explore: false,
  selected: null,
  brainReady: false,
  neuronReady: false,
  help: false,
  textVersion: false,
  webgl: true,
  cortex: 'translucent',
  reduced: !!mq?.matches,
}
const listeners = new Set<() => void>()

export const ui = {
  get: () => state,
  set(patch: Partial<UIState>) {
    state = { ...state, ...patch }
    listeners.forEach((l) => l())
  },
  subscribe(l: () => void) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
}

export function useUI<T>(pick: (s: UIState) => T): T {
  return useSyncExternalStore(ui.subscribe, () => pick(ui.get()))
}

/** Reduced motion is reversible at runtime: changing the OS setting takes effect without reload. */
mq?.addEventListener('change', (e) => ui.set({ reduced: e.matches }))

export const COARSE = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
export const DEBUG = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug')

export const currentBeat = () => BEATS[ui.get().beat]
