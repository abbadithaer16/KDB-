import { useEffect, useRef } from 'react'
import { gsap } from '../lib/scroll'
import { rig, ui } from '../lib/state'
import { device } from '../lib/device'

/** Refined desktop cursor: a point and a lagging ring that reads the element beneath. */
export function Cursor() {
  const root = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      rig.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      rig.pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    if (device.coarse || !root.current) return () => window.removeEventListener('pointermove', onMove)

    const xDot = gsap.quickTo(dot.current, 'x', { duration: 0.12, ease: 'power3' })
    const yDot = gsap.quickTo(dot.current, 'y', { duration: 0.12, ease: 'power3' })
    const xRing = gsap.quickTo(ring.current, 'x', { duration: 0.55, ease: 'power3' })
    const yRing = gsap.quickTo(ring.current, 'y', { duration: 0.55, ease: 'power3' })
    const move = (e: PointerEvent) => {
      xDot(e.clientX)
      yDot(e.clientY)
      xRing(e.clientX)
      yRing(e.clientY)
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor], a, button, .stage.is-interactive')
      const r = root.current!
      let text = ''
      let hover = false
      if (el?.classList.contains('stage')) text = 'Drag'
      else if (el?.dataset.cursor === 'view') text = 'View'
      else if (el) hover = true
      if (ui.get().mode !== 'scroll' && !el) text = ''
      r.classList.toggle('is-label', !!text)
      r.classList.toggle('is-hover', hover && !text)
      if (label.current) label.current.textContent = text
    }
    const leave = () => gsap.to(root.current, { opacity: 0, duration: 0.3 })
    const enter = () => gsap.to(root.current, { opacity: 1, duration: 0.3 })
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    document.addEventListener('pointerenter', enter)
    document.documentElement.style.cursor = 'none'
    const style = document.createElement('style')
    style.textContent = 'a,button,select,label,.stage.is-interactive{cursor:none!important}'
    document.head.appendChild(style)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      document.removeEventListener('pointerenter', enter)
      document.documentElement.style.cursor = ''
      style.remove()
    }
  }, [])

  if (device.coarse) return null
  return (
    <div className="cursor" ref={root} aria-hidden>
      <div className="cursor-ring" ref={ring}>
        <span ref={label} />
      </div>
      <div className="cursor-dot" ref={dot} />
    </div>
  )
}
