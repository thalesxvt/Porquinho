import { ReceiptText, Plus, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle } from '../ui/Card'
import { formatCurrency, formatDateRelative } from '../../lib/formatters'
import { useTransactions } from '../../hooks/useTransactions'
import { Skeleton } from '../ui/Skeleton'
import { cn } from '../../lib/utils'
import { txStyle } from '../../lib/transactionStyle'
import { useTransactionModalStore } from '../../stores/transactionModal.store'

export function RecentTransactions() {
  const { data, isLoading } = useTransactions({ limit: 6, page: 1 })
  const { openModal } = useTransactionModalStore()
  const transactions = data?.data ?? []

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-slate-100/90 pb-4">
        <div>
          <CardTitle>Últimas transações</CardTitle>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Lançamentos mais recentes da sua conta
          </p>
        </div>
        <Link
          to="/transactions"
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-zinc-950 transition-colors group"
        >
          <span>Ver todas</span>
          <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </CardHeader>

      <div className="p-4 sm:p-5">
        {isLoading ? (
          <div className="flex flex-col gap-3 py-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-4 w-36 mb-1.5" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-20 shrink-0" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3 border border-emerald-100">
              <ReceiptText size={22} />
            </div>
            <p className="text-sm font-bold text-slate-800">Nenhuma transação registrada</p>
            <p className="mt-1 text-xs text-slate-400 max-w-xs leading-relaxed">
              Comece agora registrando sua primeira receita ou despesa para acompanhar seu progresso.
            </p>
            <button
              onClick={() => openModal()}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-zinc-800 active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={14} className="text-emerald-400" />
              Registrar transação
            </button>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            {transactions.map((t: any) => {
              const tx = txStyle(t.type)
              return (
                <div
                  key={t.id}
                  onClick={() => openModal(t)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openModal(t)
                    }
                  }}
                  className="group -mx-2 flex items-center gap-3.5 rounded-xl px-3 py-3 transition-colors hover:bg-slate-50 cursor-pointer"
                  title="Clique para editar"
                >
                  {/* Category / Flow Icon */}
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-150 group-hover:scale-105 shadow-xs border',
                      tx.box
                    )}
                  >
                    <tx.Icon size={17} className="stroke-[2.5]" />
                  </div>

                  {/* Transaction Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900 group-hover:text-zinc-950">
                      {t.description}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <span
                          className="h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: t.categoryColor || '#64748b' }}
                        />
                        <span className="text-slate-600 font-medium truncate">
                          {t.categoryName}
                        </span>
                      </span>
                      <span>•</span>
                      <span>{formatDateRelative(t.date)}</span>
                    </div>
                  </div>

                  {/* Value */}
                  <div className="text-right shrink-0">
                    <span
                      className={cn(
                        'text-sm font-extrabold tabular-nums tracking-tight',
                        tx.amount
                      )}
                    >
                      {tx.sign}{formatCurrency(t.amountCents)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}
