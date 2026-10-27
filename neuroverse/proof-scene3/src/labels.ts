import type { Vector3 } from 'three'

/** World-space anchors on recorded points, set when the neuron loads. */
export const anchors: Record<string, Vector3> = {}
/** DOM elements positioned each frame by the projector (no React state per frame). */
export const labelEls: Record<string, HTMLElement | null> = {}
