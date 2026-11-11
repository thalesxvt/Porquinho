import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-slate-700 select-none">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 flex items-center justify-center text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            className={cn(
              'h-11 sm:h-10 w-full rounded-xl border border-[#DDD7C0] bg-[#FAF8F2] px-3.5 text-base sm:text-sm text-[#111111] placeholder:text-[#758695] shadow-subtle transition-all duration-150',
              'focus:border-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111]/10',
              'disabled:cursor-not-allowed disabled:bg-[#F1ECDA] disabled:text-[#758695]',
              leftIcon && 'pl-10 sm:pl-9',
              rightIcon && 'pr-10 sm:pr-9',
              error && 'border-rose-400 text-rose-900 focus:border-rose-600 focus:ring-rose-600/10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center justify-center text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs font-medium text-rose-600 animate-fade-in">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
