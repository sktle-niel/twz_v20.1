import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { Clock, Menu, Phone, X } from 'lucide-react'
import { FacebookIcon } from './icons'
import { NAV_LINKS, SITE } from '../data/site'
import logoDark from '../assets/branding/logo-dark.png'
import css from '../styles/components/Navbar.module.css'

const TICKER_ITEMS = [
  `“${SITE.tagline}”`,
  'CASA-Quality Service',
  'Genuine Parts & Accessories',
  `Since ${SITE.since}`,
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  /* Close the menu on navigation; lock body scroll and allow Escape while open. */
  useEffect(() => setOpen(false), [location.pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className={css.header}>
      {/* Tagline ticker (static under prefers-reduced-motion) */}
      <div className={css.topbar}>
        <div className={css.ticker} aria-hidden="true">
          {[0, 1].map((n) => (
            <span key={n} className={css.tickerGroup}>
              {TICKER_ITEMS.map((item) => (
                <span key={item} className={css.tickerItem}>
                  {item}
                </span>
              ))}
            </span>
          ))}
        </div>
        <p className="sr-only">{SITE.tagline}</p>
      </div>

      <nav className={css.nav} aria-label="Main navigation">
        <div className={`container ${css.navInner}`}>
          <Link to="/" className={css.brand} aria-label="Two Wheels Zone, home">
            <img src={logoDark} alt="Two Wheels Zone" />
          </Link>

          {/* Desktop links */}
          <ul className={css.links}>
            {NAV_LINKS.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    isActive ? `${css.link} ${css.linkActive}` : css.link
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
            <li className={css.ctaItem}>
              <NavLink to="/contact" className="btn btn--solid btn--sm">
                Contact Us
              </NavLink>
            </li>
          </ul>

          {/* Mobile menu button */}
          <button
            type="button"
            className={css.toggle}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu size={26} aria-hidden />
          </button>
        </div>
      </nav>

      {/* Full-screen takeover menu (mobile / tablet) */}
      <div
        id="mobile-menu"
        className={`${css.menu} ${open ? css.menuOpen : ''}`}
        inert={!open}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className={`container ${css.menuHead}`}>
          <img className={css.menuLogo} src={logoDark} alt="Two Wheels Zone" />
          <button
            type="button"
            className={css.menuClose}
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <X size={26} aria-hidden />
          </button>
        </div>

        <nav className={`container ${css.menuBody}`} aria-label="Menu">
          <ul className={css.menuLinks}>
            {NAV_LINKS.map(({ to, label }, i) => (
              <li
                key={to}
                className={css.menuItem}
                style={{ transitionDelay: open ? `${160 + i * 55}ms` : '0ms' }}
              >
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    isActive ? `${css.menuLink} ${css.menuLinkActive}` : css.menuLink
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
            <li
              className={css.menuItem}
              style={{
                transitionDelay: open ? `${160 + NAV_LINKS.length * 55}ms` : '0ms',
              }}
            >
              <NavLink to="/contact" className={css.menuContact}>
                Contact Us
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className={css.menuFoot}>
          <div className={`container ${css.menuMeta}`}>
            <a href={SITE.phoneHref}>
              <Phone size={16} aria-hidden />
              {SITE.phone}
            </a>
            <p>
              <Clock size={16} aria-hidden />
              {SITE.hours}
            </p>
            <a href={SITE.facebook} target="_blank" rel="noreferrer">
              <FacebookIcon size={16} />
              Facebook
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
