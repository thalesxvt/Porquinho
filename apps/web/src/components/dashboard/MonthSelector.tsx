import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { format, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface MonthSelectorProps {
  selectedDate: Date
  onChange: (date: Date) => void
  availableMonths?: Date[]
}

export function MonthSelector({
  selectedDate,
  onChange,
  availableMonths,
}: MonthSelectorProps) {
  const handlePrev = () => {
    onChange(subMonths(selectedDate, 1))
  }

  const handleNext = () => {
    onChange(addMonths(selectedDate, 1))
  }

  const monthLabel = format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })
  const formattedLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  // Quick preset months (e.g. Ago/26, Set/26, Out/26, Nov/26)
  const defaultMonths = availableMonths || [
    new Date(2026, 7, 1),  // Agosto
    new Date(2026, 8, 1),  // Setembro
    new Date(2026, 9, 1),  // Outubro
    new Date(2026, 10, 1), // Novembro
  ]

  const isCurrentMonth =
    format(selectedDate, 'yyyy-MM') === format(new Date(), 'yyyy-MM')

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 rounded-2xl border border-[#DDD7C0] bg-[#FAF8F2] p-2 sm:p-2.5 shadow-subtle">
      {/* Month Stepper */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={handlePrev}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-[#758695] hover:text-[#111111] hover:bg-[#EFE9D5] active:scale-95 transition-all cursor-pointer"
          title="Mês anterior"
          aria-label="Mês anterior"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-2 px-2 text-center min-w-[160px] justify-center">
          <Calendar size={16} className="text-[#758695] shrink-0" />
          <span className="text-sm font-extrabold text-[#111111] tracking-tight">
            {formattedLabel}
          </span>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-[#758695] hover:text-[#111111] hover:bg-[#EFE9D5] active:scale-95 transition-all cursor-pointer"
          title="Próximo mês"
          aria-label="Próximo mês"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Quick Month Chips */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pt-1 sm:pt-0 border-t sm:border-t-0 border-[#DDD7C0] justify-center sm:justify-end">
        {defaultMonths.map((m) => {
          const isSelected =
            format(selectedDate, 'yyyy-MM') === format(m, 'yyyy-MM')
          const chipLabel = format(m, 'MMM', { locale: ptBR })
          return (
            <button
              key={m.toISOString()}
              type="button"
              onClick={() => onChange(m)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer capitalize shrink-0 ${
                isSelected
                  ? 'bg-[#111111] text-[#F1ECDA] shadow-xs'
                  : 'text-[#5C6D7C] hover:text-[#111111] hover:bg-[#EFE9D5]'
              }`}
            >
              {chipLabel}
            </button>
          )
        })}

        {!isCurrentMonth && (
          <button
            type="button"
            onClick={() => onChange(new Date())}
            className="rounded-lg border border-[#758695]/30 bg-[#758695]/15 px-2.5 py-1 text-[11px] font-bold text-[#1B2228] hover:bg-[#758695]/25 transition-colors shrink-0 ml-1 cursor-pointer"
          >
            Mês Atual
          </button>
        )}
      </div>
    </div>
  )
}

