import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronDown, Settings2 } from 'lucide-react'
import { useActiveAccount } from '../../hooks/useAccounts'
import { useAccountStore } from '../../stores/account.store'
import { formatCurrency } from '../../lib/formatters'
import { cn } from '../../lib/utils'

interface AccountSwitcherProps {
  /** Versão enxuta para o header mobile (sem saldo no botão). */
  compact?: boolean
  className?: string
}

/** Escolhe a conta exibida no app inteiro (painel, transações e relatórios). */
export function AccountSwitcher({ compact = false, className }: AccountSwitcherProps) {
  const { accounts, account, isLoading } = useActiveAccount()
  const selectAccount = useAccountStore((s) => s.selectAccount)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (isLoading || !account) {
    return <div className={cn('h-10 rounded-xl bg-[#EFE9D5] animate-pulse', compact ? 'w-28' : 'w-full', className)} />
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-xl border border-[#DDD7C0] bg-[#F1ECDA] text-left transition-colors hover:border-[#758695] cursor-pointer touch-manipulation',
          compact ? 'h-10 px-2.5 max-w-[11rem]' : 'px-3 py-2'
        )}
      >
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: account.color }} />
        <span className="min-w-0 flex-1">
          {!compact && (
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#758695]">Conta</span>
          )}
          <span className="block truncate text-xs font-bold text-[#111111]">{account.name}</span>
          {!compact && (
            <span className="block truncate text-[11px] font-semibold tabular-nums text-[#5C6D7C]">
              {formatCurrency(account.balanceCents)}
            </span>
          )}
        </span>
        <ChevronDown size={15} className={cn('shrink-0 text-[#758695] transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Escolher conta"
          className={cn(
            'absolute z-50 mt-1.5 rounded-xl border border-[#DDD7C0] bg-[#FAF8F2] p-1.5 shadow-elevated animate-fade-in',
            compact ? 'left-0 w-64' : 'left-0 right-0'
          )}
        >
          {accounts.map((a) => {
            const selected = a.id === account.id
            return (
              <button
                key={a.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  selectAccount(a.id)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors cursor-pointer',
                  selected ? 'bg-[#EFE9D5]' : 'hover:bg-[#F1ECDA]'
                )}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: a.color }} />
                <span className="min-w-0 flex-1 truncate text-xs font-bold text-[#111111]">{a.name}</span>
                <span
                  className={cn(
                    'shrink-0 text-[11px] font-semibold tabular-nums',
                    a.balanceCents < 0 ? 'text-rose-600' : 'text-[#5C6D7C]'
                  )}
                >
                  {formatCurrency(a.balanceCents)}
                </span>
                <Check size={14} className={cn('shrink-0', selected ? 'text-[#111111]' : 'invisible')} />
              </button>
            )
          })}
          <div className="my-1 border-t border-[#DDD7C0]" />
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              navigate('/accounts')
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#5C6D7C] hover:bg-[#F1ECDA] hover:text-[#111111] transition-colors cursor-pointer"
          >
            <Settings2 size={14} />
            Gerenciar contas
          </button>
        </div>
      )}
    </div>
  )
}
