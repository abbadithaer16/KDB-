import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import {
  AdditiveBlending,
  CanvasTexture,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PointLight,
  Sprite,
  SpriteMaterial,
  Vector3,
} from 'three'
import type { NeuronData } from './data'
import { PathLookup, UM, loadNeuron, nodeArcs } from './data'
import { myelinGeometry, neuronGeometry } from './geometry'
import { signalUniforms, tubeMaterial } from './materials'
import { T, cameraAt, dimAt, frontArc, poses, traceAt } from './choreography'
import type { Pose } from './choreography'
import { COARSE, DEBUG, reducedMotion, ui } from './state'
import { anchors, labelEls } from './labels'

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

export function Neuron() {
  const [data, setData] = useState<NeuronData | null>(null)
  useEffect(() => {
    loadNeuron().then(setData).catch((e: Error) => ui.set({ error: e.message }))
  }, [])
  return data ? <NeuronScene data={data} /> : null
}

function NeuronScene({ data }: { data: NeuronData }) {
  const { camera, size, gl } = useThree()
  const segments = COARSE ? 6 : 8
  const path = useMemo(() => new PathLookup(data.path), [data])
  const nodes = useMemo(() => nodeArcs(data), [data])
  const geo = useMemo(() => neuronGeometry(data, segments), [data, segments])
  const myelin = useMemo(() => myelinGeometry(path, nodes, 0.85, segments), [path, nodes, segments])
  const mats = useMemo(
    () => ({
      membrane: tubeMaterial({ color: '#CFC8DA', roughness: 0.5, sheen: 0.6, sheenRoughness: 0.5, sheenColor: '#E9E3F5', clearcoat: 0.25, clearcoatRoughness: 0.4 }, 1.5),
      myelin: tubeMaterial({ color: '#ECE6DA', roughness: 0.82 }, 3.8),
    }),
    [],
  )
  const P = useMemo(() => poses(data, path, size.width / size.height), [data, path, size.width, size.height])
  const halo = useMemo(() => {
    const s = new Sprite(new SpriteMaterial({ map: haloTexture(), blending: AdditiveBlending, depthWrite: false, transparent: true }))
    s.visible = false
    return s
  }, [])
  const light = useRef<PointLight>(null)
  const somaMat = useMemo(() => new MeshPhysicalMaterial({ color: '#CFC8DA', roughness: 0.5, sheen: 0.4, sheenColor: '#E9E3F5' }), [])
  const somaBase = useMemo(() => somaMat.color.clone(), [somaMat])

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
          stats: () => ({ calls: gl.info.render.calls, triangles: gl.info.render.triangles, geometries: gl.info.memory.geometries, pathLength: path.length, nodes: nodes.length }),
        },
      })
    }
  }, [data, path, nodes, gl])

  const pose = useMemo<Pose>(() => ({ pos: new Vector3(), target: new Vector3(), fov: 35, up: new Vector3(0, 1, 0) }), [])
  const front = new Vector3()
  useFrame(() => {
    const cam = camera as PerspectiveCamera
    if (cine.staticCam) {
      pose.pos.copy(P.whole.pos); pose.target.copy(P.whole.target); pose.fov = P.whole.fov; pose.up.set(0, 1, 0)
    } else cameraAt(cine.t, P, pose)
    cam.position.copy(pose.pos)
    cam.up.copy(pose.up)
    cam.lookAt(pose.target)
    if (cam.fov !== pose.fov) { cam.fov = pose.fov; cam.updateProjectionMatrix() }
    signalUniforms.uPxScale.value = (2 * Math.tan((cam.fov * Math.PI) / 360)) / size.height

    const s = cine.t - T.fire
    const active = s >= 0 && s <= T.arrive - T.fire + 0.4
    const arc = active ? frontArc(s, nodes, path.length) : -1
    signalUniforms.uFront.value = arc
    signalUniforms.uTrace.value = traceAt(cine.t)
    const dim = dimAt(cine.t)
    signalUniforms.uDim.value = dim
    somaMat.color.copy(somaBase).multiplyScalar(1 - 0.72 * dim)
    if (active) {
      path.at(arc, front)
      const d = cam.position.distanceTo(front)
      halo.position.copy(front)
      halo.scale.setScalar(d * signalUniforms.uPxScale.value * (COARSE ? 34 : 46))
      halo.visible = true
      if (light.current) { light.current.position.copy(front); light.current.intensity = 0.06; light.current.distance = 0.5 }
    } else {
      halo.visible = false
      if (light.current) light.current.intensity = 0
    }
  })

  return (
    <>
      <group scale={UM}>
        <mesh geometry={geo} material={mats.membrane} frustumCulled={false} />
        <mesh geometry={myelin} material={mats.myelin} frustumCulled={false} />
        <mesh material={somaMat}>
          <sphereGeometry args={[data.soma_radius, 32, 24]} />
        </mesh>
      </group>
      <primitive object={halo} />
      <pointLight ref={light} color="#9C86F0" intensity={0} decay={2} />
      <LabelProjector />
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
  })
  return null
}
