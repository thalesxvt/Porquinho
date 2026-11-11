import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '../../lib/utils'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const styles: Record<ToastType, { wrapper: string; icon: string }> = {
  success: {
    wrapper: 'bg-white border-emerald-200/90 text-slate-900 shadow-modal',
    icon: 'text-emerald-600',
  },
  error: {
    wrapper: 'bg-white border-rose-200/90 text-slate-900 shadow-modal',
    icon: 'text-rose-600',
  },
  warning: {
    wrapper: 'bg-white border-amber-200/90 text-slate-900 shadow-modal',
    icon: 'text-amber-600',
  },
  info: {
    wrapper: 'bg-white border-slate-200/90 text-slate-900 shadow-modal',
    icon: 'text-zinc-950',
  },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4500)
  }, [])

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm pointer-events-none w-full px-4 sm:px-0">
        {toasts.map((t) => {
          const Icon = icons[t.type]
          const style = styles[t.type]
          return (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto flex items-center gap-3 rounded-2xl border p-4 text-sm font-medium transition-all duration-200 shadow-elevated animate-slide-up',
                style.wrapper
              )}
            >
              <Icon size={18} className={cn('shrink-0', style.icon)} />
              <span className="flex-1 leading-snug">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Dispensar notificação"
              >
                <X size={15} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
