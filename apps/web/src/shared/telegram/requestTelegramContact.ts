// Prepares the "Поделиться контактом" flow for a real Telegram Mini App.
//
// IMPORTANT: Telegram.WebApp.requestContact() does NOT return the phone number to this
// client-side callback — Telegram delivers it to the bot as a `contact` message. Until
// the bot backend exists to receive that message and relay the number back to the Mini
// App (e.g. via a short-lived API call the frontend can poll), this resolves to null
// after a real share so the caller falls back to manual entry.
//
// Outside Telegram (local/browser testing) it resolves a mock number so the button and
// the rest of the flow can still be exercised end-to-end during development.
export function requestTelegramContact(): Promise<string | null> {
  return new Promise((resolve) => {
    const webApp = window.Telegram?.WebApp

    if (webApp?.requestContact) {
      webApp.requestContact(() => {
        resolve(null)
      })
      return
    }

    resolve('+79001234567')
  })
}
