import { useRef } from 'react'
import { gsap, ScrollTrigger, lockScroll } from '../../lib/scroll'
import { rig, ui } from '../../lib/state'
import { device } from '../../lib/device'
import { phases, updateStage } from '../../lib/stage'
import { useGsap } from '../../lib/useGsap'
import { Poster } from '../Poster'

const CAPS = [
  {
    at: 0.16,
    side: 'left',
    eyebrow: '06 — Rivière',
    title: (
      <>
        An unbroken <em>line of light</em>
      </>
    ),
    copy: 'Forty-two round brilliants, each in its own basket, closing in a single circle around the wrist.',
  },
  {
    at: 0.6,
    side: 'right',
    eyebrow: 'The line',
    title: (
      <>
        Every stone, <em>its own light</em>
      </>
    ),
    copy: 'Hinged links between the baskets let the line drape and turn without the stones touching.',
  },
  {
    at: 0.84,
    side: 'left',
    eyebrow: 'The clasp',
    title: (
      <>
        A box clasp, <em>a quiet catch</em>
      </>
    ),
    copy: 'The tongue slides home into the box; a side catch keeps it closed.',
  },
]

export function enterInspect() {
  ui.set({ mode: 'inspect' })
  lockScroll(true)
}
export function exitInspect() {
  ui.set({ mode: 'scroll' })
  lockScroll(false)
}

/** 06 — THE BRACELET. Studio reveal, then free 360° inspection on demand. */
export function Bracelet() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, () => {
    ScrollTrigger.create({
      trigger: root.current,
      start: 'top bottom',
      end: 'top top',
      onUpdate: (self) => {
        phases.braceEnter = self.progress
        updateStage()
      },
      onRefresh: (self) => {
        phases.braceEnter = self.progress
        updateStage()
      },
    })
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: device.reducedMotion ? true : 0.6,
        onUpdate: (self) => {
          rig.braceT = self.progress
        },
      },
    })
    gsap.utils.toArray<HTMLElement>('.shot-caption .cap-in').forEach((cap, i) => {
      const at = CAPS[i].at
      const parts = cap.querySelectorAll('.a')
      tl.fromTo(cap, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.03 }, at - 0.1)
      tl.fromTo(parts, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.07, stagger: 0.012 }, at - 0.1)
      tl.fromTo(cap.querySelector('.rule'), { scaleX: 0 }, { scaleX: 1, duration: 0.08 }, at - 0.08)
      tl.to(parts, { y: -24, opacity: 0, duration: 0.05, stagger: 0.008 }, at + 0.1)
      tl.to(cap, { autoAlpha: 0, duration: 0.02 }, at + 0.145)
    })
    if (device.webgl) tl.fromTo('.inspect-ui', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.05 }, 0.04)
    tl.set({}, {}, 1)
  })

  return (
    <section id="bracelet" className="bracelet" ref={root} aria-label="The Bracelet">
      <div className="sticky">
        {!device.webgl && <Poster name="bracelet_silk" />}
        {CAPS.map((c) => (
          <div className={`shot-caption ${c.side}`} key={c.eyebrow}>
            <div className="cap-in" style={{ opacity: 0, visibility: 'hidden' }}>
              <span className="eyebrow a" style={{ display: 'block', marginBottom: 18 }}>
                {c.eyebrow}
              </span>
              <h2 className="a">{c.title}</h2>
              <i className="rule" />
              <p className="body-copy a">{c.copy}</p>
            </div>
          </div>
        ))}
        {device.webgl && (
          <div className="inspect-ui" style={{ opacity: 0, visibility: 'hidden' }}>
            <button className="btn btn--solid" onClick={enterInspect} data-cursor="hover">
              Inspect in 360°
              <span className="btn-arrow" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
