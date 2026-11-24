import { create } from 'zustand'

const STORAGE_KEY = 'porquinho:account'

function readStored(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

interface AccountState {
  /** Conta escolhida no seletor. Se não existir mais, a primeira conta é usada. */
  selectedAccountId: string | null
  selectAccount: (id: string) => void
  /** Esquece a conta escolhida (ao trocar de usuário). */
  clearSelection: () => void
}

export const useAccountStore = create<AccountState>((set) => ({
  selectedAccountId: readStored(),
  selectAccount: (id) => {
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // Sem storage (aba privada etc.): a escolha vale só nesta sessão.
    }
    set({ selectedAccountId: id })
  },
  clearSelection: () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Sem storage: só limpa o estado em memória.
    }
    set({ selectedAccountId: null })
  },
}))
