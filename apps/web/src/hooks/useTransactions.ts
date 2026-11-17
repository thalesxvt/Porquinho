import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useActiveAccount } from './useAccounts'

interface TransactionFilters {
  page?: number
  limit?: number
  type?: 'EXPENSE' | 'INCOME' | 'INVESTMENT'
  categoryId?: string
  search?: string
  startDate?: string
  endDate?: string
}

/** Lista as transações da conta ativa. */
export function useTransactions(filters: TransactionFilters = {}) {
  const { accountId } = useActiveAccount()
  const query = useQuery({
    queryKey: ['transactions', filters, accountId],
    enabled: Boolean(accountId),
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('accountId', accountId!)
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.set(k, String(v))
      })
      const { data } = await api.get(`/transactions?${params}`)
      return data.data
    },
  })
  return Object.assign(query, { isLoading: query.isLoading || !accountId })
}

function useInvalidateAfterChange() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: ['transactions'] })
    qc.invalidateQueries({ queryKey: ['reports'] })
    // O saldo de cada conta aparece no seletor de contas.
    qc.invalidateQueries({ queryKey: ['accounts'] })
  }
}

export function useCreateTransaction() {
  const invalidate = useInvalidateAfterChange()
  return useMutation({
    mutationFn: async (input: any) => {
      const { data } = await api.post('/transactions', input)
      return data.data
    },
    onSuccess: invalidate,
  })
}

export function useUpdateTransaction() {
  const invalidate = useInvalidateAfterChange()
  return useMutation({
    mutationFn: async ({ id, ...input }: any) => {
      const { data } = await api.put(`/transactions/${id}`, input)
      return data.data
    },
    onSuccess: invalidate,
  })
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateAfterChange()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/transactions/${id}`)
    },
    onSuccess: invalidate,
  })
}
