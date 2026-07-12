export {}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initDataUnsafe?: {
          user?: {
            id: number
            username?: string
            first_name?: string
            last_name?: string
            photo_url?: string
          }
        }
        // Bot API 6.9+. Triggers a native Telegram prompt; the resulting contact is
        // delivered to the bot backend as a message, not returned to this callback —
        // `sent` only tells us whether the user agreed to share.
        requestContact?: (callback: (sent: boolean) => void) => void
      }
    }
  }
}
