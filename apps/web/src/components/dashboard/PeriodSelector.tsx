import { cn } from '../../lib/utils'

export type Period = 'week' | 'month' | 'year'

interface PeriodSelectorProps {
  value: Period
  onChange: (period: Period) => void
  className?: string
}

const options: Array<{ value: Period; label: string }> = [
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' },
  { value: 'year', label: 'Ano' },
]

export function PeriodSelector({ value, onChange, className }: PeriodSelectorProps) {
  return (
    <div
      role="tablist"
      aria-label="Filtro de período"
      className={cn(
        'inline-flex items-center rounded-xl border border-[#DDD7C0] bg-[#FAF8F2] p-1 shadow-subtle',
        className
      )}
    >
      {options.map((opt) => {
        const isSelected = value === opt.value
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-150 cursor-pointer select-none touch-manipulation',
              isSelected
                ? 'bg-[#111111] text-[#F1ECDA] shadow-xs'
                : 'text-[#5C6D7C] hover:text-[#111111] hover:bg-[#EFE9D5]'
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
