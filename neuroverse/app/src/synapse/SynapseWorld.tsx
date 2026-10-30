import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  Color,
  CylinderGeometry,
  DoubleSide,
  InstancedMesh,
  LatheGeometry,
  MathUtils,
  Matrix4,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  Plane,
  SphereGeometry,
  Vector2,
  Vector3,
} from 'three'
import type { Group, Material, PerspectiveCamera } from 'three'
import { SYN, phase } from './timing'
import { TOKENS, rig } from '../rig'
import { ui } from '../state'
import { anchors } from '../anchors'
import { focus } from '../focus'

/**
 * A typical chemical synapse, built in-house and labelled "Simplified" and "Not to scale".
 * Units are arbitrary. The terminal bouton sits above, a dendritic spine head below, and one
 * vertical cut removes the half nearest the camera so the vesicles are seen inside the terminal.
 */
const PRE_Y = 0.1 // presynaptic membrane (bottom of the terminal)
const POST_Y = -0.1 // postsynaptic membrane (top of the spine head)
const YAW = 0.5 // camera azimuth around the vertical axis
const VIEW = new Vector3(Math.sin(YAW), 0, Math.cos(YAW)) // towards the camera
const SIDE = new Vector3(Math.cos(YAW), 0, -Math.sin(YAW)) // screen right
const inPlane = (s: number, y: number, depth = -0.07) => SIDE.clone().multiplyScalar(s).addScaledVector(VIEW, depth).setY(y)
const FUSE = [inPlane(-0.24, PRE_Y), inPlane(0.02, PRE_Y, -0.1), inPlane(0.25, PRE_Y)]
const N_TX = 240
const N_VES = 46
const N_REC = 22
const N_CH = 10
/** Keeps the far half (n·p + c >= 0 with n pointing away from the camera). */
const CUT = new Plane(VIEW.clone().negate(), 0)

/** Small deterministic PRNG so every render of the event is identical. */
function rng(seed: number) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

/** Superellipse quarter: from the axis-side pole to the equator (or the reverse). */
function arc(cy: number, R: number, H: number, n: number, from: number, to: number, steps: number) {
  const pts: Vector2[] = []
  for (let i = 0; i <= steps; i++) {
    const t = from + ((to - from) * i) / steps
    const c = Math.cos(t), s = Math.sin(t)
    pts.push(new Vector2(R * Math.sign(c) * Math.abs(c) ** (2 / n) + 0.0005, cy + H * Math.sign(s) * Math.abs(s) ** (2 / n)))
  }
  return pts
}

/**
 * Membrane material for a cut-open compartment: outside lit normally; the inside (back faces)
 * drawn as a dim cytoplasm tone; a thin pale rim where the cut passes through the membrane.
 */
function membrane(color: string, inside: string) {
  const m = new MeshPhysicalMaterial({ color, roughness: 0.62, sheen: 0.7, sheenRoughness: 0.5, sheenColor: new Color('#E4DCEB'), side: DoubleSide, clippingPlanes: [CUT] })
  m.onBeforeCompile = (s) => {
    s.uniforms.uInside = { value: new Color(inside) }
    s.uniforms.uCut = { value: new Vector3(CUT.normal.x, CUT.normal.y, CUT.normal.z) }
    s.vertexShader = s.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vSynWorld;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvSynWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;')
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vSynWorld;\nuniform vec3 uInside;\nuniform vec3 uCut;')
      .replace(
        '#include <opaque_fragment>',
        `if (!gl_FrontFacing) {
  // Inside the compartment: darker towards the bottom of the view, never pure black.
  outgoingLight = uInside * (0.75 + 0.35 * clamp(vSynWorld.y + 0.6, 0.0, 1.0));
}
float synRim = 1.0 - smoothstep(0.004, 0.012, dot(uCut, vSynWorld));
outgoingLight = mix(outgoingLight, vec3(0.86, 0.83, 0.88), synRim);
#include <opaque_fragment>`,
      )
  }
  m.customProgramCacheKey = () => 'syn-membrane'
  return m
}

