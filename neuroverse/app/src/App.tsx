import { useEffect, useRef, useState } from 'react'
import { Stage } from './Stage'
import { BEATS, STEPS, beatIndexById } from './content'
import type { LabelDef } from './content'
import { director } from './director'
import { COARSE, DEBUG, ui, useUI } from './state'
import type { CortexMode } from './state'
import { labelEls, threadEls } from './labels'
import { TextVersion } from './ui/TextVersion'
import { Sources } from './ui/Sources'
import { Help } from './ui/Help'
import { rig } from './rig'

const fullscreenOK = typeof document !== 'undefined' && !!document.documentElement.requestFullscreen

export function App() {
  const webgl = useUI((s) => s.webgl)
  const textVersion = useUI((s) => s.textVersion)
  useEffect(() => {
    // Feature-detect WebGL2 before mounting the canvas; without it, the text version is the experience.
    try {
      const c = document.createElement('canvas')
      if (!c.getContext('webgl2')) ui.set({ webgl: false })
    } catch {
      ui.set({ webgl: false })
    }
  }, [])
  if (!webgl || textVersion) return <TextVersion />
  return <Presentation />
}

function Presentation() {
  const beat = useUI((s) => s.beat)
  const transitioning = useUI((s) => s.transitioning)
  const explore = useUI((s) => s.explore)
  const selected = useUI((s) => s.selected)
  const brainReady = useUI((s) => s.brainReady)
  const neuronReady = useUI((s) => s.neuronReady)
  const reduced = useUI((s) => s.reduced)
  const cortex = useUI((s) => s.cortex)
  const ref = BEATS[beat]
  const { step, stepIndex, beat: b } = ref
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const helpOpen = useUI((s) => s.help)
  const sourcesBtn = useRef<HTMLButtonElement>(null)
  const ready = brainReady && (!b.id.startsWith('signal') || neuronReady)

  // Deep link on load, and the back/forward buttons or an edited address.
  useEffect(() => {
    director.jump(ui.get().beat)
    const onHash = () => {
      const i = beatIndexById(decodeURIComponent(window.location.hash.slice(1)))
      if (i >= 0 && i !== ui.get().beat) director.jump(i)
    }
    window.addEventListener('hashchange', onHash)
    if (DEBUG) Object.assign(window, { __nv: { ui, rig, director, go: (i: number) => director.jump(i) } })
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Keyboard map (interaction spec): clickers send PageDown / PageUp.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const s = ui.get()
      if (document.querySelector('dialog[open]')) return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return
      const k = e.key
      if (k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && tag !== 'BUTTON')) director.next()
      else if (k === 'ArrowLeft' || k === 'PageUp') director.previous()
      else if (k === 'Home') director.first()
      else if (k === 'End') director.last()
      else if (k === 'f' || k === 'F') toggleFullscreen()
      else if (k === '?') ui.set({ help: true })
      else if (k === 'e' || k === 'E') { if (BEATS[s.beat].beat.explore && !s.transitioning) ui.set({ explore: !s.explore, selected: null }) }
      else if (k === 'r' || k === 'R') { if (s.explore) window.dispatchEvent(new Event('neuroverse:reset')); else director.replay() }
      else if (k === 'Escape') {
        if (s.explore) ui.set({ explore: false })
        else if (s.selected) ui.set({ selected: null })
        else return
      } else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Touch: a horizontal swipe outside Explore Mode moves one beat (a shortcut; buttons remain).
  useEffect(() => {
    let x0 = 0, y0 = 0, t0 = 0, id = -1
    const down = (e: PointerEvent) => { if (e.pointerType !== 'touch' || ui.get().explore) return; x0 = e.clientX; y0 = e.clientY; t0 = performance.now(); id = e.pointerId }
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return
      id = -1
      const dx = e.clientX - x0, dy = e.clientY - y0
      if (performance.now() - t0 < 600 && Math.abs(dx) > 60 && Math.abs(dx) > 1.5 * Math.abs(dy)) (dx < 0 ? director.next : director.previous)()
    }
    const cancel = () => { id = -1 }
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cancel)
    return () => { window.removeEventListener('pointerdown', down); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', cancel) }
  }, [])

  const isMind = b.id === 'mind'
  const showLabels = ready && !transitioning && !explore
  const replayable = b.id === 'signal-axon' || b.id === 'signal-synapse'
  const announce = transitioning ? '' : `Step ${stepIndex + 1} of 5, ${step.title}. ${b.caption ?? ''}. ${selected ? `${b.labels.find((l) => l.key === selected)?.name} selected.` : ''} ${explore ? 'Explore mode on.' : ''}`

  return (
    <div className={`stage beat-${b.id} step-${step.id} ${transitioning ? 'is-moving' : ''} ${explore ? 'is-exploring' : ''}`}>
      <Stage />
      <div className="scrim" aria-hidden="true" />

      {!isMind && (
        <div className={`labels3d ${showLabels ? '' : 'is-hidden'}`}>
          {b.labels.map((l) => <Annotation key={`${b.id}-${l.key}`} label={l} selected={selected} />)}
        </div>
      )}
      {isMind && <Threads labels={b.labels} visible={showLabels || transitioning} />}

      <header className="masthead">
        <p className="wordmark">Neuroverse</p>
        <h1 key={step.id}>{step.title}</h1>
        <p className="statement">{b.statement}</p>
      </header>

      <nav className="progress" aria-label="Presentation progress">
        <span className="ticks" aria-hidden="true">{STEPS.map((s, i) => <i key={s.id} className={i === stepIndex ? 'is-now' : i < stepIndex ? 'is-done' : ''} />)}</span>
        <span>{stepIndex + 1} of 5</span>
        {fullscreenOK && <button className="icon" onClick={toggleFullscreen} aria-label="Full screen">Full screen <kbd>F</kbd></button>}
        <button className="icon" onClick={() => ui.set({ help: true })} aria-label="Keyboard shortcuts">Keys <kbd>?</kbd></button>
      </nav>

      <div className="dock">
        {b.caption && <p className="caption">{b.caption}</p>}
        <dl className="legend">
          <div><dt>Recorded</dt><dd>{b.recorded}</dd></div>
          <div><dt>Illustrative</dt><dd>{b.illustrative}</dd></div>
        </dl>
        {isMind || b.labels.length === 0 ? null : (
          <ul className="label-list" aria-label="Labelled structures">
            {b.labels.map((l) => (
              <li key={l.key}>
                {l.regions ? (
                  <button aria-pressed={selected === l.key} className={selected === l.key ? 'is-on' : ''} onClick={() => ui.set({ selected: selected === l.key ? null : l.key })}>
                    {l.name}
                  </button>
                ) : <span>{l.name}</span>}
              </li>
            ))}
          </ul>
        )}
        {selected && <p className="caption note">Highlight colour is illustrative</p>}
        {explore && <p className="caption note">{COARSE ? 'Drag with one finger to rotate · pinch to zoom' : 'Drag to rotate · scroll to zoom'}{b.labels.some((l) => l.regions) ? ' · tap a structure' : ''}</p>}
        <div className="buttons">
          <button onClick={director.previous} disabled={beat === 0} aria-label="Previous">Previous <kbd>←</kbd></button>
          <button className="primary" onClick={director.next} disabled={!ready && !transitioning}>
            {transitioning ? 'Skip to the end' : b.nextLabel ?? 'Next'} <kbd>→</kbd>
          </button>
          {b.explore && !transitioning && (
            <button onClick={() => ui.set({ explore: !explore, selected: null })} aria-pressed={explore}>{explore ? 'Leave explore' : 'Explore'} <kbd>E</kbd></button>
          )}
          {explore && <button onClick={() => window.dispatchEvent(new Event('neuroverse:reset'))}>Reset view <kbd>R</kbd></button>}
          {explore && b.id.startsWith('memory') && !COARSE && (
            <label className="select">
              Cortex
              <select value={cortex} onChange={(e) => setCortex(e.target.value as CortexMode)}>
                <option value="translucent">Translucent</option>
                <option value="hidden">Hidden</option>
                <option value="solid">Solid</option>
              </select>
            </label>
          )}
          {replayable && !transitioning && <button onClick={director.replay}>{reduced ? (b.id === 'signal-axon' ? 'Play the signal' : 'Play the release') : b.id === 'signal-axon' ? 'Replay signal' : 'Replay release'}</button>}
        </div>
        <p className="credit">
          {b.id.startsWith('signal') && b.id !== 'signal-synapse'
            ? 'Neuron: NeuroMorpho.Org 290955 (Mohan et al. 2015) · CC BY 4.0 · '
            : b.id === 'signal-synapse' ? 'Synapse: model made for this presentation · ' : 'Brain: BodyParts3D, © DBCLS · CC BY 4.0 and CC BY-SA 2.1 JP · '}
          <button ref={sourcesBtn} className="link" onClick={() => setSourcesOpen(true)}>Sources and changes</button>
          {' · '}
          <button className="link" onClick={() => ui.set({ textVersion: true })}>Text version</button>
        </p>
      </div>

      <div className="dip" aria-hidden="true" />
      {!ready && <p className="loading" role="status">{brainReady ? 'Loading the neuron' : 'Loading the brain model'}</p>}
      <p className="sr-only" aria-live="polite">{announce}</p>
      <Sources open={sourcesOpen} onClose={() => { setSourcesOpen(false); sourcesBtn.current?.focus() }} />
      <Help open={helpOpen} onClose={() => ui.set({ help: false })} />
    </div>
  )
}

