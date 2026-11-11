import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-zinc-950/50 backdrop-blur-xs transition-opacity" />

      {/* Modal Dialog Box */}
      <div
        className={cn(
          'relative z-10 w-full rounded-t-3xl sm:rounded-2xl border border-[#DDD7C0] bg-[#FAF8F2] shadow-modal overflow-hidden animate-slide-up sm:animate-scale-in max-h-[90vh] flex flex-col',
          sizes[size]
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#DDD7C0] px-6 py-5 bg-[#F6F2E5]/60 shrink-0">
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-[#111111] tracking-tight">{title}</h2>
            {description && (
              <p className="text-xs text-[#5C6D7C] font-medium mt-0.5">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#758695] hover:text-[#111111] hover:bg-[#EFE9D5] active:scale-95 transition-all cursor-pointer"
            aria-label="Fechar"
          >
            <X size={17} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto scrollbar-subtle flex-1">{children}</div>
      </div>
    </div>
  )
}
