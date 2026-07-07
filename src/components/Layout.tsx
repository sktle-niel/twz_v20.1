import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import Navbar from './Navbar'
import Footer from './Footer'
import FranchiseWizard from './FranchiseWizard'
import { EASE } from './motion/Reveal'

export default function Layout() {
  const { pathname } = useLocation()
  const reduce = useReducedMotion()

  return (
    <FranchiseWizard>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar />
      {/* Keyed by route so every navigation gets a soft fade-up entrance. */}
      <motion.main
        id="main"
        key={pathname}
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        <Outlet />
      </motion.main>
      <Footer />
      <ScrollRestoration />
    </FranchiseWizard>
  )
}
