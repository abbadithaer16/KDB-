import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import gsap from 'gsap'
import { BackSide, Box3, Color, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, Raycaster, Vector3 } from 'three'
import type { Plane } from 'three'
import { ui, useUI, reducedMotion } from './state'
import type { View } from './state'
import { ANCHOR_TARGETS, GREY_MATTER, LABELS, TOKENS, WHITE, anchorPoints, sectionPlane } from './scene'

const MODEL = `${import.meta.env.BASE_URL}models/brain-s2.glb`

type Part = {
  name: string
  region: string
  side: string
  mesh: Mesh
  material: MeshPhysicalMaterial
  base: Color
  cap: MeshBasicMaterial
  outline: MeshBasicMaterial
}

function tissueMaterial(hex: string, planes: Plane[]) {
  return new MeshPhysicalMaterial({
    color: hex,
    vertexColors: true, // cavity term from the pipeline darkens sulci
    roughness: 0.52,
    sheen: 0.45,
    sheenRoughness: 0.55,
    sheenColor: new Color('#d9c9c1'),
    clearcoat: 0.22,
    clearcoatRoughness: 0.38,
    clippingPlanes: planes,
  })
}

/** Inverted hull: back faces pushed out along the normal, drawn in the selection violet. */
function outlineMaterial(planes: Plane[]) {
  const m = new MeshBasicMaterial({ color: TOKENS.violet, side: BackSide, clippingPlanes: planes, transparent: true, opacity: 0, depthWrite: false })
  m.visible = false
  m.onBeforeCompile = (s) => {
    s.vertexShader = s.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n transformed += normal * 0.0045;')
  }
  return m
}

function capColor(region: string) {
  if (WHITE.has(region)) return TOKENS.capWhite
  if (GREY_MATTER.has(region)) return TOKENS.capGrey
  return TOKENS.deepNuclei
}

/**
 * Label anchors that are actually visible from the teaching camera: candidates on the region,
 * nearest a target point in its bounding box, are accepted only if a ray from the viewer side
 * hits this region first. In the section view the left hemisphere is ignored.
 */
function findAnchors(parts: Part[]) {
  const ray = new Raycaster()
  const v = new Vector3()
  const box = new Box3()
  for (const view of ['lateral', 'section'] as View[]) {
    const side = view === 'lateral' ? 'left' : 'right'
    const occluders = parts.filter((p) => view === 'lateral' || p.side !== 'left').map((p) => p.mesh)
    for (const label of LABELS[view]) {
      const region = label.regions[0]
      const part = parts.find((p) => p.region === region && p.side === side) ?? parts.find((p) => p.region === region && p.side === 'mid')
      if (!part) continue
      const [fx, fy] = ANCHOR_TARGETS[`${view}:${label.id}`] ?? [0.5, 0.5]
      const geo = part.mesh.geometry
      geo.computeBoundingBox()
      box.copy(geo.boundingBox!)
      const tx = box.min.x + fx * (box.max.x - box.min.x)
      const ty = box.min.y + fy * (box.max.y - box.min.y)
      const pos = geo.getAttribute('position')
      const nrm = geo.getAttribute('normal')
      const cands: { i: number; d: number }[] = []
      for (let i = 0; i < pos.count; i++) {
        if (nrm.getZ(i) < 0.25) continue // must face the viewer (+z)
        if (view === 'section' && pos.getZ(i) > 0) continue
        cands.push({ i, d: Math.hypot(pos.getX(i) - tx, pos.getY(i) - ty) })
      }
      cands.sort((a, b) => a.d - b.d)
      let found: Vector3 | undefined
      for (const c of cands.slice(0, 60)) {
        v.fromBufferAttribute(pos, c.i)
        ray.set(new Vector3(v.x, v.y, 5), new Vector3(0, 0, -1))
        const hits = ray.intersectObjects(occluders, false).filter((h) => view === 'lateral' || h.point.z <= 0)
        if (hits[0]?.object === part.mesh) { found = hits[0].point.clone(); break }
      }
      if (!found && cands[0]) found = v.fromBufferAttribute(pos, cands[0].i).clone()
      if (found) anchorPoints[`${view}:${label.id}`] = found
    }
  }
}

