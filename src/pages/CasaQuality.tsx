import { useState } from 'react'
import { Receipt } from 'lucide-react'
import Lightbox from '../components/Lightbox'
import { usePageTitle } from '../hooks/usePageTitle'
import logo from '../assets/branding/logo.png'
import servicesImg from '../assets/casa/services.jpg'
import partsImg from '../assets/casa/parts.jpg'
import accessoriesImg from '../assets/casa/accessories.jpg'
import servicesMenu from '../assets/casa/services-menu.png'
import partsMenu from '../assets/casa/parts-menu.png'
import accessoriesMenu from '../assets/casa/accessories-menu.png'
import css from '../styles/pages/CasaQuality.module.css'

interface Category {
  name: string
  image: string
  menu: string
  blurb: string
}

const CATEGORIES: Category[] = [
  {
    name: 'Service',
    image: servicesImg,
    menu: servicesMenu,
    blurb: 'Essential and periodic motorcycle care by certified technicians.',
  },
  {
    name: 'Parts',
    image: partsImg,
    menu: partsMenu,
    blurb: 'A wide selection of genuine, high-quality replacement parts from trusted brands.',
  },
  {
    name: 'Accessories',
    image: accessoriesImg,
    menu: accessoriesMenu,
    blurb: 'Quality upgrades and add-ons to boost performance, comfort, and style.',
  },
]

export default function CasaQuality() {
  usePageTitle('Casa Quality')
  const [lightbox, setLightbox] = useState<Category | null>(null)

  return (
    <>
      <section className={css.hero}>
        <div className={`container ${css.heroInner}`}>
          <img className={css.logo} src={logo} alt="Two Wheels Zone" />
          <h1 className={css.title}>
            <span className={css.green}>Casa-Quality</span>{' '}
            <span className={css.red}>Service, Parts & Accessories</span>
          </h1>
          <p className={css.lede}>
            Dealership-level care without the dealership price tag. Browse each
            category's official price list below.
          </p>
        </div>
      </section>

      <section className={`section ${css.catalog}`}>
        <div className="container">
          <div className={css.grid}>
            {CATEGORIES.map((cat) => (
              <article key={cat.name} className={`card ${css.catCard}`}>
                <img className={css.catImage} src={cat.image} alt={cat.name} loading="lazy" />
                <div className={css.catHeader}>
                  <h2>{cat.name}</h2>
                </div>
                <div className={css.catBody}>
                  <p>{cat.blurb}</p>
                  <button
                    type="button"
                    className="btn btn--dark btn--sm"
                    onClick={() => setLightbox(cat)}
                  >
                    <Receipt size={16} aria-hidden /> View Price List
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {lightbox && (
        <Lightbox
          src={lightbox.menu}
          alt={`${lightbox.name} price list`}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  )
}
