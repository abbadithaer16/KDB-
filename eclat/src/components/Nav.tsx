import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger, lockScroll, scrollToId } from '../lib/scroll'
import { ui, useUI } from '../lib/state'
import { openEnquiry } from './Enquiry'

const LINKS = [
  { id: 'diamond', label: 'The Diamond' },
  { id: 'campaign', label: 'Campaign' },
  { id: 'necklace', label: 'Lueur' },
  { id: 'craft', label: 'Craft' },
  { id: 'bracelet', label: 'Rivière' },
  { id: 'collections', label: 'Collections' },
]

const CHAPTERS = [
  { id: 'awakening', n: '01', label: 'The Awakening' },
  { id: 'diamond', n: '02', label: 'The Diamond' },
  { id: 'campaign', n: '03', label: 'Campaign' },
  { id: 'necklace', n: '04', label: 'The Necklace' },
  { id: 'craft', n: '05', label: 'The Art of Craft' },
  { id: 'bracelet', n: '06', label: 'The Bracelet' },
  { id: 'collections', n: '07', label: 'Collections' },
  { id: 'finale', n: '09', label: 'Private Viewing' },
]

export function Nav() {
  const mode = useUI((s) => s.mode)
  const loaded = useUI((s) => s.loaded)
  const menuOpen = useUI((s) => s.menuOpen)
  const [active, setActive] = useState('awakening')
  const line = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!loaded) return
    const triggers = CHAPTERS.map((c) =>
      ScrollTrigger.create({
        trigger: `#${c.id}`,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => self.isActive && setActive(c.id),
        onUpdate: (self) => {
          if (line.current && self.isActive) line.current.style.transform = `scaleX(${self.progress})`
        },
      }),
    )
    return () => triggers.forEach((t) => t.kill())
  }, [loaded])

  const go = (id: string) => {
    if (menuOpen) {
      ui.set({ menuOpen: false })
      lockScroll(false)
    }
    scrollToId(id)
  }
  const toggleMenu = () => {
    const open = !ui.get().menuOpen
    ui.set({ menuOpen: open })
    lockScroll(open)
  }
  const hidden = mode !== 'scroll' || !loaded
  const ch = CHAPTERS.find((c) => c.id === active) ?? CHAPTERS[0]

  return (
    <>
      <header className={`nav${hidden ? ' is-hidden' : ''}`}>
        <a
          className="nav-logo"
          href="#awakening"
          onClick={(e) => {
            e.preventDefault()
            go('awakening')
          }}
          aria-label="ÉCLAT — back to top"
        >
          ÉCLAT
        </a>
        <nav className="nav-links" aria-label="Sections">
          {LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className={`link-line${active === l.id ? ' is-active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                go(l.id)
              }}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="nav-right">
          <button className="btn nav-cta" onClick={() => openEnquiry(null)} data-cursor="hover">
            Private Viewing
          </button>
          <button className={`nav-burger${menuOpen ? ' is-open' : ''}`} onClick={toggleMenu} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
            <i />
            <i />
          </button>
        </div>
      </header>

      <div className={`menu${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>
        {LINKS.map((l, i) => (
          <a
            key={l.id}
            href={`#${l.id}`}
            tabIndex={menuOpen ? 0 : -1}
            style={{ transitionDelay: menuOpen ? `${0.25 + i * 0.06}s` : '0s' }}
            onClick={(e) => {
              e.preventDefault()
              go(l.id)
            }}
          >
            <small>0{i + 2}</small>
            {l.label}
          </a>
        ))}
        <div className="menu-foot">
          <button
            className="btn btn--solid"
            tabIndex={menuOpen ? 0 : -1}
            onClick={() => {
              ui.set({ menuOpen: false })
              openEnquiry(null)
            }}
          >
            Private Viewing <span className="btn-arrow" />
          </button>
        </div>
      </div>

      <div className="chapter" style={{ opacity: hidden || active === 'collections' || active === 'finale' ? 0 : 1 }} aria-hidden>
        <b>{ch.n}</b>
        <span className="chapter-line">
          <i ref={line} />
        </span>
        <span>{ch.label}</span>
      </div>
    </>
  )
}
