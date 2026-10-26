import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import gsap from 'gsap'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Vector3 } from 'three'
import { ui, useUI, reducedMotion } from './state'
import type { View } from './state'
import { SECTION_CONSTANT, sectionPlane } from './scene'

/**
 * Camera owner for the narrative. GSAP writes `rig`; useFrame applies it. In Explore Mode
 * OrbitControls owns the camera instead, and leaving Explore tweens back to the frame.
 */
const rig = { az: 0, el: 0.04, tx: 0, ty: 0, dist: 4.2, plane: 2 }

// Brain bounds from the GLB (x: anterior -0.97 to posterior 0.83, y: -0.87 to 0.79).
const BRAIN = { cx: -0.07, cy: -0.04, w: 1.8, h: 1.66 }
const TAN = Math.tan((13 * Math.PI) / 180) // half of the 26° vertical field of view

/**
 * Teaching-frame framing: the brain fills a set share of the frame and sits at a set screen
 * position, clear of the masthead and the label column. Narrow screens centre it higher, with
 * labels listed underneath.
 */
function pose(view: View, aspect: number) {
  const portrait = aspect < 0.9
  const frame = portrait
    ? { cx: 0.5, cy: 0.43, fracH: 0.36, maxW: 0.78 }
    : view === 'lateral'
      ? { cx: 0.43, cy: 0.58, fracH: 0.6, maxW: 0.5 }
      : { cx: 0.6, cy: 0.58, fracH: 0.6, maxW: 0.5 }
  let hWorld = BRAIN.h / frame.fracH
  if (BRAIN.w / (hWorld * aspect) > frame.maxW) hWorld = BRAIN.w / frame.maxW / aspect
  const wWorld = hWorld * aspect
  return {
    az: 0,
    el: 0.04,
    tx: BRAIN.cx - (frame.cx - 0.5) * wWorld,
    ty: BRAIN.cy + (frame.cy - 0.5) * hWorld,
    dist: hWorld / (2 * TAN),
    plane: view === 'section' ? SECTION_CONSTANT : 2,
  }
}

export function Rig() {
  const { camera, size } = useThree()
  const view = useUI((s) => s.view)
  const explore = useUI((s) => s.explore)
  const controls = useRef<OrbitControlsImpl | null>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)
  const aspect = size.width / size.height
  const first = useRef(true)

  // View changes: one choreographed move with a sweeping cut; interruptible and deterministic.
  useEffect(() => {
    const p = pose(view, aspect)
    tl.current?.kill()
    if (first.current || reducedMotion) {
      Object.assign(rig, p)
      first.current = false
      ui.set({ transitioning: false })
      return
    }
    ui.set({ transitioning: true, selected: null })
    const toSection = view === 'section'
    tl.current = gsap
      .timeline({ onComplete: () => ui.set({ transitioning: false }) })
      .to(rig, { az: toSection ? 0.42 : -0.3, el: 0.16, tx: (rig.tx + p.tx) / 2, dist: p.dist * 1.08, duration: 1.5, ease: 'power2.inOut' })
      .to(rig, { plane: toSection ? 0.34 : 0.9, duration: 1.5, ease: 'power1.inOut' }, 0.2)
      .to(rig, { az: p.az, el: p.el, tx: p.tx, ty: p.ty, dist: p.dist, duration: 1.6, ease: 'power3.inOut' }, 1.5)
      .to(rig, { plane: p.plane, duration: 1.4, ease: 'power2.inOut' }, 1.6)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  // Resize: re-frame immediately when nothing is animating.
  useEffect(() => {
    if (!tl.current?.isActive()) Object.assign(rig, pose(ui.get().view, aspect))
  }, [aspect])

  // Leaving Explore Mode returns to the exact teaching frame.
  useEffect(() => {
    if (explore) return
    const c = controls.current
    if (!c) return
    const p = pose(ui.get().view, aspect)
    const from = camera.position.clone().sub(c.target)
    Object.assign(rig, {
      az: Math.atan2(from.x, from.z), el: Math.asin(from.y / from.length()),
      tx: c.target.x, ty: c.target.y, dist: from.length(),
    })
    gsap.to(rig, { ...p, duration: reducedMotion ? 0 : 1.2, ease: 'power2.inOut' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [explore])

  // Reset inside Explore Mode: back to the teaching frame without leaving the mode.
  useEffect(() => {
    const onReset = () => {
      const c = controls.current
      if (!c) return
      const p = pose(ui.get().view, aspect)
      c.target.set(p.tx, p.ty, 0)
      camera.position.set(p.tx + p.dist * Math.sin(p.az), p.ty + p.dist * Math.sin(p.el), p.dist * Math.cos(p.az))
      c.update()
    }
    window.addEventListener('neuroverse:reset', onReset)
    return () => window.removeEventListener('neuroverse:reset', onReset)
  }, [aspect, camera])

  const target = new Vector3()
  useFrame(() => {
    sectionPlane.constant = rig.plane
    if (ui.get().explore) return
    target.set(rig.tx, rig.ty, 0)
    camera.position.set(
      target.x + rig.dist * Math.sin(rig.az) * Math.cos(rig.el),
      target.y + rig.dist * Math.sin(rig.el),
      target.z + rig.dist * Math.cos(rig.az) * Math.cos(rig.el),
    )
    camera.lookAt(target)
  })

  return explore ? (
    <OrbitControls
      ref={controls}
      makeDefault
      target={[rig.tx, rig.ty, 0]}
      enablePan={false}
      enableDamping={!reducedMotion}
      minDistance={2.4}
      maxDistance={rig.dist * 1.6}
    />
  ) : null
}
