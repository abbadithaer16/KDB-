import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../../lib/scroll'
import { rig, useUI } from '../../lib/state'
import { device } from '../../lib/device'
import { useGsap } from '../../lib/useGsap'
import { Poster } from '../Poster'

const WORD = 'ÉCLAT'

/** 01 — THE AWAKENING. A beam finds the ring; the wordmark rises beneath it. */
export function Awakening() {
  const root = useRef<HTMLElement>(null)
  const loaded = useUI((s) => s.loaded)

  // time-based intro, once the preloader lifts
  useLayoutEffect(() => {
    if (!loaded || !root.current) return
    const q = gsap.utils.selector(root.current)
    const rm = device.reducedMotion
    const tl = gsap.timeline()
    tl.to(rig, { intro: 1, duration: rm ? 0.01 : 4.8, ease: 'power2.inOut' }, 0)
    tl.fromTo(
      q('.hero-word .ch > span'),
      { yPercent: 112, y: 0 },
      { yPercent: 0, y: 0, duration: rm ? 0.01 : 1.7, ease: 'expo.out', stagger: 0.085 },
      rm ? 0 : 1.55,
    )
    tl.fromTo(q('.hero-tag .rule'), { scaleX: 0 }, { scaleX: 1, duration: rm ? 0.01 : 1.4, ease: 'expo.inOut' }, rm ? 0 : 2.2)
    tl.fromTo(q('.hero-tag span, .hero-foot > *'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 1.2, ease: 'power3.out', stagger: 0.12 }, rm ? 0 : 2.6)
    if (import.meta.env.DEV) Object.assign(window, { __intro: tl })
    return () => {
      tl.kill()
    }
  }, [loaded])

  // the type leaves as the camera begins to move
  useGsap(root, () => {
    gsap.timeline({
      scrollTrigger: {
        trigger: root.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          rig.ringT = 0.12 * self.progress
        },
      },
    })
      .to('.hero-word', { yPercent: -30, opacity: 0, ease: 'none' }, 0)
      .to('.hero-tag, .hero-foot', { y: -40, opacity: 0, ease: 'none' }, 0)
    ScrollTrigger.refresh()
  })

  return (
    <section id="awakening" className="hero" ref={root} aria-label="ÉCLAT — The Art of Forever">
      {!device.webgl && <Poster name="campaign" portrait="campaign_portrait" />}
      <div className="hero-inner">
        <div />
        <div>
          <h1 className="hero-word" aria-label={WORD}>
            {WORD.split('').map((c, i) => (
              <span className="ch" key={i} aria-hidden>
                <span style={{ visibility: loaded ? 'visible' : 'hidden' }}>{c}</span>
              </span>
            ))}
          </h1>
          <div className="hero-tag">
            <i className="rule left" style={{ transform: 'scaleX(0)' }} />
            <span style={{ opacity: 0 }}>The Art of Forever</span>
            <i className="rule" style={{ transform: 'scaleX(0)' }} />
          </div>
          <div className="hero-foot">
            <span className="hide-sm" style={{ opacity: 0 }}>
              Haute joaillerie · Collection N°1
            </span>
            <span className="scroll-cue" style={{ opacity: 0 }}>
              <i />
              Scroll to discover
            </span>
            <span className="hide-sm" style={{ opacity: 0 }}>
              Aube — round brilliant solitaire
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
