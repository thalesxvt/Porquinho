import { create } from 'zustand'
import type { AuthUser } from '@porquinho/types'
import { api } from '../lib/api'
import { useAuthStore } from './auth.store'
import { TOUR_STEPS } from '../components/onboarding/tourSteps'

interface TourState {
  isOpen: boolean
  stepIndex: number
  start: () => void
  next: () => void
  prev: () => void
  /** Fecha o tour (concluído ou pulado) e marca no servidor que o usuário já o viu. */
  finish: () => void
}

export const useTourStore = create<TourState>((set, get) => ({
  isOpen: false,
  stepIndex: 0,
  start: () => set({ isOpen: true, stepIndex: 0 }),
  next: () => {
    const { stepIndex, finish } = get()
    if (stepIndex >= TOUR_STEPS.length - 1) finish()
    else set({ stepIndex: stepIndex + 1 })
  },
  prev: () => set((s) => ({ stepIndex: Math.max(0, s.stepIndex - 1) })),
  finish: () => {
    set({ isOpen: false, stepIndex: 0 })
    const { user, setUser } = useAuthStore.getState()
    if (user?.onboardingCompletedAt !== null) return
    api
      .post<{ data: AuthUser }>('/auth/onboarding/complete')
      .then((res) => setUser(res.data.data))
      // Sem rede: o tour volta a aparecer no próximo acesso, o que é aceitável.
      .catch(() => {})
  },
}))
