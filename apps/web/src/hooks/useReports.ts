import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useActiveAccount } from './useAccounts'
import type { Forecast, UpcomingSummary } from '@porquinho/types'

export type Period = 'week' | 'month' | 'year'

export interface ReportDateParams {
  date?: string
  year?: number
  month?: number
}

/**
 * Todos os relatórios são da conta ativa. Enquanto a conta ainda não carregou,
 * a consulta fica desligada e é reportada como carregando (mostra skeleton).
 */
function useAccountQuery<T>(key: unknown[], path: (sp: URLSearchParams) => string): UseQueryResult<T> & { isLoading: boolean } {
  const { accountId } = useActiveAccount()
  const query = useQuery({
    queryKey: ['reports', ...key, accountId],
    enabled: Boolean(accountId),
    queryFn: async () => {
      const sp = new URLSearchParams()
      sp.set('accountId', accountId!)
      const { data } = await api.get(path(sp))
      return data.data as T
    },
  })
  return Object.assign(query, { isLoading: query.isLoading || !accountId })
}

function setDateParams(sp: URLSearchParams, params?: ReportDateParams) {
  if (params?.date) sp.set('date', params.date)
  if (params?.year) sp.set('year', String(params.year))
  if (params?.month) sp.set('month', String(params.month))
}

export function useSummary(period: Period, params?: ReportDateParams) {
  return useAccountQuery<any>(['summary', period, params], (sp) => {
    sp.set('period', period)
    setDateParams(sp, params)
    return `/reports/summary?${sp.toString()}`
  })
}

export function useCategoryReport(period: Period, params?: ReportDateParams) {
  return useAccountQuery<any[]>(['by-category', period, params], (sp) => {
    sp.set('period', period)
    setDateParams(sp, params)
    return `/reports/by-category?${sp.toString()}`
  })
}

/** Pendentes vencidas + as que vencem nos próximos `days` dias. */
export function useUpcoming(days = 30) {
  return useAccountQuery<UpcomingSummary>(['upcoming', days], (sp) => {
    sp.set('days', String(days))
    return `/reports/upcoming?${sp.toString()}`
  })
}

/** Saldo previsto para os próximos `months` meses, somando as pendentes. */
export function useForecast(months = 6) {
  return useAccountQuery<Forecast>(['forecast', months], (sp) => {
    sp.set('months', String(months))
    return `/reports/forecast?${sp.toString()}`
  })
}

export function useWeeklyReport(year: number, month: number) {
  return useAccountQuery<any[]>(['weekly', year, month], (sp) => {
    sp.set('year', String(year))
    sp.set('month', String(month))
    return `/reports/weekly?${sp.toString()}`
  })
}

export function useAvailableMonths() {
  // ['2026-11', '2026-10', ...] — mais recente primeiro
  return useAccountQuery<string[]>(['available-months'], (sp) => `/reports/available-months?${sp.toString()}`)
}

export function useMonthlyReport(year: number, categoryId?: string) {
  return useAccountQuery<any[]>(['monthly', year, categoryId], (sp) => {
    sp.set('year', String(year))
    if (categoryId) sp.set('categoryId', categoryId)
    return `/reports/monthly?${sp.toString()}`
  })
}
