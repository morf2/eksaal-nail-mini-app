// Pure time-math helpers — reused by the frontend today and by the future backend
// (slot/duration calculations must stay identical on both sides).

export function addMinutesToTime(time: string, minutesToAdd: number): string {
  const [hours, minutes] = time.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + minutesToAdd
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60)
  const endHours = Math.floor(normalized / 60)
  const endMinutes = normalized % 60
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
}

// Local-calendar-date "YYYY-MM-DD", NOT date.toISOString().slice(0, 10). The latter
// converts to UTC first, which silently shifts the date by one day for any positive
// UTC offset (all of Russia — exactly where this app's users are) whenever local time
// is past midnight but UTC hasn't rolled over yet. Always use this for date-only values.
export function toLocalISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
