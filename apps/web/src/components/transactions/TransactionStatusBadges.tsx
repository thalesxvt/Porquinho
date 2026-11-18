import { Repeat } from 'lucide-react'
import { cn } from '../../lib/utils'
import { isOverdue } from '../../lib/transactionStatus'

const pill =
  'inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-px text-[10px] font-semibold whitespace-nowrap'

/**
 * Selos de uma transação: Pendente/Atrasada, parcela "2/3" e recorrente.
 * Não renderiza nada para lançamentos pagos e avulsos.
 */
export function TransactionStatusBadges({ transaction: t, className }: { transaction: any; className?: string }) {
  const overdue = isOverdue(t)
  return (
    <>
      {t.status === 'PENDING' && (
        <span
          title={overdue ? 'Vencimento já passou' : 'Ainda não saiu/entrou no saldo'}
          className={cn(
            pill,
            overdue
              ? 'border-rose-200/80 bg-rose-50 text-rose-700'
              : 'border-amber-200/80 bg-amber-50 text-amber-700',
            className
          )}
        >
          {overdue ? 'Atrasada' : 'Pendente'}
        </span>
      )}
      {t.installmentNumber && t.installmentTotal && (
        <span title="Parcela" className={cn(pill, 'border-slate-200/80 bg-slate-100/80 text-slate-700 tabular-nums', className)}>
          {t.installmentNumber}/{t.installmentTotal}
        </span>
      )}
      {t.seriesKind === 'RECURRING' && (
        <span title="Repete todo mês" className={cn(pill, 'border-slate-200/80 bg-slate-100/80 text-slate-700', className)}>
          <Repeat size={9} className="stroke-[2.5]" aria-hidden="true" />
          Mensal
        </span>
      )}
    </>
  )
}
