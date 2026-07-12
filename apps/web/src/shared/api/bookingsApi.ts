import type { Booking, BookingStatus } from '@eksaal/shared'
import { API_BASE_URL, parseResponse } from './apiClient'

// Thin client for apps/api's /bookings endpoints — mirrors the Booking shape from
// @eksaal/shared exactly, so callers (useAdminBookingsStore) never need to reshape
// data between the API and what components already read from the store.
//
// credentials: 'include' on every call so the httpOnly admin session cookie (see
// shared/api/authApi.ts) rides along — required for PATCH .../status, which the
// API rejects with 401 without it. Harmless on GET/POST, which stay public.
export async function fetchBookingsFromApi(): Promise<Booking[]> {
  const response = await fetch(`${API_BASE_URL}/bookings`, { credentials: 'include' })
  return parseResponse<Booking[]>(response)
}

export async function createBookingApi(booking: Booking): Promise<Booking> {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking),
  })
  return parseResponse<Booking>(response)
}

export async function updateBookingStatusApi(id: string, status: BookingStatus): Promise<Booking> {
  const response = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  return parseResponse<Booking>(response)
}
