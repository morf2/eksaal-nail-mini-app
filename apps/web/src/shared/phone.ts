// UI-only masking/validation for Russian phone numbers. Canonical internal state is the
// 10-digit subscriber number (i.e. everything after the fixed "+7" prefix) — the +7/8
// country/trunk prefix is normalized away on input and re-added only for display/storage.

export function extractSubscriberDigits(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  // a full 11-digit paste like "89001234567" or "79001234567" — drop the leading prefix
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    digits = digits.slice(1)
  }
  return digits.slice(0, 10)
}

// Formats only the editable part (no +7) — this is what the <input> itself should
// display, since +7 is rendered as a separate fixed, non-editable prefix next to it.
export function formatSubscriberDigits(subscriberDigits: string): string {
  let formatted = ''
  if (subscriberDigits.length > 0) formatted += subscriberDigits.slice(0, 3)
  if (subscriberDigits.length > 3) formatted += ` ${subscriberDigits.slice(3, 6)}`
  if (subscriberDigits.length > 6) formatted += `-${subscriberDigits.slice(6, 8)}`
  if (subscriberDigits.length > 8) formatted += `-${subscriberDigits.slice(8, 10)}`
  return formatted
}

// Full "+7 900 123-45-67" form — for read-only display contexts (e.g. admin cards),
// never fed back through an <input>'s onChange.
export function formatRussianPhone(subscriberDigits: string): string {
  const rest = formatSubscriberDigits(subscriberDigits)
  return rest ? `+7 ${rest}` : '+7'
}

export function formatE164ForDisplay(e164: string | null): string {
  if (!e164) return ''
  return formatRussianPhone(extractSubscriberDigits(e164))
}

export function isValidRussianPhone(subscriberDigits: string): boolean {
  return subscriberDigits.length === 10
}

export function getPhoneError(subscriberDigits: string): string | null {
  if (subscriberDigits.length === 0) return 'Введите номер телефона'
  if (subscriberDigits.length < 10) return 'Введите минимум 10 цифр номера'
  return null
}

export function toE164(subscriberDigits: string): string {
  return `+7${subscriberDigits}`
}
