import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { gsap, lockScroll } from '../lib/scroll'
import { ui, useUI } from '../lib/state'
import { PRODUCTS, productById } from '../lib/products'
import { useFocusTrap } from '../lib/useFocusTrap'

export function openEnquiry(productId: string | null) {
  ui.set({ enquiryOpen: true, enquiryProduct: productId })
  lockScroll(true)
}

function closeEnquiry() {
  ui.set({ enquiryOpen: false })
  // keep the page locked if the product panel is still open underneath
  if (ui.get().mode === 'scroll') lockScroll(false)
}

type Errors = Partial<Record<'name' | 'email', string>>

/**
 * Private viewing / enquiry — a DEMONSTRATION. The form validates locally and
 * shows a confirmation; nothing is transmitted or stored.
 */
export function Enquiry() {
  const open = useUI((s) => s.enquiryOpen)
  const productId = useUI((s) => s.enquiryProduct)
  const card = useRef<HTMLDivElement>(null)
  const first = useRef<HTMLInputElement>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [done, setDone] = useState<null | { name: string; piece: string; format: string }>(null)
  useFocusTrap(card, open)

  useEffect(() => {
    if (open) {
      setDone(null)
      setErrors({})
    }
  }, [open])

  useLayoutEffect(() => {
    if (!open || !card.current) return
    gsap.fromTo(card.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out' })
    first.current?.focus({ preventScroll: true })
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeEnquiry()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = String(fd.get('name') || '').trim()
    const email = String(fd.get('email') || '').trim()
    const errs: Errors = {}
    if (name.length < 2) errs.name = 'Please enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errs.email = 'Please enter a valid email address.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    const piece = productById(String(fd.get('piece')))?.name ?? 'the collection'
    setDone({ name, piece, format: String(fd.get('format')) })
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="enq-title" onClick={(e) => e.target === e.currentTarget && closeEnquiry()}>
      <div className="modal-card" ref={card} data-lenis-prevent>
        <button className="detail-close modal-x" onClick={closeEnquiry} aria-label="Close">
          <i />
        </button>
        {!done ? (
          <>
            <span className="eyebrow">Private viewing</span>
            <h2 id="enq-title">Request an appointment</h2>
            <div className="demo-banner" role="note">
              <b>Demo</b>
              <span>
                This is a portfolio demonstration. The form checks your entries locally, but nothing is sent, stored or
                shared.
              </span>
            </div>
            <form onSubmit={submit} noValidate>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="enq-name">Name</label>
                  <input ref={first} id="enq-name" name="name" autoComplete="off" aria-invalid={!!errors.name} aria-describedby="enq-name-err" />
                  {errors.name && <span className="err" id="enq-name-err">{errors.name}</span>}
                </div>
                <div className="field">
                  <label htmlFor="enq-email">Email</label>
                  <input id="enq-email" name="email" type="email" autoComplete="off" aria-invalid={!!errors.email} aria-describedby="enq-email-err" />
                  {errors.email && <span className="err" id="enq-email-err">{errors.email}</span>}
                </div>
                <div className="field full">
                  <label htmlFor="enq-piece">Piece</label>
                  <select id="enq-piece" name="piece" defaultValue={productId ?? ''}>
                    <option value="">The whole collection</option>
                    {PRODUCTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.kind}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field full">
                  <fieldset>
                    <legend>Viewing</legend>
                    <div className="seg">
                      <label>
                        <input type="radio" name="format" value="In the salon" defaultChecked />
                        <span>In the salon</span>
                      </label>
                      <label>
                        <input type="radio" name="format" value="By video" />
                        <span>By video</span>
                      </label>
                    </div>
                  </fieldset>
                </div>
                <div className="field full">
                  <label htmlFor="enq-msg">Message (optional)</label>
                  <textarea id="enq-msg" name="message" rows={3} />
                </div>
              </div>
              <div className="modal-actions">
                <span className="eyebrow" style={{ color: 'var(--ivory-dim)' }}>
                  Nothing will be sent
                </span>
                <button className="btn btn--solid" type="submit">
                  Preview request
                  <span className="btn-arrow" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div aria-live="polite">
            <span className="eyebrow">Demo confirmation</span>
            <h2 id="enq-title">Thank you, {done.name.split(' ')[0]}.</h2>
            <p className="body-copy" style={{ maxWidth: 'none' }}>
              On a live site, your request to view <em>{done.piece}</em> ({done.format.toLowerCase()}) would now go to the
              client team.
            </p>
            <div className="demo-banner" role="note">
              <b>Demo</b>
              <span>No request has been sent and nothing has been stored. This screen only shows how the flow would feel.</span>
            </div>
            <div className="modal-actions">
              <span />
              <button className="btn" onClick={closeEnquiry}>
                Close
                <span className="btn-arrow" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
