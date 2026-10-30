import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { AdditiveBlending, CanvasTexture, Float32BufferAttribute, MathUtils, SphereGeometry, Sprite, SpriteMaterial, Vector3 } from 'three'
import type { Group, PerspectiveCamera } from 'three'
import type { NeuronData } from './data'
import { PathLookup, UM, loadNeuron, nodeArcs } from './data'
import { myelinGeometry, neuronGeometry } from './geometry'
import { signalUniforms, tubeMaterial } from './materials'
import { T, cameraAt, dimAt, focusAt, frontArc, poses, traceAt } from './choreography'
import type { Pose } from './choreography'
import { rig } from '../rig'
import { COARSE, ui } from '../state'
import { anchors } from '../anchors'
import { focus } from '../focus'

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

/** Scene 3, beats 3a and 3b: the recorded neuron (NeuroMorpho.Org 290955) and the signal. */
export function NeuronWorld() {
  const [data, setData] = useState<NeuronData | null>(null)
  useEffect(() => {
    loadNeuron().then((d) => { setData(d); ui.set({ neuronReady: true }) }).catch(() => ui.set({ neuronReady: false }))
  }, [])
  return data ? <NeuronScene data={data} /> : null
}

function NeuronScene({ data }: { data: NeuronData }) {
  const { camera, size } = useThree()
  const segments = COARSE ? 6 : 10
  const path = useMemo(() => new PathLookup(data.path), [data])
  const nodes = useMemo(() => nodeArcs(data), [data])
  const geo = useMemo(() => neuronGeometry(data, segments), [data, segments])
  const myelin = useMemo(() => myelinGeometry(path, nodes, 0.85, segments), [path, nodes, segments])
  const soma = useMemo(() => somaGeometry(data.soma_radius), [data])
  const mats = useMemo(
    () => ({
      membrane: tubeMaterial({ color: '#C8C0BA', roughness: 0.62, sheen: 0.85, sheenRoughness: 0.55, sheenColor: '#E4DCEB' }, COARSE ? 2.0 : 3.0),
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

  // Label anchors on recorded points.
  useEffect(() => {
    const apical = data.sections.filter((s) => s.type === 4).flatMap((s) => s.pts)
    const maxY = Math.max(...apical.map((p) => p[1]))
    const target = new Vector3(0, 0.62 * maxY, 0)
    const best = apical.reduce((a, p) => (new Vector3(p[0], p[1], p[2]).distanceTo(target) < new Vector3(a[0], a[1], a[2]).distanceTo(target) ? p : a))
    anchors['signal:dendrites'] = new Vector3(best[0], best[1], best[2]).multiplyScalar(UM)
    anchors['signal:soma'] = new Vector3(0, 0, 0)
    anchors['signal:axon'] = path.at(260)
    anchors['signal-axon:trigger'] = path.at(14)
    anchors['signal-axon:myelin'] = path.at(nodes[Math.floor(nodes.length * 0.42)] + 40)
    anchors['signal-axon:node'] = path.at(nodes[Math.floor(nodes.length * 0.62)])
    anchors['signal-axon:end'] = path.at(path.length)
    return () => { geo.dispose(); myelin.dispose(); soma.dispose(); mats.membrane.dispose(); mats.myelin.dispose() }
  }, [data, path, nodes, geo, myelin, soma, mats])

  const pose = useMemo<Pose>(() => ({ pos: new Vector3(), target: new Vector3(), fov: 24, up: new Vector3(0, 1, 0) }), [])
  const front = useMemo(() => new Vector3(), [])
  const group = useRef<Group>(null)
  useFrame(() => {
    const on = rig.world === 'neuron'
    if (group.current) group.current.visible = on
    if (!on) { halo.visible = false; return }
    const cam = camera as PerspectiveCamera
    const t = rig.neuronT
    if (rig.neuronStatic) {
      pose.pos.copy(P.whole.pos); pose.target.copy(P.whole.target); pose.fov = P.whole.fov; pose.up.set(0, 1, 0)
    } else cameraAt(t, P, pose)
    // The camera is ours unless Explore Mode's controls own it.
    if (!ui.get().explore) {
      cam.position.copy(pose.pos)
      cam.up.copy(pose.up)
      cam.lookAt(pose.target)
      if (cam.fov !== pose.fov) { cam.fov = pose.fov; cam.updateProjectionMatrix() }
    }
    signalUniforms.uPxScale.value = (2 * Math.tan((cam.fov * Math.PI) / 360)) / size.height
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

    if (COARSE && active && t < T.arrive) {
      halo.position.copy(front)
      halo.scale.setScalar(cam.position.distanceTo(front) * signalUniforms.uPxScale.value * 34)
      halo.visible = true
    } else halo.visible = false

    focus.bokeh = ui.get().reduced || rig.neuronStatic ? 0 : focusAt(t, P, front, focus.point)
    focus.range = t <= T.fire ? 0.28 : 0.2
  })

  return (
    <group ref={group} visible={false}>
      <group scale={UM}>
        <mesh geometry={geo} material={mats.membrane} frustumCulled={false} />
        <mesh geometry={myelin} material={mats.myelin} frustumCulled={false} />
        <mesh geometry={soma} material={mats.membrane} />
      </group>
      <primitive object={halo} />
      {/* Specimen lighting: soft key, low cool fill, violet back-rims. */}
      <directionalLight position={[-3, 5, 4]} intensity={2.0} color="#FFF1E6" />
      <directionalLight position={[3, -2, 2]} intensity={0.35} color="#A9B8C9" />
      <directionalLight position={[4, 2, -6]} intensity={1.6} color="#8F86B3" />
      <directionalLight position={[-4, -1, -5]} intensity={0.9} color="#8F86B3" />
      <hemisphereLight args={['#B9C0CC', '#07080A', 0.22]} />
    </group>
  )
}
