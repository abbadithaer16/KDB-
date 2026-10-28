import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, DepthOfField, EffectComposer, N8AO, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import type { DepthOfFieldEffect } from 'postprocessing'
import gsap from 'gsap'
import {
  AdditiveBlending,
  CanvasTexture,
  Float32BufferAttribute,
  MathUtils,
  PerspectiveCamera,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  Vector3,
} from 'three'
import type { NeuronData } from './data'
import { PathLookup, UM, loadNeuron, nodeArcs } from './data'
import { myelinGeometry, neuronGeometry } from './geometry'
import { signalUniforms, tubeMaterial } from './materials'
import { T, cameraAt, dimAt, focusAt, frontArc, poses, timeForArc, traceAt } from './choreography'
import type { Pose } from './choreography'
import { COARSE, DEBUG, reducedMotion, ui } from './state'
import { anchors, labelEls, scaleBar } from './labels'

/** Timeline time for the whole scene; GSAP writes it, useFrame reads it (one owner). */
const cine = { t: 0, staticCam: false }
let tl: gsap.core.Tween | null = null

const dipEl = () => document.querySelector<HTMLElement>('.dip')

/** A short dip to the ground colour hides discontinuous jumps (interrupt, replay, back). */
function dip(action: () => void) {
  const el = dipEl()
  if (!el) return action()
  gsap.killTweensOf(el)
  gsap.timeline()
    .to(el, { opacity: 1, duration: 0.15, ease: 'power1.in' })
    .add(action)
    .to(el, { opacity: 0, duration: reducedMotion ? 0.15 : 0.3, ease: 'power1.out' })
}

function play(from: number, staticCam: boolean) {
  tl?.kill()
  cine.t = from
  cine.staticCam = staticCam
  ui.set({ beat: 'signal', playingStatic: staticCam })
  tl = gsap.to(cine, {
    t: T.end,
    duration: T.end - from,
    ease: 'none',
    onUpdate: () => {
      if (cine.t >= T.arrive && ui.get().beat === 'signal') ui.set({ beat: 'arrived' })
    },
  })
}

export const actions = {
  next() {
    const { beat } = ui.get()
    if (beat === 'neuron') {
      if (reducedMotion) dip(() => { tl?.kill(); cine.t = T.end; cine.staticCam = true; ui.set({ beat: 'arrived' }) })
      else play(0, false)
    } else if (beat === 'signal') {
      // Interrupt: complete to the resting frame; the input is consumed, nothing queues.
      dip(() => { tl?.kill(); cine.t = T.end; ui.set({ beat: 'arrived' }) })
    }
  },
  previous() {
    if (ui.get().beat === 'neuron') return
    dip(() => { tl?.kill(); cine.t = 0; cine.staticCam = false; ui.set({ beat: 'neuron', playingStatic: false }) })
  },
  replay() {
    if (reducedMotion) {
      play(T.fire, true) // the signal only, camera still
      return
    }
    dip(() => play(T.toTrigger, false))
  },
}

function haloTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, 'rgba(206,196,255,0.9)')
  grad.addColorStop(0.25, 'rgba(156,134,240,0.35)')
  grad.addColorStop(1, 'rgba(156,134,240,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  return new CanvasTexture(c)
}

/** The cell body as stored in the file (a sphere), carrying the tube shader's attributes. */
function somaGeometry(radius: number) {
  const g = new SphereGeometry(radius, 40, 28)
  const n = g.getAttribute('position').count
  g.setAttribute('aRadius', new Float32BufferAttribute(new Float32Array(n), 1))
  g.setAttribute('aArc', new Float32BufferAttribute(new Float32Array(n).fill(-1), 1))
  g.setAttribute('aKind', new Float32BufferAttribute(new Float32Array(n), 1))
  return g
}

export function Neuron() {
  const [data, setData] = useState<NeuronData | null>(null)
  useEffect(() => {
    loadNeuron().then(setData).catch((e: Error) => ui.set({ error: e.message }))
  }, [])
  return data ? <NeuronScene data={data} /> : null
}

