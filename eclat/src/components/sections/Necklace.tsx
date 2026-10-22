import { useRef } from 'react'
import { gsap, ScrollTrigger } from '../../lib/scroll'
import { rig } from '../../lib/state'
import { device } from '../../lib/device'
import { phases, updateStage } from '../../lib/stage'
import { useGsap } from '../../lib/useGsap'
import { Picture } from '../Picture'
import { Poster } from '../Poster'

const CAPS = [
  {
    at: 0.12,
    num: '04 — Lueur',
    title: (
      <>
        A point of light <em>at the collarbone</em>
      </>
    ),
    copy: 'A single round brilliant on a fine cable chain, shown on a black velvet form.',
  },
  {
    at: 0.84,
    num: 'The basket',
    title: (
      <>
        Six claws, <em>twisted rope</em>
      </>
    ),
    copy: 'Two rope-twist galleries bind the claws; the chain passes through loops at either side, so the stone faces forward.',
  },
]

/** 04 — THE NECKLACE. Light rises; the camera follows the chain down to the pendant. */
export function Necklace() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, () => {
    ScrollTrigger.create({
      trigger: root.current,
      start: 'top bottom',
      end: 'top top',
      onUpdate: (self) => {
        phases.neckEnter = self.progress
        updateStage()
      },
      onRefresh: (self) => {
        phases.neckEnter = self.progress
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
          rig.neckT = self.progress
        },
      },
    })
    const caps = gsap.utils.toArray<HTMLElement>('.shot-caption .cap-in')
    caps.forEach((cap, i) => {
      const at = CAPS[i].at
      const parts = cap.querySelectorAll('.a')
      tl.fromTo(cap, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.03 }, Math.max(0, at - 0.1))
      tl.fromTo(parts, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.07, stagger: 0.012 }, Math.max(0, at - 0.1))
      tl.fromTo(cap.querySelector('.rule'), { scaleX: 0 }, { scaleX: 1, duration: 0.08 }, Math.max(0, at - 0.08))
      if (i === 0) {
        tl.to(parts, { y: -24, opacity: 0, duration: 0.05, stagger: 0.008 }, at + 0.12)
        tl.to(cap, { autoAlpha: 0, duration: 0.02 }, at + 0.17)
      }
    })
    // adjacent editorial: the worn still
    tl.fromTo('.neck-photo', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.16, ease: 'power3.inOut' }, 0.34)
    tl.fromTo('.neck-photo img', { yPercent: -4, scale: 1.12 }, { yPercent: -14, scale: 1, duration: 0.36 }, 0.34)
    tl.fromTo('.neck-photo-cap', { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.44)
    tl.to('.neck-photo', { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.12, ease: 'power3.inOut' }, 0.66)
    tl.to('.neck-photo-cap', { opacity: 0, duration: 0.04 }, 0.66)
    tl.set({}, {}, 1)
  })

  return (
    <>
      <section id="necklace" className="necklace" ref={root} aria-label="The Necklace">
        <div className="sticky">
          {!device.webgl && <Poster name="worn" />}
          {CAPS.map((c) => (
            <div className="shot-caption left" key={c.num}>
              <div className="cap-in" style={{ opacity: 0, visibility: 'hidden' }}>
                <span className="eyebrow a" style={{ display: 'block', marginBottom: 18 }}>
                  {c.num}
                </span>
                <h2 className="a">{c.title}</h2>
                <i className="rule" />
                <p className="body-copy a">{c.copy}</p>
              </div>
            </div>
          ))}
          <div className="neck-editorial">
            <div className="neck-photo">
              <Picture name="worn" alt="Lueur pendant necklace on a black velvet display form" sizes="30vw" />
            </div>
            <div className="neck-photo-cap">
              <span>Lueur, on the form</span>
              <span>Path-traced still</span>
            </div>
          </div>
        </div>
      </section>
      <div className="neck-mobile">
        <Picture name="worn" alt="Lueur pendant necklace on a black velvet display form" sizes="100vw" />
        <p className="eyebrow" style={{ marginTop: 16 }}>
          Lueur, on the form
        </p>
        <p className="body-copy">
          The chain rests at the base of the neck and falls in a soft V to the stone — a single point of light.
        </p>
      </div>
    </>
  )
}
