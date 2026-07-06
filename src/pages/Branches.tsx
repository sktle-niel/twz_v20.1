import { Clock, ExternalLink, MapPin, Phone, Wrench } from 'lucide-react'
import { FacebookIcon } from '../components/icons'
import PageHero from '../components/PageHero'
import SectionHeading from '../components/SectionHeading'
import { usePageTitle } from '../hooks/usePageTitle'
import { BRANCHES, MAIN_MAP_EMBED } from '../data/branches'
import { SITE } from '../data/site'
import heroImg from '../assets/hero/storefront.jpg'
import phMap from '../assets/branches/ph-map.png'
import css from '../styles/pages/Branches.module.css'

const CONTACT_CARDS = [
  { icon: Phone, title: 'Call Us', lines: [SITE.phone] },
  { icon: Clock, title: 'Office Hours', lines: ['Monday to Sunday', '7:00 AM - 9:00 PM'] },
  { icon: MapPin, title: 'Main Branch', lines: ['329 Malvar Road', 'Puerto Princesa City, 5300 Palawan'] },
]

export default function Branches() {
  usePageTitle('Branches')

  return (
    <>
      <PageHero
        image={heroImg}
        kicker="Where To Find Us"
        title="Our Branches"
        lede="Find a Two Wheels Zone branch near you and visit us for all your motorcycle needs."
      />

      <section className="section">
        <div className="container">
          <div className={`card ${css.mapCard}`}>
            <iframe
              src={MAIN_MAP_EMBED}
              title="Two Wheels Zone main branch on Google Maps"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <ul className={css.contactCards}>
            {CONTACT_CARDS.map(({ icon: Icon, title, lines }) => (
              <li key={title} className={`card ${css.contactCard}`}>
                <span className={css.contactIcon}>
                  <Icon size={24} aria-hidden />
                </span>
                <h3>{title}</h3>
                {lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`section ${css.listSection}`}>
        <div className="container">
          <SectionHeading
            center
            title="All Our Branches"
            lede="Serving riders across Palawan, with more branches on the way."
          />
          <div className={css.listGrid}>
            <figure className={css.mapFigure}>
              <img src={phMap} alt="Map of the Philippines highlighting Two Wheels Zone branch locations" loading="lazy" />
            </figure>

            <ul className={css.branchList}>
              {BRANCHES.map((branch) => (
                <li key={branch.id} className={`card ${css.branchCard}`}>
                  <h3>{branch.name}</h3>
                  <ul className={css.branchInfo}>
                    <li>
                      <MapPin size={17} aria-hidden />
                      <span>{branch.address}</span>
                    </li>
                    <li>
                      <Clock size={17} aria-hidden />
                      <span>{branch.hours}</span>
                    </li>
                    <li>
                      <Wrench size={17} aria-hidden />
                      <span>{branch.services}</span>
                    </li>
                  </ul>
                  <div className={css.branchActions}>
                    <a
                      href={branch.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn--dark btn--sm"
                    >
                      <ExternalLink size={15} aria-hidden /> Open in Maps
                    </a>
                    <a
                      href={branch.facebook}
                      target="_blank"
                      rel="noreferrer"
                      className={`btn btn--sm ${css.fbBtn}`}
                    >
                      <FacebookIcon size={15} /> Facebook
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}
