import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  Bike,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Globe2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Settings,
  Video,
  XCircle,
} from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'
import { useToast } from '../components/Toast'
import {
  ApiError,
  deleteJson,
  getJson,
  postJson,
  type Appointment,
  type InquiryStatus,
} from '../lib/api'
import {
  COMMON_TZS,
  COUNTRY_DEFAULT_TZ,
  PH_TZ,
  timeNowIn,
  tzOffsetLabel,
  tzOptions,
  type TzOption,
} from '../lib/timezones'
import css from '../styles/pages/Admin.module.css'

/* ── Types ── */

type Kind = 'franchise' | 'contact'

interface Inquiry {
  id: number
  reference: string
  name: string
  email: string
  country: string
  country_name: string
  dial: string
  mobile: string
  status: InquiryStatus
  viewed: number
  appointment: Appointment | null
  meeting_type: 'online' | 'inperson' | null
  meeting_link: string | null
  message: string | null
  created_at: string
  /* franchise */
  amount?: number
  location?: string
  income?: string
  other_source?: string | null
  find_us?: string | null
  /* contact */
  subject?: string
}

interface DataDate {
  date: string /* YYYY-MM-DD */
  count: number
}

interface Slot {
  time: string /* HH:MM, client-local */
  client_label: string /* "6:00 AM - 7:00 AM" */
  ph_label: string /* "Wed · 10:00 AM - 11:00 AM" */
  taken: boolean
  past: boolean
}

interface ListResponse {
  ok: boolean
  items: Inquiry[]
  page: number
  pages: number
  total: number
  counts: Record<string, number>
  unseen: number
  dates: DataDate[]
  work_hours: { start: number; end: number; tz: string }
}

/* "2026-07-05" -> "Jul 5, 2026" */
function dateLabel(d: string): string {
  const [y, m, dd] = d.split('-').map(Number)
  return new Date(y, m - 1, dd).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const TOKEN_KEY = 'twz_admin_token'

/* ── UI-state persistence (per browser tab, survives reloads) ── */
const SS = {
  get(key: string, fallback: string): string {
    try {
      return sessionStorage.getItem(key) ?? fallback
    } catch {
      return fallback
    }
  },
  set(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value)
    } catch {
      /* storage blocked — the UI just won't survive a reload */
    }
  },
}

const OPEN_KEY = 'twz_admin_open'

function openCards(): Set<string> {
  try {
    return new Set<string>(JSON.parse(sessionStorage.getItem(OPEN_KEY) ?? '[]'))
  } catch {
    return new Set()
  }
}

function rememberOpen(cardKey: string, open: boolean): void {
  const s = openCards()
  if (open) s.add(cardKey)
  else s.delete(cardKey)
  SS.set(OPEN_KEY, JSON.stringify([...s]))
}
const STATUSES: Array<InquiryStatus | 'all'> = [
  'all',
  'new',
  'contacted',
  'scheduled',
  'completed',
  'closed',
]
const STATUS_LABEL: Record<string, string> = {
  all: 'All',
  new: 'New',
  contacted: 'Contacted',
  scheduled: 'Scheduled',
  completed: 'Completed',
  closed: 'Closed',
}
const INCOME_LABEL: Record<string, string> = {
  'business-owner': 'Business Owner',
  'employed-professional': 'Employed / Professional',
  ofw: 'OFW / Overseas Income',
  other: 'Other',
}

const peso = (n: number) => `₱${n.toLocaleString('en-US')}`

const DURATIONS = [30, 60, 90, 120] as const

function durationLabel(minutes: number): string {
  switch (minutes) {
    case 30:
      return '30 min'
    case 60:
      return '1 hour'
    case 90:
      return '1.5 hours'
    default:
      return '2 hours'
  }
}