export function SynapseWorld() {
  const { camera, size } = useThree()
  const group = useRef<Group>(null)

  const geo = useMemo(() => {
    // Terminal bouton: a flattened face at the active zone, a rounded body, then the axon above.
    const tcy = PRE_Y + 0.34
    const term = [new Vector2(0.0005, PRE_Y), ...arc(tcy, 0.55, 0.34, 3.2, -Math.PI / 2 + 0.02, 0, 22).slice(1)]
    for (const p of arc(tcy, 0.55, 0.4, 2.2, 0, Math.PI / 2, 28).slice(1)) if (p.x > 0.15) term.push(p)
    term.push(new Vector2(0.13, term[term.length - 1].y + 0.08), new Vector2(0.11, 1.9))
    // Spine head below, joined to its dendrite by a narrow neck. Built bottom-up like the terminal.
    const hcy = POST_Y - 0.28
    const head = [new Vector2(0.11, -1.9), new Vector2(0.13, hcy - 0.36)]
    for (const p of arc(hcy, 0.6, 0.34, 2.2, -Math.PI / 2, 0, 28)) if (p.x > 0.15) head.push(p)
    head.push(...arc(hcy, 0.6, 0.28, 3.4, 0, Math.PI / 2 - 0.02, 22).slice(1), new Vector2(0.0005, POST_Y))
    return {
      terminal: new LatheGeometry(term, 96),
      head: new LatheGeometry(head, 96),
      density: new CylinderGeometry(0.4, 0.42, 0.03, 64),
      vesicle: new SphereGeometry(0.048, 20, 14),
      tx: new SphereGeometry(0.0105, 8, 6),
      receptor: new CylinderGeometry(0.02, 0.024, 0.06, 10),
      channel: new CylinderGeometry(0.014, 0.014, 0.05, 8),
    }
  }, [])

  const mats = useMemo(
    () => ({
      terminal: membrane('#C9C1BB', '#3A3340'),
      head: membrane('#C2BBB5', '#342F3C'),
      density: new MeshStandardMaterial({ color: '#58506A', roughness: 0.7, emissive: new Color(TOKENS.violet), emissiveIntensity: 0, side: DoubleSide, clippingPlanes: [CUT] }),
      vesicle: new MeshPhysicalMaterial({ color: '#E9E1D6', roughness: 0.35, sheen: 0.4, clearcoat: 0.3, clearcoatRoughness: 0.4 }),
      tx: new MeshStandardMaterial({ color: TOKENS.amber, emissive: new Color(TOKENS.amber), emissiveIntensity: 0.9, roughness: 0.4, clippingPlanes: [CUT] }),
      receptor: new MeshStandardMaterial({ color: '#9D93B5', roughness: 0.5, emissive: new Color(TOKENS.violet), emissiveIntensity: 0, clippingPlanes: [CUT] }),
      channel: new MeshStandardMaterial({ color: '#8F86B3', roughness: 0.5, emissive: new Color(TOKENS.violet), emissiveIntensity: 0, clippingPlanes: [CUT] }),
    }),
    [],
  )

  // Fixed layout (seeded), all in the far half so nothing is cut through: resting vesicles in the
  // terminal, receptors in the postsynaptic membrane, calcium channels in the presynaptic membrane.
  const layout = useMemo(() => {
    const r = rng(7)
    const depth = (p: Vector3) => p.dot(VIEW)
    const ves: Vector3[] = []
    for (let guard = 0; ves.length < N_VES && guard < 20000; guard++) {
      const y = PRE_Y + 0.1 + r() * 0.48
      const p = new Vector3((r() - 0.5) * 1.0, y, (r() - 0.5) * 1.0)
      const room = y < PRE_Y + 0.3 ? 0.44 : 0.4 - (y - PRE_Y - 0.3) * 0.5
      if (Math.hypot(p.x, p.z) > room || depth(p) > -0.06) continue
      if (ves.some((q) => q.distanceTo(p) < 0.105) || FUSE.some((f) => f.distanceTo(p) < 0.15)) continue
      ves.push(p)
    }
    const rec: Vector3[] = []
    for (let guard = 0; rec.length < N_REC && guard < 20000; guard++) {
      const p = new Vector3((r() - 0.5) * 0.8, POST_Y + 0.02, (r() - 0.5) * 0.8)
      if (Math.hypot(p.x, p.z) > 0.38 || depth(p) > -0.03 || rec.some((q) => q.distanceTo(p) < 0.07)) continue
      rec.push(p)
    }
    const ch: Vector3[] = []
    for (let i = 0; i < N_CH; i++) ch.push(inPlane(-0.36 + (0.72 * i) / (N_CH - 1), PRE_Y - 0.01, -0.03 - r() * 0.25))
    const tx = Array.from({ length: N_TX }, (_, i) => {
      const src = FUSE[i % 3]
      const bound = i % 3 !== 2 // about two thirds end bound to a receptor; the rest drift in the cleft
      const target = bound
        ? rec[Math.floor(r() * N_REC)].clone().add(new Vector3((r() - 0.5) * 0.02, 0.035, (r() - 0.5) * 0.02))
        : src.clone().add(new Vector3((r() - 0.5) * 0.6, 0, (r() - 0.5) * 0.6)).setY(POST_Y + 0.03 + r() * (PRE_Y - POST_Y - 0.06))
      const delay = r() * 0.5
      const wobble = new Vector3(r() - 0.5, 0, r() - 0.5).multiplyScalar(0.18)
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
    o.scale.setScalar(1)
    layout.rec.forEach((p, i) => { o.position.copy(p); o.updateMatrix(); rec.setMatrixAt(i, o.matrix) })
    layout.ch.forEach((p, i) => { o.position.copy(p); o.updateMatrix(); ch.setMatrixAt(i, o.matrix) })
    for (const m of [ves, tx, rec, ch]) m.frustumCulled = false
    return { ves, tx, rec, ch }
  }, [geo, mats, layout])

  useEffect(() => {
    anchors['signal-synapse:terminal'] = inPlane(0.5, PRE_Y + 0.62, -0.2)
    anchors['signal-synapse:vesicles'] = layout.ves.reduce((a, b) => (b.dot(SIDE) - b.y * 0.5 > a.dot(SIDE) - a.y * 0.5 ? b : a)).clone()
    anchors['signal-synapse:transmitter'] = inPlane(-0.3, 0.0, -0.1)
    anchors['signal-synapse:cleft'] = inPlane(0.5, 0.0, -0.08)
    anchors['signal-synapse:receptors'] = layout.rec.reduce((a, b) => (b.dot(SIDE) > a.dot(SIDE) ? b : a)).clone()
    return () => {
      Object.values(geo).forEach((g) => g.dispose())
      Object.values(mats).forEach((m: Material) => m.dispose())
    }
  }, [geo, mats, layout])

  const o = useMemo(() => new Object3D(), [])
  const hidden = useMemo(() => new Matrix4().makeScale(0, 0, 0), [])
  const pos = useMemo(() => new Vector3(), [])
  const start = useMemo(() => new Vector3(), [])
  const end = useMemo(() => new Vector3(), [])
  useFrame(() => {
    const on = rig.world === 'synapse'
    if (group.current) group.current.visible = on
    if (!on) return
    const t = rig.synT
    const cam = camera as PerspectiveCamera
    // Camera: slightly above the cleft, the whole bouton and spine head in frame, a slow 6%
    // push-in through the event. In landscape the subject sits right of the text column.
    const aspect = size.width / size.height
    const portrait = aspect < 0.9
    const push = 1 - 0.06 * MathUtils.smootherstep(t, 0, SYN_PUSH)
    const fov = 30
    const halfH = Math.tan(MathUtils.degToRad(fov / 2))
    const subjectH = 1.9 // from the spine neck to the axon above the bouton
    const dist = ((subjectH / 2) / (halfH * (portrait ? 0.5 : 0.86))) * push * (portrait ? Math.max(1, 0.62 / aspect) : 1)
    if (!ui.get().explore) {
      const target = new Vector3(0, portrait ? -0.25 : 0.12, 0)
      if (!portrait) target.addScaledVector(SIDE, -dist * halfH * aspect * 0.36)
      const el = MathUtils.degToRad(9)
      cam.position.copy(target).addScaledVector(VIEW, dist * Math.cos(el)).setY(target.y + dist * Math.sin(el))
      cam.up.set(0, 1, 0)
      cam.lookAt(target)
      if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix() }
    }
    focus.bokeh = 0

    // Calcium channels open as the electrical signal arrives.
    const ch = phase(t, SYN.channels)
    mats.channel.emissiveIntensity = 2.2 * Math.sin(Math.PI * Math.min(1, ch)) + (t >= SYN.channels[1] ? 0.25 : 0)
    // Three vesicles dock and fuse with the membrane.
    const fu = phase(t, SYN.fusion)
    FUSE.forEach((f, i) => {
      start.set(f.x * 0.9, PRE_Y + 0.2, f.z * 0.9)
      end.set(f.x, PRE_Y + 0.045, f.z)
      pos.lerpVectors(start, end, MathUtils.smoothstep(fu, 0, 0.6))
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
      pos.lerpVectors(m.src, m.target, MathUtils.smoothstep(k, 0, 1)).addScaledVector(m.wobble, Math.sin(Math.PI * k) * 0.6)
      pos.y = MathUtils.clamp(pos.y, POST_Y + 0.025, PRE_Y - 0.012) // stays inside the cleft
      o.position.copy(pos)
      o.scale.setScalar(1)
      o.updateMatrix()
      inst.tx.setMatrixAt(i, o.matrix)
    })
    inst.tx.instanceMatrix.needsUpdate = true
    // Binding, then a local response at the postsynaptic density (violet: electrical again).
    const bi = phase(t, SYN.binding)
    mats.receptor.emissiveIntensity = 1.4 * bi
    const re = phase(t, SYN.response)
    mats.density.emissiveIntensity = 0.9 * Math.sin(Math.PI * re) + 0.15 * (t >= SYN.response[1] ? 1 : 0)
  })

  return (
    <group ref={group} visible={false}>
      <mesh geometry={geo.terminal} material={mats.terminal} />
      <mesh geometry={geo.head} material={mats.head} />
      <mesh geometry={geo.density} material={mats.density} position={[0, POST_Y - 0.035, 0]} />
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

const SYN_PUSH = 5
