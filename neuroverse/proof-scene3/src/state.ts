import { useSyncExternalStore } from 'react'

/** Beats of scene 3 covered by this proof: 3a (neuron) and 3b (signal, then resting). */
export type Beat = 'neuron' | 'signal' | 'arrived'

type UI = { beat: Beat; ready: boolean; playingStatic: boolean; error?: string }

let state: UI = { beat: 'neuron', ready: false, playingStatic: false }
const listeners = new Set<() => void>()

export const ui = {
  get: () => state,
  set(patch: Partial<UI>) {
    state = { ...state, ...patch }
    listeners.forEach((l) => l())
  },
  subscribe(l: () => void) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
}

export function useUI<T>(select: (s: UI) => T) {
  return useSyncExternalStore(ui.subscribe, () => select(state))
}

export const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const COARSE = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
export const DEBUG = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug')
