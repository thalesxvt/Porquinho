import { forwardRef, SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-slate-700 select-none">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            className={cn(
              'h-11 sm:h-10 w-full appearance-none rounded-xl border border-[#DDD7C0] bg-[#FAF8F2] px-3.5 pr-9 text-base sm:text-sm text-[#111111] shadow-subtle transition-all duration-150 cursor-pointer',
              'focus:border-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111]/10',
              'disabled:cursor-not-allowed disabled:bg-[#F1ECDA] disabled:text-[#758695]',
              error && 'border-rose-400 text-rose-900 focus:border-rose-600 focus:ring-rose-600/10',
              className
            )}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 text-slate-400"
          />
        </div>
        {error && <p className="text-xs font-medium text-rose-600 animate-fade-in">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
