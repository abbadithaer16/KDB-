import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, OrbitControls } from '@react-three/drei'
import { Bloom, DepthOfField, EffectComposer, N8AO, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import type { DepthOfFieldEffect, VignetteEffect } from 'postprocessing'
import gsap from 'gsap'
import { AgXToneMapping, NoToneMapping, Vector3 } from 'three'
import type { Group, PerspectiveCamera } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Brain } from './brain/Brain'
import { Contours, Landmarks } from './brain/Lines'
import { Section } from './brain/Section'
import { NeuronWorld } from './neuron/NeuronWorld'
import { SynapseWorld } from './synapse/SynapseWorld'
import { REST, setAspect } from './director'
import { BEATS } from './content'
import { TOKENS, blendPose, brainPose, copyPose, makePose, rig } from './rig'
import { COARSE, ui, useUI } from './state'
import { anchors } from './anchors'
import { focus } from './focus'
import { labelEls, threadEls } from './labels'

/** Brain-world camera: the rig's pose, or the resting pose for the current aspect. */
function BrainCamera() {
  const { camera, size } = useThree()
  useFrame(() => {
    if (rig.world !== 'brain' || ui.get().explore) return
    const cam = camera as PerspectiveCamera
    if (rig.poseName) brainPose(rig.poseName, size.width / size.height, rig.pose)
    cam.position.copy(rig.pose.pos)
    cam.up.copy(rig.pose.up)
    cam.lookAt(rig.pose.target)
    if (cam.fov !== rig.pose.fov) { cam.fov = rig.pose.fov; cam.updateProjectionMatrix() }
  })
  return null
}

/** Ground colour follows the rig; the UI switches to ink on the light plate of scene 5. */
function Exposure() {
  const { scene, size } = useThree()
  useEffect(() => { setAspect(size.width / size.height) }, [size])
  const plate = useRef(false)
  useFrame(() => {
    if (scene.background && 'copy' in scene.background) (scene.background as typeof rig.bg).copy(rig.bg)
    const p = rig.plate > 0.55
    if (p !== plate.current) {
      plate.current = p
      document.documentElement.classList.toggle('on-plate', p)
    }
  })
  return null
}

function BrainLights() {
  const g = useRef<Group>(null)
  useFrame(() => { if (g.current) g.current.visible = rig.world === 'brain' })
  return (
    <group ref={g}>
      {/* Warm-neutral raking key from upper front left, low cool fill, desaturated violet rims. */}
      <directionalLight position={[-2.2, 2.2, 3.2]} intensity={2.5} color="#FFEBDD" />
      <directionalLight position={[2.8, -0.6, 1.6]} intensity={0.35} color="#A9B8C9" />
      <directionalLight position={[2.6, 1.4, -3.2]} intensity={2.2} color={TOKENS.rim} />
      <directionalLight position={[-2.6, 0.8, -3.0]} intensity={0.9} color={TOKENS.rim} />
    </group>
  )
}

