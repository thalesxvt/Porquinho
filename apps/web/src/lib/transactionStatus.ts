import { format } from 'date-fns'

/** "Hoje" no fuso do navegador, às 12:00 UTC — o formato das datas gravadas. */
export function todayNoonIso(): string {
  return `${format(new Date(), 'yyyy-MM-dd')}T12:00:00.000Z`
}

/**
 * Data sugerida ('yyyy-MM-dd') ao lançar a partir de um mês: hoje, se for o mês
 * atual; senão o dia `fallbackDay` daquele mês.
 */
export function suggestedDateInMonth(month: Date, fallbackDay = 1): string {
  const today = new Date()
  if (format(month, 'yyyy-MM') === format(today, 'yyyy-MM')) return format(today, 'yyyy-MM-dd')
  return `${format(month, 'yyyy-MM')}-${String(fallbackDay).padStart(2, '0')}`
}

/** Pendente com vencimento antes de hoje. */
export function isOverdue(t: { status?: string; date: string }): boolean {
  return t.status === 'PENDING' && t.date.slice(0, 10) < format(new Date(), 'yyyy-MM-dd')
}
