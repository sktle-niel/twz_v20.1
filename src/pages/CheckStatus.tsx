import { useState, type FormEvent } from 'react'
import { CalendarClock, CheckCircle2, CircleDashed, PhoneCall, Search } from 'lucide-react'
import PageHero from '../components/PageHero'
import { usePageTitle } from '../hooks/usePageTitle'
import { getJson, type Appointment, type InquiryStatus } from '../lib/api'
import heroImg from '../assets/hero/hero-3.jpg'
import css from '../styles/pages/CheckStatus.module.css'

interface StatusResult {
  found: boolean
  kind?: 'franchise' | 'contact'
  reference?: string
  first_name?: string
  status?: InquiryStatus
  submitted?: string
  appointment?: Appointment | null
  error?: string
}

const STATUS_COPY: Record<InquiryStatus, { label: string; blurb: string }> = {
  new: {
    label: 'Received',
    blurb: 'We got your inquiry. Our team will contact you soon.',
  },
  contacted: {
    label: 'Contacted',
    blurb: 'Our team has reached out to you. Keep an eye on your phone and email.',
  },
  scheduled: {
    label: 'Call Scheduled',
    blurb: 'Your call with our team is booked — details below.',
  },
  completed: {
    label: 'Completed',
    blurb: 'This inquiry has been completed. Salamat!',
  },
  closed: {
    label: 'Closed',
    blurb: 'This inquiry has been closed. Feel free to reach out again anytime.',
  },
}

/* Timeline milestones (closed is shown via the badge, not the trail). */
const TRAIL: InquiryStatus[] = ['new', 'contacted', 'scheduled', 'completed']
const TRAIL_LABELS = ['Received', 'Contacted', 'Scheduled', 'Completed']

export default function CheckStatus() {
  usePageTitle('Check Status')
  const [ref, setRef] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<StatusResult | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const cleaned = ref.trim().toUpperCase()
    if (!/^TWZ-[A-Z0-9]{6}$/.test(cleaned)) {
      setError('References look like TWZ-XXXXXX — you can copy it from our email.')
      setResult(null)
      return
    }

    setError('')
    setBusy(true)
    try {
      const data = await getJson<StatusResult>(`/status.php?ref=${encodeURIComponent(cleaned)}`)
      setResult(data)
      if (!data.found) {
        setError(data.error ?? 'We could not find that reference. Please double-check it.')
      }
    } catch {
      setError('Something went wrong. Please try again shortly.')
      setResult(null)
    } finally {
      setBusy(false)
    }
  }

  const status = result?.found ? (result.status as InquiryStatus) : null
  const copy = status ? STATUS_COPY[status] : null
  const trailIndex = status ? TRAIL.indexOf(status) : -1

  return (
    <>
      <PageHero
        image={heroImg}
        kicker="Track Your Inquiry"
        title="Check Status"
        lede="Enter the reference number from our email to see where your inquiry stands."
      />

      <section className="section">
        <div className={`container ${css.wrap}`}>
          <form className={`card ${css.lookupCard}`} onSubmit={handleSubmit}>
            <label htmlFor="ref" className={css.lookupLabel}>
              Reference number
            </label>
            <div className={css.lookupRow}>
              <input
                id="ref"
                className={`input ${css.refInput}`}
                type="text"
                placeholder="TWZ-XXXXXX"
                autoComplete="off"
                spellCheck={false}
                maxLength={10}
                value={ref}
                onChange={(e) => setRef(e.target.value.toUpperCase())}
              />
              <button type="submit" className="btn btn--solid" disabled={busy}>
                <Search size={17} aria-hidden />
                {busy ? 'Checking…' : 'Check'}
              </button>
            </div>
            <p className={css.hint}>
              You received this in the confirmation email when you sent your inquiry.
            </p>
            {error && (
              <p className="alert alert--error" role="alert">
                {error}
              </p>
            )}
          </form>

          {result?.found && status && copy && (
            <div className={`card ${css.resultCard}`} role="status">
              <div className={css.resultHead}>
                <div>
                  <p className={css.resultKicker}>
                    {result.kind === 'franchise' ? 'Franchise Application' : 'Contact Message'} ·{' '}
                    {result.reference}
                  </p>
                  <h2 className={css.resultTitle}>
                    Hi {result.first_name}! Status: {copy.label}
                  </h2>
                </div>
                <span className={`${css.badge} ${css[`badge_${status}`]}`}>{copy.label}</span>
              </div>

              <p className={css.blurb}>{copy.blurb}</p>

              {trailIndex >= 0 && (
                <ol className={css.trail} aria-label="Progress">
                  {TRAIL_LABELS.map((label, i) => {
                    const done = i <= trailIndex
                    return (
                      <li key={label} className={done ? css.trailDone : css.trailPending}>
                        {done ? (
                          <CheckCircle2 size={18} aria-hidden />
                        ) : (
                          <CircleDashed size={18} aria-hidden />
                        )}
                        {label}
                      </li>
                    )
                  })}
                </ol>
              )}

              {result.appointment && (
                <div className={css.appointment}>
                  <p className={css.appointmentKicker}>
                    <PhoneCall size={15} aria-hidden /> Your scheduled call
                  </p>
                  <p className={css.appointmentTime}>
                    <CalendarClock size={18} aria-hidden />
                    {result.appointment.client_time}
                    {result.appointment.client_tz !== 'Asia/Manila' && (
                      <span className={css.tz}> (your time — {result.appointment.client_tz})</span>
                    )}
                  </p>
                  {result.appointment.client_tz !== 'Asia/Manila' && (
                    <p className={css.phTime}>
                      Philippine time: {result.appointment.ph_time}
                    </p>
                  )}
                </div>
              )}

              <p className={css.submitted}>Submitted {result.submitted}</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
