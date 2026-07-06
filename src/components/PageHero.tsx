import css from '../styles/components/PageHero.module.css'

interface PageHeroProps {
  image: string
  kicker?: string
  title: string
  lede?: string
}

export default function PageHero({ image, kicker, title, lede }: PageHeroProps) {
  return (
    <section className={css.hero} style={{ backgroundImage: `url(${image})` }}>
      <div className={css.overlay} />
      <div className={`container ${css.content}`}>
        {kicker && <p className={css.kicker}>{kicker}</p>}
        <h1>{title}</h1>
        {lede && <p className={css.lede}>{lede}</p>}
      </div>
    </section>
  )
}
