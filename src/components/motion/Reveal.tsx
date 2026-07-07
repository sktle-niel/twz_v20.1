/* Viewport-entrance reveal: content rises and fades in the first time it
   scrolls into view. Wraps Motion so every call site stays one-line and the
   reduced-motion fallback lives in a single place. */

import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

/* The site's shared "smooth" curve (easeOutExpo-ish). */
export const EASE = [0.16, 1, 0.3, 1] as const

export default function Reveal({
  children,
  delay = 0,
  y = 26,
  amount = 0.25,
  className,
}: {
  children: ReactNode
  /* Seconds — stagger grids by passing index * 0.06 or similar. */
  delay?: number
  /* Rise distance in px. */
  y?: number
  /* How much of the element must be visible before it plays. */
  amount?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}
