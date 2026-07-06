import { useEffect, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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

  useEffect(() => {
    if (paused || count < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), interval)
    return () => clearInterval(timer)
  }, [paused, count, interval])

  const goTo = (i: number) => setIndex(((i % count) + count) % count)

  return (
    <section
      className={css.carousel}
      aria-roledescription="carousel"
      aria-label="Two Wheels Zone highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
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
      <div className={css.overlay} />

      <div className={css.content}>{children}</div>

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
