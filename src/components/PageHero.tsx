import { motion, useReducedMotion, useScroll, useTransform, type Variants } from 'motion/react'
import { EASE } from './motion/Reveal'
import css from '../styles/components/PageHero.module.css'

interface PageHeroProps {
  image: string
  kicker?: string
  title: string
  lede?: string
}

/* Entrance: kicker, title, and lede introduce themselves in reading order. */
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}

const rise: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
}

export default function PageHero({ image, kicker, title, lede }: PageHeroProps) {
  const reduce = useReducedMotion()

  /* Parallax: the photo lags behind the page while the hero scrolls out.
     Raw scrollY (the hero is always the first block on the page) stays stable
     even while a modal locks body scroll. */
  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 560], ['0%', '20%'])

  return (
    <section className={css.hero}>
      <motion.div
        className={css.bg}
        style={{ backgroundImage: `url(${image})`, ...(reduce ? {} : { y: bgY }) }}
        aria-hidden="true"
      />
      <div className={css.overlay} />
      <motion.div
        className={`container ${css.content}`}
        variants={stagger}
        initial={reduce ? false : 'hidden'}
        animate="show"
      >
        {kicker && (
          <motion.p variants={rise} className={css.kicker}>
            {kicker}
          </motion.p>
        )}
        <motion.h1 variants={rise}>{title}</motion.h1>
        {lede && (
          <motion.p variants={rise} className={css.lede}>
            {lede}
          </motion.p>
        )}
      </motion.div>
    </section>
  )
}
