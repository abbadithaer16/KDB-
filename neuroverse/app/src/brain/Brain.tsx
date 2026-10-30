import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import gsap from 'gsap'
import { Box3, Color, MathUtils, Matrix4, Mesh, Vector3 } from 'three'
import type { MeshBasicMaterial, MeshPhysicalMaterial, Plane } from 'three'
import { useBrainModel } from './model'
import { brainUniforms, outlineMaterial, planes, tissueMaterial } from './materials'
import { BRAIN, TOKENS, brainPose, deepCentre, mtgPoint, rig } from '../rig'
import type { PoseName } from '../rig'
import { BEATS } from '../content'
import { ui, useUI } from '../state'
import { CUTAWAY } from '../director'
import { anchors } from '../anchors'

const CORTEX = new Set(['frontal', 'parietal', 'temporal', 'occipital', 'insula', 'whitematter', 'cerebellum'])
const GREY = new Set(['frontal', 'parietal', 'temporal', 'occipital', 'insula', 'limbic', 'cerebellum'])
const WHITE = new Set(['whitematter', 'callosum', 'fornix'])

/** Horizontal cut for the scene 1 lift: 64% of brain height from the bottom. */
const CUT_Y = -0.87 + 0.64 * BRAIN.h
const UP = new Vector3(0, 1, 0)
const LIFT = 0.03 * BRAIN.h // clearance at the hinge
const LID = -MathUtils.degToRad(30) // the top opens like a lid, hinged at the occipital pole
const HINGE_X = BRAIN.cx + BRAIN.w / 2
/** Scene 2: the left hemisphere moves anterior (screen left in the lateral view) and outwards. */
const PART = new Vector3(-3.0, 0.15, 1.4)

type Part = {
  name: string
  region: string
  side: 'left' | 'right' | 'mid'
  base: Matrix4
  main: Mesh
  twin: Mesh
  outline: Mesh
  mat: MeshPhysicalMaterial
  twinMat: MeshPhysicalMaterial
  outlineMat: MeshBasicMaterial
  color: Color
  cap: Color
}

const tint = (c: Color, on: boolean, any: boolean) => (!any ? c.clone() : on ? c.clone().lerp(new Color(TOKENS.violet), 0.45) : c.clone().lerp(new Color(TOKENS.dimmed), 0.8))

