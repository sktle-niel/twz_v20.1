import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import motorImg from '../assets/branding/motor.png'
import css from '../styles/pages/NotFound.module.css'

export default function NotFound() {
  usePageTitle('Page Not Found')

  return (
    <section className={`section ${css.wrap}`}>
      <div className={`container ${css.inner}`}>
        <img src={motorImg} alt="" role="presentation" />
        <h1>404</h1>
        <p>Looks like you took a wrong turn. This page doesn't exist.</p>
        <Link to="/" className="btn btn--solid">
          Back to Home
        </Link>
      </div>
    </section>
  )
}
