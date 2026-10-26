import { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { AgXToneMapping } from 'three'
import { Brain } from './Brain'
import { Rig } from './Rig'
import { LeaderLines, LeaderProjector, labelRefs } from './Labels'
import { ui, useUI } from './state'
import { LABELS, TOKENS, anchorPoints } from './scene'

function Lights() {
  return (
    <>
      {/* Warm-neutral key from upper front-left, cool low fill, desaturated violet rim behind. */}
      <directionalLight position={[-2.2, 2.6, 3.2]} intensity={2.4} color="#FFEBDD" />
      <directionalLight position={[2.8, -0.6, 1.6]} intensity={0.35} color="#A9B8C9" />
      <directionalLight position={[2.6, 1.4, -3.2]} intensity={2.2} color={TOKENS.rimViolet} />
      <directionalLight position={[-2.6, 0.8, -3.0]} intensity={0.9} color={TOKENS.rimViolet} />
      {/* In-house environment for soft reflections on the wet surface (no external HDRI). */}
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#FFF1E6" position={[-3, 3, 4]} scale={[4, 2, 1]} />
        <Lightformer form="rect" intensity={1.1} color={TOKENS.rimViolet} position={[3, 1, -4]} scale={[3, 3, 1]} />
        <Lightformer form="ring" intensity={0.4} color="#B9C4D2" position={[0, -3, 2]} scale={2} />
      </Environment>
    </>
  )
}

const VIEW_COPY = {
  lateral: { caption: 'Left lateral view', action: 'Show midline section' },
  section: { caption: 'Midsagittal section, seen from the left', action: 'Return to lateral view' },
} as const

export function App() {
  const view = useUI((s) => s.view)
  const selected = useUI((s) => s.selected)
  const explore = useUI((s) => s.explore)
  const ready = useUI((s) => s.ready)
  const transitioning = useUI((s) => s.transitioning)
  // Order labels top-to-bottom by their anchor height so leader lines do not cross.
  const labels = ready
    ? [...LABELS[view]].sort((a, b) => (anchorPoints[`${view}:${b.id}`]?.y ?? 0) - (anchorPoints[`${view}:${a.id}`]?.y ?? 0))
    : LABELS[view]
  const selectedName = labels.find((l) => l.id === selected)?.name

  const toggleView = () => ui.set({ view: ui.get().view === 'lateral' ? 'section' : 'lateral', explore: false })
  const toggleExplore = () => ui.set({ explore: !ui.get().explore, selected: null })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key.toLowerCase()
      if (k === 's') toggleView()
      else if (k === 'e') toggleExplore()
      else if (k === 'r' && ui.get().explore) window.dispatchEvent(new Event('neuroverse:reset'))
      else if (k === 'escape') {
        if (ui.get().explore) ui.set({ explore: false })
        else ui.set({ selected: null })
      } else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className={`stage view-${view} ${explore ? 'is-exploring' : ''}`}>
      <Canvas
        className="canvas"
        aria-hidden="true"
        dpr={[1, 2]}
        camera={{ fov: 26, near: 0.1, far: 50, position: [0, 0, 4.2] }}
        gl={{ antialias: true, localClippingEnabled: true, toneMapping: AgXToneMapping, toneMappingExposure: 1.05 }}
      >
        <color attach="background" args={[TOKENS.charcoal]} />
        <Lights />
        <Suspense fallback={null}>
          <Brain />
        </Suspense>
        <Rig />
        <LeaderProjector />
      </Canvas>

      <LeaderLines />

      <header className="masthead">
        <p className="wordmark">Neuroverse</p>
        <h1>The architecture of thought</h1>
        <p className="statement">Major structures of the brain, seen from the left side.</p>
      </header>

      <nav className="progress" aria-label="Presentation progress">
        <span className="ticks" aria-hidden="true">{[1, 2, 3, 4, 5].map((i) => <i key={i} className={i === 2 ? 'is-now' : ''} />)}</span>
        <span>2 of 5</span>
      </nav>

      {(['left', 'right'] as const).map((column) => {
        const items = labels.filter((l) => l.column === column)
        if (!items.length) return null
        return (
          <ul
            key={`${view}-${column}`}
            className={`labels labels--${column} ${transitioning || explore || !ready ? 'is-hidden' : ''}`}
            aria-label={column === 'left' ? 'Labelled structures' : 'More labelled structures'}
          >
            {items.map((l) => (
              <li key={`${view}-${l.id}`}>
                <button
                  ref={(el) => { labelRefs[l.id] = el }}
                  aria-pressed={selected === l.id}
                  className={selected === l.id ? 'is-on' : selected ? 'is-off' : ''}
                  onClick={() => ui.set({ selected: selected === l.id ? null : l.id })}
                >
                  {l.name}
                </button>
              </li>
            ))}
          </ul>
        )
      })}

      <footer className="controls">
        <p className="caption">{VIEW_COPY[view].caption}</p>
        {selected && <p className="caption note">Highlight colour is illustrative</p>}
        <div className="buttons">
          <button onClick={toggleView} disabled={explore}>{VIEW_COPY[view].action} <kbd>S</kbd></button>
          <button onClick={toggleExplore} aria-pressed={explore}>{explore ? 'Leave explore' : 'Explore'} <kbd>E</kbd></button>
          {explore && <button onClick={() => window.dispatchEvent(new Event('neuroverse:reset'))}>Reset view <kbd>R</kbd></button>}
        </div>
      </footer>

      <p className="credit">
        Brain model adapted from{' '}
        <a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/" target="_blank" rel="noreferrer">BodyParts3D</a>,
        © The Database Center for Life Science, licensed under{' '}
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a> and{' '}
        <a href="https://creativecommons.org/licenses/by-sa/2.1/jp/" target="_blank" rel="noreferrer">CC BY-SA 2.1 JP</a>.{' '}
        <a href={`${import.meta.env.BASE_URL}models/ATTRIBUTION.md`} target="_blank" rel="noreferrer">Changes and details</a>.
        {' '}Proof, not production.
      </p>

      {!ready && <p className="loading" role="status">Loading the brain model</p>}
      <p className="sr-only" aria-live="polite">
        {transitioning ? '' : `${VIEW_COPY[view].caption}.${selectedName ? ` ${selectedName} selected.` : ''}${explore ? ' Explore mode on.' : ''}`}
      </p>
    </div>
  )
}
