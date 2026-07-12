const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:4000'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export type BookingAction = 'CONFIRM' | 'CANCEL'

interface BookingActionResult {
  status: string
}

// Calls apps/api's POST /telegram/booking-action — chatId is whoever tapped the
// button, verified server-side (isMasterChatId) before anything changes.
export async function updateBookingStatusViaTelegram(
  bookingId: string,
  action: BookingAction,
  chatId: string,
): Promise<BookingActionResult> {
  const response = await fetch(`${API_BASE_URL}/telegram/booking-action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId, action, chatId }),
  })

  const body = (await response.json()) as ApiResponse<BookingActionResult>
  if (!body.success || !body.data) {
    throw new Error(body.error ?? 'Failed to update booking status')
  }
  return body.data
}
