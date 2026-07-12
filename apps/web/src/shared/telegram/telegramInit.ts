// Local, narrow type for just the two methods this file calls — deliberately not
// added to shared/telegram/telegram.d.ts (out of scope for this change; that file
// stays untouched).
interface TelegramWebAppInit {
  ready?: () => void
  expand?: () => void
}

// Single place that calls Telegram.WebApp.ready()/.expand() once at app startup
// (see App.tsx). Outside Telegram — window.Telegram is undefined in a plain
// browser — this is a safe no-op, never throws, never blocks the rest of the app.
export function initTelegramWebApp(): void {
  const webApp = window.Telegram?.WebApp as unknown as TelegramWebAppInit | undefined
  if (!webApp) return

  webApp.ready?.()
  webApp.expand?.()
}
