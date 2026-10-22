import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { gsap, lockScroll, ScrollTrigger } from '../lib/scroll'
import { ui, useUI } from '../lib/state'
import { device } from '../lib/device'
import { imageUrl } from './Picture'

/** Critical images: the first full-bleed photograph the visitor will meet. */
function preloadCritical(): Promise<void> {
  const tall = window.innerWidth / window.innerHeight < 0.8
  const key = tall ? 'campaign_portrait' : 'campaign'
  const url = imageUrl(key, Math.min(2400, window.innerWidth * Math.min(2, window.devicePixelRatio || 1)))
  return new Promise((res) => {
    const img = new Image()
    img.onload = img.onerror = () => res()
    img.src = url
  })
}

/** 00 — PRELOADER. Real progress (models, HDRI, shaders, fonts, key image). */
export function Preloader() {
  const { progress: threeProgress } = useProgress()
  const glReady = useUI((s) => s.glReady)
  const [assets, setAssets] = useState({ fonts: false, image: false })
  const [gone, setGone] = useState(false)
  const shown = useRef({ v: 0 })
  const root = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLElement>(null)
  const num = useRef<HTMLSpanElement>(null)
  const started = useRef(performance.now())

  useEffect(() => {
    history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    lockScroll(true)
    document.fonts.ready.then(() => setAssets((a) => ({ ...a, fonts: true })))
    preloadCritical().then(() => setAssets((a) => ({ ...a, image: true })))
  }, [])

  const webglPart = device.webgl ? (glReady ? 1 : Math.min(0.96, threeProgress / 100)) : 1
  const target = (webglPart * 0.78 + (assets.fonts ? 0.08 : 0) + (assets.image ? 0.14 : 0)) * 100
  const complete = (device.webgl ? glReady : true) && assets.fonts && assets.image

  useEffect(() => {
    gsap.to(shown.current, {
      v: target,
      duration: 0.8,
      ease: 'power2.out',
      overwrite: true,
      onUpdate: () => {
        if (bar.current) bar.current.style.transform = `scaleX(${shown.current.v / 100})`
        if (num.current) num.current.textContent = String(Math.round(shown.current.v)).padStart(3, '0')
      },
    })
  }, [target])

  useEffect(() => {
    if (!complete || !root.current) return
    const wait = Math.max(0, 900 - (performance.now() - started.current)) / 1000
    const q = gsap.utils.selector(root.current)
    const tl = gsap.timeline({ delay: wait + 0.35 })
    tl.to(q('.preloader-mark span'), { yPercent: -110, duration: 0.9, ease: 'expo.in', stagger: 0.04 })
      .to(q('.preloader-bar, .preloader-meta'), { opacity: 0, duration: 0.5 }, '<')
      .to(root.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'expo.inOut' }, '-=0.35')
      .add(() => {
        ui.set({ loaded: true })
        lockScroll(false)
        ScrollTrigger.refresh()
      }, '-=0.75')
      .add(() => setGone(true))
    return () => {
      tl.kill()
    }
  }, [complete])

  if (gone) return null
  return (
    <div className="preloader" ref={root} role="progressbar" aria-label="Loading ÉCLAT" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(target)}>
      <div className="preloader-inner">
        <div className="preloader-mark" aria-hidden>
          {'ÉCLAT'.split('').map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
        <div className="preloader-bar">
          <i ref={bar} />
        </div>
        <div className="preloader-meta">
          <span>The Art of Forever</span>
          <span ref={num}>000</span>
        </div>
      </div>
    </div>
  )
}