/** Explore Mode: orbit and zoom within limits; leaving returns to the exact teaching frame. */
function Explore() {
  const explore = useUI((s) => s.explore)
  const { camera, size } = useThree()
  const controls = useRef<OrbitControlsImpl | null>(null)
  const beat = useUI((s) => s.beat)
  const id = BEATS[beat].beat.id
  const neuron = id === 'signal'
  const start = useMemo(() => makePose(), [])

  useEffect(() => {
    if (!explore) return
    const cam = camera as PerspectiveCamera
    start.pos.copy(cam.position)
    start.up.copy(cam.up)
    start.fov = cam.fov
    // Orbit about the teaching frame's target, upright.
    const target = rig.world === 'brain' ? rig.pose.target.clone() : new Vector3()
    if (rig.world === 'neuron') {
      const dir = new Vector3(0, 0, -1).applyQuaternion(cam.quaternion)
      target.copy(cam.position).addScaledVector(dir, cam.position.length() * 0.9)
    }
    start.target.copy(target)
    cam.up.set(0, 1, 0)
    const c = controls.current
    if (c) { c.target.copy(target); c.update() }
    const onReset = () => {
      if (!c) return
      cam.position.copy(start.pos)
      c.target.copy(start.target)
      c.update()
    }
    window.addEventListener('neuroverse:reset', onReset)
    return () => {
      window.removeEventListener('neuroverse:reset', onReset)
      // Leaving: tween from where the viewer left the camera back to the resting frame.
      if (rig.world !== 'brain') return
      const from = makePose()
      from.pos.copy(cam.position)
      from.target.copy(c?.target ?? start.target)
      from.up.set(0, 1, 0)
      from.fov = cam.fov
      const restName = REST[BEATS[ui.get().beat].beat.id]?.pose
      if (!restName) return
      const to = brainPose(restName, size.width / size.height)
      const k = { v: 0 }
      rig.poseName = null
      copyPose(from, rig.pose)
      gsap.to(k, {
        v: 1,
        duration: ui.get().reduced ? 0 : 1.2,
        ease: 'power2.inOut',
        onUpdate: () => blendPose(from, to, k.v, rig.pose),
        onComplete: () => { rig.poseName = restName },
      })
    }
  }, [explore, camera, size, start])

  if (!explore) return null
  const dist = start.pos.distanceTo(start.target) || 5
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableDamping={!ui.get().reduced}
      minDistance={dist * (neuron ? 0.8 : 0.6)}
      maxDistance={dist * (neuron ? 1.4 : 1.6)}
      minPolarAngle={neuron ? Math.PI / 2 - 0.44 : 0.25}
      maxPolarAngle={neuron ? Math.PI / 2 + 0.44 : Math.PI - 0.25}
      rotateSpeed={0.7}
    />
  )
}

/** Projects the current beat's anchors to the screen and writes positions to the DOM labels. */
type Placed = { el: HTMLElement; x: number; y: number; flip: boolean; h: number; x0: number; x1: number }
/** Text block heights, read once per beat and element (layout reads every frame would thrash). */
const boxes = new WeakMap<HTMLElement, { id: string; h: number; w: number }>()
function textBox(el: HTMLElement, id: string) {
  const c = boxes.get(el)
  if (c && c.id === id && c.h > 0) return c
  const span = el.querySelector('span') as HTMLElement | null
  const b = { id, h: span?.offsetHeight ?? 0, w: span?.offsetWidth ?? 0 }
  boxes.set(el, b)
  return b.h ? b : { id, h: 40, w: 180 }
}

function LabelProjector() {
  const { camera, size } = useThree()
  const v = useMemo(() => new Vector3(), [])
  useFrame(() => {
    const id = BEATS[ui.get().beat].beat.id
    const narrow = size.width < 760
    const placed: Placed[] = []
    for (const [key, el] of Object.entries(labelEls)) {
      if (!el) continue
      const a = anchors[`${id}:${key}`]
      if (!a) { el.style.visibility = 'hidden'; continue }
      v.copy(a).project(camera)
      const x = (v.x * 0.5 + 0.5) * size.width
      const y = (-v.y * 0.5 + 0.5) * size.height
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
      const flip = x > size.width * (narrow ? 0.4 : 0.7)
      el.dataset.flip = flip ? '1' : '0'
      el.style.visibility = v.z > 1 ? 'hidden' : ''
      const box = textBox(el, id)
      const x0 = flip ? x - 42 - box.w : x + 42
      placed.push({ el, x, y, flip, h: box.h, x0, x1: x0 + box.w })
    }
    // Text blocks whose boxes would overlap are pushed apart top to bottom; each
    // leader then bends from its dot to the moved text. The dots themselves never move.
    placed.sort((p, q) => p.y - q.y)
    const done: (Placed & { ty: number })[] = []
    for (const p of placed) {
      let ty = p.y
      for (const q of done) {
        if (q.x1 < p.x0 - 8 || p.x1 < q.x0 - 8) continue
        ty = Math.max(ty, q.ty + q.h + 6)
      }
      done.push({ ...p, ty })
      const dy = ty - p.y
      const ex = p.flip ? -36 : 36
      p.el.style.setProperty('--dy', `${dy.toFixed(1)}px`)
      p.el.style.setProperty('--ang', `${Math.atan2(dy, ex).toFixed(4)}rad`)
      p.el.style.setProperty('--len', `${(Math.hypot(ex, dy) - 8).toFixed(1)}px`)
    }
    // Scene 5 threads: from each margin annotation to its anchor.
    for (const [key, t] of Object.entries(threadEls)) {
      if (!t.line || !t.label) continue
      const a = anchors[`${id}:${key}`]
      if (!a) continue
      v.copy(a).project(camera)
      const x = (v.x * 0.5 + 0.5) * size.width
      const y = (-v.y * 0.5 + 0.5) * size.height
      const r = t.label.getBoundingClientRect()
      const x1 = r.right + 12
      const y1 = r.top + r.height * 0.32
      t.line.setAttribute('x1', String(x1))
      t.line.setAttribute('y1', String(y1))
      t.line.setAttribute('x2', String(x))
      t.line.setAttribute('y2', String(y))
      const len = Math.hypot(x - x1, y - y1)
      t.line.style.strokeDasharray = `${len}`
      t.line.style.strokeDashoffset = `${len * (1 - rig.threads)}`
      t.dot?.setAttribute('cx', String(x))
      t.dot?.setAttribute('cy', String(y))
      if (t.dot) t.dot.style.opacity = String(rig.threads)
    }
  })
  return null
}

