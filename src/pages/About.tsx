import { Link } from 'react-router-dom'
import { HandCoins, ShieldCheck, Wrench } from 'lucide-react'
import PageHero from '../components/PageHero'
import SectionHeading from '../components/SectionHeading'
import { usePageTitle } from '../hooks/usePageTitle'
import heroImg from '../assets/about/about.jpg'
import advantagesImg from '../assets/about/team.jpg'
import historyImg from '../assets/about/shop.jpg'
import css from '../styles/pages/About.module.css'

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'CASA-Quality Standards',
    text: 'Dealership-level service quality on every job, big or small.',
  },
  {
    icon: Wrench,
    title: 'Skilled Technicians',
    text: 'A trained team backed by state-of-the-art equipment.',
  },
  {
    icon: HandCoins,
    title: 'Fair Prices',
    text: 'Quality craftsmanship that stays affordable for every rider.',
  },
]

export default function About() {
  usePageTitle('About Us')

  return (
    <>
      <PageHero
        image={heroImg}
        kicker="Who We Are"
        title="About Two Wheels Zone"
        lede="Your premier destination for motorcycle parts and services in Palawan."
      />

      <section className="section">
        <div className={`container ${css.split}`}>
          <div>
            <SectionHeading
              title="Our Advantages"
              lede="CASA-quality services at affordable prices."
            />
            <p className={css.body}>
              Our team of skilled technicians, coupled with state-of-the-art equipment,
              allows us to fulfill this vision. It's what we call the Two Wheels Zone
              Way, and it's what separates us from every other competitor out there.
              Curious about the #TwoWheelsZoneWay and what makes it so good? Come and
              experience it for yourself!
            </p>
          </div>
          <figure className={css.media}>
            <img src={advantagesImg} alt="The Two Wheels Zone team" loading="lazy" />
          </figure>
        </div>
      </section>

      <section className={`section ${css.altSection}`}>
        <div className={`container ${css.split} ${css.splitReverse}`}>
          <figure className={css.media}>
            <img src={historyImg} alt="Inside the Two Wheels Zone shop" loading="lazy" />
          </figure>
          <div>
            <SectionHeading
              title="Our History"
              lede="Born of a joint venture with Midas International."
            />
            <p className={css.body}>
              Being the largest auto service center chain in the world, Midas provided
              the basis for Two Wheels Zone's systems and procedures, among the things
              that helped us shape the Two Wheels Zone Way. The brand has stood the test
              of time, and here at Two Wheels Zone, your satisfaction is our guarantee.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            center
            kicker="What We Stand For"
            title="The Two Wheels Zone Way"
          />
          <ul className={css.values}>
            {VALUES.map(({ icon: Icon, title, text }) => (
              <li key={title} className={`card ${css.valueCard}`}>
                <span className={css.valueIcon}>
                  <Icon size={26} aria-hidden />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={css.cta}>
        <div className={`container ${css.ctaInner}`}>
          <h2>Experience the #TwoWheelsZoneWay</h2>
          <div className={css.ctaActions}>
            <Link to="/branches" className="btn btn--solid">
              Visit a Branch
            </Link>
            <Link to="/contact" className={`btn btn--ghost ${css.ctaGhost}`}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
