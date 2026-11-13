import { ArrowDownLeft, ArrowUpRight, TrendingUp } from 'lucide-react'

export type TxType = 'EXPENSE' | 'INCOME' | 'INVESTMENT'

const STYLES = {
  INCOME: {
    label: 'Receita',
    Icon: ArrowUpRight,
    box: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    amount: 'text-emerald-700',
    sign: '+',
  },
  EXPENSE: {
    label: 'Despesa',
    Icon: ArrowDownLeft,
    box: 'bg-rose-50 border-rose-200 text-rose-700',
    amount: 'text-rose-700',
    sign: '-',
  },
  INVESTMENT: {
    label: 'Investimento',
    Icon: TrendingUp,
    box: 'bg-blue-50 border-blue-200 text-blue-700',
    amount: 'text-blue-700',
    sign: '-',
  },
} as const

export function txStyle(type: TxType) {
  return STYLES[type] ?? STYLES.EXPENSE
}