/* "https://meet.google.com/abc-defg-hij" -> "abc-defg-hij". */
function meetCode(link: string): string | null {
  try {
    const path = new URL(link).pathname.replace(/^\/|\/$/g, '')
    return /^[a-z]{3,4}-[a-z]{4}-[a-z]{3,4}$/i.test(path) ? path : null
  } catch {
    return null
  }
}
const hour12 = (h: number) =>
  h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`

/* ══════════════════════════ Root: login gate ══════════════════════════ */

export default function Admin() {
  usePageTitle('Admin')
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [checked, setChecked] = useState(false)

  /* Keep the dashboard out of search engines. */
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => {
      document.head.removeChild(meta)
    }
  }, [])

  /* Validate a remembered token once on mount. */
  useEffect(() => {
    if (!token) {
      setChecked(true)
      return
    }
    getJson('/session.php', token)
      .then(() => setChecked(true))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setChecked(true)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleLogin(newToken: string) {
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
  }

  function handleLogout() {
    if (token) deleteJson('/session.php', token).catch(() => {})
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }

  if (!checked) return null
  if (!token) return <Login onLogin={handleLogin} />
  return <Dashboard token={token} onLogout={handleLogout} onExpired={handleLogout} />
}

/* ══════════════════════════════ Login ══════════════════════════════ */

function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await postJson<{ ok: boolean; token: string }>('/login.php', {
        email,
        password,
      })
      onLogin(res.token)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div className={css.loginScreen}>
      <form className={`card ${css.loginCard}`} onSubmit={submit}>
        <p className={css.wordmark}>
          TWO WHEELS <span>ZONE</span>
        </p>
        <h1 className={css.loginTitle}>Admin Sign In</h1>

        {error && (
          <p className="alert alert--error" role="alert">
            {error}
          </p>
        )}

        <div className="field">
          <label htmlFor="adm-email">Email</label>
          <input
            id="adm-email"
            className="input"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="adm-pass">Password</label>
          <input
            id="adm-pass"
            className="input"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn--solid" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign In'}
        </button>
        <Link to="/" className={css.backLink}>
          ← Back to the website
        </Link>
      </form>
    </div>
  )
}

/* ═══════════════════════════ Dashboard ═══════════════════════════ */

function Dashboard({
  token,
  onLogout,
  onExpired,
}: {
  token: string
  onLogout: () => void
  onExpired: () => void
}) {
  /* Every filter survives a reload (per tab): you come back to the same
     view, same filters, same page. */
  const [view, setView] = useState<Kind | 'account'>(() => {
    const v = SS.get('twz_admin_view', 'franchise')
    return v === 'contact' || v === 'account' ? v : 'franchise'
  })
  const kind: Kind = view === 'account' ? 'franchise' : view
  const [status, setStatus] = useState<InquiryStatus | 'all'>(() => {
    const s = SS.get('twz_admin_status', 'all')
    return (STATUSES as string[]).includes(s) ? (s as InquiryStatus | 'all') : 'all'
  })
  const [year, setYear] = useState(() => SS.get('twz_admin_year', ''))
  const [month, setMonth] = useState(() => SS.get('twz_admin_month', ''))
  const [day, setDay] = useState(() => SS.get('twz_admin_day', ''))
  const [page, setPage] = useState(() => Math.max(1, Number(SS.get('twz_admin_page', '1')) || 1))
  const [data, setData] = useState<ListResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    SS.set('twz_admin_view', view)
    SS.set('twz_admin_status', status)
    SS.set('twz_admin_year', year)
    SS.set('twz_admin_month', month)
    SS.set('twz_admin_day', day)
    SS.set('twz_admin_page', String(page))
  }, [view, status, year, month, day, page])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getJson<ListResponse>(
        `/admin.php?kind=${kind}&status=${status}&page=${page}` +
          (year ? `&year=${year}` : '') +
          (year && month ? `&month=${year}-${month}` : '') +
          (year && month && day ? `&day=${day}` : ''),
        token,
      )
      setData(res)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) onExpired()
    } finally {
      setLoading(false)
    }
  }, [kind, status, page, year, month, day, token, onExpired])

  useEffect(() => {
    load()
  }, [load])

  /* Cascading filter options — only periods that actually contain data. */
  const dates = data?.dates ?? []
  const years = useMemo(() => {
    const m = new Map<string, number>()
    for (const d of dates) {
      const y = d.date.slice(0, 4)
      m.set(y, (m.get(y) ?? 0) + d.count)
    }
    return [...m.entries()] // newest first (dates arrive date-desc)
  }, [dates])
  const latestYear = years[0]?.[0] ?? ''
  const monthsInYear = useMemo(() => {
    const m = new Map<string, number>()
    for (const d of dates) {
      if (d.date.slice(0, 4) !== year) continue
      const mm = d.date.slice(5, 7)
      m.set(mm, (m.get(mm) ?? 0) + d.count)
    }
    return [...m.entries()]
  }, [dates, year])
  const daysInMonth = useMemo(
    () => (month ? dates.filter((d) => d.date.startsWith(`${year}-${month}`)) : []),
    [dates, year, month],
  )

  /* Default the year filter to the latest year that has data. */
  useEffect(() => {
    if (!year && latestYear) setYear(latestYear)
  }, [year, latestYear])

  function switchView(v: Kind | 'account') {
    setView(v)
    if (v !== 'account') {
      setStatus('all')
      setYear('')
      setMonth('')
      setDay('')
      setPage(1)
    }
  }

  function patchItem(id: number, patch: Partial<Inquiry>, reload = true) {
    setData((d) =>
      d ? { ...d, items: d.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) } : d,
    )
    if (reload) load() /* refresh counts in the background */
  }

  return (
    <div className={css.shell}>
      <header className={css.topbar}>
        <p className={css.wordmark}>
          TWO WHEELS <span>ZONE</span>
        </p>
        <button type="button" className={css.logout} onClick={onLogout}>
          <LogOut size={15} aria-hidden /> Log out
        </button>
      </header>

      <nav className={css.pillNav} aria-label="Dashboard sections">
        <button
          type="button"
          className={view === 'franchise' ? css.pillActive : css.pill}
          onClick={() => switchView('franchise')}
        >
          <Bike size={16} aria-hidden /> Franchise
        </button>
        <button
          type="button"
          className={view === 'contact' ? css.pillActive : css.pill}
          onClick={() => switchView('contact')}
        >
          <Mail size={16} aria-hidden /> Messages
        </button>
        <button
          type="button"
          className={view === 'account' ? css.pillActive : css.pill}
          onClick={() => switchView('account')}
        >
          <Settings size={16} aria-hidden /> Account
        </button>
      </nav>

      {view === 'account' ? (
        <main className={css.main}>
          <h1 className={css.pageTitle}>Account</h1>
          <AccountView token={token} onExpired={onExpired} />
        </main>
      ) : (
      <main className={css.main}>
        <h1 className={css.pageTitle}>
          {kind === 'franchise' ? 'Franchise Applications' : 'Contact Messages'}
        </h1>

        <div className={css.filterBar}>
          <div className={css.chips} role="tablist" aria-label="Filter by status">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={status === s}
                className={status === s ? css.chipActive : css.chip}
                onClick={() => {
                  setStatus(s)
                  setPage(1)
                }}
              >
                {STATUS_LABEL[s]}
                {data && <span className={css.chipCount}>{data.counts[s] ?? 0}</span>}
              </button>
            ))}
          </div>

          {/* Date filters — only periods that actually have data are offered. */}
          {years.length > 0 && (
            <div className={css.dateFilters}>
              <FilterSelect
                value={year}
                placeholder="Year"
                options={years.map(([y, n]) => ({ value: y, label: y, count: n }))}
                onChange={(v) => {
                  setYear(v)
                  setMonth('')
                  setDay('')
                  setPage(1)
                }}
              />
              <FilterSelect
                value={month}
                placeholder="All months"
                allLabel="All months"
                options={monthsInYear.map(([mm, n]) => ({
                  value: mm,
                  label: new Date(Number(year), Number(mm) - 1, 1).toLocaleDateString('en-US', {
                    month: 'long',
                  }),
                  count: n,
                }))}
                onChange={(v) => {
                  setMonth(v)
                  setDay('')
                  setPage(1)
                }}
              />
              {month && daysInMonth.length > 0 && (
                <FilterSelect
                  value={day}
                  placeholder="All days"
                  allLabel="All days"
                  options={daysInMonth.map((d) => ({
                    value: String(Number(d.date.slice(8))),
                    label: dateLabel(d.date),
                    count: d.count,
                  }))}
                  onChange={(v) => {
                    setDay(v)
                    setPage(1)
                  }}
                />
              )}
            </div>
          )}
        </div>

        <div className={css.listWrap}>
          {data && data.items.length > 0 ? (
            <ul className={`${css.list} ${loading ? css.listDim : ''}`}>
              {data.items.map((item) => (
                <InquiryCard
                  key={`${kind}-${item.id}`}
                  kind={kind}
                  item={item}
                  token={token}
                  workHours={data.work_hours}
                  onPatched={patchItem}
                  onExpired={onExpired}
                />
              ))}
            </ul>
          ) : (
            !loading && (
              <p className={css.empty}>
                No {status === 'all' ? '' : STATUS_LABEL[status].toLowerCase() + ' '}inquiries here
                yet.
              </p>
            )
          )}
          {loading && (
            <div className={data && data.items.length > 0 ? css.listOverlay : css.loadingWrap}>
              <span className={css.spinner} role="status" aria-label="Loading" />
            </div>
          )}
        </div>

        {data && data.pages > 1 && (
          <div className={css.pager}>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={15} aria-hidden /> Prev
            </button>
            <span>
              Page {data.page} of {data.pages}
            </span>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              disabled={page >= data.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight size={15} aria-hidden />
            </button>
          </div>
        )}
      </main>
      )}
    </div>
  )
}

/* ═══════════════════════════ Account settings ═══════════════════════════ */

function AccountView({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [current, setCurrent] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getJson<{ ok: boolean; email: string }>('/session.php', token)
      .then((r) => {
        setEmail(r.email)
        setLoaded(true)
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) onExpired()
      })
  }, [token, onExpired])

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage('')
    if (password && password !== confirm) {
      setError('The new passwords do not match.')
      return
    }
    setError('')
    setBusy(true)
    try {
      const res = await postJson<{ ok: boolean; email: string; password_changed: boolean }>(
        '/admin.php',
        { action: 'update_account', email, password, current_password: current },
        token,
      )
      setEmail(res.email)
      setPassword('')
      setConfirm('')
      setCurrent('')
      setMessage(
        res.password_changed
          ? 'Saved! Your password has been changed and every other signed-in device was logged out.'
          : 'Saved! Inquiry notifications and reminders now go to ' + res.email + '.',
      )
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return onExpired()
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (!loaded) {
    return (
      <div className={css.loadingWrap}>
        <span className={css.spinner} role="status" aria-label="Loading" />
      </div>
    )
  }

  return (
    <form className={`card ${css.accountCard}`} onSubmit={submit}>
      {message && (
        <p className="alert alert--success" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="alert alert--error" role="alert">
          {error}
        </p>
      )}

      <div className="field">
        <label htmlFor="acc-email">Email</label>
        <input
          id="acc-email"
          className="input"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <p className={css.tinyHint}>
          Used to sign in here, and every inquiry notification and meeting reminder is sent to this
          address.
        </p>
      </div>

      <div className="field">
        <label htmlFor="acc-pass">New password</label>
        <input
          id="acc-pass"
          className="input"
          type="password"
          autoComplete="new-password"
          minLength={8}
          placeholder="Leave blank to keep the current one"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {password && (
        <div className="field">
          <label htmlFor="acc-confirm">Confirm new password</label>
          <input
            id="acc-confirm"
            className="input"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
      )}

      <div className={css.accountDivider} />

      <div className="field">
        <label htmlFor="acc-current">Current password</label>
        <input
          id="acc-current"
          className="input"
          type="password"
          autoComplete="current-password"
          required
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
        <p className={css.tinyHint}>Required to save any change.</p>
      </div>

      <button type="submit" className="btn btn--solid btn--sm" disabled={busy}>
        {busy ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  )
}

/* ═══════════════════════════ Inquiry card ═══════════════════════════ */

function InquiryCard({
  kind,
  item,
  token,
  workHours,
  onPatched,
  onExpired,
}: {
  kind: Kind
  item: Inquiry
  token: string
  workHours: { start: number; end: number; tz: string }
  onPatched: (id: number, patch: Partial<Inquiry>, reload?: boolean) => void
  onExpired: () => void
}) {
  const cardKey = `${kind}-${item.id}`
  const [open, setOpen] = useState(() => openCards().has(cardKey))
  const [scheduling, setScheduling] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function act(body: Record<string, unknown>, patch: (r: never) => Partial<Inquiry>) {
    setBusy(true)
    setError('')
    try {
      const res = await postJson('/admin.php', { kind, id: item.id, ...body }, token)
      onPatched(item.id, patch(res as never))
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return onExpired()
      setError(err instanceof ApiError ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  const setStatus = (status: InquiryStatus) =>
    act({ action: 'set_status', status }, () => ({ status }))

  const unschedule = () =>
    act({ action: 'unschedule' }, () => ({ status: 'contacted', appointment: null }))

  return (
    <li className={`card ${css.item}`}>
      <button
        type="button"
        className={css.itemHead}
        aria-expanded={open}
        onClick={() => {
          const willOpen = !open
          setOpen(willOpen)
          rememberOpen(cardKey, willOpen) /* survive reloads */
          /* First open = seen: clear the green new-inquiry mark locally right
             away (no list reload — a refetch could race the POST below). */
          if (willOpen && !item.viewed) {
            onPatched(item.id, { viewed: 1 }, false)
            postJson('/admin.php', { action: 'mark_viewed', kind, id: item.id }, token).catch(
              () => {},
            )
          }
        }}
      >
        <div className={css.itemWho}>
          <strong>
            {!item.viewed && <span className={css.newDot} title="New — not yet viewed" />}
            {item.name}
          </strong>
          <span className={css.itemMeta}>
            {item.reference} · {item.created_at.slice(0, 10)}
            {kind === 'franchise' && item.amount != null && <> · {peso(item.amount)}</>}
            {kind === 'contact' && item.subject && <> · {item.subject}</>}
          </span>
        </div>
        <span className={`${css.badge} ${css[`badge_${item.status}`]}`}>
          {STATUS_LABEL[item.status]}
        </span>
        <ChevronDown size={17} aria-hidden className={open ? css.caretOpen : css.caret} />
      </button>

      {item.appointment && (
        <p className={css.itemAppointment}>
          <CalendarClock size={14} aria-hidden />
          {item.appointment.ph_time} <em>PH</em>
          {item.appointment.client_tz !== PH_TZ && (
            <span>
              · client: {item.appointment.client_time} ({item.appointment.client_tz})
            </span>
          )}
          {item.meeting_type === 'online' && item.meeting_link && (
            <>
              <a
                className={css.meetLink}
                href={item.meeting_link}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <Video size={13} aria-hidden /> Google Meet
              </a>
              {meetCode(item.meeting_link) && (
                <code className={css.meetCode}>{meetCode(item.meeting_link)}</code>
              )}
            </>
          )}
          {item.meeting_type === 'inperson' && (
            <span className={css.meetBadge}>
              <MapPin size={13} aria-hidden /> In-person
            </span>
          )}
        </p>
      )}

      {open && (
        <div className={css.itemBody}>
          <dl className={css.details}>
            <div>
              <dt>
                <Mail size={13} aria-hidden /> Email
              </dt>
              <dd>
                <a href={`mailto:${item.email}`}>{item.email}</a>
              </dd>
            </div>
            <div>
              <dt>
                <Phone size={13} aria-hidden /> Mobile
              </dt>
              <dd>
                <a href={`tel:${item.dial}${item.mobile}`}>
                  {item.dial} {item.mobile}
                </a>
              </dd>
            </div>
            <div>
              <dt>
                <Globe2 size={13} aria-hidden /> Country
              </dt>
              <dd>{item.country_name}</dd>
            </div>
            {kind === 'franchise' && (
              <>
                <div>
                  <dt>
                    <MapPin size={13} aria-hidden /> Location
                  </dt>
                  <dd>{item.location}</dd>
                </div>
                <div>
                  <dt>Income</dt>
                  <dd>
                    {INCOME_LABEL[item.income ?? ''] ?? item.income}
                    {item.other_source ? ` — ${item.other_source}` : ''}
                  </dd>
                </div>
                {item.find_us && (
                  <div>
                    <dt>Found us via</dt>
                    <dd>{item.find_us.replace('-', ' ')}</dd>
                  </div>
                )}
              </>
            )}
          </dl>

          {item.message && <p className={css.message}>{item.message}</p>}

          {error && (
            <p className="alert alert--error" role="alert">
              {error}
            </p>
          )}

          <div className={css.actions}>
            {item.status === 'new' && (
              <button
                type="button"
                className="btn btn--dark btn--sm"
                disabled={busy}
                onClick={() => setStatus('contacted')}
              >
                <PhoneIconTiny /> Mark contacted
              </button>
            )}
            {(item.status === 'contacted' || item.status === 'scheduled') && (
              <button
                type="button"
                className="btn btn--solid btn--sm"
                disabled={busy}
                onClick={() => setScheduling((s) => !s)}
              >
                <CalendarClock size={15} aria-hidden />
                {item.appointment ? 'Reschedule meeting' : 'Schedule meeting'}
              </button>
            )}
            {item.status === 'scheduled' && (
              <>
                <button
                  type="button"
                  className="btn btn--dark btn--sm"
                  disabled={busy}
                  onClick={() => setStatus('completed')}
                >
                  <CheckCircle2 size={15} aria-hidden /> Mark completed
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  disabled={busy}
                  onClick={unschedule}
                >
                  Cancel meeting
                </button>
              </>
            )}
            {item.status === 'contacted' && (
              <button
                type="button"
                className="btn btn--dark btn--sm"
                disabled={busy}
                onClick={() => setStatus('completed')}
              >
                <CheckCircle2 size={15} aria-hidden /> Mark completed
              </button>
            )}
            {item.status !== 'closed' && item.status !== 'completed' && (
              <button
                type="button"
                className={`btn btn--ghost btn--sm ${css.closeBtn}`}
                disabled={busy}
                onClick={() => setStatus('closed')}
              >
                <XCircle size={15} aria-hidden /> Close
              </button>
            )}
            {(item.status === 'closed' || item.status === 'completed') && (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                disabled={busy}
                onClick={() => setStatus('contacted')}
              >
                Reopen
              </button>
            )}
          </div>

          {scheduling && (
            <ScheduleForm
              item={item}
              kind={kind}
              token={token}
              workHours={workHours}
              onDone={(patch) => {
                setScheduling(false)
                onPatched(item.id, patch)
              }}
              onExpired={onExpired}
            />
          )}
        </div>
      )}
    </li>
  )
}

function PhoneIconTiny() {
  return <Phone size={15} aria-hidden />
}

/* ═══════════════════════════ Schedule form ═══════════════════════════ */

function ScheduleForm({
  item,
  kind,
  token,
  workHours,
  onDone,
  onExpired,
}: {
  item: Inquiry
  kind: Kind
  token: string
  workHours: { start: number; end: number; tz: string }
  onDone: (patch: Partial<Inquiry>) => void
  onExpired: () => void
}) {
  const toast = useToast()
  const defaultTz = COUNTRY_DEFAULT_TZ[item.country] ?? PH_TZ
  const [abroad, setAbroad] = useState(item.country !== 'PH')
  const [tz, setTz] = useState(item.country !== 'PH' ? defaultTz : PH_TZ)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState(60)
  const [meetingType, setMeetingType] = useState<'online' | 'inperson'>('online')
  const [meetLink, setMeetLink] = useState('')
  const [slots, setSlots] = useState<Slot[] | null>(null)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const effectiveTz = abroad ? tz : PH_TZ
  /* An abroad client can only meet online. */
  const effectiveType = abroad ? 'online' : meetingType
  const linkOk = /^https:\/\/\S+\.\S+/.test(meetLink.trim())

  /* Fair slots for the picked date + duration: hours that suit BOTH the
     client's local clock and PH work hours for the meeting's full length,
     with already-booked hours flagged. Changing the duration re-shapes the
     slot list (e.g. a 2-hour meeting offers fewer, earlier start times). */
  useEffect(() => {
    if (!date) {
      setSlots(null)
      return
    }
    let stale = false
    setSlotsLoading(true)
    setTime('')
    getJson<{ ok: boolean; slots: Slot[] }>(
      `/admin.php?view=slots&date=${date}&tz=${encodeURIComponent(effectiveTz)}` +
        `&duration=${duration}&kind=${kind}&id=${item.id}`,
      token,
    )
      .then((r) => {
        if (!stale) setSlots(r.slots)
      })
      .catch(() => {
        if (!stale) setSlots([])
      })
      .finally(() => {
        if (!stale) setSlotsLoading(false)
      })
    return () => {
      stale = true
    }
  }, [date, effectiveTz, duration, kind, item.id, token])

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    /* Tell the admin exactly what's still missing instead of leaving the
       button silently disabled. */
    if (!date) {
      toast.error('Please pick a date first.')
      return
    }
    if (!time) {
      toast.error('Please pick a time slot.')
      return
    }
    if (effectiveType === 'online' && !linkOk) {
      toast.error('Please add the Google Meet link.')
      return
    }

    setBusy(true)
    setError('')
    try {
      const res = await postJson<{
        ok: boolean
        status: InquiryStatus
        appointment: Appointment
        meeting_type: 'online' | 'inperson'
        meeting_link: string | null
      }>(
        '/admin.php',
        {
          action: 'schedule',
          kind,
          id: item.id,
          date,
          time,
          tz: effectiveTz,
          duration,
          meeting_type: effectiveType,
          meeting_link: effectiveType === 'online' ? meetLink.trim() : '',
        },
        token,
      )
      onDone({
        status: res.status,
        appointment: res.appointment,
        meeting_type: res.meeting_type,
        meeting_link: res.meeting_link,
      })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return onExpired()
      setError(err instanceof ApiError ? err.message : 'Something went wrong.')
      setBusy(false)
    }
  }

  return (
    <form className={css.scheduleForm} onSubmit={submit} noValidate>
      <p className={css.scheduleTitle}>
        <CalendarClock size={15} aria-hidden /> Schedule the meeting
      </p>
      <p className={css.scheduleHint}>
        Pick the client's date and we'll suggest hours that are <strong>daytime for both
        sides</strong>: 6 AM–8 PM on the client's clock and {hour12(workHours.start)}–
        {hour12(workHours.end)} here. Hours already booked by another client are blocked.
      </p>

      <div className="field">
        <label>Duration</label>
        <div className={css.meetTypeRow}>
          {DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              className={duration === d ? css.meetTypeActive : css.meetType}
              onClick={() => setDuration(d)}
            >
              {durationLabel(d)}
            </button>
          ))}
        </div>
      </div>

      <label className={css.abroadToggle}>
        <input
          type="checkbox"
          checked={abroad}
          onChange={(e) => {
            setAbroad(e.target.checked)
            if (e.target.checked && tz === PH_TZ) setTz(defaultTz)
          }}
        />
        Client is abroad (OFW / out of the country)
      </label>

      <div className="field">
        <label>Meeting type</label>
        <div className={css.meetTypeRow}>
          <button
            type="button"
            className={effectiveType === 'online' ? css.meetTypeActive : css.meetType}
            onClick={() => setMeetingType('online')}
          >
            <Video size={15} aria-hidden /> Online · Google Meet
          </button>
          <button
            type="button"
            disabled={abroad}
            className={effectiveType === 'inperson' ? css.meetTypeActive : css.meetType}
            onClick={() => setMeetingType('inperson')}
          >
            <MapPin size={15} aria-hidden /> In-person · branch
          </button>
        </div>
        {abroad && (
          <p className={css.tinyHint}>Abroad clients can only meet online.</p>
        )}
      </div>

      {effectiveType === 'online' && (
        <div className="field">
          <label htmlFor={`meet-${item.id}`}>Google Meet link</label>
          <input
            id={`meet-${item.id}`}
            className="input"
            type="url"
            required
            placeholder="https://meet.google.com/xxx-xxxx-xxx"
            autoComplete="off"
            spellCheck={false}
            value={meetLink}
            onChange={(e) => setMeetLink(e.target.value)}
          />
          <p className={css.tinyHint}>
            Create it at meet.google.com, paste it here — the client gets a one-click "Join
            Google Meet" button in every email and on their status page.
          </p>
        </div>
      )}

      {abroad && (
        <div className="field">
          <label htmlFor={`tz-${item.id}`}>Client's timezone</label>
          <TzPicker id={`tz-${item.id}`} value={tz} onChange={setTz} />
          <p className={css.tinyHint}>
            Auto-selected from their mobile number ({item.dial} — {item.country_name}). Change it
            if they live somewhere else.
          </p>
        </div>
      )}

      <div className="field">
        <label htmlFor={`date-${item.id}`}>Date (client's)</label>
        <input
          id={`date-${item.id}`}
          className="input"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {date && (
        <div className="field">
          <label>
            Time — fair for both sides
            {effectiveTz !== PH_TZ && <span className={css.tinyHint}>Shown in the client's time; PH equivalent below each slot.</span>}
          </label>
          {slotsLoading ? (
            <div className={css.slotLoading}>
              <span className={css.spinner} role="status" aria-label="Loading slots" />
            </div>
          ) : !slots || slots.length === 0 ? (
            <p className={css.tinyHint}>
              No time on this date works for both their clock and PH work hours. Try another
              date.
            </p>
          ) : (
            <div className={css.slotGrid} role="listbox" aria-label="Available time slots">
              {slots.map((s) => {
                const disabled = s.taken || s.past
                return (
                  <button
                    key={s.time}
                    type="button"
                    role="option"
                    aria-selected={time === s.time}
                    disabled={disabled}
                    className={
                      time === s.time ? css.slotActive : disabled ? css.slotTaken : css.slot
                    }
                    onClick={() => setTime(s.time)}
                  >
                    <span className={css.slotTime}>{s.client_label}</span>
                    <span className={css.slotPh}>
                      {s.taken ? 'Booked' : s.past ? 'Past' : effectiveTz !== PH_TZ ? `PH ${s.ph_label}` : s.ph_label}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="alert alert--error" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="btn btn--solid btn--sm"
        disabled={busy}
      >
        {busy ? 'Saving…' : 'Save & email the client'}
      </button>
    </form>
  )
}

/* ═══════════════ Filter select (modern pill dropdown) ═══════════════
   Pill button + floating option panel with counts. Options only ever cover
   periods that actually contain data (the caller guarantees that). */

function FilterSelect({
  value,
  placeholder,
  allLabel,
  options,
  onChange,
}: {
  value: string
  placeholder: string
  /* When set, an option to clear the selection is offered with this label. */
  allLabel?: string
  options: Array<{ value: string; label: string; count?: number }>
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const current = options.find((o) => o.value === value)
  const pick = (v: string) => {
    onChange(v)
    setOpen(false)
  }

  return (
    <div className={css.dateFilter} ref={boxRef}>
      <button
        type="button"
        className={`${css.dateBtn} ${value ? css.dateBtnActive : ''}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((o) => !o)}
      >
        <CalendarDays size={15} aria-hidden />
        {current?.label ?? placeholder}
        <ChevronDown size={14} aria-hidden className={open ? css.caretOpen : css.caret} />
      </button>

      {open && (
        <div className={css.datePanel} role="listbox" aria-label={placeholder}>
          {allLabel && (
            <button
              type="button"
              role="option"
              aria-selected={!value}
              className={!value ? css.dateOptActive : css.dateOpt}
              onClick={() => pick('')}
            >
              {allLabel}
            </button>
          )}
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={o.value === value}
              className={o.value === value ? css.dateOptActive : css.dateOpt}
              onClick={() => pick(o.value)}
            >
              {o.label}
              {o.count !== undefined && <span className={css.dateCount}>{o.count}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════ Searchable timezone picker (combobox) ═══════════════ */

function TzPicker({
  id,
  value,
  onChange,
}: {
  id: string
  value: string
  onChange: (tz: string) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const options = useMemo(tzOptions, [])

  const q = query.trim().toLowerCase()
  const matches: TzOption[] = q
    ? options.filter((o) => o.search.includes(q)).slice(0, 40)
    : (COMMON_TZS.map((z) => options.find((o) => o.tz === z)).filter(Boolean) as TzOption[])

  /* Close when clicking anywhere outside the picker. */
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div className={css.tzPicker} ref={boxRef}>
      <input
        id={id}
        className="input"
        type="text"
        role="combobox"
        aria-expanded={open}
        autoComplete="off"
        spellCheck={false}
        placeholder="Search city, country, or timezone…"
        value={open ? query : `${value.replace(/_/g, ' ')} (${tzOffsetLabel(value)})`}
        onFocus={() => {
          setOpen(true)
          setQuery('')
        }}
        onChange={(e) => setQuery(e.target.value)}
      />
      <p className={css.tzNow}>
        Current time there: <strong>{timeNowIn(value)}</strong>
      </p>
      {open && (
        <ul className={css.tzList} role="listbox" aria-label="Timezones">
          {!q && <li className={css.tzGroup}>Common OFW destinations — type to search all</li>}
          {matches.length === 0 && (
            <li className={css.tzGroup}>
              No match — try the nearest big city (e.g. "Dubai", "London") or a country name.
            </li>
          )}
          {matches.map((o) => (
            <li key={o.tz}>
              <button
                type="button"
                role="option"
                aria-selected={o.tz === value}
                className={o.tz === value ? css.tzOptActive : css.tzOpt}
                onClick={() => {
                  onChange(o.tz)
                  setOpen(false)
                  setQuery('')
                }}
              >
                <span className={css.tzName}>{o.label}</span>
                <span className={css.tzMeta}>
                  {tzOffsetLabel(o.tz)} · now {timeNowIn(o.tz)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
