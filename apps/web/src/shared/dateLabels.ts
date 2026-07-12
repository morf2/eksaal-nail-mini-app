const WEEKDAY_LABELS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
const MONTH_LABELS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
]

export function formatDateLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00`)
  return `${WEEKDAY_LABELS[parsed.getDay()]}, ${parsed.getDate()} ${MONTH_LABELS[parsed.getMonth()]}`
}
