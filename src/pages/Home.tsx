import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { FacebookIcon } from '../components/icons'
import Carousel, { type Slide } from '../components/Carousel'
import SectionHeading from '../components/SectionHeading'
import { useFranchiseWizard } from '../components/FranchiseWizard'
import { usePageTitle } from '../hooks/usePageTitle'
import { SITE } from '../data/site'
import { FEATURED_SERVICES } from '../data/services'
import { SHOP_LINKS } from '../data/shop'
import storefront from '../assets/hero/storefront.jpg'
import hero2 from '../assets/hero/hero-2.jpg'
import hero3 from '../assets/hero/hero-3.jpg'
import hero4 from '../assets/hero/hero-4.jpg'
import hero5 from '../assets/hero/hero-5.jpg'
import aboutImg from '../assets/about/franchise.jpg'
import motorImg from '../assets/branding/motor.png'
import css from '../styles/pages/Home.module.css'

const SLIDES: Slide[] = [
  { image: storefront, alt: 'Two Wheels Zone storefront in Palawan' },
  { image: hero2, alt: 'Motorcycle service bay' },
  { image: hero3, alt: 'Parts and accessories display' },
  { image: hero4, alt: 'Technicians working on a motorcycle' },
  { image: hero5, alt: 'Two Wheels Zone branch' },
]

export default function Home() {
  usePageTitle()
  const openFranchise = useFranchiseWizard()

  return (
    <>
      {/* ── Hero ── */}
      <Carousel slides={SLIDES}>
        <div className="container">
          <div className={css.hero}>
            <p className={css.heroKicker}>Motorcycle Service · Parts · Accessories</p>
            <h1 className={css.heroTitle}>
              <span>Alagang Casa</span> para sa mga Motorista
            </h1>
            <p className={css.heroLede}>
              CASA-quality motorcycle care, genuine parts, and expert technicians at
              prices riders can afford. Proudly serving Palawan since {SITE.since}.
            </p>
            <div className={css.heroActions}>
              <Link to="/services" className="btn btn--solid">
                Explore Services
              </Link>
              <button
                type="button"
                className={`btn btn--ghost ${css.heroGhost}`}
                onClick={openFranchise}
              >
                Franchise Now
              </button>
            </div>
          </div>
        </div>
      </Carousel>

      {/* ── Casa Quality banner ── */}
      <section className={css.casaBand}>
        <div className={`container ${css.casaBandInner}`}>
          <div>
            <h2>Services, Parts & Accessories</h2>
            <p>
              From essential motorcycle care to genuine replacement parts and quality
              upgrades. Everything your ride needs, done the Casa way.
            </p>
          </div>
          <Link to="/casa-quality" className="btn btn--dark">
            Explore Casa Quality <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
      </section>

      {/* ── About preview ── */}
      <section className="section">
        <div className={`container ${css.about}`}>
          <div className={css.aboutMedia}>
            <img src={aboutImg} alt="Inside a Two Wheels Zone workshop" loading="lazy" />
          </div>
          <div>
            <SectionHeading
              title="About Two Wheels Zone"
              lede="Two Wheels Zone is your premier destination for motorcycle parts and services. We specialize in high-quality parts, expert maintenance, and comprehensive service. It's the standard we call the Two Wheels Zone Way."
            />
            <Link to="/about" className={`btn btn--dark ${css.aboutBtn}`}>
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* ── Services preview ── */}
      <section className={`section ${css.services}`} data-on-dark>
        <div className="container">
          <SectionHeading
            center
            onDark
            kicker="What We Do"
            title="Popular Services"
            lede="FI cleaning to full overhauls, handled by skilled technicians with the right equipment."
          />
          <ul className={css.serviceGrid}>
            {FEATURED_SERVICES.map(({ name, icon: Icon }) => (
              <li key={name} className={css.serviceTile}>
                <span className={css.serviceIcon}>
                  <Icon size={26} aria-hidden />
                </span>
                {name}
              </li>
            ))}
          </ul>
          <div className={css.servicesCta}>
            <Link to="/services" className="btn btn--solid">
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* ── Shop online ── */}
      <section className={`section ${css.shop}`}>
        <div className="container">
          <SectionHeading
            center
            title="Find Us on Your Favorite Platforms"
            lede="Can't drop by the branch? Order genuine parts and accessories online."
          />
          <div className={css.shopGrid}>
            {SHOP_LINKS.map(({ name, url, image, blurb }) => (
              <article key={name} className={`card ${css.shopCard}`}>
                <img src={image} alt={`${name} logo`} loading="lazy" />
                <h3>{name}</h3>
                <p>{blurb}</p>
                <a href={url} target="_blank" rel="noreferrer" className="btn btn--dark btn--sm">
                  Visit {name} <ArrowRight size={16} aria-hidden />
                </a>
              </article>
            ))}
            <article className={`card ${css.shopCard} ${css.shopCardFb}`}>
              <span className={css.fbIcon}>
                <FacebookIcon size={38} />
              </span>
              <h3>Facebook</h3>
              <p>Message us for orders, questions, and the latest promos.</p>
              <a
                href={SITE.facebook}
                target="_blank"
                rel="noreferrer"
                className="btn btn--dark btn--sm"
              >
                Visit Facebook <ArrowRight size={16} aria-hidden />
              </a>
            </article>
          </div>
        </div>
      </section>

      {/* ── Franchise CTA ── */}
      <section className={css.franchise}>
        <div className={`container ${css.franchiseInner}`}>
          <div>
            <h2 className={css.franchiseTitle}>Own a Two Wheels Zone</h2>
            <p className={css.franchiseLede}>
              Turn your passion for motorcycles into a thriving business. Join the
              fastest-growing two-wheeler market in the region.
            </p>
            <button type="button" className="btn btn--solid" onClick={openFranchise}>
              Franchise Now
            </button>
          </div>
          <img
            className={css.franchiseImg}
            src={motorImg}
            alt=""
            role="presentation"
            loading="lazy"
          />
        </div>
      </section>
    </>
  )
}
