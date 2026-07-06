import { Link } from 'react-router-dom'
import { Clock, MapPin, Phone } from 'lucide-react'
import { FacebookIcon } from './icons'
import { PARTNERS, SITE } from '../data/site'
import logoDark from '../assets/branding/logo-dark.png'
import css from '../styles/components/Footer.module.css'

const EXPLORE = [
  { to: '/about', label: 'About Us' },
  { to: '/services', label: 'Services' },
  { to: '/casa-quality', label: 'Casa Quality' },
  { to: '/branches', label: 'Branches' },
]

const BUSINESS = [
  { to: '/franchise', label: 'Franchise Us' },
  { to: '/contact', label: 'Contact Us' },
]

const LEGAL = [
  { to: '/terms-of-service', label: 'Terms of Service' },
  { to: '/privacy-policy', label: 'Privacy Policy' },
]

export default function Footer() {
  return (
    <footer className={css.footer}>
      <div className="container">
        <div className={css.grid}>
          <div>
            <img className={css.brandLogo} src={logoDark} alt="Two Wheels Zone" />
            <p className={css.desc}>{SITE.description}</p>
            <ul className={css.contact}>
              <li>
                <Phone size={16} aria-hidden />
                <a href={SITE.phoneHref}>{SITE.phone}</a>
              </li>
              <li>
                <MapPin size={16} aria-hidden />
                <span>{SITE.address}</span>
              </li>
              <li>
                <Clock size={16} aria-hidden />
                <span>{SITE.hours}</span>
              </li>
            </ul>
            <a
              className={css.social}
              href={SITE.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Two Wheels Zone on Facebook"
            >
              <FacebookIcon size={18} />
            </a>
          </div>

          <FooterColumn title="Explore" links={EXPLORE} />
          <FooterColumn title="Business" links={BUSINESS} />
          <FooterColumn title="Legal" links={LEGAL} />
        </div>

        <div className={css.partners} aria-label="Brands we carry">
          {PARTNERS.map((brand) => (
            <span key={brand} className={css.partnerBadge}>
              {brand}
            </span>
          ))}
        </div>

        <div className={css.bottom}>
          <p>
            © {SITE.since}-{new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p className={css.tagline}>Powering your ride since {SITE.since}</p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { to: string; label: string }[]
}) {
  return (
    <nav aria-label={title}>
      <h3 className={css.heading}>{title}</h3>
      <ul className={css.linkList}>
        {links.map(({ to, label }) => (
          <li key={to}>
            <Link to={to}>{label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
