import type { SeriesScope } from '../../hooks/useTransactions'
import { cn } from '../../lib/utils'

interface SeriesScopeChoiceProps {
  value: SeriesScope
  onChange: (scope: SeriesScope) => void
  /** Verbo da ação, ex.: "Aplicar a" ou "Excluir". */
  label: string
}

/** Escolha entre afetar só esta ocorrência da série ou também as pendentes seguintes. */
export function SeriesScopeChoice({ value, onChange, label }: SeriesScopeChoiceProps) {
  const option = (scope: SeriesScope, text: string) => (
    <button
      type="button"
      onClick={() => onChange(scope)}
      aria-pressed={value === scope}
      className={cn(
        'flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer',
        value === scope ? 'bg-[#111111] text-[#F1ECDA] shadow-xs' : 'text-[#5C6D7C] hover:text-[#111111]'
      )}
    >
      {text}
    </button>
  )

  return (
    <div>
      <p className="mb-1.5 text-xs font-bold text-slate-700">{label}</p>
      <div className="flex gap-1 rounded-xl border border-[#DDD7C0] bg-[#F1ECDA] p-1">
        {option('one', 'Só esta')}
        {option('following', 'Esta e as próximas')}
      </div>
      <p className="mt-1.5 text-[11px] text-[#758695]">
        Lançamentos já pagos nunca são alterados em conjunto.
      </p>
    </div>
  )
}
