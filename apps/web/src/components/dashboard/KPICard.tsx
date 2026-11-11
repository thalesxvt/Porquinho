import { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '../../lib/utils'
import { formatCurrency, getPercentageChange } from '../../lib/formatters'

export type KPIVariant = 'default' | 'income' | 'expense' | 'balance' | 'savings'

export interface KPICardProps {
  title: string
  value: number
  previousValue?: number
  variant?: KPIVariant
  icon?: ReactNode
  badgeText?: string
  subtext?: ReactNode
  customFooter?: ReactNode
  hideFooter?: boolean
}

const variantStyles: Record<
  KPIVariant,
  { iconBg: string; iconColor: string; valueColor: string; accentBorder: string }
> = {
  default: {
    iconBg: 'bg-[#758695]/15 text-[#1B2228]',
    iconColor: 'text-[#5C6D7C]',
    valueColor: 'text-[#111111]',
    accentBorder: 'hover:border-[#758695]',
  },
  balance: {
    iconBg: 'bg-[#111111] text-[#F1ECDA]',
    iconColor: 'text-[#F1ECDA]',
    valueColor: 'text-[#111111]',
    accentBorder: 'hover:border-[#111111]',
  },
  income: {
    iconBg: 'bg-emerald-50 text-emerald-700',
    iconColor: 'text-emerald-600',
    valueColor: 'text-emerald-700',
    accentBorder: 'hover:border-emerald-500/40',
  },
  expense: {
    iconBg: 'bg-rose-50 text-rose-700',
    iconColor: 'text-rose-600',
    valueColor: 'text-rose-700',
    accentBorder: 'hover:border-rose-500/40',
  },
  savings: {
    iconBg: 'bg-[#111111] text-[#F1ECDA]',
    iconColor: 'text-[#F1ECDA]',
    valueColor: 'text-[#111111]',
    accentBorder: 'hover:border-[#758695]',
  },
}

export function KPICard({
  title,
  value,
  previousValue,
  variant = 'default',
  icon,
  badgeText,
  subtext,
  customFooter,
  hideFooter = false,
}: KPICardProps) {
  const styles = variantStyles[variant]
  const hasComparison = previousValue !== undefined && previousValue !== null
  const change = hasComparison ? getPercentageChange(value, previousValue!) : 0
  const isPositive = change > 0
  const isNegative = change < 0

  // For expense, a decrease is favorable (saving money)
  const isFavorable = variant === 'expense' ? isNegative : isPositive
  const isUnfavorable = variant === 'expense' ? isPositive : isNegative

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-[#DDD7C0] bg-[#FAF8F2] p-3.5 sm:p-5 shadow-surface transition-all duration-200 hover:shadow-surface-hover hover:-translate-y-0.5',
        styles.accentBorder
      )}
    >
      <div className="flex items-start justify-between gap-2.5 sm:gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-[11px] sm:text-xs font-semibold text-[#5C6D7C] tracking-tight">
              {title}
            </span>
            {badgeText && (
              <span className="rounded-full bg-[#E5EAEF] px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-[#44515E] shrink-0 border border-[#DDD7C0]">
                {badgeText}
              </span>
            )}
          </div>
          <p
            className={cn(
              'mt-1.5 sm:mt-2 text-base sm:text-2xl font-extrabold tracking-tight tabular-nums truncate',
              styles.valueColor
            )}
          >
            {formatCurrency(value)}
          </p>
          {subtext && (
            <div className="mt-1 text-[10px] sm:text-[11px] text-[#5C6D7C] font-medium">
              {subtext}
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 shadow-xs',
            styles.iconBg
          )}
        >
          {icon}
        </div>
      </div>

      {!hideFooter && (
        customFooter ? (
          <div className="mt-4 pt-3 border-t border-[#DDD7C0] text-xs text-[#5C6D7C]">
            {customFooter}
          </div>
        ) : hasComparison ? (
          <div className="mt-4 flex items-center gap-2 pt-3 border-t border-[#DDD7C0] text-xs">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold tabular-nums text-[11px]',
                isFavorable
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                  : isUnfavorable
                  ? 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20'
                  : 'bg-[#E5EAEF] text-[#5C6D7C]'
              )}
            >
              {isPositive ? (
                <TrendingUp size={12} className="stroke-[2.5]" />
              ) : isNegative ? (
                <TrendingDown size={12} className="stroke-[2.5]" />
              ) : (
                <Minus size={12} className="stroke-[2.5]" />
              )}
              {change === 0 ? '0%' : `${Math.abs(change)}%`}
            </span>
            <span className="text-[11px] text-[#758695] font-medium truncate">vs período anterior</span>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-1.5 pt-3 border-t border-[#DDD7C0] text-[11px] text-[#758695] font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-[#758695]" />
            <span>Atualizado em tempo real</span>
          </div>
        )
      )}
    </div>
  )
}
