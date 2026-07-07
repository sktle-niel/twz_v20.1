import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { FacebookIcon } from '../components/icons'
import Carousel, { type Slide } from '../components/Carousel'
import SectionHeading from '../components/SectionHeading'
import Reveal, { EASE } from '../components/motion/Reveal'
import Parallax from '../components/motion/Parallax'
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

/* Hero entrance: kicker, headline, lede, and CTAs arrive in reading order. */
const heroStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.1 } },
}

const heroRise: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
}

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
  const reduce = useReducedMotion()

  return (
    <>
      {/* ── Hero ── */}
      <Carousel slides={SLIDES}>
        <div className="container">
          <motion.div
            className={css.hero}
            variants={heroStagger}
            initial={reduce ? false : 'hidden'}
            animate="show"
          >
            <motion.p variants={heroRise} className={css.heroKicker}>
              Motorcycle Service · Parts · Accessories
            </motion.p>
            <motion.h1 variants={heroRise} className={css.heroTitle}>
              <span>Alagang Casa</span> para sa mga Motorista
            </motion.h1>
            <motion.p variants={heroRise} className={css.heroLede}>
              CASA-quality motorcycle care, genuine parts, and expert technicians at
              prices riders can afford. Proudly serving Palawan since {SITE.since}.
            </motion.p>
            <motion.div variants={heroRise} className={css.heroActions}>
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
            </motion.div>
          </motion.div>
        </div>
      </Carousel>

      {/* ── Casa Quality banner ── */}
      <section className={css.casaBand}>
        <div className={`container ${css.casaBandInner}`}>
          <Reveal y={20}>
            <h2>Services, Parts & Accessories</h2>
            <p>
              From essential motorcycle care to genuine replacement parts and quality
              upgrades. Everything your ride needs, done the Casa way.
            </p>
          </Reveal>
          <Reveal y={20} delay={0.12}>
            <Link to="/casa-quality" className="btn btn--dark">
              Explore Casa Quality <ArrowRight size={18} aria-hidden />
            </Link>
          </Reveal>
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
            {FEATURED_SERVICES.map(({ name, icon: Icon }, i) => (
              <motion.li
                key={name}
                className={css.serviceTile}
                initial={reduce ? false : { opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: (i % 4) * 0.07, ease: EASE }}
              >
                <span className={css.serviceIcon}>
                  <Icon size={26} aria-hidden />
                </span>
                {name}
              </motion.li>
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
          <Parallax range={30} className={css.franchiseImgWrap}>
            <img
              className={css.franchiseImg}
              src={motorImg}
              alt=""
              role="presentation"
              loading="lazy"
            />
          </Parallax>
        </div>
      </section>
    </>
  )
}
