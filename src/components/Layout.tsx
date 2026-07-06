import { Outlet, ScrollRestoration } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import FranchiseWizard from './FranchiseWizard'

export default function Layout() {
  return (
    <FranchiseWizard>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </FranchiseWizard>
  )
}
