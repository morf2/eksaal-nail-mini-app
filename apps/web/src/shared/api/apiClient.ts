// Falls back to the production API when VITE_API_URL isn't set at build time
// (e.g. the hosting build didn't configure it) — local dev overrides via .env.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://eksaal-api.onrender.com'

interface ApiSuccess<T> {
  success: true
  data: T
}

interface ApiFailure {
  success: false
  error: string
}

type ApiResponse<T> = ApiSuccess<T> | ApiFailure

// Shared by every apps/api client (bookingsApi.ts, authApi.ts) — same
// {success,data}/{success:false,error} envelope on every endpoint.
export async function parseResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiResponse<T>
  if (!body.success) throw new Error(body.error)
  return body.data
}
