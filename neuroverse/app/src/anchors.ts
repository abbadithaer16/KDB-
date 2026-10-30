import type { Vector3 } from 'three'

/** World-space label anchors, keyed `${beatId}:${labelKey}`, written by the world that owns the beat. */
export const anchors: Record<string, Vector3> = {}
