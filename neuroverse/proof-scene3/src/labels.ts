import type { Vector3 } from 'three'

/** World-space anchors on recorded points, set when the neuron loads. */
export const anchors: Record<string, Vector3> = {}
/** DOM elements positioned each frame by the projector (no React state per frame). */
export const labelEls: Record<string, HTMLElement | null> = {}
/** The 100 um scale bar, sized each frame from the camera. */
export const scaleBar: { el: HTMLElement | null } = { el: null }
