import { prisma } from '../../lib/prisma'
import {
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  startOfYear, endOfYear, subWeeks, subMonths, subYears,
  eachWeekOfInterval, eachMonthOfInterval, format
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { dayBounds, projectBalances, todayAtNoon, type MonthFlow } from '../transactions/series'
import { extendRecurringSeries } from '../transactions/series.service'
import { mapTransaction, transactionInclude } from '../transactions/transactions.service'

type Period = 'week' | 'month' | 'year'

function getDateRange(period: Period, referenceDate = new Date()) {
  switch (period) {
    case 'week':
      return {
        start: startOfWeek(referenceDate, { weekStartsOn: 0 }),
        end: endOfWeek(referenceDate, { weekStartsOn: 0 }),
        previousStart: startOfWeek(subWeeks(referenceDate, 1), { weekStartsOn: 0 }),
        previousEnd: endOfWeek(subWeeks(referenceDate, 1), { weekStartsOn: 0 }),
      }
    case 'month':
      return {
        start: startOfMonth(referenceDate),
        end: endOfMonth(referenceDate),
        previousStart: startOfMonth(subMonths(referenceDate, 1)),
        previousEnd: endOfMonth(subMonths(referenceDate, 1)),
      }
    case 'year':
      return {
        start: startOfYear(referenceDate),
        end: endOfYear(referenceDate),
        previousStart: startOfYear(subYears(referenceDate, 1)),
        previousEnd: endOfYear(subYears(referenceDate, 1)),
      }
  }
}

async function getTotals(userId: string, accountId: string, start: Date, end: Date, categoryId?: string) {
  // Relatórios mostram o realizado: pendentes (contas a pagar/receber) ficam fora.
  const where: any = { userId, accountId, status: 'PAID', date: { gte: start, lte: end } }
  if (categoryId) {
    where.categoryId = categoryId
  }

  const result = await prisma.transaction.groupBy({
    by: ['type'],
    where,
    _sum: { amountCents: true },
  })

  const sum = (type: string) =>
    result
      .filter((r) => r.type === type)
      .reduce((acc, r) => acc + (r._sum.amountCents ?? 0), 0)

  const income = sum('INCOME')
  const expense = sum('EXPENSE')
  const invested = sum('INVESTMENT')
  // Investimento sai do caixa, mas não é despesa.
  return { income, expense, invested, balance: income - expense - invested }
}

/**
 * Saldo realizado (só PAID) antes de `beforeDate`, ou de todo o histórico se omitida.
 * Inclui o saldo inicial da conta, que vale desde antes do primeiro lançamento.
 */
async function getPriorBalance(userId: string, accountId: string, beforeDate?: Date) {
  const [result, account] = await Promise.all([
    prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        accountId,
        status: 'PAID',
        ...(beforeDate && { date: { lt: beforeDate } }),
      },
      _sum: { amountCents: true },
    }),
    prisma.account.findFirst({ where: { id: accountId, userId }, select: { initialBalanceCents: true } }),
  ])

  const income = result.find((r) => r.type === 'INCOME')?._sum.amountCents ?? 0
  const expense = result.find((r) => r.type === 'EXPENSE')?._sum.amountCents ?? 0
  const invested = result.find((r) => r.type === 'INVESTMENT')?._sum.amountCents ?? 0
  return (account?.initialBalanceCents ?? 0) + income - expense - invested
}

export class ReportsService {
  async getSummary(userId: string, accountId: string, period: Period, referenceDate: Date = new Date()) {
    const range = getDateRange(period, referenceDate)

    const [current, previous, rolloverBalance] = await Promise.all([
      getTotals(userId, accountId, range.start, range.end),
      getTotals(userId, accountId, range.previousStart, range.previousEnd),
      getPriorBalance(userId, accountId, range.start),
    ])

    const monthBalance = current.balance
    const totalBalance = rolloverBalance + monthBalance

    return {
      totalIncome: current.income,
      totalExpense: current.expense,
      totalInvested: current.invested,
      monthBalance,
      rolloverBalance,
      balance: totalBalance,
      previousIncome: previous.income,
      previousExpense: previous.expense,
      previousInvested: previous.invested,
      previousBalance: previous.balance,
    }
  }

  async getByCategory(userId: string, accountId: string, period: Period, referenceDate: Date = new Date()) {
    const range = getDateRange(period, referenceDate)

    const results = await prisma.transaction.groupBy({
      by: ['categoryId', 'type'],
      where: {
        userId,
        accountId,
        type: 'EXPENSE',
        status: 'PAID',
        date: { gte: range.start, lte: range.end },
      },
      _sum: { amountCents: true },
      _count: true,
    })

    const totalExpense = results.reduce((sum, r) => sum + (r._sum.amountCents ?? 0), 0)

    const categories = await prisma.category.findMany({
      where: { id: { in: results.map((r) => r.categoryId) } },
      select: { id: true, name: true, color: true },
    })

    return results.map((r) => {
      const cat = categories.find((c) => c.id === r.categoryId)!
      const total = r._sum.amountCents ?? 0
      return {
        categoryId: r.categoryId,
        categoryName: cat.name,
        categoryColor: cat.color,
        total,
        percentage: totalExpense > 0 ? Math.round((total / totalExpense) * 100 * 10) / 10 : 0,
        count: r._count,
      }
    }).sort((a, b) => b.total - a.total)
  }

