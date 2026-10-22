import { useSyncExternalStore } from 'react'

/* ---------------------------------------------------------------------------
 * rig — mutable, per-frame values written by ScrollTrigger and read in useFrame.
 * Never stored in React state (no re-render per scroll tick).
 * ------------------------------------------------------------------------- */
export type Piece = 'ring' | 'necklace' | 'bracelet'

export const rig = {
  intro: 0, // 0 → 1, time-based hero reveal after preload
  ringT: 0, // 0 hero → 1 end of THE DIAMOND
  ringOn: 1, // stage presence (light) 0..1
  neckT: 0,
  neckOn: 0,
  braceT: 0,
  braceOn: 0,
  pointer: { x: 0, y: 0 }, // -1..1, desktop parallax
}

/* ---------------------------------------------------------------------------
 * UI store — low-frequency state shared by DOM + canvas.
 * ------------------------------------------------------------------------- */
export type Metal = 'yellow' | 'white'
export type Mode = 'scroll' | 'inspect' | 'detail'

export interface UIState {
  loaded: boolean
  glReady: boolean
  progress: number
  mode: Mode
  stageVisible: boolean // any 3D scene on screen → render loop on
  detailId: string | null
  metal: Metal
  enquiryOpen: boolean
  enquiryProduct: string | null
  menuOpen: boolean
  resetTick: number
}

let state: UIState = {
  loaded: false,
  glReady: false,
  progress: 0,
  mode: 'scroll',
  stageVisible: true,
  detailId: null,
  metal: 'yellow',
  enquiryOpen: false,
  enquiryProduct: null,
  menuOpen: false,
  resetTick: 0,
}

const listeners = new Set<() => void>()

export const ui = {
  get: () => state,
  set(patch: Partial<UIState>) {
    let changed = false
    for (const k in patch) {
      const key = k as keyof UIState
      if (state[key] !== patch[key]) {
        changed = true
        break
      }
    }
    if (!changed) return
    state = { ...state, ...patch }
    listeners.forEach((l) => l())
  },
  subscribe(l: () => void) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
}

export function useUI<T>(selector: (s: UIState) => T): T {
  return useSyncExternalStore(ui.subscribe, () => selector(state), () => selector(state))
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  Object.assign(window as object, { __rig: rig, __ui: ui })
}
