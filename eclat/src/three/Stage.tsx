import { asset } from '../lib/asset'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { RGBELoader } from 'three-stdlib'
import { useBinaryUrl } from '../lib/binary'
import {
  ContactShadows,
  Environment,
  OrbitControls,
  PerformanceMonitor,
  Preload,
  SpotLight,
} from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { rig, ui, useUI, type Piece } from '../lib/state'
import { device } from '../lib/device'
import { productById } from '../lib/products'
import { Jewel, type GemTuning } from './Jewel'
import { floorMaterial } from './materials'
import { INSPECT, INTRO_FROM, SHOTS, lerpPose, makePose, sampleShots, setPose } from './shots'

/* ---------------------------------------------------------------------------
 * Which piece is on stage right now.
 * ------------------------------------------------------------------------- */
export function activePiece(): Piece | null {
  const s = ui.get()
  if (s.mode === 'detail') return productById(s.detailId)?.piece ?? null
  if (s.mode === 'inspect') return 'bracelet'
  let best: Piece | null = null
  let v = 0.001
  if (rig.ringOn > v) (best = 'ring'), (v = rig.ringOn)
  if (rig.neckOn > v) (best = 'necklace'), (v = rig.neckOn)
  if (rig.braceOn > v) best = 'bracelet'
  return best
}

/** ?debug=nobeam,noshadow,nofloor — isolates scene elements during visual QA */
const DEBUG = new Set((new URLSearchParams(location.search).get('debug') || '').split(','))

const presence = (p: Piece) => (p === 'ring' ? rig.ringOn : p === 'necklace' ? rig.neckOn : rig.braceOn)
const progress = (p: Piece) => (p === 'ring' ? rig.ringT : p === 'necklace' ? rig.neckT : rig.braceT)

/** Live, damped pose — written by the Director, read by the piece scenes. */
const live = { spin: 0, light: 1, piece: null as Piece | null }

/* ---------------------------------------------------------------------------
 * Director — scroll-driven camera with damping, view-offset framing,
 * intro blend, pointer parallax, and hand-over to OrbitControls.
 * ------------------------------------------------------------------------- */
