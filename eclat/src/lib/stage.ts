import { rig, ui } from './state'

/**
 * Stage presence. Each section reports how far it has progressed through its
 * transition; this module turns those into per-piece light levels and decides
 * whether the WebGL loop needs to run at all (it stops while opaque editorial
 * sections cover the canvas).
 */
export const phases = {
  campaign: 0, // 0 → 1 while the campaign mask opens over the ring
  neckEnter: 0, // necklace section top: viewport bottom → top
  craftEnter: 0, // craft (opaque) top: bottom → top
  braceEnter: 0,
  collEnter: 0,
}

const ss = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

export function updateStage() {
  rig.ringOn = 1 - ss(0.1, 0.42, phases.campaign)
  rig.neckOn = ss(0.0, 0.85, phases.neckEnter) * (phases.craftEnter < 0.999 ? 1 : 0)
  rig.braceOn = ss(0.0, 0.85, phases.braceEnter) * (phases.collEnter < 0.999 ? 1 : 0)
  const visible = rig.ringOn > 0.001 || rig.neckOn > 0.001 || rig.braceOn > 0.001
  ui.set({ stageVisible: visible })
}
