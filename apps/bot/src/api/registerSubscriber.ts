const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:4000'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface RegisterSubscriberInput {
  chatId: string
  username?: string | null
}

// Calls apps/api's POST /telegram/register — the bot process itself never
// touches Prisma/the database directly, it only reacts to Telegram updates and
// forwards them.
export async function registerSubscriber(input: RegisterSubscriberInput): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/telegram/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId: input.chatId, username: input.username, role: 'CLIENT' }),
  })

  const body = (await response.json()) as ApiResponse<unknown>
  if (!body.success) {
    throw new Error(body.error ?? 'Failed to register subscriber')
  }
}
