import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export type Period = 'week' | 'month' | 'year'

export interface ReportDateParams {
  date?: string
  year?: number
  month?: number
}

export function useSummary(period: Period, params?: ReportDateParams) {
  return useQuery({
    queryKey: ['reports', 'summary', period, params],
    queryFn: async () => {
      const sp = new URLSearchParams()
      sp.set('period', period)
      if (params?.date) sp.set('date', params.date)
      if (params?.year) sp.set('year', String(params.year))
      if (params?.month) sp.set('month', String(params.month))
      const { data } = await api.get(`/reports/summary?${sp.toString()}`)
      return data.data
    },
  })
}

export function useCategoryReport(period: Period, params?: ReportDateParams) {
  return useQuery({
    queryKey: ['reports', 'by-category', period, params],
    queryFn: async () => {
      const sp = new URLSearchParams()
      sp.set('period', period)
      if (params?.date) sp.set('date', params.date)
      if (params?.year) sp.set('year', String(params.year))
      if (params?.month) sp.set('month', String(params.month))
      const { data } = await api.get(`/reports/by-category?${sp.toString()}`)
      return data.data as any[]
    },
  })
}

export function useWeeklyReport(year: number, month: number) {
  return useQuery({
    queryKey: ['reports', 'weekly', year, month],
    queryFn: async () => {
      const { data } = await api.get(`/reports/weekly?year=${year}&month=${month}`)
      return data.data as any[]
    },
  })
}

export function useAvailableMonths() {
  return useQuery({
    queryKey: ['reports', 'available-months'],
    queryFn: async () => {
      const { data } = await api.get('/reports/available-months')
      return data.data as string[] // ['2026-07', '2026-08', '2026-10', '2026-11'] — mais antigo primeiro
    },
  })
}

export function useMonthlyReport(year: number, categoryId?: string) {
  return useQuery({
    queryKey: ['reports', 'monthly', year, categoryId],
    queryFn: async () => {
      const sp = new URLSearchParams()
      sp.set('year', String(year))
      if (categoryId) sp.set('categoryId', categoryId)
      const { data } = await api.get(`/reports/monthly?${sp.toString()}`)
      return data.data as any[]
    },
  })
}
