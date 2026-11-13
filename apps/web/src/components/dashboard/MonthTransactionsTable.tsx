import { useState } from 'react'
import {
  Pencil,
  Trash2,
  Search,
  Plus,
  ReceiptText,
  PiggyBank,
  ArrowRight,
} from 'lucide-react'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { TableRowSkeleton } from '../ui/Skeleton'
import { DeleteConfirmModal } from '../transactions/DeleteConfirmModal'
import { useTransactions } from '../../hooks/useTransactions'
import { useSummary } from '../../hooks/useReports'
import { formatCurrency, formatDate } from '../../lib/formatters'
import { useTransactionModalStore } from '../../stores/transactionModal.store'
import { cn } from '../../lib/utils'
import { txStyle } from '../../lib/transactionStyle'

interface MonthTransactionsTableProps {
  selectedDate: Date
}

export function MonthTransactionsTable({ selectedDate }: MonthTransactionsTableProps) {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'' | 'EXPENSE' | 'INCOME' | 'INVESTMENT'>('')
  const [deleteTransaction, setDeleteTransaction] = useState<any>(null)

  const { openModal } = useTransactionModalStore()

  const start = startOfMonth(selectedDate).toISOString()
  const end = endOfMonth(selectedDate).toISOString()

  // Transactions of this month (only real records!)
  const { data, isLoading } = useTransactions({
    startDate: start,
    endDate: end,
    limit: 100,
    search: search.trim() || undefined,
    type: filterType || undefined,
  })

  // Monthly summary (with rollover balance from prior months!)
  const { data: summary } = useSummary('month', { date: selectedDate.toISOString() })

  const transactions = data?.data ?? []
  const monthName = format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })
  const formattedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1)

  const rolloverBalance = summary?.rolloverBalance ?? 0
  const totalIncome = summary?.totalIncome ?? 0
  const totalExpense = summary?.totalExpense ?? 0
  const totalInvested = summary?.totalInvested ?? 0
  const totalAvailable = summary?.balance ?? (rolloverBalance + (totalIncome - totalExpense - totalInvested))

  return (
    <Card className="overflow-hidden">
      {/* Card Header with Month info and Totals */}
      <CardHeader className="border-b border-slate-100/90 pb-4 flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>Transações de {formattedMonth}</CardTitle>
            <Badge variant="neutral">
              {transactions.length} {transactions.length === 1 ? 'item' : 'itens'}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Lançamentos efetivos registrados neste mês
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <Button
            size="sm"
            onClick={() =>
              openModal({
                date: format(selectedDate, 'yyyy-MM-15'),
              })
            }
            leftIcon={<Plus size={14} className="text-emerald-400 stroke-[2.5]" />}
          >
            Lançar neste mês
          </Button>
        </div>
      </CardHeader>

      {/* Cashflow & Rollover Strip (shows carryover from previous month without a table record!) */}
      <div className="p-3 sm:p-4 bg-[#F6F2E5]/80 border-b border-[#DDD7C0] text-xs">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
          {/* Rollover from prior month */}
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-[#DDD7C0] bg-[#FAF8F2] px-2.5 sm:px-3 py-1.5 shadow-subtle min-w-0">
            <PiggyBank size={14} className="text-[#758695] shrink-0" />
            <span className="text-[#5C6D7C] font-medium truncate">Sobra anterior:</span>
            <span
              className={cn(
                'font-extrabold tabular-nums ml-auto sm:ml-0',
                rolloverBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'
              )}
            >
              {formatCurrency(rolloverBalance)}
            </span>
          </div>

          <span className="text-[#758695] hidden sm:inline font-bold">+</span>

          {/* Income of this month */}
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/25 bg-emerald-50 px-2.5 sm:px-3 py-1.5 min-w-0">
            <span className="text-emerald-700 font-medium truncate">Receitas:</span>
            <span className="font-extrabold text-emerald-700 tabular-nums ml-auto sm:ml-0">
              +{formatCurrency(totalIncome)}
            </span>
          </div>

          <span className="text-[#758695] hidden sm:inline font-bold">-</span>

          {/* Expenses of this month */}
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/25 bg-rose-50 px-2.5 sm:px-3 py-1.5 min-w-0">
            <span className="text-rose-700 font-medium truncate">Despesas:</span>
            <span className="font-extrabold text-rose-700 tabular-nums ml-auto sm:ml-0">
              -{formatCurrency(totalExpense)}
            </span>
          </div>

          <span className="text-[#758695] hidden sm:inline font-bold">-</span>

          {/* Investments of this month */}
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/25 bg-blue-50 px-2.5 sm:px-3 py-1.5 min-w-0">
            <span className="text-blue-700 font-medium truncate">Investimentos:</span>
            <span className="font-extrabold text-blue-700 tabular-nums ml-auto sm:ml-0">
              -{formatCurrency(totalInvested)}
            </span>
          </div>

          <ArrowRight size={13} className="text-[#758695] hidden sm:inline" />

          {/* Total Available in Account */}
          <div className="col-span-2 sm:col-span-1 inline-flex items-center justify-between sm:justify-start gap-1.5 rounded-xl border border-[#111111] bg-[#111111] px-3 py-1.5 text-[#F1ECDA] shadow-xs">
            <span className="text-[#F1ECDA]/70 font-medium">Total Disponível:</span>
            <span
              className={cn(
                'font-extrabold tabular-nums',
                totalAvailable >= 0 ? 'text-[#F1ECDA]' : 'text-rose-400'
              )}
            >
              {formatCurrency(totalAvailable)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Sub-bar */}
      <div className="p-3 sm:p-4 border-b border-[#DDD7C0] flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#758695]">
            <Search size={14} />
          </div>
          <input
            type="text"
            placeholder="Filtrar por descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-[#DDD7C0] bg-[#FAF8F2] pl-9 pr-3 text-xs text-[#111111] placeholder:text-[#758695] shadow-subtle transition-all focus:border-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111]/10"
          />
        </div>

        <div className="flex rounded-xl border border-[#DDD7C0] bg-[#F1ECDA] p-0.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterType('')}
            className={cn(
              'flex-1 sm:flex-none rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer',
              filterType === '' ? 'bg-[#111111] text-[#F1ECDA] shadow-xs' : 'text-[#5C6D7C] hover:text-[#111111]'
            )}
          >
            Todas ({transactions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('INCOME')}
            className={cn(
              'flex-1 sm:flex-none rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer',
              filterType === 'INCOME'
                ? 'bg-[#758695] text-white shadow-xs'
                : 'text-[#5C6D7C] hover:text-[#111111]'
            )}
          >
            Receitas
          </button>
          <button
            type="button"
            onClick={() => setFilterType('EXPENSE')}
            className={cn(
              'flex-1 sm:flex-none rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer',
              filterType === 'EXPENSE'
                ? 'bg-[#C94A4A] text-white shadow-xs'
                : 'text-[#5C6D7C] hover:text-[#111111]'
            )}
          >
            Despesas
          </button>
          <button
            type="button"
            onClick={() => setFilterType('INVESTMENT')}
            className={cn(
              'flex-1 sm:flex-none rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer',
              filterType === 'INVESTMENT'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-[#5C6D7C] hover:text-[#111111]'
            )}
          >
            Investimentos
          </button>
        </div>
      </div>

      {/* Table Content (NO SYNTHETIC ROW ADDED HERE - ONLY REAL TRANSACTIONS) */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-4">
            <table className="w-full text-left">
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TableRowSkeleton key={i} />
                ))}
              </tbody>
            </table>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-2.5 border border-emerald-100">
              <ReceiptText size={22} />
            </div>
            <p className="text-sm font-bold text-slate-800">
              Nenhuma transação em {formattedMonth}
            </p>
            <p className="mt-1 text-xs text-slate-400 max-w-sm">
              Não há registros para os filtros selecionados neste mês.
            </p>
            <Button
              size="sm"
              variant="secondary"
              className="mt-4"
              onClick={() =>
                openModal({
                  date: format(selectedDate, 'yyyy-MM-15'),
                })
              }
            >
              Adicionar lançamento
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#DDD7C0] bg-[#F6F2E5]/80 text-[11px] font-bold uppercase tracking-wider text-[#5C6D7C]">
                    <th className="py-3 px-6">Descrição</th>
                    <th className="py-3 px-6">Categoria</th>
                    <th className="py-3 px-6">Data</th>
                    <th className="py-3 px-6 text-right">Valor</th>
                    <th className="py-3 px-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD7C0] text-sm">
                  {transactions.map((t: any) => {
                    const tx = txStyle(t.type)
                    return (
                      <tr
                        key={t.id}
                        className="group hover:bg-[#EFE9D5]/60 transition-colors"
                      >
                        {/* Description */}
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border shadow-xs',
                                tx.box
                              )}
                            >
                              <tx.Icon size={15} className="stroke-[2.5]" />
                            </div>
                            <span className="font-bold text-[#111111] group-hover:text-black truncate">
                              {t.description}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-6 whitespace-nowrap">
                          <Badge
                            variant="neutral"
                            dot
                            dotColor={t.categoryColor}
                          >
                            {t.categoryName}
                          </Badge>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-6 whitespace-nowrap text-xs text-[#5C6D7C] font-medium">
                          {formatDate(t.date)}
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-6 whitespace-nowrap text-right">
                          <span
                            className={cn(
                              'text-sm font-extrabold tabular-nums tracking-tight',
                              tx.amount
                            )}
                          >
                            {tx.sign}{formatCurrency(t.amountCents)}
                          </span>
                        </td>

                        {/* Action buttons (Edit & Delete) */}
                        <td className="py-3.5 px-6 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => openModal(t)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#758695] hover:text-[#111111] hover:bg-[#EFE9D5] transition-colors cursor-pointer"
                              title="Editar transação"
                              aria-label={`Editar ${t.description}`}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteTransaction(t)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#758695] hover:text-[#8A2B2B] hover:bg-[#C94A4A]/10 transition-colors cursor-pointer"
                              title="Excluir transação"
                              aria-label={`Excluir ${t.description}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Touch Cards View (per adapt skill guidelines) */}
            <div className="sm:hidden divide-y divide-[#DDD7C0] p-2">
              {transactions.map((t: any) => {
                const tx = txStyle(t.type)
                return (
                  <div key={t.id} className="p-3 flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-xs',
                            tx.box
                          )}
                        >
                          <tx.Icon size={16} className="stroke-[2.5]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-[#111111] truncate">
                            {t.description}
                          </p>
                          <p className="text-[11px] text-[#758695] font-medium">
                            {formatDate(t.date)}
                          </p>
                        </div>
                      </div>

                      <span
                        className={cn(
                          'text-sm font-extrabold tabular-nums tracking-tight shrink-0',
                          tx.amount
                        )}
                      >
                        {tx.sign}{formatCurrency(t.amountCents)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <Badge variant="neutral" dot dotColor={t.categoryColor}>
                        {t.categoryName}
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openModal(t)}
                          className="flex h-8 px-2.5 items-center gap-1 text-xs font-bold text-[#111111] hover:text-black bg-[#EFE9D5] active:bg-[#E5DDC2] rounded-lg cursor-pointer touch-manipulation"
                          aria-label={`Editar ${t.description}`}
                        >
                          <Pencil size={13} />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => setDeleteTransaction(t)}
                          className="flex h-8 w-8 items-center justify-center text-[#758695] hover:text-[#8A2B2B] hover:bg-[#C94A4A]/10 active:bg-[#C94A4A]/20 rounded-lg cursor-pointer touch-manipulation"
                          aria-label={`Excluir ${t.description}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTransaction && (
        <DeleteConfirmModal
          isOpen={!!deleteTransaction}
          onClose={() => setDeleteTransaction(null)}
          transaction={deleteTransaction}
        />
      )}
    </Card>
  )
}
