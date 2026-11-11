import { format, parseISO, isToday, isYesterday, isThisYear } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatCurrency(cents: number): string {
  const safeCents = Number.isFinite(cents) ? cents : 0
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeCents / 100)
}

export function formatCurrencyCompact(cents: number): string {
  const safeValue = (Number.isFinite(cents) ? cents : 0) / 100
  if (Math.abs(safeValue) >= 1_000_000) {
    return `R$ ${(safeValue / 1_000_000).toFixed(1).replace('.', ',')}M`
  }
  if (Math.abs(safeValue) >= 1_000) {
    return `R$ ${(safeValue / 1_000).toFixed(1).replace('.', ',')}k`
  }
  return formatCurrency(cents)
}

export function formatDate(dateString: string): string {
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR })
  } catch {
    return dateString
  }
}

export function formatDateRelative(dateString: string): string {
  try {
    const date = parseISO(dateString)
    if (isToday(date)) return 'Hoje'
    if (isYesterday(date)) return 'Ontem'
    if (isThisYear(date)) {
      return format(date, "d 'de' MMM", { locale: ptBR })
    }
    return format(date, "d 'de' MMM, yyyy", { locale: ptBR })
  } catch {
    return dateString
  }
}

export function formatDateLong(dateString: string): string {
  try {
    return format(parseISO(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  } catch {
    return dateString
  }
}

export function toCents(value: string | number): number {
  if (typeof value === 'number') return Math.round(value * 100)
  // Accepts "149.90", "149,90", "R$ 149,90"
  const cleaned = value.replace(/[^\d.,-]/g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : Math.round(num * 100)
}

export function centsToFloat(cents: number): string {
  const safeCents = Number.isFinite(cents) ? cents : 0
  return (safeCents / 100).toFixed(2).replace('.', ',')
}

export function getPercentageChange(current: number, previous: number): number {
  if (!previous || previous === 0) {
    return current > 0 ? 100 : 0
  }
  return Math.round(((current - previous) / Math.abs(previous)) * 100)
}
