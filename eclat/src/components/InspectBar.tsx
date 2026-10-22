import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/scroll'
import { ui, useUI } from '../lib/state'
import { exitInspect } from './sections/Bracelet'
import { openDetail } from './ProductDetail'

/** Controls shown while the bracelet is in free 360° inspection. */
export function InspectBar() {
  const mode = useUI((s) => s.mode)
  const bar = useRef<HTMLDivElement>(null)
  const done = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    if (mode !== 'inspect' || !bar.current) return
    gsap.fromTo([bar.current, '.inspect-title'], { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.08 })
    done.current?.focus({ preventScroll: true })
  }, [mode])

  useEffect(() => {
    if (mode !== 'inspect') return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && exitInspect()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode])

  if (mode !== 'inspect') return null
  return (
    <>
      <div className="inspect-title">
        <span className="eyebrow">360° inspection</span>
        <h3>Rivière</h3>
      </div>
      <div className="inspect-bar" ref={bar} role="toolbar" aria-label="Inspection controls">
        <span className="hint">Drag to rotate · Scroll or pinch to zoom</span>
        <button className="chip" onClick={() => ui.set({ resetTick: ui.get().resetTick + 1 })}>
          Reset view
        </button>
        <button
          className="chip"
          onClick={() => {
            exitInspect()
            openDetail('riviere')
          }}
        >
          Details
        </button>
        <button className="chip chip--gold" onClick={exitInspect} ref={done}>
          Done
        </button>
      </div>
    </>
  )
}
