/* Tiny client for the Two Wheels Zone API (twowheelszone-api).
   Set VITE_API_URL in .env.local (defaults to the local dev server). */

const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8001'

export class ApiError extends Error {
  readonly status: number
  /* Per-field messages from a 422 validation response. */
  readonly fieldErrors?: Record<string, string>

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export interface SubmitResult {
  ok: boolean
  reference: string
  emailed?: boolean
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, init)
  } catch {
    throw new ApiError('Could not reach the server. Please check your connection and try again.', 0)
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const fieldErrors: Record<string, string> | undefined = data.errors
    const message: string =
      data.error ??
      (fieldErrors && Object.values(fieldErrors)[0]) ??
      'Something went wrong. Please try again.'
    throw new ApiError(message, res.status, fieldErrors)
  }
  return data as T
}

export function postJson<T = SubmitResult>(path: string, body: unknown, token?: string): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
}

export function getJson<T>(path: string, token?: string): Promise<T> {
  return request<T>(path, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export function deleteJson<T>(path: string, token?: string): Promise<T> {
  return request<T>(path, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

/* ── Shared shapes ── */

export interface Appointment {
  client_time: string
  client_tz: string
  ph_time: string
  utc: string
  duration_minutes: number
  /* Present on the public status payload. */
  meeting_type?: 'online' | 'inperson' | null
  meeting_link?: string | null
}

export type InquiryStatus = 'new' | 'contacted' | 'scheduled' | 'completed' | 'closed'
