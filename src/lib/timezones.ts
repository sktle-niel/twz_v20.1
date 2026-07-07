/* Timezone helpers for the admin's appointment scheduler.

   The admin books a call at the CLIENT's local date/time. These helpers turn
   that zoned wall-clock into a real instant (for the PH-time preview) without
   any library — the backend re-does the same conversion authoritatively. */

import { COUNTRIES } from '../data/countries'

/* Minutes the zone is ahead of UTC at a given instant (handles DST). */
function offsetMinutes(tz: string, at: Date): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  )
  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  )
  return (asUTC - at.getTime()) / 60000
}

/* "2026-07-10" + "16:00" in an IANA zone -> the actual Date (instant). */
export function zonedToDate(date: string, time: string, tz: string): Date | null {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  if (!y || !m || !d || Number.isNaN(hh) || Number.isNaN(mm)) return null
  try {
    const wall = Date.UTC(y, m - 1, d, hh, mm)
    /* Two passes converge across DST transitions. */
    let guess = wall
    for (let i = 0; i < 2; i++) {
      guess = wall - offsetMinutes(tz, new Date(guess)) * 60000
    }
    return new Date(guess)
  } catch {
    return null /* unknown timezone */
  }
}

export const PH_TZ = 'Asia/Manila'

/* "Fri, Jul 10, 2026, 8:00 PM" in a given zone. */
export function formatInZone(at: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(at)
}

/* Minutes since midnight, PH time — for the work-hours preview check. */
export function phMinutes(at: Date): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: PH_TZ,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  )
  return (Number(parts.hour) % 24) * 60 + Number(parts.minute)
}

/* Every IANA zone the browser knows (fallback: a hand-picked OFW list). */
export function allTimezones(): string[] {
  try {
    return Intl.supportedValuesOf('timeZone')
  } catch {
    return [
      'Asia/Manila', 'Asia/Dubai', 'Asia/Riyadh', 'Asia/Qatar', 'Asia/Kuwait',
      'Asia/Bahrain', 'Asia/Hong_Kong', 'Asia/Singapore', 'Asia/Tokyo', 'Asia/Seoul',
      'Asia/Taipei', 'Australia/Sydney', 'Europe/London', 'Europe/Rome', 'Europe/Madrid',
      'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
      'America/Toronto', 'America/Vancouver', 'Pacific/Auckland',
    ]
  }
}

/* "UTC+04:00" / "UTC-05:30" right now (offsets shift with DST). */
export function tzOffsetLabel(tz: string, at: Date = new Date()): string {
  try {
    /* offsetMinutes carries sub-minute noise (the formatter drops the source
       date's milliseconds), so round to whole minutes. Positive = ahead of UTC. */
    const min = Math.round(offsetMinutes(tz, at))
    const sign = min < 0 ? '-' : '+'
    const abs = Math.abs(min)
    const h = String(Math.floor(abs / 60)).padStart(2, '0')
    const m = String(abs % 60).padStart(2, '0')
    return `UTC${sign}${h}:${m}`
  } catch {
    return ''
  }
}

/* "3:42 PM" right now in a zone — shown so the admin can sanity-check. */
export function timeNowIn(tz: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date())
  } catch {
    return ''
  }
}

/* ── Searchable option list ──
   IANA names are city-based ("Asia/Riyadh"), so searching "saudi" would find
   nothing. We attach the country names we know (from the site's country list)
   to their zones so country searches work too. */

export interface TzOption {
  tz: string
  label: string /* "Asia/Riyadh — Saudi Arabia" */
  search: string /* lowercase haystack: zone + countries */
}

let cachedOptions: TzOption[] | null = null

export function tzOptions(): TzOption[] {
  if (cachedOptions) return cachedOptions
  const countryNamesByTz = new Map<string, string[]>()
  for (const c of COUNTRIES) {
    const tz = COUNTRY_DEFAULT_TZ[c.iso]
    if (!tz) continue
    countryNamesByTz.set(tz, [...(countryNamesByTz.get(tz) ?? []), c.name])
  }
  cachedOptions = allTimezones().map((tz) => {
    const names = countryNamesByTz.get(tz) ?? []
    const pretty = tz.replace(/_/g, ' ')
    return {
      tz,
      label: names.length ? `${pretty} — ${names.join(', ')}` : pretty,
      search: `${pretty} ${names.join(' ')}`.toLowerCase(),
    }
  })
  return cachedOptions
}

/* Frequent OFW destinations, shown before the admin types anything. */
export const COMMON_TZS = [
  'Asia/Manila', 'Asia/Dubai', 'Asia/Riyadh', 'Asia/Qatar', 'Asia/Kuwait',
  'Asia/Bahrain', 'Asia/Hong_Kong', 'Asia/Singapore', 'Asia/Tokyo', 'Asia/Seoul',
  'Asia/Taipei', 'Australia/Sydney', 'Europe/London', 'Europe/Rome',
  'America/New_York', 'America/Los_Angeles', 'America/Toronto', 'Pacific/Auckland',
]

/* Sensible default zone per country ISO (multi-zone countries get their most
   common OFW destination). Just a preselect — the admin can change it. */
export const COUNTRY_DEFAULT_TZ: Record<string, string> = {
  PH: 'Asia/Manila', AU: 'Australia/Sydney', AT: 'Europe/Vienna', BH: 'Asia/Bahrain',
  BE: 'Europe/Brussels', BN: 'Asia/Brunei', CA: 'America/Toronto', CN: 'Asia/Shanghai',
  CY: 'Asia/Nicosia', CZ: 'Europe/Prague', DK: 'Europe/Copenhagen', FI: 'Europe/Helsinki',
  FR: 'Europe/Paris', DE: 'Europe/Berlin', GR: 'Europe/Athens', HK: 'Asia/Hong_Kong',
  IN: 'Asia/Kolkata', ID: 'Asia/Jakarta', IE: 'Europe/Dublin', IL: 'Asia/Jerusalem',
  IT: 'Europe/Rome', JP: 'Asia/Tokyo', JO: 'Asia/Amman', KW: 'Asia/Kuwait',
  LB: 'Asia/Beirut', MO: 'Asia/Macau', MY: 'Asia/Kuala_Lumpur', MT: 'Europe/Malta',
  NL: 'Europe/Amsterdam', NZ: 'Pacific/Auckland', NO: 'Europe/Oslo', OM: 'Asia/Muscat',
  PL: 'Europe/Warsaw', PT: 'Europe/Lisbon', QA: 'Asia/Qatar', SA: 'Asia/Riyadh',
  SG: 'Asia/Singapore', ZA: 'Africa/Johannesburg', KR: 'Asia/Seoul', ES: 'Europe/Madrid',
  SE: 'Europe/Stockholm', CH: 'Europe/Zurich', TW: 'Asia/Taipei', TH: 'Asia/Bangkok',
  TR: 'Europe/Istanbul', AE: 'Asia/Dubai', GB: 'Europe/London', US: 'America/New_York',
  VN: 'Asia/Ho_Chi_Minh',
}
