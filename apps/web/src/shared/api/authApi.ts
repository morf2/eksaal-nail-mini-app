import { API_BASE_URL, parseResponse } from './apiClient'

interface SessionResult {
  authenticated: boolean
}

// credentials: 'include' is required on all three — it's what lets the browser
// send/receive the httpOnly admin session cookie set by apps/api. No password
// hashing happens here at all; the frontend just forwards what the admin typed.
export async function loginApi(login: string, password: string): Promise<SessionResult> {
  const response = await fetch(`${API_BASE_URL}/admin/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password }),
  })
  return parseResponse<SessionResult>(response)
}

export async function logoutApi(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/logout`, {
    method: 'POST',
    credentials: 'include',
  })
  await parseResponse<null>(response)
}

export async function fetchSessionApi(): Promise<SessionResult> {
  const response = await fetch(`${API_BASE_URL}/admin/session`, {
    credentials: 'include',
  })
  return parseResponse<SessionResult>(response)
}
