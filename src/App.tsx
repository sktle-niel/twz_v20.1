import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import CasaQuality from './pages/CasaQuality'
import Branches from './pages/Branches'
import Contact from './pages/Contact'
import Franchise from './pages/Franchise'
import CheckStatus from './pages/CheckStatus'
import Admin from './pages/Admin'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import NotFound from './pages/NotFound'

export const router = createBrowserRouter([
  /* Admin dashboard lives outside the public Layout (own chrome, no navbar). */
  { path: '/admin', element: <Admin /> },
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/about', element: <About /> },
      { path: '/services', element: <Services /> },
      { path: '/casa-quality', element: <CasaQuality /> },
      { path: '/branches', element: <Branches /> },
      { path: '/contact', element: <Contact /> },
      { path: '/franchise', element: <Franchise /> },
      { path: '/status', element: <CheckStatus /> },
      { path: '/privacy-policy', element: <PrivacyPolicy /> },
      { path: '/terms-of-service', element: <TermsOfService /> },

      /* Redirects for the old PHP site's URLs */
      { path: '/home', element: <Navigate to="/" replace /> },
      { path: '/aboutUs', element: <Navigate to="/about" replace /> },
      { path: '/exploreCasa', element: <Navigate to="/casa-quality" replace /> },
      { path: '/contactUs', element: <Navigate to="/contact" replace /> },
      { path: '/franchiseUs', element: <Navigate to="/franchise" replace /> },
      { path: '/privacyPolicy', element: <Navigate to="/privacy-policy" replace /> },
      { path: '/termsOfService', element: <Navigate to="/terms-of-service" replace /> },

      { path: '*', element: <NotFound /> },
    ],
  },
])