export function Brain() {
  const gltf = useBrainModel()
  const parts = useMemo<Part[]>(() => {
    const out: Part[] = []
    gltf.scene.updateMatrixWorld(true)
    gltf.scene.traverse((o) => {
      if (!(o as Mesh).isMesh) return
      const src = o as Mesh
      const region = String(src.userData.region)
      const side = String(src.userData.side) as Part['side']
      const hex = GREY.has(region) ? TOKENS.greyMatter : WHITE.has(region) ? TOKENS.whiteMatter : TOKENS.deepNuclei
      const capHex = WHITE.has(region) ? TOKENS.capWhite : GREY.has(region) ? TOKENS.capGrey : TOKENS.deepNuclei
      const cortex = CORTEX.has(region)
      const second: Plane = side === 'mid' ? planes.midRight : cortex && side === 'left' && CUTAWAY ? planes.cutaway : planes.none
      const mat = tissueMaterial(hex, capHex, [planes.axialLow, second], { cortex, ink: cortex || region === 'limbic' ? 1 : 0.55 })
      const twinMat = tissueMaterial(hex, capHex, [planes.axialHigh, side === 'mid' ? planes.midLeft : planes.none], { cortex, ink: 1 })
      const base = src.matrixWorld.clone()
      const mk = (m: MeshPhysicalMaterial | MeshBasicMaterial) => {
        const mesh = new Mesh(src.geometry, m)
        mesh.matrixAutoUpdate = false
        mesh.matrix.copy(base)
        mesh.matrixWorld.copy(base)
        mesh.userData = { region, side }
        return mesh
      }
      const scale = new Vector3().setFromMatrixScale(base)
      const outlineMat = outlineMaterial([planes.axialLow, second], 0.0045 / ((scale.x + scale.y + scale.z) / 3))
      const main = mk(mat)
      const twin = mk(twinMat)
      twin.visible = false
      const outline = mk(outlineMat)
      outline.raycast = () => {}
      twin.raycast = () => {}
      out.push({ name: src.name, region, side, base, main, twin, outline, mat, twinMat, outlineMat, color: new Color(hex), cap: new Color(capHex) })
    })
    return out
  }, [gltf])

  // Model-derived points used by the camera and labels.
  useEffect(() => {
    const centroid = (p: Part) => {
      const g = p.main.geometry
      g.computeBoundingBox()
      return g.boundingBox!.clone().applyMatrix4(p.base).getCenter(new Vector3())
    }
    const temporal = parts.find((p) => p.region === 'temporal' && p.side === 'left')
    if (temporal) mtgPoint.copy(surfacePoint(temporal, 0.45, 0.42, new Vector3(0, 0, 1)) ?? centroid(temporal))
    const hip = parts.find((p) => p.region === 'hippocampus' && p.side === 'left')
    const amy = parts.find((p) => p.region === 'amygdala' && p.side === 'left')
    if (hip && amy) deepCentre.copy(centroid(hip)).add(centroid(amy)).multiplyScalar(0.5)
    if (hip) {
      const g = hip.main.geometry
      g.computeBoundingBox()
      const box = g.boundingBox!.clone().applyMatrix4(hip.base)
      cutawayZ = box.max.z + 0.025
    }
    ui.set({ brainReady: true })
    return () => parts.forEach((p) => { p.mat.dispose(); p.twinMat.dispose(); p.outlineMat.dispose() })
  }, [parts])

  // Anchors for the current beat, computed once per beat from the model (visible points only).
  const beat = useUI((s) => s.beat)
  useEffect(() => {
    computeAnchors(BEATS[beat].beat.id, parts)
  }, [beat, parts])

  // Selection and the scene 4 network highlight.
  const selected = useUI((s) => s.selected)
  useEffect(() => {
    const def = BEATS[beat].beat
    const label = def.labels.find((l) => l.key === selected)
    const set = new Set<string>(label?.regions ?? (def.id.startsWith('memory') ? def.labels.flatMap((l) => l.regions ?? []) : []))
    const any = set.size > 0
    const d = ui.get().reduced ? 0 : 0.45
    for (const p of parts) {
      const on = set.has(p.region)
      const c = tint(p.color, on, any)
      const cap = tint(p.cap, on, any)
      for (const m of [p.mat, p.twinMat]) {
        gsap.to(m.color, { r: c.r, g: c.g, b: c.b, duration: d, ease: 'power2.out', overwrite: true })
        const u = (m.userData.local as { uCap: { value: Color } }).uCap.value
        gsap.to(u, { r: cap.r, g: cap.g, b: cap.b, duration: d, ease: 'power2.out', overwrite: true })
      }
      const show = on && (!!label || p.side !== 'right')
      if (show) p.outline.visible = true
      gsap.to(p.outlineMat, { opacity: show ? 1 : 0, duration: d, overwrite: true, onComplete: () => { p.outline.visible = show } })
    }
  }, [selected, beat, parts])

  const tmp = useMemo(() => new Matrix4(), [])
  const lid = useMemo(() => new Matrix4(), [])
  const rot = useMemo(() => new Matrix4(), [])
  const back = useMemo(() => new Matrix4(), [])
  useFrame(() => {
    const lift = rig.lift
    const part = rig.part
    const shell = CUTAWAY ? 0 : rig.shell
    brainUniforms.uBuild.value = rig.build
    brainUniforms.uShell.value = shell
    brainUniforms.uSweepX.value = rig.line <= 0.0001 ? -5 : -1.05 + 2.0 * rig.line
    // Lift: lower part keeps y < cut; the twin keeps the part above the cut and rises with it.
    const liftY = lift * LIFT
    planes.axialLow.constant = lift > 0.001 ? CUT_Y : 1e3
    // The lid: rotate about a left-right axis at the back of the cut, then rise slightly. Its
    // clipping plane is the cut plane carried by the same transform.
    lid.makeTranslation(HINGE_X, CUT_Y + liftY, 0).multiply(rot.makeRotationZ(LID * lift)).multiply(back.makeTranslation(-HINGE_X, -CUT_Y, 0))
    if (lift > 0.001) planes.axialHigh.set(UP, -CUT_Y).applyMatrix4(lid)
    else planes.axialHigh.set(UP, 1e3)
    // Parting: midline parts are split at z = 0; the left half (twin) moves with the left hemisphere.
    const off = PART.clone().multiplyScalar(part)
    planes.midRight.constant = part > 0.001 ? 0 : 1e3
    planes.midLeft.constant = part > 0.001 ? -off.z : 1e3
    planes.cutaway.constant = CUTAWAY && rig.shell > 0.001 ? 1 + (cutawayZ - 1) * rig.shell : 1e3
    const hideLeft = part > 0.999
    for (const p of parts) {
      const mainOff = p.side === 'left' ? off : null
      p.main.matrix.copy(mainOff ? tmp.makeTranslation(mainOff.x, mainOff.y, mainOff.z).multiply(p.base) : p.base)
      p.main.matrixWorld.copy(p.main.matrix)
      p.outline.matrix.copy(p.main.matrix)
      p.outline.matrixWorld.copy(p.main.matrix)
      const cortexHidden = ui.get().cortex === 'hidden' && rig.shell > 0.5 && CORTEX.has(p.region)
      p.main.visible = !(hideLeft && p.side === 'left') && !(shell > 0.98 && p.region === 'whitematter') && !cortexHidden
      const twinLift = lift > 0.001
      const twinPart = part > 0.001 && p.side === 'mid'
      p.twin.visible = (twinLift || twinPart) && !(twinPart && hideLeft)
      if (p.twin.visible) {
        if (twinLift) p.twin.matrix.copy(lid).multiply(p.base)
        else p.twin.matrix.copy(tmp.makeTranslation(off.x, off.y, off.z).multiply(p.base))
        p.twin.matrixWorld.copy(p.twin.matrix)
        if (twinPart) planes.midLeft.constant = -off.z
      }
      if (CORTEX.has(p.region)) {
        const translucent = shell > 0.02
        p.mat.depthWrite = !translucent
        p.mat.transparent = translucent
        p.main.renderOrder = translucent ? 2 : 0
      }
    }
  })

  const onClick = (e: ThreeEvent<MouseEvent>, p: Part) => {
    if (e.delta > 4 || !p.main.visible) return
    if (!CUTAWAY && rig.shell > 0.5 && CORTEX.has(p.region)) return // see-through cortex passes clicks on
    if (rig.part > 0.5 && p.side === 'mid' && e.point.z > 0.0) return
    if (CUTAWAY && rig.shell > 0.5 && CORTEX.has(p.region) && p.side === 'left' && e.point.z > cutawayZ) return
    const def = BEATS[ui.get().beat].beat
    const label = def.labels.find((l) => l.regions?.includes(p.region))
    if (!label) return
    e.stopPropagation()
    ui.set({ selected: ui.get().selected === label.key ? null : label.key })
  }

  return (
    <group>
      {parts.map((p) => (
        <group key={p.name}>
          <primitive object={p.main} onClick={(e: ThreeEvent<MouseEvent>) => onClick(e, p)} />
          <primitive object={p.twin} />
          <primitive object={p.outline} />
        </group>
      ))}
    </group>
  )
}

