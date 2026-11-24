import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Account } from '@porquinho/types'
import { api } from '../lib/api'
import { useAccountStore } from '../stores/account.store'

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data } = await api.get('/accounts')
      return data.data as Account[]
    },
  })
}

/** Conta ativa no app inteiro: a escolhida no seletor ou, na falta dela, a primeira. */
export function useActiveAccount() {
  const { data: accounts = [], isLoading } = useAccounts()
  const selectedAccountId = useAccountStore((s) => s.selectedAccountId)
  const account = accounts.find((a) => a.id === selectedAccountId) ?? accounts[0]
  return { accounts, account, accountId: account?.id, isLoading }
}

function useInvalidateAll() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: ['accounts'] })
    qc.invalidateQueries({ queryKey: ['transactions'] })
    qc.invalidateQueries({ queryKey: ['reports'] })
  }
}

export function useCreateAccount() {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: async (input: { name: string; color: string; initialBalanceCents?: number }) => {
      const { data } = await api.post('/accounts', input)
      return data.data
    },
    onSuccess: invalidate,
  })
}

export function useUpdateAccount() {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: async ({ id, ...input }: { id: string; name?: string; color?: string; initialBalanceCents?: number }) => {
      const { data } = await api.put(`/accounts/${id}`, input)
      return data.data
    },
    onSuccess: invalidate,
  })
}

export function useDeleteAccount() {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/accounts/${id}`)
    },
    onSuccess: invalidate,
  })
}
