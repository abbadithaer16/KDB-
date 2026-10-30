import { Vector3 } from 'three'

/** Depth of field for the desktop tier, written by the world on screen each frame (0 bokeh = sharp). */
export const focus = { point: new Vector3(), bokeh: 0, range: 0.25 }
