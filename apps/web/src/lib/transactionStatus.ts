import { format } from 'date-fns'

/** "Hoje" no fuso do navegador, às 12:00 UTC — o formato das datas gravadas. */
export function todayNoonIso(): string {
  return `${format(new Date(), 'yyyy-MM-dd')}T12:00:00.000Z`
}

/** Pendente com vencimento antes de hoje. */
export function isOverdue(t: { status?: string; date: string }): boolean {
  return t.status === 'PENDING' && t.date.slice(0, 10) < format(new Date(), 'yyyy-MM-dd')
}
