import { cn } from '../../lib/utils'

/** Selo para despesas pagas por outra pessoa (ex.: cartão dos pais), que não saem do saldo. */
export function PaidByOthersBadge({ className }: { className?: string }) {
  return (
    <span
      title="Pago por outra pessoa: não sai do seu saldo"
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border border-amber-200/80 bg-amber-50 px-1.5 py-px text-[10px] font-semibold text-amber-700 whitespace-nowrap',
        className
      )}
    >
      Pago por outros
    </span>
  )
}
