import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import css from '../styles/components/Carousel.module.css'

export interface Slide {
  image: string
  alt: string
}

interface CarouselProps {
  slides: Slide[]
  interval?: number
  children?: ReactNode
}

export default function Carousel({ slides, interval = 6000, children }: CarouselProps) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = slides.length
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()

  /* Parallax exit: as the hero scrolls out, the imagery lags behind the page
     (depth) while the copy drifts up faster and fades (focus hand-off).
     Driven by raw scrollY (the hero always sits at the page top), which stays
     stable even while a modal locks body scroll. */
  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 800], ['0%', '16%'])
  const contentY = useTransform(scrollY, [0, 800], ['0%', '-30%'])
  const contentOpacity = useTransform(scrollY, [0, 560], [1, 0])

  useEffect(() => {
    if (paused || count < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), interval)
    return () => clearInterval(timer)
  }, [paused, count, interval])

  const goTo = (i: number) => setIndex(((i % count) + count) % count)

  return (
    <section
      ref={ref}
      className={css.carousel}
      aria-roledescription="carousel"
      aria-label="Two Wheels Zone highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div className={css.slides} style={reduce ? undefined : { y: bgY }}>
        {slides.map((slide, i) => (
          <div
            key={slide.image}
            className={`${css.slide} ${i === index ? css.slideActive : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
            role="img"
            aria-label={slide.alt}
            aria-hidden={i !== index}
          />
        ))}
      </motion.div>
      <div className={css.overlay} />

      <motion.div
        className={css.content}
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        {children}
      </motion.div>

      {count > 1 && (
        <>
          <button
            type="button"
            className={`${css.arrow} ${css.arrowPrev}`}
            aria-label="Previous slide"
            onClick={() => goTo(index - 1)}
          >
            <ChevronLeft size={30} aria-hidden />
          </button>
          <button
            type="button"
            className={`${css.arrow} ${css.arrowNext}`}
            aria-label="Next slide"
            onClick={() => goTo(index + 1)}
          >
            <ChevronRight size={30} aria-hidden />
          </button>

          <div className={css.dots} role="tablist" aria-label="Choose slide">
            {slides.map((slide, i) => (
              <button
                key={slide.image}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1} of ${count}`}
                className={`${css.dot} ${i === index ? css.dotActive : ''}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
