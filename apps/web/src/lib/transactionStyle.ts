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

/**
 * Nome da categoria para listas que misturam tipos (filtros). Quando o nome se
 * repete, como os três "Outros" padrão, mostra o tipo junto: "Outros (receita)".
 */
export function categoryOptionLabel(
  category: { name: string; type: string },
  all: { name: string; type: string }[]
): string {
  const key = category.name.trim().toLowerCase()
  const repeated = all.filter((c) => c.name.trim().toLowerCase() === key).length > 1
  if (!repeated) return category.name
  const typeLabel = category.type === 'BOTH' ? 'ambos' : txStyle(category.type as TxType).label.toLowerCase()
  return `${category.name} (${typeLabel})`
}