function setCortex(mode: CortexMode) {
  ui.set({ cortex: mode })
  rig.shell = mode === 'solid' ? 0 : 1
}

function toggleFullscreen() {
  if (!fullscreenOK) return
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
  else document.documentElement.requestFullscreen().catch(() => {})
}

function Annotation({ label, selected }: { label: LabelDef; selected: string | null }) {
  const on = selected === label.key
  const off = !!selected && !on
  const inner = (
    <>
      <b>{label.name}</b>
      {label.role && <small>{label.role}</small>}
    </>
  )
  return (
    <div className={`tag3d ${on ? 'is-on' : ''} ${off ? 'is-off' : ''}`} ref={(el) => { labelEls[label.key] = el }} aria-hidden="true">
      <i />
      {label.regions ? (
        <span>
          <button tabIndex={-1} onClick={() => ui.set({ selected: on ? null : label.key })}>{inner}</button>
        </span>
      ) : <span>{inner}</span>}
    </div>
  )
}

function Threads({ labels, visible }: { labels: LabelDef[]; visible: boolean }) {
  return (
    <>
      <svg className={`threads ${visible ? '' : 'is-hidden'}`} aria-hidden="true">
        {labels.map((l) => (
          <g key={l.key}>
            <line ref={(el) => { threadEls[l.key] = { ...(threadEls[l.key] ?? { label: null, dot: null }), line: el } }} />
            <circle r="3.5" ref={(el) => { threadEls[l.key] = { ...(threadEls[l.key] ?? { label: null, line: null }), dot: el } }} />
          </g>
        ))}
      </svg>
      <ol className={`synthesis ${visible ? '' : 'is-hidden'}`}>
        {labels.map((l) => (
          <li key={l.key} ref={(el) => { threadEls[l.key] = { ...(threadEls[l.key] ?? { line: null, dot: null }), label: el } }}>
            <b>{l.name}</b>
            {l.role && <small>{l.role}</small>}
          </li>
        ))}
      </ol>
    </>
  )
}
