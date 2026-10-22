import { useRef } from 'react'
import { gsap, ScrollTrigger } from '../../lib/scroll'
import { PRODUCTS } from '../../lib/products'
import { phases, updateStage } from '../../lib/stage'
import { useGsap } from '../../lib/useGsap'
import { Picture } from '../Picture'
import { openDetail } from '../ProductDetail'

const CARD_IMAGE: Record<string, string> = {
  aube: 'card_ring',
  lueur: 'card_necklace',
  riviere: 'bracelet_silk',
}

/** 07 — COLLECTIONS. Editorial cards → product experience. */
export function Collections() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, () => {
    ScrollTrigger.create({
      trigger: root.current,
      start: 'top bottom',
      end: 'top top',
      onUpdate: (self) => {
        phases.collEnter = self.progress
        updateStage()
      },
      onRefresh: (self) => {
        phases.collEnter = self.progress
        updateStage()
      },
    })
    gsap.fromTo(
      '.collections-head > *',
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.12, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 70%' } },
    )
    gsap.fromTo(
      '.card',
      { y: 70, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.14, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: '.cards', start: 'top 82%' } },
    )
    gsap.fromTo(
      '.card-media',
      { clipPath: 'inset(12% 8% 12% 8%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        stagger: 0.14,
        duration: 1.6,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.cards', start: 'top 82%' },
      },
    )
  })

  return (
    <section id="collections" className="collections opaque" ref={root} aria-label="Collections">
      <header className="collections-head">
        <div>
          <span className="eyebrow">07 — Collections</span>
          <h2>
            Three ways
            <br />
            <span className="serif-italic">to hold light</span>
          </h2>
        </div>
        <p className="body-copy">
          Rings, necklaces and bracelets — each piece can be turned in your hand in three dimensions, in yellow or white
          gold.
        </p>
      </header>
      <div className="cards">
        {PRODUCTS.map((p, i) => (
          <button
            key={p.id}
            className="card"
            onClick={() => openDetail(p.id)}
            data-cursor="view"
            aria-label={`${p.collection}: ${p.name}, ${p.kind}. Open in 3D`}
          >
            <div className="card-media">
              <Picture name={CARD_IMAGE[p.id]} alt="" sizes="(max-width: 760px) 80vw, 33vw" />
              <div className="card-over">
                <div>
                  <span className="eyebrow">{p.collection}</span>
                  <h3>{p.name}</h3>
                </div>
                <span className="go">
                  View in 3D <i className="btn-arrow" style={{ width: 18, height: 1, background: 'currentColor', display: 'inline-block' }} />
                </span>
              </div>
            </div>
            <div className="card-meta">
              <span className="card-num">0{i + 1}</span>
              <i className="rule" />
              <span>{p.kind}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
