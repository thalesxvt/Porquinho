import React, { useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { TransactionModal } from '../transactions/TransactionModal'
import { useTransactionModalStore } from '../../stores/transactionModal.store'
import { useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth.store'
import { useTourStore } from '../../stores/tour.store'
import { Tour } from '../onboarding/Tour'

interface PageLayoutProps {
  children: React.ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  const { isOpen, closeModal, editData, openModal } = useTransactionModalStore()
  const tourOpen = useTourStore((s) => s.isOpen)
  const startTour = useTourStore((s) => s.start)
  const needsOnboarding = useAuthStore((s) => s.user?.onboardingCompletedAt === null)
  const { pathname } = useLocation()

  // Primeiro acesso: abre o tour no Dashboard (onde ficam todos os elementos que ele aponta).
  useEffect(() => {
    if (needsOnboarding && pathname === '/') startTour()
  }, [needsOnboarding, pathname, startTour])

  // Global keyboard shortcut: press 'n' or 'N' (when not typing in an input) to trigger quick transaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'n' || e.key === 'N') &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName) &&
        !e.ctrlKey &&
        !e.metaKey &&
        !isOpen &&
        !tourOpen
      ) {
        e.preventDefault()
        openModal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openModal, isOpen, tourOpen])

  return (
    <div className="min-h-[100dvh] bg-[#F1ECDA] flex flex-col antialiased selection:bg-[#111111] selection:text-[#F1ECDA]">
      <Sidebar />
      <main className="flex-1 md:pl-[var(--sidebar-width)] pt-16 md:pt-0 pb-[max(6.5rem,calc(env(safe-area-inset-bottom)+5.5rem))] md:pb-12 bg-[#F1ECDA]">
        <div className="mx-auto max-w-6xl px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8">
          {children}
        </div>
      </main>

      {/* Global Transaction Modal */}
      <TransactionModal
        isOpen={isOpen}
        onClose={closeModal}
        transaction={editData}
      />

      <Tour />
    </div>
  )
}
