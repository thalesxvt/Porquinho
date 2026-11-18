import { describe, it, expect } from 'vitest'
import {
  occurrenceDate,
  buildInstallments,
  nextOccurrences,
  recurringHorizon,
  projectBalances,
  todayAtNoon,
  dayBounds,
} from '../src/modules/transactions/series'

const d = (iso: string) => new Date(`${iso}T12:00:00.000Z`)
const day = (date: Date) => date.toISOString().slice(0, 10)

describe('occurrenceDate', () => {
  it('soma meses mantendo o dia', () => {
    expect(day(occurrenceDate(d('2026-01-10'), 1, 10))).toBe('2026-02-10')
    expect(day(occurrenceDate(d('2026-11-10'), 3, 10))).toBe('2027-02-10')
  })

  it('usa o último dia em meses mais curtos', () => {
    expect(day(occurrenceDate(d('2026-01-31'), 1, 31))).toBe('2026-02-28')
    expect(day(occurrenceDate(d('2028-01-31'), 1, 31))).toBe('2028-02-29') // bissexto
    expect(day(occurrenceDate(d('2026-01-31'), 3, 31))).toBe('2026-04-30')
  })

  it('volta ao dia original depois de um mês curto', () => {
    // A base é 28/fev (já truncada), mas o dia da série é 31.
    expect(day(occurrenceDate(d('2026-02-28'), 1, 31))).toBe('2026-03-31')
  })

  it('preserva o horário', () => {
    expect(occurrenceDate(d('2026-01-10'), 1, 10).toISOString()).toBe('2026-02-10T12:00:00.000Z')
  })
})

describe('buildInstallments', () => {
  it('divide com o resto na primeira parcela e soma exata', () => {
    const parts = buildInstallments(10000, 3, d('2026-11-18'))
    expect(parts.map((p) => p.amountCents)).toEqual([3334, 3333, 3333])
    expect(parts.reduce((s, p) => s + p.amountCents, 0)).toBe(10000)
    expect(parts.map((p) => p.number)).toEqual([1, 2, 3])
    expect(parts.map((p) => day(p.date))).toEqual(['2026-11-18', '2026-12-18', '2027-01-18'])
  })

  it('divide igualmente quando não há resto', () => {
    expect(buildInstallments(1200, 12, d('2026-01-05')).every((p) => p.amountCents === 100)).toBe(true)
  })

  it('mantém o dia 31 nos meses que o têm', () => {
    const dates = buildInstallments(400, 4, d('2026-01-31')).map((p) => day(p.date))
    expect(dates).toEqual(['2026-01-31', '2026-02-28', '2026-03-31', '2026-04-30'])
  })

  it('recusa valores inválidos', () => {
    expect(() => buildInstallments(0, 3, d('2026-01-01'))).toThrow('INVALID_AMOUNT')
    expect(() => buildInstallments(100, 0, d('2026-01-01'))).toThrow('INVALID_COUNT')
    expect(() => buildInstallments(2, 3, d('2026-01-01'))).toThrow('AMOUNT_TOO_SMALL')
  })
})

describe('nextOccurrences', () => {
  it('gera depois da última (exclusive) até o limite (inclusive)', () => {
    const dates = nextOccurrences(d('2026-11-18'), 18, d('2027-02-18')).map(day)
    expect(dates).toEqual(['2026-12-18', '2027-01-18', '2027-02-18'])
  })

  it('não gera nada se já está no limite (idempotente)', () => {
    expect(nextOccurrences(d('2027-02-18'), 18, d('2027-02-18'))).toEqual([])
  })

  it('continua do ponto onde parou sem duplicar', () => {
    const first = nextOccurrences(d('2026-01-31'), 31, d('2026-03-31'))
    const rest = nextOccurrences(first[first.length - 1], 31, d('2026-05-31'))
    expect([...first, ...rest].map(day)).toEqual(['2026-02-28', '2026-03-31', '2026-04-30', '2026-05-31'])
  })
})

describe('recurringHorizon', () => {
  it('dá 12 ocorrências contando a de hoje', () => {
    const today = d('2026-11-18')
    const dates = [today, ...nextOccurrences(today, 18, recurringHorizon(today))]
    expect(dates).toHaveLength(12)
    expect(day(dates[11])).toBe('2027-10-18')
  })
})

describe('todayAtNoon', () => {
  it('usa a data de Brasília, não a UTC', () => {
    // 01:30 UTC de 19/11 ainda é 22:30 de 18/11 em Brasília.
    expect(todayAtNoon(new Date('2026-11-19T01:30:00.000Z')).toISOString()).toBe('2026-11-18T12:00:00.000Z')
    expect(todayAtNoon(new Date('2026-11-19T03:00:00.000Z')).toISOString()).toBe('2026-11-19T12:00:00.000Z')
  })

  it('dayBounds cobre o dia inteiro', () => {
    const { start, end } = dayBounds(d('2026-11-18'))
    expect(start.toISOString()).toBe('2026-11-18T00:00:00.000Z')
    expect(end.toISOString()).toBe('2026-11-19T00:00:00.000Z')
  })
})

describe('projectBalances', () => {
  it('acumula o saldo mês a mês', () => {
    expect(projectBalances(1000, [
      { income: 500, expense: 200, invested: 100 },
      { income: 0, expense: 1500, invested: 0 },
      { income: 300, expense: 0, invested: 0 },
    ])).toEqual([1200, -300, 0])
  })

  it('sem meses devolve lista vazia', () => {
    expect(projectBalances(1000, [])).toEqual([])
  })
})
