import { useState, type FormEvent } from 'react'
import { Clock, MapPin, Phone, Send } from 'lucide-react'
import PageHero from '../components/PageHero'
import { usePageTitle } from '../hooks/usePageTitle'
import { MAIN_MAP_EMBED } from '../data/branches'
import { SITE } from '../data/site'
import { COUNTRIES, getCountry } from '../data/countries'
import { isMeaningfulText } from '../lib/validate'
import { ApiError, postJson } from '../lib/api'
import heroImg from '../assets/hero/hero-2.jpg'
import css from '../styles/pages/Contact.module.css'

type FormStatus = 'idle' | 'sending' | 'success'

export default function Contact() {
  usePageTitle('Contact Us')
  const [status, setStatus] = useState<FormStatus>('idle')
  const [countryIso, setCountryIso] = useState('PH')
  const [error, setError] = useState('')
  const country = getCountry(countryIso)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget

    /* Reject gibberish in the free-text fields. */
    const nameValue = (form.elements.namedItem('name') as HTMLInputElement).value
    const subjectValue = (form.elements.namedItem('subject') as HTMLInputElement).value
    const messageValue = (form.elements.namedItem('message') as HTMLTextAreaElement).value
    if (!isMeaningfulText(nameValue)) {
      setError('Please enter your real name.')
      return
    }
    if (!isMeaningfulText(subjectValue)) {
      setError('Please enter a readable subject.')
      return
    }
    if (!isMeaningfulText(messageValue)) {
      setError('Your message contains text we could not read. Please rephrase it.')
      return
    }

    setError('')
    setStatus('sending')

    try {
      await postJson('/contact.php', {
        name: nameValue,
        country: countryIso,
        mobile: (form.elements.namedItem('mobile') as HTMLInputElement).value,
        email: (form.elements.namedItem('email') as HTMLInputElement).value,
        subject: subjectValue,
        message: messageValue,
        hp: (form.elements.namedItem('hp') as HTMLInputElement).value,
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
      setStatus('idle')
      return
    }

    setStatus('success')
    setCountryIso('PH')
    form.reset()
  }

  return (
    <>
      <PageHero
        image={heroImg}
        kicker="Get In Touch"
        title="Contact Us"
        lede="Our friendly team will be happy to answer your questions or inquiries."
      />

      <section className="section">
        <div className={`container ${css.grid}`}>
          {/* ── Form ── */}
          <div className={`card ${css.formCard}`}>
            <h2 className={css.formTitle}>Send Us a Message</h2>
            <p className={css.formSub}>We usually reply within 24 hours.</p>

            {status === 'success' && (
              <p className="alert alert--success" role="status">
                Thank you for your message! We will get back to you soon.
              </p>
            )}
            {error && (
              <p className="alert alert--error" role="alert">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className={css.form}>
              {/* Honeypot: hidden from real users; bots that fill it get silently dropped. */}
              <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
                <label htmlFor="hp">Leave this field empty</label>
                <input id="hp" name="hp" type="text" tabIndex={-1} autoComplete="off" />
              </div>

              <div className="field">
                <label htmlFor="name">
                  Name <span className="required">*</span>
                </label>
                <input id="name" name="name" type="text" className="input" placeholder="Enter your name" required />
              </div>

              <div className={css.row}>
                <div className="field">
                  <label htmlFor="country">
                    Country <span className="required">*</span>
                  </label>
                  <select
                    id="country"
                    name="country"
                    className="select"
                    value={countryIso}
                    onChange={(e) => setCountryIso(e.target.value)}
                  >
                    {COUNTRIES.map(({ iso, name, dial, flag }) => (
                      <option key={iso} value={iso}>
                        {flag} {name} ({dial})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="mobile">
                    Mobile Number <span className="required">*</span>
                  </label>
                  <div className="input-group">
                    <span>{country.dial}</span>
                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      className="input"
                      placeholder={countryIso === 'PH' ? '9123456789' : 'Mobile number'}
                      required
                      inputMode="numeric"
                      pattern={countryIso === 'PH' ? '[0-9]{10}' : '[0-9]{5,14}'}
                      maxLength={14}
                      title={
                        countryIso === 'PH'
                          ? 'Enter the 10 digits after +63 (e.g. 9123456789)'
                          : `Enter your number after ${country.dial}, digits only`
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="field">
                <label htmlFor="email">
                  Email <span className="required">*</span>
                </label>
                <input id="email" name="email" type="email" className="input" placeholder="you@email.com" required />
              </div>

              <div className="field">
                <label htmlFor="subject">
                  Subject <span className="required">*</span>
                </label>
                <input id="subject" name="subject" type="text" className="input" placeholder="What is it about?" required />
              </div>

              <div className="field">
                <label htmlFor="message">
                  Message <span className="required">*</span>
                </label>
                <textarea id="message" name="message" className="textarea" placeholder="Type your message here…" required />
              </div>

              <button type="submit" className="btn btn--solid" disabled={status === 'sending'}>
                <Send size={17} aria-hidden />
                {status === 'sending' ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* ── Map + info ── */}
          <div className={css.side}>
            <div className={`card ${css.mapCard}`}>
              <iframe
                src={MAIN_MAP_EMBED}
                title="Two Wheels Zone on Google Maps"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <ul className={css.infoCards}>
              <li className={`card ${css.infoCard}`}>
                <Phone size={22} aria-hidden />
                <h3>Call Us</h3>
                <p>
                  <a href={SITE.phoneHref}>{SITE.phone}</a>
                </p>
              </li>
              <li className={`card ${css.infoCard}`}>
                <Clock size={22} aria-hidden />
                <h3>Office Hours</h3>
                <p>Monday to Sunday</p>
                <p>7:00 AM - 9:00 PM</p>
              </li>
              <li className={`card ${css.infoCard}`}>
                <MapPin size={22} aria-hidden />
                <h3>Location</h3>
                <p>329 Malvar Road</p>
                <p>Puerto Princesa City, 5300 Palawan</p>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}
