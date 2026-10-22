import { useRef } from 'react'
import { gsap } from '../../lib/scroll'
import { device } from '../../lib/device'
import { phases, updateStage } from '../../lib/stage'
import { useGsap } from '../../lib/useGsap'
import { Picture } from '../Picture'

/**
 * 03 — EDITORIAL CAMPAIGN. The photograph opens from a single vertical line of
 * light over the ring, widens to full bleed, and settles with a slow zoom.
 */
export function Campaign() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, () => {
    const rm = device.reducedMotion
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: rm ? true : 0.8,
        onUpdate: (self) => {
          phases.campaign = self.progress
          updateStage()
        },
      },
    })
    tl.fromTo(
      '.campaign-media',
      { clipPath: 'inset(50% 49.85% 50% 49.85%)' },
      { clipPath: 'inset(0% 49.85% 0% 49.85%)', duration: 0.08, ease: 'power2.in' },
      0.0,
    )
      .to('.campaign-media', { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.34, ease: 'power3.inOut' }, 0.08)
      .fromTo('.campaign-media img', { scale: rm ? 1.05 : 1.32 }, { scale: 1.06, duration: 0.45, ease: 'power2.out' }, 0)
      .to('.campaign-media img', { scale: 1.0, yPercent: rm ? 0 : -2, duration: 0.55 }, 0.45)
      .fromTo('.campaign-shade', { opacity: 0 }, { opacity: 1, duration: 0.12 }, 0.4)
      .fromTo('.campaign-copy .eyebrow', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.08 }, 0.44)
      .fromTo('.campaign-copy h2 .line > span', { yPercent: 105 }, { yPercent: 0, duration: 0.12, stagger: 0.04, ease: 'power3.out' }, 0.46)
      .fromTo('.campaign-copy .rule', { scaleX: 0 }, { scaleX: 1, duration: 0.1 }, 0.56)
      .fromTo('.campaign-copy p, .campaign-credit', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.1, stagger: 0.03 }, 0.58)
      .set({}, {}, 1)
  })

  return (
    <section id="campaign" className="campaign" ref={root} aria-label="Campaign">
      <div className="sticky">
        <div className="campaign-media" style={{ clipPath: 'inset(50% 50% 50% 50%)' }}>
          <Picture
            name="campaign"
            portrait="campaign_portrait"
            alt="Aube solitaire ring standing on dark slate in a single pool of warm light"
            sizes="100vw"
            eager
          />
          <div className="campaign-shade" />
        </div>
        <div className="campaign-copy">
          <span className="eyebrow">03 — Campaign · Lumière Noire</span>
          <h2>
            <span className="line">
              <span>Light,</span>
            </span>
            <span className="line">
              <span className="serif-italic">held still.</span>
            </span>
          </h2>
          <i className="rule" style={{ width: 90, marginBottom: 20 }} />
          <p className="body-copy">
            Aube, photographed in one pool of warm light on dark slate. No props, no colour but the gold — only the
            stone and what it does with light.
          </p>
        </div>
        <span className="campaign-credit">Path-traced still · ÉCLAT studio</span>
      </div>
    </section>
  )
}
