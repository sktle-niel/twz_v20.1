import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import SectionHeading from '../components/SectionHeading'
import { usePageTitle } from '../hooks/usePageTitle'
import { SERVICE_CATEGORIES } from '../data/services'
import heroImg from '../assets/about/shop.jpg'
import css from '../styles/pages/Services.module.css'

export default function Services() {
  usePageTitle('Services')
  const [active, setActive] = useState<string>('all')

  const shown =
    active === 'all'
      ? SERVICE_CATEGORIES
      : SERVICE_CATEGORIES.filter((c) => c.id === active)

  return (
    <>
      <PageHero
        image={heroImg}
        kicker="What We Do"
        title="Our Services"
        lede="Comprehensive motorcycle services to keep you riding smoothly and safely."
      />

      <section className="section">
        <div className="container">
          <SectionHeading center title="Everything Your Ride Needs" />

          <div className={css.pills} role="tablist" aria-label="Service categories">
            <CategoryPill
              label="All"
              selected={active === 'all'}
              onClick={() => setActive('all')}
            />
            {SERVICE_CATEGORIES.map((cat) => (
              <CategoryPill
                key={cat.id}
                label={cat.label}
                selected={active === cat.id}
                onClick={() => setActive(cat.id)}
              />
            ))}
          </div>

          {shown.map((cat) => (
            <div key={cat.id} className={css.category}>
              <div className={css.categoryHead}>
                <h3>{cat.label}</h3>
                <p>{cat.blurb}</p>
              </div>
              <ul className={css.grid}>
                {cat.services.map(({ name, icon: Icon }) => (
                  <li key={name} className={`card ${css.serviceCard}`}>
                    <span className={css.icon}>
                      <Icon size={24} aria-hidden />
                    </span>
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className={css.cta}>
        <div className={`container ${css.ctaInner}`}>
          <div>
            <h2>Not sure what your bike needs?</h2>
            <p>Drop by any branch or send us a message and we'll sort it out.</p>
          </div>
          <div className={css.ctaActions}>
            <Link to="/contact" className="btn btn--dark">
              Contact Us
            </Link>
            <Link to="/branches" className="btn btn--ghost">
              Find a Branch
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

function CategoryPill({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      className={`${css.pill} ${selected ? css.pillActive : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
