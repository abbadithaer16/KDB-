import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { device } from './device'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

let lenis: Lenis | null = null

export function initScroll() {
  if (lenis || device.reducedMotion) {
    ScrollTrigger.refresh()
    return () => {}
  }
  lenis = new Lenis({
    duration: 1.25,
    easing: (t) => 1 - Math.pow(1 - t, 4),
    smoothWheel: true,
    touchMultiplier: 1.4,
  })
  lenis.on('scroll', ScrollTrigger.update)
  if (import.meta.env.DEV) (window as unknown as { __lenis: Lenis }).__lenis = lenis
  const raf = (time: number) => lenis?.raf(time * 1000)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)
  return () => {
    gsap.ticker.remove(raf)
    lenis?.destroy()
    lenis = null
  }
}

export function lockScroll(locked: boolean) {
  if (locked) {
    lenis?.stop()
    document.body.classList.add('is-locked')
  } else {
    lenis?.start()
    document.body.classList.remove('is-locked')
  }
}

export function scrollToId(id: string, offset = 0) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset, duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) })
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: 'auto' })
}

export { gsap, ScrollTrigger }