function Director({ controls }: { controls: React.RefObject<OrbitControlsImpl> }) {
  const { camera, size } = useThree()
  const cam = camera as THREE.PerspectiveCamera
  const target = useRef(new THREE.Vector3(0, 4, 0))
  const frame = useRef(new THREE.Vector2())
  const want = useMemo(makePose, [])
  const a = useMemo(makePose, [])
  const b = useMemo(makePose, [])
  const arriveUntil = useRef(0)
  const lastMode = useRef(ui.get().mode)
  const lastReset = useRef(ui.get().resetTick)
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const right = useMemo(() => new THREE.Vector3(), [])
  const up = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 8)
    const s = ui.get()
    const piece = activePiece()
    if (!piece) return
    const tall = size.width / size.height < 0.85
    const now = state.clock.elapsedTime

    // mode transitions → camera "arrives" at the inspection pose before the user takes over
    if (s.mode !== lastMode.current || s.resetTick !== lastReset.current) {
      if (s.mode !== 'scroll') arriveUntil.current = now + 1.1
      lastMode.current = s.mode
      lastReset.current = s.resetTick
    }

    const switched = live.piece !== piece
    live.piece = piece
    // a new piece in an inspection mode re-runs the arrival so the orbit target follows it
    if (switched && s.mode !== 'scroll') arriveUntil.current = now + 1.1

    if (s.mode === 'scroll') {
      if (controls.current) controls.current.enabled = false
      const keys = SHOTS[piece][tall ? 'tall' : 'wide']
      sampleShots(keys, progress(piece), b)
      if (piece === 'ring' && rig.intro < 1) {
        setPose(a, INTRO_FROM[tall ? 'tall' : 'wide'])
        const u = 1 - Math.pow(1 - rig.intro, 3)
        lerpPose(a, b, u, want)
      } else {
        want.pos.copy(b.pos)
        want.tgt.copy(b.tgt)
        want.fov = b.fov
        want.frame.copy(b.frame)
        want.spin = b.spin
        want.light = b.light
      }
      // gentle pointer parallax (desktop only)
      if (!device.coarse && !device.reducedMotion) {
        const dist = want.pos.distanceTo(want.tgt)
        tmp.subVectors(want.tgt, want.pos).normalize()
        right.crossVectors(tmp, THREE.Object3D.DEFAULT_UP).normalize()
        up.crossVectors(right, tmp).normalize()
        want.pos.addScaledVector(right, rig.pointer.x * dist * 0.035)
        want.pos.addScaledVector(up, -rig.pointer.y * dist * 0.025)
      }
    } else {
      const ins = INSPECT[piece]
      want.tgt.set(...ins.tgt)
      // portrait screens give the 3D a shorter viewport — step back to keep the whole piece in frame
      want.pos.set(...ins.pos).sub(want.tgt).multiplyScalar(tall ? 1.75 : 1).add(want.tgt)
      want.fov = ins.fov
      want.spin = 0
      want.light = 1.1
      if (s.mode === 'detail') {
        want.frame.set(tall ? 0 : -0.17, tall ? 0.24 : 0)
      } else want.frame.set(0, 0.04)
    }

    const arriving = s.mode !== 'scroll' && now < arriveUntil.current
    const userControl = s.mode !== 'scroll' && !arriving
    const lambda = device.reducedMotion ? 14 : s.mode === 'scroll' ? 4.2 : 5.5

    if (switched) {
      // scene changes happen behind full-bleed photography — cut, don't fly
      cam.position.copy(want.pos)
      target.current.copy(want.tgt)
      cam.fov = want.fov
      frame.current.copy(want.frame)
      live.spin = want.spin
      live.light = want.light
      controls.current?.target.copy(want.tgt)
    } else if (!userControl) {
      const k = 1 - Math.exp(-lambda * dt)
      cam.position.lerp(want.pos, k)
      target.current.lerp(want.tgt, k)
      cam.fov += (want.fov - cam.fov) * k
      live.spin += (want.spin - live.spin) * k
      live.light += (want.light - live.light) * k
    } else if (controls.current) {
      target.current.copy(controls.current.target)
    }
    const kf = 1 - Math.exp(-4 * dt)
    frame.current.lerp(want.frame, switched ? 1 : kf)

    if (controls.current) {
      if (!userControl) controls.current.target.copy(target.current)
      controls.current.enabled = userControl
      const reach = tall ? 1.75 : 1 // matches the portrait inspection framing
      controls.current.minDistance = INSPECT[piece].min
      controls.current.maxDistance = INSPECT[piece].max * reach
    }
    if (!userControl) cam.lookAt(target.current)

    const w = size.width
    const h = size.height
    cam.setViewOffset(w, h, -frame.current.x * w, frame.current.y * h, w, h)
    cam.updateProjectionMatrix()
  }, -1)

  return null
}

/* ---------------------------------------------------------------------------
 * Piece scenes
 * ------------------------------------------------------------------------- */
function usePieceFrame(piece: Piece, group: React.RefObject<THREE.Group>, fn: (on: number, s: THREE.Scene) => void) {
  useFrame((state) => {
    const isActive = activePiece() === piece
    if (group.current) group.current.visible = isActive
    if (!isActive) return
    const mode = ui.get().mode
    fn(mode === 'scroll' ? presence(piece) : 1, state.scene)
  })
}

const gemColor = () => new THREE.Color(1, 1, 1)

function RingScene({ env, gem }: { env: THREE.Texture; gem: GemTuning }) {
  const group = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Group>(null)
  const beam = useRef<THREE.SpotLight>(null)
  const rim = useRef<THREE.PointLight>(null)
  const gemTune = useMemo(() => ({ ...gem, color: gemColor() }), [gem])

  usePieceFrame('ring', group, (on, scene) => {
    const intro = ui.get().mode === 'scroll' ? rig.intro : 1
    const reveal = THREE.MathUtils.smoothstep(intro, 0.0, 0.85)
    if (spin.current) spin.current.rotation.y = live.spin
    scene.environmentIntensity = 1.05 * on * (0.08 + 0.92 * reveal) * (0.85 + 0.15 * live.light)
    gemTune.color.setScalar(gem.brightness * on * (0.1 + 0.9 * reveal))
    if (beam.current) {
      beam.current.intensity = 6 * on * THREE.MathUtils.smoothstep(intro, 0.0, 0.6) * live.light
      // drei renders the volumetric cone as a sibling of the light
      const vol = beam.current.parent?.children.find((c) => (c as THREE.Mesh).isMesh && c !== beam.current) as THREE.Mesh | undefined
      if (vol) {
        vol.layers.set(1) // visible to the camera, invisible to the contact-shadow camera
        const mat = vol.material as THREE.ShaderMaterial
        // the volumetric shaft belongs to the opening shot; it thins as THE DIAMOND begins
        if (mat.uniforms?.opacity)
          mat.uniforms.opacity.value = 0.13 * on * THREE.MathUtils.smoothstep(intro, 0.15, 0.9) * (1 - THREE.MathUtils.smoothstep(rig.ringT, 0.05, 0.3))
      }
    }
    if (rim.current) rim.current.intensity = 2.2 * on * reveal
  })

  return (
    <group ref={group}>
      <group ref={spin}>
        <Jewel url={asset('models/ring.glb')} env={env} gem={gemTune} />
      </group>
      {!DEBUG.has('nofloor') && (
        <mesh rotation-x={-Math.PI / 2} position-y={-9.96} material={floorMaterial} renderOrder={-1}>
          <circleGeometry args={[260, 96]} />
        </mesh>
      )}
      {!DEBUG.has('noshadow') && <ContactShadows position={[0, -9.93, 0]} scale={60} blur={2.2} far={26} opacity={0.85} resolution={512} color="#000000" />}
      {!DEBUG.has('nobeam') && <SpotLight
        ref={beam}
        volumetric
        position={[-22, 170, 26]}
        angle={0.13}
        penumbra={0.75}
        distance={290}
        attenuation={210}
        anglePower={6}
        radiusTop={1.2}
        radiusBottom={34}
        opacity={0.12}
        intensity={0}
        decay={0}
        color="#ffe8c8"
      />}
      <pointLight ref={rim} position={[-14, 46, -70]} intensity={0} decay={0} color="#ffd6a0" />
    </group>
  )
}

