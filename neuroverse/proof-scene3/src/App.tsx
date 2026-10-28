import { useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { AgXToneMapping, NoToneMapping } from 'three'
import { Neuron, actions } from './Scene'
import { COARSE, reducedMotion, ui, useUI } from './state'
import { labelEls, scaleBar } from './labels'
import type { Beat } from './state'

const COPY: Record<Beat, string> = {
  neuron: 'A neuron receives signals on its dendrites and sends them along a single axon.',
  signal: 'Once threshold is reached, an action potential travels down the axon. It is all-or-none: it does not get weaker.',
  arrived:
    'Along a myelinated axon, the signal is renewed at each gap in the myelin, all the way to the end of what was recorded here.',
}

type Label = { key: string; name: string; role?: string }

const LABELS: Record<'neuron' | 'arrived', Label[]> = {
  neuron: [
    { key: 'dendrites', name: 'Dendrites', role: 'Receive signals' },
    { key: 'soma', name: 'Cell body' },
    { key: 'axon', name: 'Axon', role: 'Sends the signal on; continues below' },
  ],
  arrived: [
    { key: 'trigger', name: 'Trigger zone', role: 'Where the signal starts' },
    { key: 'myelin', name: 'Myelin', role: 'Illustrative, not in the recording' },
    { key: 'node', name: 'Node of Ranvier', role: 'Where the signal is renewed' },
    { key: 'end', name: 'End of the reconstructed axon', role: 'The recording stops here' },
  ],
}

const STATIC_STEPS: Label[] = [
  { key: 'n1', name: '1  Starts at the trigger zone' },
  { key: 'n2', name: '2  Renewed at each gap in the myelin' },
  { key: 'n3', name: '3  Reaches the end of the recorded axon' },
]

export function App() {
  const beat = useUI((s) => s.beat)
  const ready = useUI((s) => s.ready)
  const error = useUI((s) => s.error)
  const playingStatic = useUI((s) => s.playingStatic)
  const sources = useRef<HTMLDialogElement>(null)
  const sourcesButton = useRef<HTMLButtonElement>(null)
  const labels =
    beat === 'neuron'
      ? LABELS.neuron
      : beat === 'arrived'
        ? reducedMotion && !playingStatic ? STATIC_STEPS : LABELS.arrived
        : playingStatic ? [] : [LABELS.arrived[0]]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || sources.current?.open) return
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) actions.next()
      else if (['ArrowLeft', 'PageUp'].includes(e.key)) actions.previous()
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const illustrative =
    beat === 'neuron'
      ? 'thin branches drawn wider at a distance.'
      : 'signal shown as light; colour and timing; myelin; thin branches drawn wider at a distance.'

  return (
    <div className={`stage beat-${beat}`}>
      <Canvas
        className="canvas"
        aria-hidden="true"
        dpr={[1, COARSE ? 1.5 : 2]}
        camera={{ fov: 24, near: 0.005, far: 200, position: [0, 0, 20] }}
        gl={{ antialias: COARSE, toneMapping: COARSE ? AgXToneMapping : NoToneMapping, toneMappingExposure: 1.0 }}
      >
        <color attach="background" args={['#07080A']} />
        <hemisphereLight args={['#B9C0CC', '#07080A', 0.22]} />
        {/* Soft warm-neutral key from upper front left; low cool fill; violet back-rims. */}
        <directionalLight position={[-3, 5, 4]} intensity={2.0} color="#FFF1E6" />
        <directionalLight position={[3, -2, 2]} intensity={0.35} color="#A9B8C9" />
        <directionalLight position={[4, 2, -6]} intensity={1.6} color="#8F86B3" />
        <directionalLight position={[-4, -1, -5]} intensity={0.9} color="#8F86B3" />
        <Neuron />
      </Canvas>

      <div className="scrim" aria-hidden="true" />
      <div className="labels3d" aria-hidden="true">
        {labels.map((l) => (
          <div key={`${beat}-${l.key}`} className="tag3d" ref={(el) => { labelEls[l.key] = el }}>
            <i />
            <span>
              <b>{l.name}</b>
              {l.role && <small>{l.role}</small>}
            </span>
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

      <div className="scalebar" aria-hidden="true" ref={(el) => { scaleBar.el = el }}>
        <i />
        <span>100 µm</span>
      </div>

      <div className="dock">
        <ul className="sr-only">
          {labels.map((l) => <li key={l.key}>{l.name}{l.role ? `: ${l.role}` : ''}</li>)}
        </ul>
        <dl className="legend">
          <div><dt>Recorded</dt><dd>the cell's shape and the axon's path.</dd></div>
          <div><dt>Illustrative</dt><dd>{illustrative}</dd></div>
        </dl>
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
          Neuron: NeuroMorpho.Org 290955 (Mohan et al. 2015) · CC BY 4.0 ·{' '}
          <button ref={sourcesButton} className="link" onClick={() => sources.current?.showModal()}>Sources and changes</button>
        </p>
      </div>

      <dialog
        ref={sources}
        className="sources"
        aria-labelledby="sources-title"
        onClose={() => sourcesButton.current?.focus()}
        onClick={(e) => { if (e.target === e.currentTarget) sources.current?.close() }}
      >
        <h2 id="sources-title">Sources and changes</h2>
        <h3>Neuron</h3>
        <p>
          Human pyramidal neuron, middle temporal gyrus, layer 2/3 (hemisphere not recorded). NeuroMorpho.Org 290955
          (790_Mohan_etal_2015). Licensed under{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>.
        </p>
        <ol>
          <li>Mohan H, et al. (2015). <i>Cerebral Cortex</i>. doi:10.1093/cercor/bhv188</li>
          <li>NeuroMorpho.Org (RRID:SCR_002145)</li>
          <li>Tecuatl C, Ljungquist B, Ascoli GA (2024). <i>FASEB BioAdvances</i> 6(7):207–221. doi:10.1096/fba.2024-00048</li>
        </ol>
        <h3>Changes made</h3>
        <ul>
          <li>Rotated so the apical dendrite points up; simplified within 0.5 µm; the signal path keeps every recorded point.</li>
          <li>Drawn as tubes from the recorded radii; thin branches held at a minimum on-screen width in distant views.</li>
          <li>Myelin and its gaps added for illustration; the recording does not include myelin.</li>
          <li>The cell body is drawn as the sphere stored in the standardised file.</li>
          <li>The signal is shown as violet light, slowed down; colour, light and timing are illustrative.</li>
        </ul>
        <h3>Text</h3>
        <p>OpenStax, <i>Anatomy and Physiology 2e</i>, sections 12.2, 12.4, 12.5.</p>
        <p className="note">Local proof, not for distribution.</p>
        <button className="close" onClick={() => sources.current?.close()}>Close</button>
      </dialog>

      <div className="dip" aria-hidden="true" />
      {!ready && !error && <p className="loading" role="status">Loading the neuron</p>}
      {error && <p className="loading" role="alert">{error}</p>}
    </div>
  )
}

// Keep the store reachable from the console in development.
if (import.meta.env.DEV) Object.assign(window, { __ui: ui })