let cutawayZ = 0.3

// ---- Anchors ------------------------------------------------------------------------------------

/** A vertex of the part near a target in its bounding box, facing `facing` (no visibility test). */
function surfacePoint(p: Part, fx: number, fy: number, facing: Vector3) {
  const g = p.main.geometry
  g.computeBoundingBox()
  const box = g.boundingBox!.clone().applyMatrix4(p.base)
  const tx = box.min.x + fx * (box.max.x - box.min.x)
  const ty = box.min.y + fy * (box.max.y - box.min.y)
  const pos = g.getAttribute('position')
  const nrm = g.getAttribute('normal')
  const v = new Vector3()
  const n = new Vector3()
  let best: Vector3 | null = null
  let bd = Infinity
  for (let i = 0; i < pos.count; i++) {
    n.fromBufferAttribute(nrm, i)
    if (n.dot(facing) < 0.5) continue
    v.fromBufferAttribute(pos, i).applyMatrix4(p.base)
    const d = Math.hypot(v.x - tx, v.y - ty)
    if (d < bd) { bd = d; best = v.clone() }
  }
  return best
}

type Spec = { key: string; region: string; side: Part['side']; fx: number; fy: number; occluders: 'all' | 'noCortex' | 'noLeft' | 'none' }

const SPECS: Record<string, { pose: PoseName; specs: Spec[] }> = {
  'living-fold-built': { pose: 'built', specs: [{ key: 'cortex', region: 'frontal', side: 'left', fx: 0.3, fy: 0.72, occluders: 'all' }] },
  architecture: {
    pose: 'lateral',
    specs: [
      { key: 'frontal', region: 'frontal', side: 'left', fx: 0.35, fy: 0.62, occluders: 'all' },
      { key: 'parietal', region: 'parietal', side: 'left', fx: 0.5, fy: 0.72, occluders: 'all' },
      { key: 'temporal', region: 'temporal', side: 'left', fx: 0.42, fy: 0.3, occluders: 'all' },
      { key: 'occipital', region: 'occipital', side: 'left', fx: 0.8, fy: 0.62, occluders: 'all' },
      { key: 'cerebellum', region: 'cerebellum', side: 'left', fx: 0.62, fy: 0.45, occluders: 'all' },
      { key: 'brainstem', region: 'brainstem', side: 'left', fx: 0.45, fy: 0.18, occluders: 'all' },
    ],
  },
  'architecture-midline': {
    pose: 'medial',
    specs: [
      { key: 'callosum', region: 'callosum', side: 'mid', fx: 0.5, fy: 0.85, occluders: 'noLeft' },
      { key: 'thalamus', region: 'thalamus', side: 'right', fx: 0.5, fy: 0.5, occluders: 'noLeft' },
      { key: 'cingulate', region: 'limbic', side: 'right', fx: 0.45, fy: 0.85, occluders: 'noLeft' },
      { key: 'cerebellum', region: 'cerebellum', side: 'right', fx: 0.4, fy: 0.5, occluders: 'noLeft' },
      { key: 'brainstem', region: 'brainstem', side: 'right', fx: 0.5, fy: 0.3, occluders: 'noLeft' },
    ],
  },
  memory: {
    pose: 'memory',
    specs: [
      { key: 'hippocampus', region: 'hippocampus', side: 'left', fx: 0.5, fy: 0.5, occluders: 'noCortex' },
      { key: 'fornix', region: 'fornix', side: 'left', fx: 0.5, fy: 0.85, occluders: 'noCortex' },
      { key: 'parahippocampal', region: 'limbic', side: 'left', fx: 0.6, fy: 0.12, occluders: 'noCortex' },
      { key: 'frontal', region: 'frontal', side: 'left', fx: 0.2, fy: 0.55, occluders: 'none' },
    ],
  },
  'memory-emotion': {
    pose: 'emotion',
    specs: [
      { key: 'amygdala', region: 'amygdala', side: 'left', fx: 0.5, fy: 0.5, occluders: 'noCortex' },
      { key: 'hippocampus', region: 'hippocampus', side: 'left', fx: 0.6, fy: 0.5, occluders: 'noCortex' },
      { key: 'hypothalamus', region: 'hypothalamus', side: 'left', fx: 0.5, fy: 0.4, occluders: 'noCortex' },
      { key: 'cingulate', region: 'limbic', side: 'left', fx: 0.4, fy: 0.9, occluders: 'noCortex' },
      { key: 'frontal', region: 'frontal', side: 'left', fx: 0.2, fy: 0.55, occluders: 'none' },
    ],
  },
  mind: {
    pose: 'mind',
    specs: [{ key: 'structures', region: 'parietal', side: 'left', fx: 0.5, fy: 0.75, occluders: 'none' }],
  },
}

