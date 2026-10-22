import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, lockScroll } from '../lib/scroll'
import { ui, useUI, type Metal } from '../lib/state'
import { device } from '../lib/device'
import { PRODUCTS, productById } from '../lib/products'
import { METAL_TONES, applyMetal } from '../three/materials'
import { Picture } from './Picture'
import { openEnquiry } from './Enquiry'
import { useFocusTrap } from '../lib/useFocusTrap'

export function openDetail(id: string) {
  ui.set({ detailId: id, mode: 'detail', metal: 'yellow' })
  applyMetal('yellow')
  lockScroll(true)
}

export function closeDetail() {
  ui.set({ mode: 'scroll', detailId: null })
  applyMetal('yellow')
  lockScroll(false)
}

/** 08 — PRODUCT EXPERIENCE: live 3D inspection (canvas behind) + editorial panel. */
export function ProductDetail() {
  const id = useUI((s) => s.detailId)
  const metal = useUI((s) => s.metal)
  const product = productById(id)
  const panel = useRef<HTMLDivElement>(null)
  const [feature, setFeature] = useState(0)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const dialog = useRef<HTMLDivElement>(null)
  const enquiryOpen = useUI((s) => s.enquiryOpen)
  useFocusTrap(dialog, !!product && !enquiryOpen)

  useEffect(() => setFeature(0), [id])

  useLayoutEffect(() => {
    if (!product || !panel.current) return
    const tall = window.innerWidth < 760
    const tl = gsap.timeline()
    tl.fromTo(
      panel.current,
      { clipPath: tall ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 0% 100%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: device.reducedMotion ? 0.01 : 1.1, ease: 'expo.inOut' },
    )
    tl.fromTo(
      panel.current.querySelectorAll('.reveal'),
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.05, duration: 0.9, ease: 'power3.out' },
      '-=0.55',
    )
    panel.current.scrollTop = 0
    closeBtn.current?.focus({ preventScroll: true })
    return () => {
      tl.kill()
    }
  }, [product])

  useEffect(() => {
    if (!product) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !ui.get().enquiryOpen && closeDetail()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [product])

  if (!product) return null
  const idx = PRODUCTS.indexOf(product)
  const prev = PRODUCTS[(idx + PRODUCTS.length - 1) % PRODUCTS.length]
  const next = PRODUCTS[(idx + 1) % PRODUCTS.length]
  const setMetal = (m: Metal) => {
    ui.set({ metal: m })
    applyMetal(m)
  }

  return (
    <div className="detail" ref={dialog} role="dialog" aria-modal="true" aria-label={`${product.name} — ${product.kind}`}>
      <div className="detail-top">
        <span className="detail-crumb">
          Collections / {product.collection} / {product.name}
        </span>
        <button className="detail-close" onClick={closeDetail} ref={closeBtn} data-cursor="hover">
          Close <i />
        </button>
      </div>
      <div className="detail-view">
        {!device.webgl && (
          <div className="poster">
            <Picture name={product.images[0]} alt="" sizes="66vw" />
          </div>
        )}
        {device.webgl && (
          <div className="detail-hint">
            <button className="chip" onClick={() => ui.set({ resetTick: ui.get().resetTick + 1 })} data-cursor="hover">
              Reset view
            </button>
            <span className="hint-text eyebrow" style={{ color: 'var(--ivory-dim)' }}>
              Drag to rotate · Scroll or pinch to zoom
            </span>
          </div>
        )}
      </div>
      <div className="detail-panel" ref={panel} data-lenis-prevent>
        <span className="detail-kind reveal">{product.kind}</span>
        <h2 className="reveal">{product.name}</h2>
        <p className="detail-line reveal">{product.line}</p>
        <p className="body-copy reveal" style={{ maxWidth: 'none' }}>
          {product.description}
        </p>

        <div className="metal-select reveal" role="group" aria-label="Metal">
          {(Object.keys(METAL_TONES) as Metal[]).map((m) => (
            <button key={m} className="metal-opt" aria-pressed={metal === m} onClick={() => setMetal(m)} data-cursor="hover">
              <span className="sw" style={{ background: METAL_TONES[m].swatch }} />
              {METAL_TONES[m].label}
            </button>
          ))}
        </div>

        <dl className="specs reveal">
          {product.specs.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>

        <div className="detail-feature reveal">
          <Picture key={product.images[feature]} name={product.images[feature]} alt={`${product.name} — image ${feature + 1}`} sizes="(max-width: 760px) 100vw, 34vw" />
        </div>
        <div className="detail-gallery reveal" role="group" aria-label="Gallery">
          {product.images.map((im, i) => (
            <button key={im} aria-pressed={feature === i} onClick={() => setFeature(i)} aria-label={`Show image ${i + 1}`}>
              <Picture name={im} alt="" sizes="90px" />
            </button>
          ))}
        </div>

        <div className="detail-actions reveal">
          <button className="btn btn--solid" onClick={() => openEnquiry(product.id)} data-cursor="hover">
            Enquire about {product.name}
            <span className="btn-arrow" />
          </button>
        </div>
        <p className="detail-note reveal">
          Fictional piece created for a Hyperform demonstration. Specifications describe the 3D model shown, not a real
          item; it is not for sale and no price is given. Images marked as client references are third-party
          photographs used for mood only.
        </p>
        <nav className="detail-nav reveal" aria-label="Other pieces">
          <button className="link-line" onClick={() => openDetail(prev.id)}>
            ← {prev.name}
          </button>
          <button className="link-line" onClick={() => openDetail(next.id)}>
            {next.name} →
          </button>
        </nav>
      </div>
    </div>
  )
}
