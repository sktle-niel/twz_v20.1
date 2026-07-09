import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bike, CheckCircle2, ChevronLeft, X } from 'lucide-react'
import {
  formatPeso,
  humanizePeso,
  INCOME_SOURCES,
  MIN_FRANCHISE_INVESTMENT,
  SUGGESTED_INVESTMENT,
} from '../data/franchise'
import { COUNTRIES, getCountry } from '../data/countries'
import { isMeaningfulText, isValidFullName } from '../lib/validate'
import { ApiError, postJson } from '../lib/api'
import { useToast } from './Toast'
import css from '../styles/components/FranchiseWizard.module.css'

const STEPS = ['ask', 'amount', 'name', 'contact', 'location', 'income', 'message', 'done'] as const
type Step = (typeof STEPS)[number]

interface FormData {
  amount: number | null
  name: string
  email: string
  countryIso: string
  mobile: string
  location: string
  income: string
  otherSource: string
  message: string
}

const EMPTY: FormData = {
  amount: null,
  name: '',
  email: '',
  countryIso: 'PH',
  mobile: '',
  location: '',
  income: '',
  otherSource: '',
  message: '',
}

/* The auto-popup shows at most once every 3 days per browser, so repeat
   visitors can browse in peace. Manual opens (hero button, pill) always work. */
const AUTO_OPEN_KEY = 'twz_franchise_prompt_at'
const AUTO_OPEN_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000

function autoOpenAllowed(): boolean {
  try {
    const last = Number(localStorage.getItem(AUTO_OPEN_KEY) ?? 0)
    return !last || Date.now() - last > AUTO_OPEN_COOLDOWN_MS
  } catch {
    return true /* storage blocked (private mode) — behave like a first visit */
  }
}

function markAutoOpened(): void {
  try {
    localStorage.setItem(AUTO_OPEN_KEY, String(Date.now()))
  } catch {
    /* storage blocked — the popup may show again next visit, which is fine */
  }
}

/* Lets any page open the wizard (e.g. the home hero's "Franchise Now"). */
const WizardContext = createContext<() => void>(() => {})

export function useFranchiseWizard() {
  return useContext(WizardContext)
}