const done = new Set<string>()
/**
 * Label anchors without raycasting: among the structure's vertices near the target (measured in
 * the plane facing the camera), take the one nearest the camera. That point is on the visible
 * outer surface of the structure by construction; occluders are handled by the beat's rules
 * (the left hemisphere is gone in the midline view, the cortex is see-through in step 4).
 */
function computeAnchors(id: string, parts: Part[]) {
  if (done.has(id)) return
  done.add(id)
  const cfg = SPECS[id]
  if (!cfg) return
  const cam = brainPose(cfg.pose, 16 / 9)
  const dir = cam.target.clone().sub(cam.pos).normalize()
  const v = new Vector3()
  const n = new Vector3()
  const box = new Box3()
  const proj = new Vector3()
  for (const s of cfg.specs) {
    const p = parts.find((q) => q.region === s.region && q.side === s.side) ?? parts.find((q) => q.region === s.region && q.side === 'mid')
    if (!p) continue
    if (s.key === 'callosum') { anchors[`${id}:callosum`] = midlineFace(p, 0.5); continue }
    const g = p.main.geometry
    g.computeBoundingBox()
    box.copy(g.boundingBox!).applyMatrix4(p.base)
    const target = new Vector3(box.min.x + s.fx * (box.max.x - box.min.x), box.min.y + s.fy * (box.max.y - box.min.y), (box.min.z + box.max.z) / 2)
    const pos = g.getAttribute('position')
    const nrm = g.getAttribute('normal')
    let best: Vector3 | null = null
    let bestScore = -Infinity
    const radius = 0.06
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(p.base)
      if (s.occluders === 'noLeft' && v.z > 0.005) continue
      n.fromBufferAttribute(nrm, i)
      if (n.dot(dir) > -0.2) continue // must face the camera
      // distance from the target measured across the view (ignore depth)
      proj.copy(v).sub(target)
      const along = proj.dot(dir)
      const across = proj.addScaledVector(dir, -along).length()
      if (across > radius) continue
      const score = -along - across * 4 // nearest the camera, then nearest the target
      if (score > bestScore) { bestScore = score; best = v.clone() }
    }
    if (!best) {
      // fall back to the nearest vertex to the target
      let bd = Infinity
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(p.base)
        const d = v.distanceTo(target)
        if (d < bd) { bd = d; best = v.clone() }
      }
    }
    if (best) anchors[`${id}:${s.key}`] = best
  }
  if (id === 'mind') {
    anchors['mind:signals'] = mtgPoint.clone()
    // Deep limbic structures (thalamus and fornix level), above the neuron's gyrus so the threads never cross.
    anchors['mind:networks'] = deepCentre.clone().add(new Vector3(0, 0.14, 0))
  }
}

/** A midline structure seen as its cut face: the middle of its cross-section at a given front-back fraction. */
function midlineFace(p: Part, fx: number) {
  const g = p.main.geometry
  g.computeBoundingBox()
  const box = g.boundingBox!.clone().applyMatrix4(p.base)
  const tx = box.min.x + fx * (box.max.x - box.min.x)
  const pos = g.getAttribute('position')
  const v = new Vector3()
  let lo = Infinity
  let hi = -Infinity
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(p.base)
    if (Math.abs(v.x - tx) < 0.02 && Math.abs(v.z) < 0.03 && v.y > box.min.y + 0.5 * (box.max.y - box.min.y)) { lo = Math.min(lo, v.y); hi = Math.max(hi, v.y) }
  }
  return new Vector3(tx, lo < hi ? (lo + hi) / 2 : box.max.y, 0)
}