function NecklaceScene({ env, gem }: { env: THREE.Texture; gem: GemTuning }) {
  const group = useRef<THREE.Group>(null)
  const key = useRef<THREE.SpotLight>(null)
  const rimL = useRef<THREE.PointLight>(null)
  const rimR = useRef<THREE.PointLight>(null)
  const gemTune = useMemo(() => ({ ...gem, color: gemColor() }), [gem])
  const keyTarget = useMemo(() => {
    const o = new THREE.Object3D()
    o.position.set(0, -42, 96)
    return o
  }, [])

  usePieceFrame('necklace', group, (on, scene) => {
    const l = THREE.MathUtils.smoothstep(on, 0, 1)
    scene.environmentIntensity = 0.95 * l * (0.7 + 0.3 * live.light)
    gemTune.color.setScalar(gem.brightness * (0.12 + 0.88 * l))
    if (key.current) key.current.intensity = 7 * l * live.light
    if (rimL.current) rimL.current.intensity = 1.6 * l
    if (rimR.current) rimR.current.intensity = 1.1 * l
  })

  return (
    <group ref={group}>
      <Jewel url={asset('models/necklace.glb')} env={env} gem={gemTune} />
      <primitive object={keyTarget} />
      <spotLight
        ref={key}
        position={[150, 160, 360]}
        target={keyTarget}
        angle={0.2}
        penumbra={0.9}
        intensity={0}
        decay={0}
        color="#ffe6c6"
      />
      <pointLight ref={rimL} position={[-260, 140, -220]} intensity={0} decay={0} color="#cfd8ff" />
      <pointLight ref={rimR} position={[260, 60, -160]} intensity={0} decay={0} color="#ffcf98" />
    </group>
  )
}

function BraceletScene({ env, gem }: { env: THREE.Texture; gem: GemTuning }) {
  const group = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Group>(null)
  const key = useRef<THREE.SpotLight>(null)
  const rim = useRef<THREE.PointLight>(null)
  // small stones seen side-on: a touch more light so they read at a distance
  const gemTune = useMemo(() => ({ ...gem, brightness: gem.brightness * 1.45, color: gemColor() }), [gem])

  usePieceFrame('bracelet', group, (on, scene) => {
    const l = THREE.MathUtils.smoothstep(on, 0, 1)
    if (spin.current) spin.current.rotation.y = live.spin
    scene.environmentIntensity = 1.0 * l * (0.75 + 0.25 * live.light)
    gemTune.color.setScalar(gem.brightness * (0.12 + 0.88 * l))
    if (key.current) key.current.intensity = 6 * l * live.light
    if (rim.current) rim.current.intensity = 1.8 * l
  })

  return (
    <group ref={group}>
      <group ref={spin}>
        {/* laid flat on the studio floor, stones facing up; the turntable spins it */}
        <Jewel url={asset('models/bracelet.glb')} env={env} gem={gemTune} />
      </group>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.02} material={floorMaterial} renderOrder={-1}>
        <circleGeometry args={[320, 96]} />
      </mesh>
      <ContactShadows position={[0, 0, 0]} scale={110} blur={1.6} far={8} opacity={0.9} resolution={512} color="#000000" />
      <spotLight ref={key} position={[-40, 230, 90]} angle={0.3} penumbra={0.85} intensity={0} decay={0} color="#ffe6c4" />
      <pointLight ref={rim} position={[60, 40, -160]} intensity={0} decay={0} color="#ffd3a0" />
    </group>
  )
}

