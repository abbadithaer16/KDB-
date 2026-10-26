import { useSyncExternalStore } from 'react'

/** UI state only (modes, selection). Per-frame values never live here. */
export type View = 'lateral' | 'section'
export type UIState = {
  view: View
  selected: string | null
  explore: boolean
  transitioning: boolean
  ready: boolean
}

let state: UIState = { view: 'lateral', selected: null, explore: false, transitioning: false, ready: false }
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

export const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