export default function FranchiseWizard({ children }: { children: ReactNode }) {
  const routerLocation = useLocation()
  const navigate = useNavigate()
  const toast = useToast()
  const onFranchisePage = routerLocation.pathname === '/franchise'

  const [open, setOpen] = useState(false)
  const [showPill, setShowPill] = useState(false)
  const [step, setStep] = useState<Step>('ask')
  const [data, setData] = useState<FormData>(EMPTY)
  const [sending, setSending] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const autoOpened = useRef(false)

  /* Auto-appear once per visit (skipped on the franchise page itself), and at
     most once every 3 days per browser — repeat visitors get the quiet pill
     instead. The ref is only marked when the timer actually fires — marking it
     at schedule time made StrictMode's double effect-run cancel the open. */
  useEffect(() => {
    if (onFranchisePage || autoOpened.current) return
    if (!autoOpenAllowed()) {
      autoOpened.current = true
      setShowPill(true)
      return
    }
    const timer = setTimeout(() => {
      autoOpened.current = true
      markAutoOpened()
      setOpen(true)
    }, 1600)
    return () => clearTimeout(timer)
  }, [onFranchisePage])

  useEffect(() => {
    if (onFranchisePage) setOpen(false)
  }, [onFranchisePage])

  /* Scroll lock + Escape while open. */
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
      /* The lock changes the page's scrollable range; nudge scroll-linked
         animations (parallax) to re-measure now that it's restored. */
      window.dispatchEvent(new Event('resize'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function dismiss() {
    setOpen(false)
    setShowPill(true)
    if (step === 'done') reset()
  }

  function reset() {
    setStep('ask')
    setData(EMPTY)
    setSending(false)
    setSubmitError('')
  }

  const stepIndex = STEPS.indexOf(step)
  const progress = stepIndex / (STEPS.length - 1)

  const patch = (partial: Partial<FormData>) => setData((d) => ({ ...d, ...partial }))

  const amountTooLow = data.amount !== null && data.amount < MIN_FRANCHISE_INVESTMENT
  const emailValid = /^\S+@\S+\.\S+$/.test(data.email)
  const country = getCountry(data.countryIso)
  const mobileValid =
    data.countryIso === 'PH' ? /^[0-9]{10}$/.test(data.mobile) : /^[0-9]{5,14}$/.test(data.mobile)

  /* Free-text checks: flag gibberish once the user has typed enough. */
  const nameValid = isValidFullName(data.name)
  const nameLooksWrong = data.name.trim().length >= 4 && !nameValid
  const locationValid = isMeaningfulText(data.location)
  const locationLooksWrong = data.location.trim().length >= 3 && !locationValid
  const otherValid = isMeaningfulText(data.otherSource)
  const otherLooksWrong = data.otherSource.trim().length >= 3 && !otherValid
  const messageValid = data.message.trim() === '' || isMeaningfulText(data.message)

  const canContinue: boolean = (() => {
    switch (step) {
      case 'amount':
        return data.amount !== null && data.amount >= MIN_FRANCHISE_INVESTMENT
      case 'name':
        return nameValid
      case 'contact':
        return emailValid && mobileValid
      case 'location':
        return locationValid
      case 'income':
        return data.income !== '' && (data.income !== 'other' || otherValid)
      case 'message':
        return !sending && messageValid
      default:
        return false
    }
  })()

  /* What to tell the visitor when Continue/Submit is pressed but the step
     isn't ready yet — names whichever field is empty or still looks wrong. */
  function missingMessage(): string {
    switch (step) {
      case 'amount':
        if (data.amount === null) return 'Please enter how much you can invest.'
        return `Sorry, applications below ${formatPeso(MIN_FRANCHISE_INVESTMENT)} can't proceed for now.`
      case 'name':
        return data.name.trim() === ''
          ? 'Please enter your complete name.'
          : 'Please enter your real complete name, first and last.'
      case 'contact':
        if (!emailValid && !mobileValid) return 'Please enter a valid email and mobile number.'
        return !emailValid ? 'Please enter a valid email address.' : 'Please enter a valid mobile number.'
      case 'location':
        return data.location.trim() === ''
          ? 'Please enter your preferred location.'
          : 'Please enter a real city or municipality name.'
      case 'income':
        if (data.income === '') return 'Please select your source of income.'
        return 'Please describe your income source in real words.'
      case 'message':
        return 'Some of that text doesn\'t look readable. Please rephrase it, or leave the message blank.'
      default:
        return 'Please complete this step.'
    }
  }

  function goBack() {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1])
  }

  async function goNext(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canContinue) {
      toast.error(missingMessage())
      return
    }

    if (step === 'message') {
      setSending(true)
      setSubmitError('')
      try {
        await postJson('/franchise.php', {
          amount: data.amount,
          name: data.name,
          email: data.email,
          countryIso: data.countryIso,
          mobile: data.mobile,
          location: data.location,
          income: data.income,
          otherSource: data.income === 'other' ? data.otherSource : '',
          message: data.message,
          hp: '',
        })
      } catch (err) {
        setSubmitError(
          err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
        )
        setSending(false)
        return
      }
      setSending(false)
      setStep('done')
      return
    }
    setStep(STEPS[stepIndex + 1])
  }

  const openWizard = useCallback(() => setOpen(true), [])

  return (
    <WizardContext.Provider value={openWizard}>
      {children}

      {!onFranchisePage && showPill && !open && (
        <button type="button" className={css.pill} onClick={() => setOpen(true)}>
          <Bike size={19} aria-hidden />
          Franchise Now
        </button>
      )}

      {!onFranchisePage && open && (
        <div className={css.backdrop} onClick={dismiss}>
          <section
            className={css.sheet}
            role="dialog"
            aria-modal="true"
            aria-label="Franchise application"
            onClick={(e) => e.stopPropagation()}
          >
            <header className={css.head}>
              <div>
                <strong className={css.title}>Franchise Application</strong>
                <p className={css.kicker}>Two Wheels Zone</p>
              </div>
              <button type="button" className={css.close} aria-label="Close" onClick={dismiss}>
                <X size={20} aria-hidden />
              </button>
            </header>

            <div className={css.progress} aria-hidden="true">
              <span style={{ transform: `scaleX(${progress})` }} />
            </div>
            <p className="sr-only">
              Step {Math.min(stepIndex + 1, 7)} of 7
            </p>

            <form className={css.formArea} onSubmit={goNext}>
              <div className={css.body}>
                {step === 'ask' && (
                  <>
                    <h3 className={css.question}>Own a Two Wheels Zone franchise?</h3>
                    <p className={css.sub}>
                      Answer a few quick questions to see if you qualify. Takes about 2
                      minutes.
                    </p>
                    <div className={css.options}>
                      <OptionCard
                        label="Yes, I'm interested"
                        description="Start the application and see if you qualify."
                        onClick={() => setStep('amount')}
                      />
                      <OptionCard
                        label="Check Status"
                        description="Already applied? Track your application with the reference from our email."
                        onClick={() => {
                          dismiss()
                          navigate('/status')
                        }}
                      />
                    </div>
                  </>
                )}

                {step === 'amount' && (
                  <>
                    <h3 className={css.question}>How much can you invest?</h3>
                    <p className={css.sub}>
                      The Two Wheels Zone franchise package is{' '}
                      {formatPeso(SUGGESTED_INVESTMENT)}, that's{' '}
                      {humanizePeso(SUGGESTED_INVESTMENT)}. Tap it below or enter your own
                      budget.
                    </p>
                    <div className={css.fields}>
                      <div className={css.chips}>
                        <button
                          type="button"
                          className={`${css.chip} ${data.amount === SUGGESTED_INVESTMENT ? css.chipActive : ''}`}
                          onClick={() => patch({ amount: SUGGESTED_INVESTMENT })}
                        >
                          {formatPeso(SUGGESTED_INVESTMENT)} · Franchise package
                        </button>
                      </div>
                      <div className="field">
                        <label htmlFor="fw-amount">Or enter a custom budget</label>
                        <div className="input-group">
                          <span>₱</span>
                          <input
                            id="fw-amount"
                            className={`input ${css.amountInput}`}
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            placeholder="1,300,000.00"
                            autoFocus
                            value={data.amount !== null ? data.amount.toLocaleString('en-US') : ''}
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\D/g, '').slice(0, 9)
                              patch({ amount: digits ? parseInt(digits, 10) : null })
                            }}
                          />
                        </div>
                        {amountTooLow ? (
                          <p className={css.errorText} role="alert">
                            Sorry, applications below {formatPeso(MIN_FRANCHISE_INVESTMENT)}{' '}
                            ({humanizePeso(MIN_FRANCHISE_INVESTMENT)}) can't proceed for now.
                          </p>
                        ) : data.amount !== null ? (
                          <p className={css.readout}>That's {humanizePeso(data.amount)}.</p>
                        ) : (
                          <p className={css.hint}>
                            Minimum to proceed: {formatPeso(MIN_FRANCHISE_INVESTMENT)} (
                            {humanizePeso(MIN_FRANCHISE_INVESTMENT)})
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {step === 'name' && (
                  <>
                    <h3 className={css.question}>What's your complete name?</h3>
                    <p className={css.sub}>So we know who we're talking to.</p>
                    <div className={css.fields}>
                      <div className="field">
                        <label htmlFor="fw-name">Complete name</label>
                        <input
                          id="fw-name"
                          className="input"
                          type="text"
                          autoComplete="name"
                          placeholder="e.g. Juan A. Dela Cruz"
                          autoFocus
                          value={data.name}
                          onChange={(e) => patch({ name: e.target.value })}
                        />
                        {nameLooksWrong && (
                          <p className={css.errorText} role="alert">
                            Please enter your real complete name, first and last (e.g.
                            Juan A. Dela Cruz).
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {step === 'contact' && (
                  <>
                    <h3 className={css.question}>How do we reach you?</h3>
                    <p className={css.sub}>Our franchise team replies within 24 to 48 hours.</p>
                    <div className={css.fields}>
                      <div className="field">
                        <label htmlFor="fw-email">Email address</label>
                        <input
                          id="fw-email"
                          className="input"
                          type="email"
                          autoComplete="email"
                          placeholder="you@email.com"
                          autoFocus
                          value={data.email}
                          onChange={(e) => patch({ email: e.target.value })}
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="fw-country">Country</label>
                        <select
                          id="fw-country"
                          className="select"
                          value={data.countryIso}
                          onChange={(e) => patch({ countryIso: e.target.value, mobile: '' })}
                        >
                          {COUNTRIES.map(({ iso, name, dial, flag }) => (
                            <option key={iso} value={iso}>
                              {flag} {name} ({dial})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="field">
                        <label htmlFor="fw-mobile">Mobile number</label>
                        <div className="input-group">
                          <span>{country.dial}</span>
                          <input
                            id="fw-mobile"
                            className="input"
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel-national"
                            placeholder={data.countryIso === 'PH' ? '9123456789' : 'Mobile number'}
                            value={data.mobile}
                            onChange={(e) =>
                              patch({ mobile: e.target.value.replace(/\D/g, '').slice(0, 14) })
                            }
                          />
                        </div>
                        <p className={css.hint}>
                          {data.countryIso === 'PH'
                            ? 'The 10 digits after +63.'
                            : `Your number after ${country.dial}, digits only.`}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {step === 'location' && (
                  <>
                    <h3 className={css.question}>Where do you plan to open?</h3>
                    <p className={css.sub}>Your preferred city or municipality.</p>
                    <div className={css.fields}>
                      <div className="field">
                        <label htmlFor="fw-location">Preferred location</label>
                        <input
                          id="fw-location"
                          className="input"
                          type="text"
                          placeholder="e.g. Roxas, Palawan"
                          autoFocus
                          value={data.location}
                          onChange={(e) => patch({ location: e.target.value })}
                        />
                        {locationLooksWrong && (
                          <p className={css.errorText} role="alert">
                            Please enter a real city or municipality name.
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {step === 'income' && (
                  <>
                    <h3 className={css.question}>What's your source of income?</h3>
                    <p className={css.sub}>Pick the closest one.</p>
                    <div className={css.options}>
                      {INCOME_SOURCES.map((source) => (
                        <OptionCard
                          key={source.value}
                          label={source.label}
                          description={source.description}
                          selected={data.income === source.value}
                          onClick={() => patch({ income: source.value })}
                        />
                      ))}
                    </div>
                    {data.income === 'other' && (
                      <div className={`field ${css.otherField}`}>
                        <label htmlFor="fw-other">Please specify</label>
                        <input
                          id="fw-other"
                          className="input"
                          type="text"
                          placeholder="e.g. rental income, stock investments, inheritance"
                          autoFocus
                          value={data.otherSource}
                          onChange={(e) => patch({ otherSource: e.target.value })}
                        />
                        {otherLooksWrong && (
                          <p className={css.errorText} role="alert">
                            Please describe your income source in real words.
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {step === 'message' && (
                  <>
                    <h3 className={css.question}>Anything else we should know?</h3>
                    <p className={css.sub}>Optional, but it helps us prepare for our call.</p>
                    <div className={css.fields}>
                      <div className="field">
                        <label htmlFor="fw-message">Additional message</label>
                        <textarea
                          id="fw-message"
                          className="textarea"
                          placeholder="Tell us about your background, timeline, or questions…"
                          autoFocus
                          value={data.message}
                          onChange={(e) => patch({ message: e.target.value })}
                        />
                        {!messageValid && (
                          <p className={css.errorText} role="alert">
                            Some of that text doesn't look readable. Please rephrase it,
                            or leave the message blank.
                          </p>
                        )}
                        {submitError && (
                          <p className={css.errorText} role="alert">
                            {submitError}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {step === 'done' && (
                  <div className={css.done}>
                    <CheckCircle2 size={56} aria-hidden />
                    <h3 className={css.question}>Application received!</h3>
                    <p className={css.sub}>
                      Salamat{data.name ? `, ${data.name.trim().split(' ')[0]}` : ''}! Our
                      franchise team will contact you within 24 to 48 hours.
                    </p>
                    <button
                      type="button"
                      className="btn btn--solid"
                      onClick={() => {
                        setOpen(false)
                        setShowPill(true)
                        reset()
                      }}
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>

              {step !== 'ask' && step !== 'done' && (
                <footer className={css.foot}>
                  <button type="button" className={css.backBtn} onClick={goBack}>
                    <ChevronLeft size={17} aria-hidden />
                    Back
                  </button>
                  <button
                    type="submit"
                    className={`btn btn--solid btn--sm ${css.continue}`}
                    disabled={sending}
                  >
                    {step === 'message' ? (sending ? 'Submitting…' : 'Submit Application') : 'Continue'}
                  </button>
                </footer>
              )}
            </form>
          </section>
        </div>
      )}
    </WizardContext.Provider>
  )
}

function OptionCard({
  label,
  description,
  selected,
  onClick,
}: {
  label: string
  description: string
  selected?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`${css.option} ${selected ? css.optionActive : ''}`}
      aria-pressed={selected}
      onClick={onClick}
    >
      <span className={css.radio} aria-hidden />
      <span>
        <span className={css.optionLabel}>{label}</span>
        <span className={css.optionDesc}>{description}</span>
      </span>
    </button>
  )
}
