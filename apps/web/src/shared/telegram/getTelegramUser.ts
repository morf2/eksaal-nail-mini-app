export interface TelegramUserInfo {
  telegramId: string | null
  telegramUsername: string | null
  clientName: string | null
  photoUrl: string | null
}

// Reads Telegram.WebApp.initDataUnsafe client-side, for display purposes only —
// NEVER trust this for authentication/authorization. Once the backend exists it must
// independently verify the raw initData string (HMAC check) before trusting any user
// info; this is purely so the booking form / profile can prefill data today.
export function getTelegramUser(): TelegramUserInfo {
  const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user

  if (telegramUser) {
    return {
      telegramId: String(telegramUser.id),
      telegramUsername: telegramUser.username ? `@${telegramUser.username}` : null,
      clientName: [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(' ') || null,
      photoUrl: telegramUser.photo_url ?? null,
    }
  }

  // Mock fallback for local/browser testing outside the Telegram client.
  return {
    telegramId: 'mock-000000',
    telegramUsername: '@eksaal_client',
    clientName: 'Клиент Mini App',
    photoUrl: null,
  }
}
