import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

export type ButtonVariant = 'primary' | 'secondary' | 'emerald' | 'danger' | 'ghost' | 'outline'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-zinc-950 text-white shadow-sm hover:bg-zinc-800 active:bg-black active:scale-[0.98] border border-zinc-900',
  secondary:
    'bg-white text-slate-800 border border-slate-200/90 shadow-subtle hover:bg-slate-50 hover:text-zinc-950 hover:border-slate-300 active:bg-slate-100 active:scale-[0.98]',
  emerald:
    'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800 active:scale-[0.98] border border-emerald-600',
  danger:
    'bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:bg-rose-800 active:scale-[0.98] border border-rose-600',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 active:scale-[0.98]',
  outline:
    'bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-950 active:bg-slate-100 active:scale-[0.98]',
}

const sizes: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1.5 rounded-lg font-medium',
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg font-semibold',
  md: 'h-9 px-4 text-sm gap-2 rounded-xl font-semibold',
  lg: 'h-11 px-5 text-sm gap-2 rounded-xl font-semibold',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center select-none transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none cursor-pointer',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="animate-spin shrink-0" size={size === 'xs' ? 12 : 15} />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
