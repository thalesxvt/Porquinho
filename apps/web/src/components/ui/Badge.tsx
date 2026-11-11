import React from 'react'
import { cn } from '../../lib/utils'

export type BadgeVariant = 'income' | 'expense' | 'neutral' | 'default' | 'brand' | 'warning'

export interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
  dot?: boolean
  dotColor?: string
}

const variants: Record<BadgeVariant, { container: string; dot: string }> = {
  income: {
    container: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  expense: {
    container: 'bg-rose-50 text-rose-700 border-rose-200/80',
    dot: 'bg-rose-500',
  },
  neutral: {
    container: 'bg-slate-100/80 text-slate-700 border-slate-200/80',
    dot: 'bg-slate-400',
  },
  default: {
    container: 'bg-slate-100 text-slate-800 border-slate-200/80',
    dot: 'bg-slate-500',
  },
  brand: {
    container: 'bg-zinc-950 text-white border-zinc-800',
    dot: 'bg-emerald-400',
  },
  warning: {
    container: 'bg-amber-50 text-amber-700 border-amber-200/80',
    dot: 'bg-amber-500',
  },
}

export function Badge({
  variant = 'default',
  children,
  className,
  dot = false,
  dotColor,
}: BadgeProps) {
  const current = variants[variant]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-tight whitespace-nowrap',
        current.container,
        className
      )}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full shrink-0', !dotColor && current.dot)}
          style={dotColor ? { backgroundColor: dotColor } : undefined}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  )
}
