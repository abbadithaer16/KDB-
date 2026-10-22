import { useRef } from 'react'
import { gsap, ScrollTrigger } from '../../lib/scroll'
import { device } from '../../lib/device'
import { phases, updateStage } from '../../lib/stage'
import { useGsap } from '../../lib/useGsap'
import { Picture } from '../Picture'

const CHAPTERS = [
  {
    num: '01',
    title: 'The cut',
    img: 'macro_diamond',
    alt: 'Macro of a round brilliant diamond held in four gold claws',
    inset: 'client_ring_pear',
    insetAlt: 'Pear-shaped diamond solitaire in white metal (client-supplied reference)',
    copy: 'A round brilliant is a study in fifty-seven planes. The angle of the crown and the depth of the pavilion decide whether light returns to the eye or escapes through the back of the stone.',
  },
  {
    num: '02',
    title: 'The basket',
    img: 'bracelet_macro',
    alt: 'Close view of a line bracelet: four-claw baskets and hinged links',
    copy: 'Each stone in Rivière sits in its own four-claw basket. Small hinges between the baskets let the line move like fabric while every stone keeps its own light.',
    wide: true,
  },
  {
    num: '03',
    title: 'The chain',
    img: 'macro_chain',
    alt: 'Fine gold cable chain and a solitaire pendant lying on dark slate',
    copy: 'In a cable chain each oval link turns ninety degrees from the last. The chain falls without kinking and catches light at every angle as it moves.',
  },
  {
    num: '04',
    title: 'The finish',
    img: 'client_ring_round',
    alt: 'Round solitaire ring in yellow gold on a dark surface (client-supplied reference)',
    copy: 'A mirror polish is the last, patient step: metal brought to a surface that reflects the stone rather than competing with it.',
  },
]

const QUOTE = 'Every facet is a decision about where the light will go.'

/** 05 — THE ART OF CRAFT. Macro photography and editorial typography. */
export function Craft() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, () => {
    const rm = device.reducedMotion
    // the opaque section rising over the necklace stage — tells the canvas when it is covered
    ScrollTrigger.create({
      trigger: root.current,
      start: 'top bottom',
      end: 'top top',
      onUpdate: (self) => {
        phases.craftEnter = self.progress
        updateStage()
      },
      onRefresh: (self) => {
        phases.craftEnter = self.progress
        updateStage()
      },
    })

    gsap.fromTo(
      '.craft-head .rule',
      { scaleX: 0 },
      { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.craft-head', start: 'top 80%', end: 'bottom 45%', scrub: true } },
    )
    gsap.fromTo(
      '.craft-head h2 .w',
      { yPercent: 100, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        stagger: 0.06,
        ease: 'power3.out',
        duration: 1.2,
        scrollTrigger: { trigger: '.craft-head', start: 'top 78%' },
      },
    )

    gsap.utils.toArray<HTMLElement>('.chapter-row').forEach((row) => {
      const media = row.querySelector('.media')
      const img = row.querySelector('.media img')
      const text = row.querySelectorAll('.text > *')
      gsap.fromTo(
        media,
        { clipPath: 'inset(100% 0% 0% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'power2.out',
          scrollTrigger: { trigger: row, start: 'top 88%', end: 'top 30%', scrub: rm ? true : 0.8 },
        },
      )
      if (!rm)
        gsap.fromTo(
          img,
          { yPercent: -12 },
          { yPercent: 0, ease: 'none', scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      gsap.fromTo(
        text,
        { y: 34, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: row, start: 'top 62%' },
        },
      )
      const inset = row.querySelector('.inset')
      if (inset)
        gsap.fromTo(
          inset,
          { clipPath: 'inset(0% 100% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            ease: 'power2.out',
            scrollTrigger: { trigger: inset, start: 'top 90%', end: 'top 55%', scrub: rm ? true : 0.8 },
          },
        )
    })

    gsap.to('.craft-quote .w', {
      opacity: 1,
      stagger: 0.1,
      ease: 'none',
      scrollTrigger: { trigger: '.craft-quote', start: 'top 82%', end: 'bottom 45%', scrub: true },
    })
  })

  return (
    <section id="craft" className="craft opaque" ref={root} aria-label="The Art of Craft">
      <header className="craft-head">
        <div>
          <span className="eyebrow">05 — The Art of Craft</span>
          <h2 aria-label="Made slowly, by hand and by eye.">
            {['Made', 'slowly,'].map((w) => (
              <span key={w} style={{ display: 'inline-block', overflow: 'hidden', marginRight: '0.22em' }}>
                <span className="w" style={{ display: 'inline-block' }}>
                  {w}
                </span>
              </span>
            ))}
            <br />
            {['by', 'hand', 'and'].map((w) => (
              <span key={w} style={{ display: 'inline-block', overflow: 'hidden', marginRight: '0.22em' }}>
                <span className="w" style={{ display: 'inline-block' }}>
                  {w}
                </span>
              </span>
            ))}
            <span style={{ display: 'inline-block', overflow: 'hidden' }}>
              <em className="w serif-italic" style={{ display: 'inline-block' }}>
                by eye.
              </em>
            </span>
          </h2>
        </div>
        <p className="body-copy" style={{ justifySelf: 'end' }}>
          Four close studies of the decisions that make a piece of high jewellery — the cut, the basket, the chain and
          the finish — seen at the scale of the metal itself.
        </p>
        <i className="rule" />
      </header>

      {CHAPTERS.map((c, i) => (
        <article className={`chapter-row${i % 2 ? ' flip' : ''}`} key={c.num}>
          <div className={`media${c.wide ? ' wide' : ''}`} data-cursor="">
            <Picture name={c.img} alt={c.alt} sizes="(max-width: 760px) 100vw, 50vw" />
          </div>
          <div className="text">
            <span className="num">{c.num}</span>
            <h3>{c.title}</h3>
            <p className="body-copy">{c.copy}</p>
            {c.inset && (
              <div className="inset">
                <Picture name={c.inset} alt={c.insetAlt ?? ''} sizes="(max-width: 760px) 46vw, 18vw" />
              </div>
            )}
          </div>
        </article>
      ))}

      <p className="craft-quote" aria-label={QUOTE}>
        {QUOTE.split(' ').map((w, i) => (
          <span className="w" key={i} aria-hidden>
            {w}&nbsp;
          </span>
        ))}
      </p>
    </section>
  )
}