export function Brain() {
  const gltf = useGLTF(MODEL)
  const parts = useMemo<Part[]>(() => {
    const out: Part[] = []
    gltf.scene.traverse((o) => {
      if (!(o as Mesh).isMesh) return
      const src = o as Mesh
      const region = String(src.userData.region)
      const side = String(src.userData.side)
      // The right hemisphere is never clipped; the sweep cuts the left side and midline parts.
      const planes = side === 'right' ? [] : [sectionPlane]
      const hex = GREY_MATTER.has(region) ? TOKENS.greyMatter : WHITE.has(region) ? TOKENS.whiteMatter : TOKENS.deepNuclei
      const material = tissueMaterial(hex, planes)
      out.push({
        name: src.name, region, side, mesh: new Mesh(src.geometry, material),
        material, base: new Color(hex),
        cap: new MeshBasicMaterial({ color: capColor(region), side: BackSide, clippingPlanes: planes }),
        outline: outlineMaterial(planes),
      })
    })
    findAnchors(out)
    return out
  }, [gltf])

  useEffect(() => {
    ui.set({ ready: true })
    return () => parts.forEach((p) => { p.material.dispose(); p.cap.dispose(); p.outline.dispose() })
  }, [parts])

  // Caps cost draw calls only while the plane is inside the brain; once the sweep reaches the
  // midline the left hemisphere is removed rather than sliced, so no slivers remain.
  useFrame(() => {
    const c = sectionPlane.constant
    const cutting = c < 1
    const leftGone = c < 0.03
    for (const p of parts) {
      const shown = !(leftGone && p.side === 'left')
      p.mesh.visible = shown
      p.cap.visible = cutting && shown && p.side !== 'right'
      if (!shown) p.outline.visible = false
    }
  })

  // Selection: the chosen structure takes a violet tint and edge; everything else dims.
  const selected = useUI((s) => s.selected)
  const view = useUI((s) => s.view)
  useEffect(() => {
    const def = selected ? LABELS[view].find((l) => l.id === selected) : undefined
    const d = reducedMotion ? 0 : 0.45
    for (const p of parts) {
      const on = !!def && def.regions.includes(p.region)
      const target = !def ? p.base : on ? p.base.clone().lerp(new Color(TOKENS.violet), 0.45) : p.base.clone().lerp(new Color(TOKENS.dimmed), 0.62)
      gsap.to(p.material.color, { r: target.r, g: target.g, b: target.b, duration: d, ease: 'power2.out', overwrite: true })
      if (on) p.outline.visible = true
      gsap.to(p.outline, { opacity: on ? 1 : 0, duration: d, overwrite: true, onComplete: () => { p.outline.visible = on } })
    }
  }, [selected, view, parts])

  const selectable = useMemo(() => new Set(LABELS[view].flatMap((l) => l.regions)), [view])
  const onClick = (e: ThreeEvent<MouseEvent>, part: Part) => {
    if (e.delta > 4) return // a drag, not a click
    if (part.side !== 'right' && e.point.z > sectionPlane.constant) return // clipped away: pass through
    e.stopPropagation()
    if (!selectable.has(part.region)) return
    const id = LABELS[view].find((l) => l.regions.includes(part.region))?.id ?? null
    ui.set({ selected: ui.get().selected === id ? null : id })
  }

  return (
    <group>
      {parts.map((p) => (
        <group key={p.name}>
          <primitive object={p.mesh} onClick={(e: ThreeEvent<MouseEvent>) => onClick(e, p)} />
          <mesh geometry={p.mesh.geometry} material={p.cap} raycast={() => null} />
          <mesh geometry={p.mesh.geometry} material={p.outline} raycast={() => null} renderOrder={-1} />
        </group>
      ))}
    </group>
  )
}

useGLTF.preload(MODEL)
