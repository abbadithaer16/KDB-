import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  Color,
  CylinderGeometry,
  InstancedMesh,
  LatheGeometry,
  MathUtils,
  Matrix4,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
  Vector2,
  Vector3,
} from 'three'
import type { Group, Mesh, PerspectiveCamera } from 'three'
import { SYN, phase } from './timing'
import { TOKENS, rig } from '../rig'
import { ui } from '../state'
import { anchors } from '../anchors'
import { focus } from '../focus'

/**
 * A typical chemical synapse, built in-house and labelled "Simplified" and "Not to scale".
 * Units are arbitrary. Terminal above, cleft at the optical centre, the next cell below.
 */
const PRE_Y = 0.14 // presynaptic membrane (bottom of the terminal)
const POST_Y = -0.14 // postsynaptic membrane (top of the next cell)
const FUSE = [new Vector3(-0.22, PRE_Y, 0.05), new Vector3(0.04, PRE_Y, -0.08), new Vector3(0.26, PRE_Y, 0.1)]
const N_TX = 240
const N_VES = 42
const N_REC = 26
const N_CH = 12

/** Small deterministic PRNG so every render of the event is identical. */
function rng(seed: number) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

export function SynapseWorld() {
  const { camera, size } = useThree()
  const group = useRef<Group>(null)
  const post = useRef<Mesh>(null)

  const geo = useMemo(() => {
    // Terminal: a lathe profile, rounded bulb with a broad flat face towards the cleft.
    const prof: Vector2[] = []
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * Math.PI * 0.5
      prof.push(new Vector2(0.62 * Math.sin(a) + 0.001, PRE_Y + 0.02 + 0.5 * (1 - Math.cos(a)) * 0.9))
    }
    prof.unshift(new Vector2(0.001, PRE_Y))
    prof.splice(1, 0, new Vector2(0.55, PRE_Y))
    prof.push(new Vector2(0.3, 1.2), new Vector2(0.24, 1.8))
    const terminal = new LatheGeometry(prof.map((p, i) => (i === 1 ? new Vector2(0.58, PRE_Y + 0.005) : p)), 64)
    return {
      terminal,
      postCell: new CylinderGeometry(1.25, 1.35, 0.6, 72, 1, false),
      vesicle: new SphereGeometry(0.055, 20, 14),
      tx: new SphereGeometry(0.011, 8, 6),
      receptor: new CylinderGeometry(0.022, 0.026, 0.05, 10),
      channel: new CylinderGeometry(0.014, 0.014, 0.05, 8),
    }
  }, [])

  const mats = useMemo(
    () => ({
      membrane: new MeshPhysicalMaterial({ color: '#C8C0BA', roughness: 0.6, sheen: 0.8, sheenRoughness: 0.5, sheenColor: '#E4DCEB' }),
      post: new MeshPhysicalMaterial({ color: '#BFB8B2', roughness: 0.65, sheen: 0.7, sheenRoughness: 0.5, sheenColor: '#E4DCEB', emissive: new Color(TOKENS.violet), emissiveIntensity: 0 }),
      vesicle: new MeshPhysicalMaterial({ color: '#E9E1D6', roughness: 0.35, sheen: 0.4, clearcoat: 0.3, clearcoatRoughness: 0.4 }),
      tx: new MeshStandardMaterial({ color: TOKENS.amber, emissive: new Color(TOKENS.amber), emissiveIntensity: 0.9, roughness: 0.4 }),
      receptor: new MeshStandardMaterial({ color: '#9D93B5', roughness: 0.5, emissive: new Color(TOKENS.violet), emissiveIntensity: 0 }),
      channel: new MeshStandardMaterial({ color: '#8F86B3', roughness: 0.5, emissive: new Color(TOKENS.violet), emissiveIntensity: 0 }),
    }),
    [],
  )

  // Fixed layout (seeded): resting vesicles in the terminal, receptors under the active zone,
  // calcium channels on the presynaptic membrane, and each molecule's path and receptor.
  const layout = useMemo(() => {
    const r = rng(7)
    const ves: Vector3[] = []
    while (ves.length < N_VES) {
      const p = new Vector3((r() - 0.5) * 0.9, PRE_Y + 0.12 + r() * 0.45, (r() - 0.5) * 0.9)
      if (Math.hypot(p.x, p.z) > 0.48) continue
      if (ves.some((q) => q.distanceTo(p) < 0.12) || FUSE.some((f) => f.distanceTo(p) < 0.14)) continue
      ves.push(p)
    }
    const rec: Vector3[] = []
    while (rec.length < N_REC) {
      const p = new Vector3((r() - 0.5) * 0.8, POST_Y + 0.025, (r() - 0.5) * 0.8)
      if (Math.hypot(p.x, p.z) > 0.42 || rec.some((q) => q.distanceTo(p) < 0.07)) continue
      rec.push(p)
    }
    const ch: Vector3[] = []
    for (let i = 0; i < N_CH; i++) {
      const a = (i / N_CH) * Math.PI * 2 + r() * 0.3
      ch.push(new Vector3(Math.cos(a) * (0.32 + r() * 0.12), PRE_Y - 0.02, Math.sin(a) * (0.32 + r() * 0.12)))
    }
    const tx = Array.from({ length: N_TX }, (_, i) => {
      const src = FUSE[i % 3]
      const bound = i % 3 !== 2 // about two thirds end bound to a receptor; the rest drift in the cleft
      const target = bound ? rec[Math.floor(r() * N_REC)].clone().add(new Vector3((r() - 0.5) * 0.02, 0.03, (r() - 0.5) * 0.02)) : new Vector3(src.x + (r() - 0.5) * 0.7, POST_Y + 0.04 + r() * 0.2, src.z + (r() - 0.5) * 0.7)
      const delay = r() * 0.5
      const wobble = new Vector3(r() - 0.5, 0, r() - 0.5).multiplyScalar(0.25)
      return { src, target, delay, wobble }
    })
    return { ves, rec, ch, tx }
  }, [])

  const inst = useMemo(() => {
    const ves = new InstancedMesh(geo.vesicle, mats.vesicle, N_VES + 3)
    const tx = new InstancedMesh(geo.tx, mats.tx, N_TX)
    const rec = new InstancedMesh(geo.receptor, mats.receptor, N_REC)
    const ch = new InstancedMesh(geo.channel, mats.channel, N_CH)
    const o = new Object3D()
    layout.ves.forEach((p, i) => { o.position.copy(p); o.scale.setScalar(0.85 + ((i * 37) % 10) / 40); o.updateMatrix(); ves.setMatrixAt(i, o.matrix) })
    layout.rec.forEach((p, i) => { o.position.copy(p); o.scale.setScalar(1); o.updateMatrix(); rec.setMatrixAt(i, o.matrix) })
    layout.ch.forEach((p, i) => { o.position.copy(p); o.updateMatrix(); ch.setMatrixAt(i, o.matrix) })
    return { ves, tx, rec, ch }
  }, [geo, mats, layout])

  useEffect(() => {
    anchors['signal-synapse:terminal'] = new Vector3(0.5, 0.55, 0.25)
    anchors['signal-synapse:vesicles'] = layout.ves.reduce((a, b) => (b.x + b.z > a.x + a.z ? b : a)).clone()
    anchors['signal-synapse:transmitter'] = new Vector3(-0.3, POST_Y + 0.1, 0.25)
    anchors['signal-synapse:cleft'] = new Vector3(0.62, 0, 0.1)
    anchors['signal-synapse:receptors'] = layout.rec.reduce((a, b) => (b.x > a.x ? b : a)).clone()
    return () => {
      Object.values(geo).forEach((g) => g.dispose())
      Object.values(mats).forEach((m) => m.dispose())
    }
  }, [geo, mats, layout])

  const o = useMemo(() => new Object3D(), [])
  const hidden = useMemo(() => new Matrix4().makeScale(0, 0, 0), [])
  const pos = useMemo(() => new Vector3(), [])
  const tgt = useMemo(() => new Vector3(), [])
  useFrame(() => {
    const on = rig.world === 'synapse'
    if (group.current) group.current.visible = on
    if (!on) return
    const t = rig.synT
    const cam = camera as PerspectiveCamera
    // Camera: side-on, a little above the cleft, with a slow 6% push-in through the event.
    const aspect = size.width / size.height
    const portrait = aspect < 0.9
    const push = 1 - 0.06 * MathUtils.smootherstep(t, 0, 5)
    const dist = (portrait ? 5.6 : 3.1) * push
    if (!ui.get().explore) {
      cam.position.set(Math.sin(0.5) * dist, 0.28 * dist * 0.35 + 0.05, Math.cos(0.5) * dist)
      cam.up.set(0, 1, 0)
      cam.lookAt(portrait ? 0 : -0.45, portrait ? 0.1 : 0.02, 0)
      if (cam.fov !== 30) { cam.fov = 30; cam.updateProjectionMatrix() }
    }
    focus.bokeh = 0

    // Calcium channels open as the electrical signal arrives.
    const ch = phase(t, SYN.channels)
    mats.channel.emissiveIntensity = 2.2 * Math.sin(Math.PI * Math.min(1, ch)) + (t >= SYN.channels[1] ? 0.25 : 0)
    // Three vesicles dock and fuse with the membrane.
    const fu = phase(t, SYN.fusion)
    FUSE.forEach((f, i) => {
      const start = new Vector3(f.x * 0.9, PRE_Y + 0.2, f.z * 0.9)
      pos.lerpVectors(start, new Vector3(f.x, PRE_Y + 0.04, f.z), MathUtils.smoothstep(fu, 0, 0.6))
      o.position.copy(pos)
      o.scale.setScalar(1 - MathUtils.smoothstep(fu, 0.6, 1)) // merges into the membrane
      o.updateMatrix()
      inst.ves.setMatrixAt(N_VES + i, fu >= 1 ? hidden : o.matrix)
    })
    inst.ves.instanceMatrix.needsUpdate = true
    // Neurotransmitter crosses the cleft and binds receptors (amber only here).
    const di = phase(t, SYN.diffusion)
    layout.tx.forEach((m, i) => {
      const k = MathUtils.clamp((di - m.delay * 0.5) / 0.6, 0, 1)
      if (k <= 0) { inst.tx.setMatrixAt(i, hidden); return }
      tgt.copy(m.target)
      pos.lerpVectors(m.src, tgt, MathUtils.smoothstep(k, 0, 1)).addScaledVector(m.wobble, Math.sin(Math.PI * k) * 0.6)
      o.position.copy(pos)
      o.scale.setScalar(1)
      o.updateMatrix()
      inst.tx.setMatrixAt(i, o.matrix)
    })
    inst.tx.instanceMatrix.needsUpdate = true
    // Binding, then a local response in the next cell's membrane (violet: electrical again).
    const bi = phase(t, SYN.binding)
    mats.receptor.emissiveIntensity = 1.4 * bi
    const re = phase(t, SYN.response)
    mats.post.emissiveIntensity = 0.55 * Math.sin(Math.PI * re) + 0.08 * (t >= SYN.response[1] ? 1 : 0)
  })

  return (
    <group ref={group} visible={false}>
      <mesh geometry={geo.terminal} material={mats.membrane} />
      <mesh ref={post} geometry={geo.postCell} material={mats.post} position={[0, POST_Y - 0.3, 0]} />
      <primitive object={inst.ves} />
      <primitive object={inst.tx} />
      <primitive object={inst.rec} />
      <primitive object={inst.ch} />
      <directionalLight position={[-3, 5, 4]} intensity={2.0} color="#FFF1E6" />
      <directionalLight position={[3, -2, 2]} intensity={0.35} color="#A9B8C9" />
      <directionalLight position={[4, 2, -6]} intensity={1.6} color="#8F86B3" />
      <hemisphereLight args={['#B9C0CC', '#07080A', 0.25]} />
    </group>
  )
}
