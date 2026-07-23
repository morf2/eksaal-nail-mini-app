// Falls back to the production API when API_BASE_URL isn't set on the bot's
// hosting env — same fallback apps/web/src/shared/api/apiClient.ts uses. Without
// it, a bot process deployed without this env var would silently point at
// localhost:4000 (unreachable from any hosting provider), so every /start would
// fail to register and no MASTER subscriber would ever exist to notify.
const API_BASE_URL = process.env.API_BASE_URL || 'https://eksaal-api.onrender.com'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface RegisterSubscriberInput {
  chatId: string
  username?: string | null
  role: 'CLIENT' | 'MASTER'
}

// Calls apps/api's POST /telegram/register — the bot process itself never
// touches Prisma/the database directly, it only reacts to Telegram updates and
// forwards them.
export async function registerSubscriber(input: RegisterSubscriberInput): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/telegram/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId: input.chatId, username: input.username, role: input.role }),
  })

  const body = (await response.json()) as ApiResponse<unknown>
  if (!body.success) {
    throw new Error(body.error ?? 'Failed to register subscriber')
  }
}
