/* Scroll-linked parallax drift: the wrapped element travels `range`px against
   the scroll direction while it crosses the viewport, creating depth. Driven
   by Motion values (no scroll listeners, no React re-renders per frame). */

import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import type { ReactNode } from 'react'

export default function Parallax({
  children,
  range = 36,
  className,
}: {
  children: ReactNode
  /* Total px of drift across the element's trip through the viewport. */
  range?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [range, -range])

  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : { y }}>
      {children}
    </motion.div>
  )
}
