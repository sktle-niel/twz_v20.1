import { useState, type FormEvent } from 'react'
import { CheckCircle2, Send, TrendingUp } from 'lucide-react'
import PageHero from '../components/PageHero'
import { usePageTitle } from '../hooks/usePageTitle'
import { FRANCHISE_OFFERS, MARKET_UNITS } from '../data/market'
import {
  formatPeso,
  INCOME_SOURCES,
  MIN_FRANCHISE_INVESTMENT,
  SUGGESTED_INVESTMENT,
} from '../data/franchise'
import { COUNTRIES, getCountry } from '../data/countries'
import { isMeaningfulText, isValidFullName } from '../lib/validate'
import { ApiError, postJson } from '../lib/api'
import heroImg from '../assets/about/franchise.jpg'
import css from '../styles/pages/Franchise.module.css'

type FormStatus = 'idle' | 'sending' | 'success'

const maxUnits = Math.max(...MARKET_UNITS.map((m) => m.units))

export default function Franchise() {
  usePageTitle('Franchise Us')
  const [status, setStatus] = useState<FormStatus>('idle')
  const [incomeSource, setIncomeSource] = useState('')
  const [countryIso, setCountryIso] = useState('PH')
  const [investment, setInvestment] = useState<number | null>(null)
  const [error, setError] = useState('')
  const country = getCountry(countryIso)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget

    /* Franchise qualification: applications below the minimum can't proceed. */
    if (investment === null || investment < MIN_FRANCHISE_INVESTMENT) {
      setError(
        `A minimum investment of ${formatPeso(MIN_FRANCHISE_INVESTMENT)} is required to open a Two Wheels Zone franchise.`,
      )
      return
    }

    /* Reject gibberish in the free-text fields. */
    const nameValue = (form.elements.namedItem('name') as HTMLInputElement).value
    const locationValue = (form.elements.namedItem('location') as HTMLInputElement).value
    const messageValue = (form.elements.namedItem('message') as HTMLTextAreaElement).value
    if (!isValidFullName(nameValue)) {
      setError('Please enter your real complete name, first and last name.')
      return
    }
    if (!isMeaningfulText(locationValue)) {
      setError('Please enter a real location (city or municipality).')
      return
    }
    if (incomeSource === 'other') {
      const otherValue = (form.elements.namedItem('otherSource') as HTMLInputElement).value
      if (!isMeaningfulText(otherValue)) {
        setError('Please describe your source of income in real words.')
        return
      }
    }
    if (messageValue.trim() && !isMeaningfulText(messageValue)) {
      setError('Your message contains text we could not read. Please rephrase it.')
      return
    }

    setError('')
    setStatus('sending')

    try {
      await postJson('/franchise.php', {
        amount: investment,
        name: nameValue,
        email: (form.elements.namedItem('email') as HTMLInputElement).value,
        countryIso,
        mobile: (form.elements.namedItem('mobile') as HTMLInputElement).value,
        location: locationValue,
        income: incomeSource,
        otherSource:
          incomeSource === 'other'
            ? (form.elements.namedItem('otherSource') as HTMLInputElement).value
            : '',
        findUs: (form.elements.namedItem('findUs') as HTMLSelectElement).value,
        message: messageValue,
        hp: (form.elements.namedItem('hp') as HTMLInputElement).value,
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
      setStatus('idle')
      return
    }

    setStatus('success')
    setIncomeSource('')
    setCountryIso('PH')
    setInvestment(null)
    form.reset()
  }

  return (
    <>
      <PageHero
        image={heroImg}
        kicker="Business Opportunity"
        title="Franchise Two Wheels Zone"
        lede="Be part of a rapidly growing motorcycle service industry."
      />

      <section className="section">
        <div className={`container ${css.grid}`}>
          {/* ── Pitch ── */}
          <div>
            <h2 className={css.pitchTitle}>Join the ride, own the business</h2>
            <p className={css.pitchBody}>
              Here at Two Wheels Zone, we are always on the lookout for our next great
              franchisees. Do you have what it takes to be part of the thriving
              two-wheeler industry? Join us and experience the Two Wheels Zone Way:
              CASA-quality services at affordable prices.
            </p>

            <h3 className={css.offersTitle}>What we offer</h3>
            <ul className={css.offers}>
              {FRANCHISE_OFFERS.map((offer) => (
                <li key={offer}>
                  <CheckCircle2 size={19} aria-hidden />
                  {offer}
                </li>
              ))}
            </ul>

            {/* ── Market chart ── */}
            <figure className={`card ${css.chart}`}>
              <figcaption className={css.chartHead}>
                <p className={css.chartKicker}>
                  <TrendingUp size={15} aria-hidden /> Market Opportunity
                </p>
                <strong>Philippine motorcycle sales, annual units</strong>
                <span>
                  One of the fastest-growing two-wheeler markets in Southeast Asia.
                  Every motorcycle on the road is a potential customer.
                </span>
              </figcaption>
              <ul className={css.chartRows}>
                {MARKET_UNITS.map(({ year, units, projected }) => (
                  <li key={year} className={css.chartRow}>
                    <span className={css.chartYear}>{year}</span>
                    <span className={css.chartTrack}>
                      <span
                        className={`${css.chartBar} ${projected ? css.chartBarProj : ''}`}
                        style={{ width: `${(units / maxUnits) * 100}%` }}
                      />
                    </span>
                    <span className={css.chartValue}>
                      {units.toFixed(2)}M{projected && <em> proj.</em>}
                    </span>
                  </li>
                ))}
              </ul>
            </figure>
          </div>

          {/* ── Inquiry form ── */}
          <div className={`card ${css.formCard}`}>
            <h2 className={css.formTitle}>Start Your Journey</h2>
            <p className={css.formSub}>
              Fill out the form below and we'll get back to you within 24 hours.
            </p>

            {status === 'success' && (
              <p className="alert alert--success" role="status">
                Thank you for your franchise inquiry! We will get back to you soon.
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
                <label htmlFor="fr-hp">Leave this field empty</label>
                <input id="fr-hp" name="hp" type="text" tabIndex={-1} autoComplete="off" />
              </div>

              <div className="field">
                <label htmlFor="fr-name">
                  Full Name <span className="required">*</span>
                </label>
                <input id="fr-name" name="name" type="text" className="input" placeholder="Enter your full name" required />
              </div>

              <div className={css.row}>
                <div className="field">
                  <label htmlFor="fr-country">
                    Country <span className="required">*</span>
                  </label>
                  <select
                    id="fr-country"
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
                  <label htmlFor="fr-mobile">
                    Mobile Number <span className="required">*</span>
                  </label>
                  <div className="input-group">
                    <span>{country.dial}</span>
                    <input
                      id="fr-mobile"
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
                <label htmlFor="fr-email">
                  Email <span className="required">*</span>
                </label>
                <input id="fr-email" name="email" type="email" className="input" placeholder="you@email.com" required />
              </div>

              <div className={css.row}>
                <div className="field">
                  <label htmlFor="fr-findUs">
                    How did you find us? <span className="required">*</span>
                  </label>
                  <select id="fr-findUs" name="findUs" className="select" required defaultValue="">
                    <option value="" disabled>
                      Select an option
                    </option>
                    <option value="internet">Internet Search</option>
                    <option value="social-media">Social Media</option>
                    <option value="referral">Referral</option>
                    <option value="advertisement">Advertisement</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="fr-location">
                    Preferred Location <span className="required">*</span>
                  </label>
                  <input id="fr-location" name="location" type="text" className="input" placeholder="City / Province" required />
                </div>
              </div>

              <div className="field">
                <label htmlFor="fr-investment">
                  Estimated Initial Investment <span className="required">*</span>
                </label>
                <div className={css.chips}>
                  <button
                    type="button"
                    className={`${css.chip} ${investment === SUGGESTED_INVESTMENT ? css.chipActive : ''}`}
                    onClick={() => setInvestment(SUGGESTED_INVESTMENT)}
                  >
                    {formatPeso(SUGGESTED_INVESTMENT)} · Franchise package
                  </button>
                </div>
                <div className="input-group">
                  <span>₱</span>
                  <input
                    id="fr-investment"
                    name="estimatedInvestment"
                    type="text"
                    className="input"
                    placeholder="1,300,000.00"
                    inputMode="numeric"
                    autoComplete="off"
                    required
                    value={investment !== null ? investment.toLocaleString('en-US') : ''}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 9)
                      setInvestment(digits ? parseInt(digits, 10) : null)
                    }}
                  />
                </div>
                <p className={css.hint}>
                  Tap the package amount or enter your own. Minimum to proceed:{' '}
                  {formatPeso(MIN_FRANCHISE_INVESTMENT)}.
                </p>
              </div>

              <div className="field">
                <label htmlFor="fr-income">
                  Source of Income <span className="required">*</span>
                </label>
                <select
                  id="fr-income"
                  name="sourceOfIncome"
                  className="select"
                  value={incomeSource}
                  onChange={(e) => setIncomeSource(e.target.value)}
                  required
                >
                  <option value="">Select an option</option>
                  {INCOME_SOURCES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {incomeSource === 'other' && (
                <div className="field">
                  <label htmlFor="fr-otherSource">
                    Please specify <span className="required">*</span>
                  </label>
                  <input
                    id="fr-otherSource"
                    name="otherSource"
                    type="text"
                    className="input"
                    placeholder="e.g. rental income, stock investments, inheritance"
                    required
                  />
                </div>
              )}

              <div className="field">
                <label htmlFor="fr-message">Additional Message</label>
                <textarea
                  id="fr-message"
                  name="message"
                  className="textarea"
                  placeholder="Tell us about your background and why you're interested in franchising…"
                />
              </div>

              <button type="submit" className="btn btn--solid" disabled={status === 'sending'}>
                <Send size={17} aria-hidden />
                {status === 'sending' ? 'Sending…' : 'Submit Franchise Inquiry'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
