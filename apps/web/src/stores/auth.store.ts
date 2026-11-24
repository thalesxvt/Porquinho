import { create } from 'zustand'
import type { AuthUser } from '@porquinho/types'
import { queryClient } from '../lib/queryClient'
import { useAccountStore } from './account.store'

/**
 * Login e logout trocam de tela sem recarregar a página: sem isto, quem entra
 * depois no mesmo aparelho veria por alguns minutos as contas, categorias e
 * relatórios em cache da pessoa anterior.
 */
function resetUserData() {
  queryClient.clear()
  useAccountStore.getState().clearSelection()
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: AuthUser) => void
  /** Atualiza só os dados do usuário (sem trocar o token). */
  setUser: (user: AuthUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: (() => {
    try {
      const stored = localStorage.getItem('porquinho:user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })(),
  token: localStorage.getItem('porquinho:token'),
  isAuthenticated: !!localStorage.getItem('porquinho:token'),
  login: (token, user) => {
    // Só limpa quando entra OUTRA pessoa. O perfil também chama login() para
    // trocar o token depois de salvar, e aí cache e conta escolhida devem ficar.
    if (get().user?.id !== user.id) resetUserData()
    localStorage.setItem('porquinho:token', token)
    localStorage.setItem('porquinho:user', JSON.stringify(user))
    set({ token, user, isAuthenticated: true })
  },
  setUser: (user) => {
    localStorage.setItem('porquinho:user', JSON.stringify(user))
    set({ user })
  },
  logout: () => {
    resetUserData()
    localStorage.removeItem('porquinho:token')
    localStorage.removeItem('porquinho:user')
    set({ token: null, user: null, isAuthenticated: false })
  },
}))
