import { Link } from 'react-router-dom'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { CalendarClock, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'
import { PayButton } from '../transactions/PayButton'
import { TransactionStatusBadges } from '../transactions/TransactionStatusBadges'
import { useUpcoming } from '../../hooks/useReports'
import { formatCurrency, formatDate } from '../../lib/formatters'
import { txStyle } from '../../lib/transactionStyle'
import { cn } from '../../lib/utils'

const DAYS = 30
const MAX_ITEMS = 6

/** Texto curto de vencimento: "Venceu há 3 dias", "Vence hoje", "Vence em 5 dias". */
function dueLabel(date: string): string {
  // As datas são gravadas às 12:00 UTC do dia: compara só a parte da data.
  const diff = differenceInCalendarDays(parseISO(date.slice(0, 10)), new Date())
  if (diff < -1) return `Venceu há ${-diff} dias`
  if (diff === -1) return 'Venceu ontem'
  if (diff === 0) return 'Vence hoje'
  if (diff === 1) return 'Vence amanhã'
  if (diff <= 7) return `Vence em ${diff} dias`
  return `Vence ${formatDate(date)}`
}

/** Contas a pagar/receber: atrasadas + as que vencem nos próximos 30 dias. */
export function UpcomingCard({ className }: { className?: string }) {
  const { data, isLoading } = useUpcoming(DAYS)
  const items = data ? [...data.overdue, ...data.upcoming] : []
  const visible = items.slice(0, MAX_ITEMS)

  return (
    <Card className={cn('overflow-hidden flex flex-col', className)}>
      <CardHeader className="border-b border-[#DDD7C0] pb-3">
        <div>
          <CardTitle>Próximos vencimentos</CardTitle>
          <CardDescription>Contas a pagar e a receber nos próximos {DAYS} dias</CardDescription>
        </div>
      </CardHeader>

      {data && items.length > 0 && (
        <div className="grid grid-cols-2 border-b border-[#DDD7C0] text-xs">
          <div className="px-4 py-3 sm:px-5 border-r border-[#DDD7C0]">
            <p className="font-bold uppercase tracking-wider text-[10px] text-[#758695]">A pagar</p>
            <p className="mt-0.5 text-sm font-extrabold tabular-nums text-rose-700">
              {formatCurrency(data.totalToPay)}
            </p>
          </div>
          <div className="px-4 py-3 sm:px-5">
            <p className="font-bold uppercase tracking-wider text-[10px] text-[#758695]">A receber</p>
            <p className="mt-0.5 text-sm font-extrabold tabular-nums text-emerald-700">
              {formatCurrency(data.totalToReceive)}
            </p>
          </div>
        </div>
      )}

      <div className="flex-1">
        {isLoading ? (
          <div className="flex flex-col gap-3 p-4 sm:p-5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
            <div className="mb-2.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <CalendarClock size={20} />
            </div>
            <p className="text-xs font-bold text-slate-600">Nada vencendo por agora</p>
            <p className="mt-0.5 max-w-[16rem] text-[11px] text-slate-400">
              Lance contas como "A pagar" ou parcele uma compra para acompanhar aqui.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#DDD7C0]">
            {visible.map((t) => {
              const tx = txStyle(t.type)
              return (
                <li key={t.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                  <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border', tx.box)}>
                    <tx.Icon size={14} className="stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2 min-w-0">
                      <p className="truncate text-sm font-bold text-[#111111]">{t.description}</p>
                      <span className={cn('shrink-0 text-xs font-bold tabular-nums', tx.amount)}>
                        {tx.sign}
                        {formatCurrency(t.amountCents)}
                      </span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-[#758695]">
                      <span>{dueLabel(t.date)}</span>
                      <TransactionStatusBadges transaction={t} />
                    </div>
                  </div>
                  <PayButton transaction={t} />
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {items.length > MAX_ITEMS && (
        <Link
          // Abre já em "A pagar/receber": o filtro "Todas" esconde as pendentes futuras.
          to="/transactions?status=PENDING"
          className="flex items-center justify-center gap-1 border-t border-[#DDD7C0] py-3 text-xs font-bold text-[#5C6D7C] hover:text-[#111111] transition-colors"
        >
          Ver todas ({items.length})
          <ChevronRight size={14} />
        </Link>
      )}
    </Card>
  )
}
