import { Check } from 'lucide-react'
import { usePayTransaction } from '../../hooks/useTransactions'
import { useToast } from '../ui/Toast'
import { cn } from '../../lib/utils'
import { todayNoonIso } from '../../lib/transactionStatus'

/** Marca uma pendente como paga ("Pagar") ou recebida ("Receber"), com data de hoje. */
export function PayButton({ transaction, className }: { transaction: any; className?: string }) {
  const { toast } = useToast()
  const pay = usePayTransaction()
  const isIncome = transaction.type === 'INCOME'

  const handleClick = async () => {
    try {
      await pay.mutateAsync({ id: transaction.id, date: todayNoonIso() })
      toast(isIncome ? 'Marcada como recebida' : 'Marcada como paga', 'success')
    } catch {
      toast('Não foi possível atualizar a transação', 'error')
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pay.isPending}
      title={isIncome ? 'Marcar como recebida hoje' : 'Marcar como paga hoje'}
      className={cn(
        'inline-flex h-8 items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-60 cursor-pointer disabled:cursor-wait',
        className
      )}
    >
      <Check size={13} className="stroke-[2.5]" aria-hidden="true" />
      {isIncome ? 'Receber' : 'Pagar'}
    </button>
  )
}
