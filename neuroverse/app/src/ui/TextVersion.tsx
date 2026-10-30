import { useEffect, useState } from 'react'
import { STEPS } from '../content'
import { ui, useUI } from '../state'

const BASE = import.meta.env.BASE_URL

/** Horizontal sections from the model, drawn as SVG for the text version (no WebGL needed). */
function ContourFigure() {
  const [d, setD] = useState<string | null>(null)
  useEffect(() => {
    Promise.all([fetch(`${BASE}data/contours.json`).then((r) => r.json()), fetch(`${BASE}data/contours.bin`).then((r) => r.arrayBuffer())])
      .then(([meta, buf]: [{ scale: number; planes: { start: number; count: number }[] }, ArrayBuffer]) => {
        const raw = new Int16Array(buf)
        const parts: string[] = []
        for (const k of [6, 14, 22, 30]) {
          const p = meta.planes[k]
          for (let s = p.start; s < p.start + p.count; s++) {
            const f = (i: number) => (raw[s * 4 + i] * meta.scale * 100).toFixed(1)
            // seen from above, anterior up: screen x = patient left-right (z), screen y = front-back (x)
            parts.push(`M${f(1)} ${f(0)}L${f(3)} ${f(2)}`)
          }
        }
        setD(parts.join(''))
      })
      .catch(() => setD(null))
  }, [])
  if (!d) return null
  return (
    <figure className="tv-figure">
      <svg viewBox="-80 -100 160 190" role="img" aria-label="Four horizontal sections of the brain model, seen from above, front at the top">
        <path d={d} fill="none" stroke="currentColor" strokeWidth="0.35" />
      </svg>
      <figcaption>Four horizontal sections cut from the 3D brain model, seen from above, front at the top.</figcaption>
    </figure>
  )
}

/** The complete presentation as text: the non-WebGL fallback and an accessible alternative. */
export function TextVersion() {
  const webgl = useUI((s) => s.webgl)
  return (
    <main className="text-version">
      <header>
        <p className="wordmark">Neuroverse</p>
        <h1>An introduction to the human brain</h1>
        <p className="tv-lede">Text version of the five-step presentation, with every label and source.</p>
        {webgl && <button className="link" onClick={() => ui.set({ textVersion: false })}>Return to the 3D presentation</button>}
      </header>
      {STEPS.map((step, i) => (
        <section key={step.id} aria-labelledby={`tv-${step.id}`}>
          <p className="tv-step">Step {i + 1} of 5</p>
          <h2 id={`tv-${step.id}`}>{step.title}</h2>
          {i === 0 && <ContourFigure />}
          {step.beats.map((b) => (
            <div key={b.id} className="tv-beat">
              <p>{b.statement}</p>
              {b.caption && <p className="tv-caption">{b.caption}</p>}
              {b.labels.length > 0 && (
                <ul>
                  {b.labels.map((l) => <li key={l.key}><b>{l.name}</b>{l.role ? `: ${l.role}` : ''}</li>)}
                </ul>
              )}
              <p className="tv-caption">Recorded: {b.recorded} Illustrative: {b.illustrative}</p>
            </div>
          ))}
        </section>
      ))}
      <footer>
        <p>
          Brain model adapted from BodyParts3D, © The Database Center for Life Science (CC BY 4.0 and CC BY-SA 2.1 Japan; see
          the licence note in the presentation). Neuron: NeuroMorpho.Org 290955, Mohan et al. 2015, CC BY 4.0. Text: OpenStax,
          Anatomy and Physiology 2e.
        </p>
      </footer>
    </main>
  )
}