function NeuronScene({ data }: { data: NeuronData }) {
  const { camera, size, gl } = useThree()
  const segments = COARSE ? 6 : 10
  const path = useMemo(() => new PathLookup(data.path), [data])
  const nodes = useMemo(() => nodeArcs(data), [data])
  const geo = useMemo(() => neuronGeometry(data, segments), [data, segments])
  const myelin = useMemo(() => myelinGeometry(path, nodes, 0.85, segments), [path, nodes, segments])
  const soma = useMemo(() => somaGeometry(data.soma_radius), [data])
  const mats = useMemo(
    () => ({
      // Soft tissue: warm pale grey, broad sheen, no clearcoat (which read as plastic).
      membrane: tubeMaterial({ color: '#C8C0BA', roughness: 0.62, sheen: 0.85, sheenRoughness: 0.55, sheenColor: '#E4DCEB' }, COARSE ? 2.0 : 3.0),
      // Myelin: denser, satin.
      myelin: tubeMaterial({ color: '#E6DED2', roughness: 0.45, sheen: 0.5, sheenRoughness: 0.35, sheenColor: '#FFFFFF' }, 3.8),
    }),
    [],
  )
  const P = useMemo(() => poses(data, path, size.width / size.height), [data, path, size.width, size.height])
  const halo = useMemo(() => {
    const s = new Sprite(new SpriteMaterial({ map: haloTexture(), blending: AdditiveBlending, depthWrite: false, transparent: true }))
    s.visible = false
    return s
  }, [])
  const dof = useRef<DepthOfFieldEffect>(null)
  const focus = useMemo(() => new Vector3(), [])

  // Label anchors (world space), chosen from recorded points.
  useEffect(() => {
    const apical = data.sections.filter((s) => s.type === 4).flatMap((s) => s.pts)
    const maxY = Math.max(...apical.map((p) => p[1]))
    const target = new Vector3(0, 0.62 * maxY, 0)
    const best = apical.reduce((a, p) => (new Vector3(p[0], p[1], p[2]).distanceTo(target) < new Vector3(a[0], a[1], a[2]).distanceTo(target) ? p : a))
    anchors.dendrites = new Vector3(best[0], best[1], best[2]).multiplyScalar(UM)
    anchors.soma = new Vector3(0, 0, 0)
    anchors.axon = path.at(260)
    anchors.trigger = path.at(14)
    const mid = nodes[Math.floor(nodes.length * 0.42)]
    anchors.myelin = path.at(mid + 40)
    anchors.node = path.at(nodes[Math.floor(nodes.length * 0.62)])
    anchors.end = path.at(path.length)
    anchors.n1 = anchors.trigger
    anchors.n2 = anchors.node
    anchors.n3 = anchors.end
    ui.set({ ready: true })
    if (DEBUG) {
      Object.assign(window, {
        __nv: {
          seek: (t: number) => { tl?.kill(); cine.t = t; cine.staticCam = false; ui.set({ beat: t >= T.arrive ? 'arrived' : t > 0 ? 'signal' : 'neuron' }) },
          /** Time when the front reaches the k-th recorded branch point on the path. */
          branchTime: (k: number) => timeForArc(data.path_branch_arcs[k], nodes, path.length),
          branchArcs: () => data.path_branch_arcs,
          stats: () => ({ calls: gl.info.render.calls, triangles: gl.info.render.triangles, geometries: gl.info.memory.geometries, pathLength: path.length, nodes: nodes.length, tier: COARSE ? 'mobile' : 'desktop' }),
        },
      })
    }
  }, [data, path, nodes, gl])

  const pose = useMemo<Pose>(() => ({ pos: new Vector3(), target: new Vector3(), fov: 24, up: new Vector3(0, 1, 0) }), [])
  const front = useMemo(() => new Vector3(), [])
  useFrame(() => {
    const cam = camera as PerspectiveCamera
    const t = cine.t
    if (cine.staticCam) {
      pose.pos.copy(P.whole.pos); pose.target.copy(P.whole.target); pose.fov = P.whole.fov; pose.up.set(0, 1, 0)
    } else cameraAt(t, P, pose)
    cam.position.copy(pose.pos)
    cam.up.copy(pose.up)
    cam.lookAt(pose.target)
    if (cam.fov !== pose.fov) { cam.fov = pose.fov; cam.updateProjectionMatrix() }
    signalUniforms.uPxScale.value = (2 * Math.tan((cam.fov * Math.PI) / 360)) / size.height

    // Depth-graded exposure around the subject distance.
    const dist = cam.position.distanceTo(pose.target)
    const k = Math.max(0.08 * dist, 0.3)
    signalUniforms.uDepthNear.value = dist - k
    signalUniforms.uDepthFar.value = dist + 1.5 * k
    signalUniforms.uRefDist.value = dist

    const s = t - T.fire
    const active = s >= 0 && t < T.arrive + 0.3
    const arrived = t >= T.arrive
    const arc = active ? frontArc(s, nodes, path.length) : arrived ? path.length : -1
    const settle = arrived ? MathUtils.smoothstep(t, T.arrive, T.arrive + 2) : 0
    signalUniforms.uFront.value = arc
    // At rest the renewed path stays as a fading record of the signal's progress (illustrative).
    signalUniforms.uGlow.value = MathUtils.lerp(1, 0.95, settle)
    signalUniforms.uTail.value = MathUtils.lerp(160, 1400, settle)
    signalUniforms.uPathW.value = MathUtils.lerp(1.6, 2.6, settle)
    signalUniforms.uTrace.value = traceAt(t) * 0.4
    signalUniforms.uDim.value = dimAt(t)
    if (active) path.at(arc, front)
    else front.copy(P.trigger)
    signalUniforms.uFrontPos.value.copy(front)
    signalUniforms.uSigLight.value = active && t < T.arrive ? 1.5 : 0
    signalUniforms.uSigRadius.value = 0.22

    // The phone tier has no bloom: a small halo marks the front instead.
    if (COARSE && active && t < T.arrive) {
      halo.position.copy(front)
      halo.scale.setScalar(cam.position.distanceTo(front) * signalUniforms.uPxScale.value * 34)
      halo.visible = true
    } else halo.visible = false

    if (dof.current) {
      const bokeh = reducedMotion ? 0 : focusAt(t, P, front, focus)
      dof.current.target = focus
      dof.current.bokehScale = bokeh
      dof.current.cocMaterial.worldFocusRange = t <= T.fire ? 0.28 : 0.2
    }
  })

  return (
    <>
      <group scale={UM}>
        <mesh geometry={geo} material={mats.membrane} frustumCulled={false} />
        <mesh geometry={myelin} material={mats.myelin} frustumCulled={false} />
        <mesh geometry={soma} material={mats.membrane} />
      </group>
      <primitive object={halo} />
      <LabelProjector />
      {!COARSE && (
        <EffectComposer multisampling={4}>
          <N8AO halfRes screenSpaceRadius aoRadius={22} distanceFalloff={0.8} intensity={2.4} quality="medium" color="#07080A" />
          <DepthOfField ref={dof} worldFocusRange={0.28} bokehScale={0} resolutionScale={0.75} />
          <Bloom mipmapBlur luminanceThreshold={0.9} luminanceSmoothing={0.12} intensity={0.5} radius={0.55} />
          <ToneMapping mode={ToneMappingMode.AGX} />
          <Vignette offset={0.3} darkness={0.5} />
        </EffectComposer>
      )}
    </>
  )
}

const v = new Vector3()
function LabelProjector() {
  const { camera, size } = useThree()
  useFrame(() => {
    for (const [key, el] of Object.entries(labelEls)) {
      const a = anchors[key]
      if (!el || !a) continue
      v.copy(a).project(camera)
      const behind = v.z > 1
      const x = (v.x * 0.5 + 0.5) * size.width
      const y = (-v.y * 0.5 + 0.5) * size.height
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
      el.dataset.flip = x > size.width * (size.width < 760 ? 0.4 : 0.72) ? '1' : '0'
      const hideTrigger = key === 'trigger' && ui.get().beat === 'signal' && cine.t > T.fire + 0.6
      el.style.visibility = behind || hideTrigger ? 'hidden' : ''
    }
    // Scale bar: 100 um at the subject's distance, shown on the resting frames only.
    if (scaleBar.el) {
      const cam = camera as PerspectiveCamera
      const d = cam.position.distanceTo(anchors.soma ?? v.set(0, 0, 0))
      const px = (1 / (2 * d * Math.tan((cam.fov * Math.PI) / 360))) * size.height
      scaleBar.el.style.setProperty('--bar', `${px.toFixed(1)}px`)
    }
  })
  return null
}