/** Equirectangular HDR environment (works with direct and packed binaries). */
function useHdr(path: string) {
  const tex = useLoader(RGBELoader, useBinaryUrl(path))
  tex.mapping = THREE.EquirectangularReflectionMapping
  tex.colorSpace = THREE.LinearSRGBColorSpace // as drei's useEnvironment does for .hdr
  return tex
}

/* ---------------------------------------------------------------------------
 * Scene root
 * ------------------------------------------------------------------------- */
function Scene({ gem }: { gem: GemTuning }) {
  const env = useHdr('env/studio.hdr')
  // the stones see their own, busier studio (configurator practice) — the metals see the dark one
  const gemEnv = useHdr('env/gems.hdr')
  const controls = useRef<OrbitControlsImpl>(null)
  const mode = useUI((s) => s.mode)

  useEffect(() => {
    const c = controls.current
    if (!c) return
    const stop = () => (c.autoRotate = false)
    c.addEventListener('start', stop)
    return () => c.removeEventListener('start', stop)
  }, [])

  useEffect(() => {
    if (controls.current) controls.current.autoRotate = mode !== 'scroll' && !device.reducedMotion
  }, [mode])

  const loaded = useUI((s) => s.loaded)

  return (
    <>
      <Environment map={env} />
      <Director controls={controls} />
      <RingScene env={gemEnv} gem={gem} />
      {/* non-critical pieces load once the hero is on screen; each pre-compiles on arrival */}
      {loaded && (
        <Suspense fallback={null}>
          <NecklaceScene env={gemEnv} gem={gem} />
          <Preload all />
        </Suspense>
      )}
      {loaded && (
        <Suspense fallback={null}>
          <BraceletScene env={gemEnv} gem={gem} />
          <Preload all />
        </Suspense>
      )}
      <OrbitControls
        ref={controls}
        enabled={false}
        enableDamping
        dampingFactor={0.08}
        enablePan={false}
        rotateSpeed={0.7}
        zoomSpeed={0.7}
        autoRotateSpeed={0.6}
        minPolarAngle={0.12}
        maxPolarAngle={Math.PI * 0.62}
      />
    </>
  )
}

/** Signals readiness once models are loaded and shaders compiled. */
function Ready() {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    let raf = 0
    let n = 0
    const tick = () => {
      if (++n > 2) {
        ui.set({ glReady: true })
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [gl])
  return null
}

export default function Stage() {
  const mode = useUI((s) => s.mode)
  const visible = useUI((s) => s.stageVisible)
  // full-screen menu / enquiry cover the stage — no need to keep rendering behind them
  const covered = useUI((s) => s.menuOpen || s.enquiryOpen)
  const interactive = mode !== 'scroll'
  const low = device.lowPower || device.isMobile()
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, low ? 1.5 : 1.75))
  const gem = useMemo<GemTuning>(
    () => ({ bounces: low ? 2 : 3, aberration: low ? 0.006 : 0.01, brightness: 1.0 }),
    [low],
  )

  return (
    <div className={`stage${interactive ? ' is-interactive' : ''}`} aria-hidden={!interactive}>
      <Canvas
        frameloop={(visible || interactive) && !covered ? 'always' : 'never'}
        dpr={dpr}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        camera={{ fov: 30, near: 0.5, far: 4000, position: [34, 2, 150] }}
        onCreated={({ camera }) => {
          // (no setClearColor: an opaque clear alpha would also fill ContactShadows' render target)
          camera.layers.enable(1)
        }}
      >
        <color attach="background" args={['#090909']} />
        <fog attach="fog" args={['#090909', 190, 1100]} />
        <PerformanceMonitor
          onDecline={() => setDpr((d) => Math.max(1, d - 0.25))}
          onIncline={() => setDpr((d) => Math.min(window.devicePixelRatio || 1, low ? 1.5 : 1.75, d + 0.25))}
        />
        <Suspense fallback={null}>
          <Scene gem={gem} />
          <Preload all />
          <Ready />
        </Suspense>
      </Canvas>
      <div className="stage-vignette" />
    </div>
  )
}
