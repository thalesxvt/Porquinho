import { prisma } from '../../lib/prisma'
import {
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  startOfYear, endOfYear, subWeeks, subMonths, subYears,
  eachWeekOfInterval, eachMonthOfInterval, format
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

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

async function getTotals(userId: string, start: Date, end: Date, categoryId?: string) {
  const where: any = { userId, date: { gte: start, lte: end } }
  if (categoryId) {
    where.categoryId = categoryId
  }

  const result = await prisma.transaction.groupBy({
    by: ['type'],
    where,
    _sum: { amountCents: true },
  })

  const income = result.find((r) => r.type === 'INCOME')?._sum.amountCents ?? 0
  const expense = result.find((r) => r.type === 'EXPENSE')?._sum.amountCents ?? 0
  const invested = result.find((r) => r.type === 'INVESTMENT')?._sum.amountCents ?? 0
  // Investimento sai do caixa, mas não é despesa.
  return { income, expense, invested, balance: income - expense - invested }
}

async function getPriorBalance(userId: string, beforeDate: Date) {
  const result = await prisma.transaction.groupBy({
    by: ['type'],
    where: { userId, date: { lt: beforeDate } },
    _sum: { amountCents: true },
  })

  const income = result.find((r) => r.type === 'INCOME')?._sum.amountCents ?? 0
  const expense = result.find((r) => r.type === 'EXPENSE')?._sum.amountCents ?? 0
  const invested = result.find((r) => r.type === 'INVESTMENT')?._sum.amountCents ?? 0
  return income - expense - invested
}

export class ReportsService {
  async getSummary(userId: string, period: Period, referenceDate: Date = new Date()) {
    const range = getDateRange(period, referenceDate)

    const [current, previous, rolloverBalance] = await Promise.all([
      getTotals(userId, range.start, range.end),
      getTotals(userId, range.previousStart, range.previousEnd),
      getPriorBalance(userId, range.start),
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

  async getByCategory(userId: string, period: Period, referenceDate: Date = new Date()) {
    const range = getDateRange(period, referenceDate)

    const results = await prisma.transaction.groupBy({
      by: ['categoryId', 'type'],
      where: {
        userId,
        type: 'EXPENSE',
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

  async getWeekly(userId: string, year: number, month: number) {
    const start = startOfMonth(new Date(year, month - 1))
    const end = endOfMonth(new Date(year, month - 1))

    const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 0 })

    const results = await Promise.all(
      weeks.map(async (weekStart, index) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 })
        const totals = await getTotals(userId, weekStart, weekEnd)
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

  async getAvailableMonths(userId: string) {
    const rows = await prisma.transaction.findMany({
      where: { userId },
      select: { date: true },
      distinct: ['date'],
    })

    const monthSet = new Set<string>()
    for (const row of rows) {
      monthSet.add(format(row.date, 'yyyy-MM'))
    }

    return Array.from(monthSet)
      .sort((a, b) => b.localeCompare(a)) // mais recente primeiro
  }

  async getMonthly(userId: string, year: number, categoryId?: string) {
    const start = startOfYear(new Date(year, 0))
    const end = endOfYear(new Date(year, 0))

    const months = eachMonthOfInterval({ start, end })

    const results = await Promise.all(
      months.map(async (monthStart) => {
        const monthEnd = endOfMonth(monthStart)
        const totals = await getTotals(userId, monthStart, monthEnd, categoryId)
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
}
