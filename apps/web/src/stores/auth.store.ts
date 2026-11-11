import { create } from 'zustand'

interface AuthUser {
  id: string
  name: string
  email: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: AuthUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    try {
      const stored = localStorage.getItem('porquinho:user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })(),
  token: localStorage.getItem('porquinho:token'),
  isAuthenticated: !!localStorage.getItem('porquinho:token'),
  login: (token, user) => {
    localStorage.setItem('porquinho:token', token)
    localStorage.setItem('porquinho:user', JSON.stringify(user))
    set({ token, user, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('porquinho:token')
    localStorage.removeItem('porquinho:user')
    set({ token: null, user: null, isAuthenticated: false })
  },
}))
