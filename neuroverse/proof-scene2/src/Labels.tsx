import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { ui, useUI } from './state'
import { LABELS, anchorPoints } from './scene'

/**
 * Leader lines: the label column is HTML; each frame the anchor points are projected and the
 * SVG lines are written directly to the DOM (no React state per frame).
 */
export const leaderRefs: Record<string, SVGLineElement | null> = {}
export const labelRefs: Record<string, HTMLButtonElement | null> = {}

export function LeaderProjector() {
  const { camera, size } = useThree()
  const v = useRef(new Vector3())
  useFrame(() => {
    const view = ui.get().view
    for (const l of LABELS[view]) {
      const line = leaderRefs[l.id]
      const btn = labelRefs[l.id]
      const a = anchorPoints[`${view}:${l.id}`]
      if (!line || !btn || !a) continue
      v.current.copy(a).project(camera)
      const x = (v.current.x * 0.5 + 0.5) * size.width
      const y = (-v.current.y * 0.5 + 0.5) * size.height
      const r = btn.getBoundingClientRect()
      const onRight = view === 'lateral'
      line.setAttribute('x1', String(onRight ? r.left - 10 : r.right + 10))
      line.setAttribute('y1', String(r.top + r.height / 2))
      line.setAttribute('x2', String(x))
      line.setAttribute('y2', String(y))
      const dot = line.nextElementSibling as SVGCircleElement | null
      dot?.setAttribute('cx', String(x))
      dot?.setAttribute('cy', String(y))
    }
  })
  return null
}

export function LeaderLines() {
  const view = useUI((s) => s.view)
  const selected = useUI((s) => s.selected)
  const hidden = useUI((s) => s.transitioning || s.explore || !s.ready)
  return (
    <svg className={`leaders ${hidden ? 'is-hidden' : ''}`} aria-hidden="true">
      {LABELS[view].map((l) => (
        <g key={`${view}-${l.id}`} className={selected === l.id ? 'is-on' : selected ? 'is-off' : ''}>
          <line ref={(el) => { leaderRefs[l.id] = el }} />
          <circle r="3.5" />
        </g>
      ))}
    </svg>
  )
}