/** Desktop tier only: ambient occlusion, depth of field on moving neuron shots, subtle bloom, AgX. */
function Effects() {
  const dof = useRef<DepthOfFieldEffect>(null)
  const vig = useRef<VignetteEffect>(null)
  // n8ao ships no types; only its configuration object is touched here.
  const ao = useRef<{ configuration: { intensity: number } }>(null)
  useFrame(() => {
    if (dof.current) {
      const on = rig.world === 'neuron'
      dof.current.target = focus.point
      dof.current.bokehScale = on ? focus.bokeh : 0
      dof.current.cocMaterial.worldFocusRange = focus.range
    }
    if (vig.current) vig.current.darkness = 0.32 * (1 - rig.plate)
    if (ao.current) ao.current.configuration.intensity = rig.plate > 0.5 ? 0 : rig.world === 'brain' ? 1.6 : 2.4
  })
  return (
    <EffectComposer multisampling={4}>
      <N8AO ref={ao as never} halfRes screenSpaceRadius aoRadius={22} distanceFalloff={0.8} intensity={2.4} quality="medium" color="#07080A" />
      <DepthOfField ref={dof} worldFocusRange={0.28} bokehScale={0} resolutionScale={0.75} />
      <Bloom mipmapBlur luminanceThreshold={0.9} luminanceSmoothing={0.12} intensity={0.5} radius={0.55} />
      <ToneMapping mode={ToneMappingMode.AGX} />
      <Vignette ref={vig} offset={0.42} darkness={0.32} />
    </EffectComposer>
  )
}

export function Stage() {
  return (
    <Canvas
      className="canvas"
      aria-hidden="true"
      dpr={[1, COARSE ? 1.5 : 2]}
      camera={{ fov: 26, near: 0.005, far: 200, position: [0, 0, 6] }}
      gl={{ antialias: COARSE, localClippingEnabled: true, toneMapping: COARSE ? AgXToneMapping : NoToneMapping, toneMappingExposure: 1.0 }}
      onCreated={({ gl }) => { if (!gl.capabilities.isWebGL2) ui.set({ webgl: false }) }}
    >
      <color attach="background" args={['#07080A']} />
      <Exposure />
      <BrainLights />
      {/* In-house environment for soft reflections on the wet tissue (no external HDRI). */}
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#FFF1E6" position={[-3, 3, 4]} scale={[4, 2, 1]} />
        <Lightformer form="rect" intensity={1.1} color={TOKENS.rim} position={[3, 1, -4]} scale={[3, 3, 1]} />
        <Lightformer form="ring" intensity={0.4} color="#B9C4D2" position={[0, -3, 2]} scale={2} />
      </Environment>
      <Suspense fallback={null}>
        <BrainGroup />
      </Suspense>
      <NeuronWorld />
      <SynapseWorld />
      <BrainCamera />
      <Explore />
      <LabelProjector />
      {!COARSE && <Effects />}
    </Canvas>
  )
}

function BrainGroup() {
  const g = useRef<Group>(null)
  useFrame(() => { if (g.current) g.current.visible = rig.world === 'brain' })
  return (
    <group ref={g}>
      <Brain />
      <Section />
      <Contours />
      <Landmarks />
    </group>
  )
}
