import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { AgXToneMapping } from 'three'
import { Neuron, actions } from './Scene'
import { COARSE, reducedMotion, ui, useUI } from './state'
import { labelEls } from './labels'
import type { Beat } from './state'

const COPY: Record<Beat, string> = {
  neuron: 'A neuron receives signals on its dendrites and sends them along a single axon.',
  signal: 'Once threshold is reached, an action potential travels down the axon. It is all-or-none: it does not get weaker.',
  arrived:
    'Along a myelinated axon, the signal is renewed at each gap in the myelin, all the way to the end of what was recorded here.',
}

/** Labels per beat: key (anchor), text, and whether it marks an illustrative element. */
const LABELS: Record<'neuron' | 'arrived', { key: string; text: string }[]> = {
  neuron: [
    { key: 'dendrites', text: 'Dendrites' },
    { key: 'soma', text: 'Cell body' },
    { key: 'axon', text: 'Axon (continues below)' },
  ],
  arrived: [
    { key: 'trigger', text: 'Trigger zone' },
    { key: 'myelin', text: 'Myelin (illustrative)' },
    { key: 'node', text: 'Node of Ranvier' },
    { key: 'end', text: 'End of the reconstructed axon' },
  ],
}

const STATIC_STEPS = [
  { key: 'n1', text: '1  Starts at the trigger zone' },
  { key: 'n2', text: '2  Renewed at each gap in the myelin' },
  { key: 'n3', text: '3  Reaches the end of the recorded axon' },
]

export function App() {
  const beat = useUI((s) => s.beat)
  const ready = useUI((s) => s.ready)
  const error = useUI((s) => s.error)
  const playingStatic = useUI((s) => s.playingStatic)
  const labels =
    beat === 'neuron'
      ? LABELS.neuron
      : beat === 'arrived'
        ? reducedMotion && !playingStatic ? STATIC_STEPS : LABELS.arrived
        : playingStatic ? [] : [LABELS.arrived[0]]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) actions.next()
      else if (['ArrowLeft', 'PageUp'].includes(e.key)) actions.previous()
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const tags =
    beat === 'neuron'
      ? 'Fine branches drawn wider than true scale in distant views.'
      : 'Slowed down · Illustrative colour · Myelin added for illustration (not in the recording) · Fine branches drawn wider than true scale in distant views.'

  return (
    <div className={`stage beat-${beat}`}>
      <Canvas
        className="canvas"
        aria-hidden="true"
        dpr={[1, COARSE ? 1.5 : 2]}
        camera={{ fov: 35, near: 0.01, far: 200, position: [0, 0, 20] }}
        gl={{ antialias: true, toneMapping: AgXToneMapping, toneMappingExposure: 1.0 }}
      >
        <color attach="background" args={['#07080A']} />
        <hemisphereLight args={['#C9CED8', '#07080A', 0.35]} />
        <directionalLight position={[2, 6, 4]} intensity={2.2} color="#FFF3EA" />
        <directionalLight position={[-3, 1, -5]} intensity={1.1} color="#9AA3B5" />
        <Neuron />
      </Canvas>

      <div className="scrim" aria-hidden="true" />
      <div className="labels3d" aria-hidden="true">
        {labels.map((l) => (
          <div key={`${beat}-${l.key}`} className="tag3d" ref={(el) => { labelEls[l.key] = el }}>
            <i />
            <span>{l.text}</span>
          </div>
        ))}
      </div>

      <header className="masthead">
        <p className="wordmark">Neuroverse</p>
        <h1>Electrical, then chemical</h1>
        <p className="statement" aria-live="polite">{COPY[beat]}</p>
      </header>

      <nav className="progress" aria-label="Presentation progress">
        <span className="ticks" aria-hidden="true">{[1, 2, 3, 4, 5].map((i) => <i key={i} className={i === 3 ? 'is-now' : ''} />)}</span>
        <span>3 of 5</span>
      </nav>

      <div className="dock">
        <ul className="sr-only">
          {labels.map((l) => <li key={l.key}>{l.text}</li>)}
        </ul>
        <div className="legend">
          <p><b>Recorded:</b> the cell's shape and the axon's path (the file stores the cell body as a sphere).</p>
          <p><b>Illustrative:</b> {tags}</p>
        </div>
        <div className="buttons">
          {beat === 'neuron' && <button onClick={actions.next}>Send a signal <kbd>→</kbd></button>}
          {beat === 'signal' && <button onClick={actions.next}>Skip to the end <kbd>→</kbd></button>}
          {beat === 'arrived' && (
            <>
              <button onClick={actions.replay}>{reducedMotion ? 'Play the signal' : 'Replay signal'}</button>
              <button onClick={actions.previous}>Back to the neuron <kbd>←</kbd></button>
            </>
          )}
        </div>
        <p className="credit">
          Neuron: NeuroMorpho.Org 290955 (790_Mohan_etal_2015), human middle temporal gyrus, layer 2/3; Mohan et al. 2015,{' '}
          <i>Cerebral Cortex</i>, doi:10.1093/cercor/bhv188. NeuroMorpho.Org (RRID:SCR_002145); Tecuatl, Ljungquist &amp; Ascoli 2024,
          doi:10.1096/fba.2024-00048. CC BY 4.0. Changed: oriented, simplified within 0.5&nbsp;µm, drawn as tubes; myelin added
          (illustrative). Local proof, not for distribution.
        </p>
      </div>

      <div className="dip" aria-hidden="true" />
      {!ready && !error && <p className="loading" role="status">Loading the neuron</p>}
      {error && <p className="loading" role="alert">{error}</p>}
    </div>
  )
}

// Keep the store reachable from the console in development.
if (import.meta.env.DEV) Object.assign(window, { __ui: ui })
