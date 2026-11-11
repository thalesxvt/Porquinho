import { create } from 'zustand'

interface TransactionModalState {
  isOpen: boolean
  editData: any | null
  openModal: (data?: any) => void
  closeModal: () => void
}

export const useTransactionModalStore = create<TransactionModalState>((set) => ({
  isOpen: false,
  editData: null,
  openModal: (data = null) => set({ isOpen: true, editData: data }),
  closeModal: () => set({ isOpen: false, editData: null }),
}))

