import { useRef } from 'react'
import { gsap } from '../../lib/scroll'
import { device } from '../../lib/device'
import { useGsap } from '../../lib/useGsap'
import { Picture } from '../Picture'
import { openEnquiry } from '../Enquiry'

/** 09 — FINAL CAMPAIGN + PRIVATE VIEWING. */
export function Finale() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, () => {
    const rm = device.reducedMotion
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom bottom', scrub: rm ? true : 0.8 },
    })
    tl.fromTo('.finale .bg', { clipPath: 'inset(8% 6% 8% 6%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'power2.out' }, 0)
      .fromTo('.finale .bg img', { scale: rm ? 1.02 : 1.2 }, { scale: 1, duration: 1 }, 0)
      .fromTo('.finale-copy .word', { letterSpacing: '0.5em', opacity: 0 }, { letterSpacing: '0.14em', opacity: 1, duration: 0.45, ease: 'power2.out' }, 0.35)
      .fromTo('.finale-cta > *', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.2, stagger: 0.06 }, 0.62)
  })

  return (
    <section id="finale" className="finale opaque" ref={root} aria-label="Private Viewing">
      <div className="sticky">
        <div className="bg">
          <Picture
            name="finale"
            portrait="finale_portrait"
            alt="Aube solitaire standing before the Rivière bracelet on dark slate"
            sizes="100vw"
          />
          <div className="finale-shade" />
        </div>
        <div className="finale-copy">
          <span className="word" aria-label="ÉCLAT">
            ÉCLAT
          </span>
          <span className="eyebrow" style={{ marginTop: 18 }}>
            The Art of Forever
          </span>
        </div>
        <div className="finale-cta">
          <span className="eyebrow">09 — Private Viewing</span>
          <h2>
            Some things should be seen
            <br />
            <span className="serif-italic">in person.</span>
          </h2>
          <button className="btn btn--solid" onClick={() => openEnquiry(null)} data-cursor="hover">
            Request a private viewing
            <span className="btn-arrow" />
          </button>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <div className="logo">ÉCLAT</div>
        <p>
          ÉCLAT is a fictional maison created by Hyperform as a portfolio demonstration of immersive 3D experiences for
          luxury jewellery. No products are for sale and no data is collected.
        </p>
      </div>
      <div>
        <h4>Imagery &amp; 3D</h4>
        <p>
          Ring, necklace and bracelet modelled procedurally for this demo in Blender; diamonds are 57-facet round
          brilliants. Campaign stills are path-traced renders of the same models.
        </p>
        <p>Additional reference photography supplied by the client — usage rights to be confirmed before publication.</p>
      </div>
      <div>
        <h4>Demonstration</h4>
        <p>Enquiry and private viewing forms are demonstrations only and do not send or store anything.</p>
        <p>© Hyperform — concept demo, not for public distribution.</p>
      </div>
    </footer>
  )
}
