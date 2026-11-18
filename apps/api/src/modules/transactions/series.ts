/**
 * Lógica pura das séries mensais (parceladas e recorrentes) e da previsão de saldo.
 * Sem acesso ao banco, para poder ser testada isoladamente.
 *
 * Datas são tratadas em UTC: o app grava transações às 12:00 UTC do dia escolhido,
 * então somar meses em UTC preserva o dia certo em qualquer fuso do servidor.
 */

/**
 * Quantos meses à frente de hoje as séries recorrentes ficam geradas.
 * 11 meses + o mês atual = 12 ocorrências visíveis.
 */
export const RECURRING_HORIZON_MONTHS = 11

/**
 * Data `monthOffset` meses depois de `base`, no dia `dayOfMonth`.
 * Em meses mais curtos usa o último dia (31/jan + 1 mês = 28 ou 29/fev).
 */
export function occurrenceDate(base: Date, monthOffset: number, dayOfMonth: number): Date {
  const year = base.getUTCFullYear()
  const month = base.getUTCMonth() + monthOffset
  // Dia 0 do mês seguinte = último dia deste mês (Date.UTC normaliza o estouro de mês).
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  return new Date(Date.UTC(
    year,
    month,
    Math.min(dayOfMonth, daysInMonth),
    base.getUTCHours(),
    base.getUTCMinutes(),
    base.getUTCSeconds(),
  ))
}

export interface Installment {
  number: number      // 1..count
  amountCents: number
  date: Date
}

/**
 * Divide `totalCents` em `count` parcelas mensais a partir de `firstDate`.
 * O resto da divisão vai para a primeira parcela, para a soma bater exatamente.
 */
export function buildInstallments(totalCents: number, count: number, firstDate: Date): Installment[] {
  if (!Number.isInteger(totalCents) || totalCents <= 0) throw new Error('INVALID_AMOUNT')
  if (!Number.isInteger(count) || count < 1) throw new Error('INVALID_COUNT')
  if (totalCents < count) throw new Error('AMOUNT_TOO_SMALL')

  const base = Math.floor(totalCents / count)
  const remainder = totalCents - base * count
  const day = firstDate.getUTCDate()

  return Array.from({ length: count }, (_, i) => ({
    number: i + 1,
    amountCents: i === 0 ? base + remainder : base,
    date: occurrenceDate(firstDate, i, day),
  }))
}

/**
 * Próximas ocorrências mensais depois de `lastGenerated` (exclusive) até `until` (inclusive).
 * `lastGenerated` precisa ser uma ocorrência da própria série.
 */
export function nextOccurrences(lastGenerated: Date, dayOfMonth: number, until: Date): Date[] {
  const dates: Date[] = []
  for (let k = 1; ; k++) {
    const date = occurrenceDate(lastGenerated, k, dayOfMonth)
    if (date.getTime() > until.getTime()) break
    dates.push(date)
  }
  return dates
}

/** Fuso do app: Brasília (UTC−3, sem horário de verão desde 2019). */
const APP_UTC_OFFSET_HOURS = -3
const HOUR = 60 * 60 * 1000

/** "Hoje" no fuso do app, às 12:00 UTC — o mesmo formato das datas gravadas pelo web. */
export function todayAtNoon(now: Date = new Date()): Date {
  const local = new Date(now.getTime() + APP_UTC_OFFSET_HOURS * HOUR)
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate(), 12))
}

/** Início (inclusive) e fim (exclusive) do dia de `noon`, para filtros de data. */
export function dayBounds(noon: Date): { start: Date; end: Date } {
  return { start: new Date(noon.getTime() - 12 * HOUR), end: new Date(noon.getTime() + 12 * HOUR) }
}

/** Limite até onde uma série recorrente deve estar gerada, a partir de `now`. */
export function recurringHorizon(now: Date): Date {
  return occurrenceDate(now, RECURRING_HORIZON_MONTHS, now.getUTCDate())
}

export interface MonthFlow {
  income: number
  expense: number
  invested: number
}

/** Saldo acumulado no fim de cada mês, partindo de `startBalance`. */
export function projectBalances(startBalance: number, months: MonthFlow[]): number[] {
  let balance = startBalance
  return months.map((m) => {
    balance += m.income - m.expense - m.invested
    return balance
  })
}