  async getWeekly(userId: string, accountId: string, year: number, month: number) {
    const start = startOfMonth(new Date(year, month - 1))
    const end = endOfMonth(new Date(year, month - 1))

    const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 0 })

    const results = await Promise.all(
      weeks.map(async (weekStart, index) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 })
        const totals = await getTotals(userId, accountId, weekStart, weekEnd)
        return {
          week: `Semana ${index + 1}`,
          startDate: weekStart.toISOString(),
          endDate: weekEnd.toISOString(),
          totalExpense: totals.expense,
          totalIncome: totals.income,
          totalInvested: totals.invested,
        }
      })
    )

    return results
  }

  async getAvailableMonths(userId: string, accountId: string) {
    const rows = await prisma.transaction.findMany({
      where: { userId, accountId, status: 'PAID' },
      select: { date: true },
      distinct: ['date'],
    })

    // O mês atual entra sempre, mesmo sem transação paga: na virada do mês ele
    // só tem pendentes, e precisa aparecer nos atalhos e no filtro mesmo assim.
    // (todayAtNoon é 12:00 UTC, então o format dá o mesmo mês em qualquer fuso.)
    const monthSet = new Set<string>([format(todayAtNoon(), 'yyyy-MM')])
    for (const row of rows) {
      monthSet.add(format(row.date, 'yyyy-MM'))
    }

    return Array.from(monthSet)
      .sort((a, b) => b.localeCompare(a)) // mais recente primeiro
  }

  async getMonthly(userId: string, accountId: string, year: number, categoryId?: string) {
    const start = startOfYear(new Date(year, 0))
    const end = endOfYear(new Date(year, 0))

    const months = eachMonthOfInterval({ start, end })

    const results = await Promise.all(
      months.map(async (monthStart) => {
        const monthEnd = endOfMonth(monthStart)
        const totals = await getTotals(userId, accountId, monthStart, monthEnd, categoryId)
        return {
          month: format(monthStart, 'yyyy-MM'),
          monthLabel: format(monthStart, 'MMM', { locale: ptBR }),
          totalExpense: totals.expense,
          totalIncome: totals.income,
          totalInvested: totals.invested,
          balance: totals.balance,
        }
      })
    )

    return results
  }

  /** Pendentes vencidas + as que vencem nos próximos `days` dias, com totais. */
  async getUpcoming(userId: string, accountId: string, days: number) {
    await extendRecurringSeries(userId)

    const today = dayBounds(todayAtNoon())
    const limit = new Date(today.end.getTime() + days * 24 * 60 * 60 * 1000)

    const rows = await prisma.transaction.findMany({
      where: { userId, accountId, status: 'PENDING', date: { lt: limit } },
      include: transactionInclude,
      orderBy: { date: 'asc' },
    })
    const items = rows.map(mapTransaction)

    let totalToPay = 0
    let totalToReceive = 0
    for (const t of items) {
      if (t.type === 'INCOME') totalToReceive += t.amountCents
      else totalToPay += t.amountCents
    }

    const startMs = today.start.getTime()
    return {
      overdue: items.filter((t) => new Date(t.date).getTime() < startMs),
      upcoming: items.filter((t) => new Date(t.date).getTime() >= startMs),
      totalToPay,
      totalToReceive,
    }
  }

  /**
   * Previsão de saldo: parte do saldo realizado de hoje e soma, mês a mês,
   * as pendentes. Pendentes atrasadas entram no mês atual.
   */
  async getForecast(userId: string, accountId: string, months: number) {
    await extendRecurringSeries(userId)

    const today = todayAtNoon()
    const year = today.getUTCFullYear()
    const month = today.getUTCMonth()
    // Início de cada mês (UTC) do atual até atual + months; o último é só o limite.
    const bounds = Array.from({ length: months + 1 }, (_, i) => new Date(Date.UTC(year, month + i, 1)))

    const [currentBalance, pending] = await Promise.all([
      getPriorBalance(userId, accountId),
      prisma.transaction.findMany({
        where: {
          userId,
          accountId,
          status: 'PENDING',
          date: { lt: bounds[months] },
        },
        select: { amountCents: true, type: true, date: true },
      }),
    ])

    const flows: MonthFlow[] = Array.from({ length: months }, () => ({ income: 0, expense: 0, invested: 0 }))
    for (const t of pending) {
      // Atrasadas (antes do mês atual) caem no mês atual: ainda vão sair do caixa.
      const i = Math.max(0, bounds.findIndex((b, k) => k < months && t.date < bounds[k + 1]))
      if (t.type === 'INCOME') flows[i].income += t.amountCents
      else if (t.type === 'EXPENSE') flows[i].expense += t.amountCents
      else flows[i].invested += t.amountCents
    }

    const balances = projectBalances(currentBalance, flows)

    return {
      currentBalance,
      months: flows.map((f, i) => {
        // Dia 15 ao meio-dia evita que o fuso do servidor troque o mês do rótulo.
        const labelDate = new Date(Date.UTC(year, month + i, 15, 12))
        return {
          month: format(labelDate, 'yyyy-MM'),
          monthLabel: format(labelDate, 'MMM', { locale: ptBR }),
          expectedIncome: f.income,
          expectedExpense: f.expense,
          expectedInvested: f.invested,
          endingBalance: balances[i],
        }
      }),
    }
  }
}
