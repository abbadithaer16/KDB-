import { useRef } from 'react'
import { gsap } from '../../lib/scroll'
import { rig } from '../../lib/state'
import { device } from '../../lib/device'
import { useGsap } from '../../lib/useGsap'
import { Poster } from '../Poster'

/** Shot windows in section progress (matches ring keys at t = .27 .50 .72 .88). */
const CAPTIONS = [
  {
    at: 0.17,
    side: 'left',
    num: 'I',
    title: (
      <>
        The <em>silhouette</em>
      </>
    ),
    copy: 'A single stone, lifted high on cathedral shoulders. Nothing competes with it; everything leads to it.',
  },
  {
    at: 0.43,
    side: 'right',
    num: 'II',
    title: (
      <>
        Fifty-seven <em>facets</em>
      </>
    ),
    copy: 'A table, a crown of stars and kites, a pavilion of mains and halves — every plane placed to send light back to the eye.',
  },
  {
    at: 0.68,
    side: 'left',
    num: 'III',
    title: (
      <>
        Four <em>claws</em>
      </>
    ),
    copy: 'Ball-tipped and polished, they hold the girdle at its corners and leave the crown open to the light.',
  },
  {
    at: 0.86,
    side: 'right',
    num: 'IV',
    title: (
      <>
        Light from <em>below</em>
      </>
    ),
    copy: 'An open gallery lets light enter the pavilion from beneath — the stone is lit from every side.',
  },
] as const

/** 02 — THE DIAMOND. Pinned, scroll-scrubbed macro choreography around the ring. */
export function Diamond() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, () => {
    const caps = gsap.utils.toArray<HTMLElement>('.shot-caption .cap-in')
    const marks = gsap.utils.toArray<HTMLElement>('.section-index span')
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: device.reducedMotion ? true : 0.6,
        onUpdate: (self) => {
          rig.ringT = 0.12 + 0.88 * self.progress
          const idx = CAPTIONS.findIndex((c, i) => {
            const next = CAPTIONS[i + 1]?.at ?? 2
            return self.progress >= c.at - 0.1 && self.progress < next - 0.1
          })
          marks.forEach((m, i) => m.classList.toggle('is-on', i === idx))
        },
      },
    })
    caps.forEach((cap, i) => {
      const at = CAPTIONS[i].at
      const parts = cap.querySelectorAll('.a')
      tl.fromTo(cap, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, at - 0.1)
      tl.fromTo(parts, { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.07, stagger: 0.012 }, at - 0.1)
      tl.fromTo(cap.querySelector('.rule'), { scaleX: 0 }, { scaleX: 1, duration: 0.08 }, at - 0.08)
      tl.to(parts, { y: -26, opacity: 0, duration: 0.05, stagger: 0.008 }, at + 0.075)
      tl.to(cap, { autoAlpha: 0, duration: 0.02 }, at + 0.12)
    })
    tl.set({}, {}, 1)
  })

  return (
    <section id="diamond" className="diamond" ref={root} aria-label="The Diamond">
      <div className="sticky">
        {!device.webgl && <Poster name="macro_diamond" />}
        {CAPTIONS.map((c) => (
          <div className={`shot-caption ${c.side}`} key={c.num}>
            <div className="cap-in" style={{ opacity: 0, visibility: 'hidden' }}>
              <span className="num a">{c.num}</span>
              <h2 className="a">{c.title}</h2>
              <i className="rule" />
              <p className="body-copy a">{c.copy}</p>
            </div>
          </div>
        ))}
        <div className="section-index" aria-hidden>
          {CAPTIONS.map((c) => (
            <span key={c.num}>{c.num}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
