import { useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ReceiptText,
} from 'lucide-react'
import { PageLayout } from '../components/layout/PageLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { DeleteConfirmModal } from '../components/transactions/DeleteConfirmModal'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import { useAvailableMonths } from '../hooks/useReports'
import { formatCurrency, formatDateRelative, formatDate } from '../lib/formatters'
import { TableRowSkeleton } from '../components/ui/Skeleton'
import { useTransactionModalStore } from '../stores/transactionModal.store'
import { cn } from '../lib/utils'

export function Transactions() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<'' | 'EXPENSE' | 'INCOME'>('')
  const [categoryId, setCategoryId] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [deleteTransaction, setDeleteTransaction] = useState<any>(null)

  const { openModal } = useTransactionModalStore()

  const startDate = selectedMonth ? `${selectedMonth}-01T00:00:00.000Z` : undefined
  const endDate = selectedMonth
    ? new Date(
        parseInt(selectedMonth.split('-')[0], 10),
        parseInt(selectedMonth.split('-')[1], 10),
        0,
        23,
        59,
        59
      ).toISOString()
    : undefined

  const { data, isLoading } = useTransactions({
    page,
    limit: 15,
    search: search.trim() || undefined,
    type: type || undefined,
    categoryId: categoryId || undefined,
    startDate,
    endDate,
  })

  const { data: categories = [] } = useCategories()
  const { data: availableMonthsRaw = [] } = useAvailableMonths()

  const monthOptions = (availableMonthsRaw as string[]).map((m) => {
    const [year, month] = m.split('-').map(Number)
    const date = new Date(year, month - 1, 1)
    const monthName = date.toLocaleDateString('pt-BR', { month: 'long' })
    const formattedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1)
    return { value: m, label: `${formattedMonth}/${year}` }
  })

  const transactions = data?.data ?? []
  const totalPages = data?.totalPages ?? 1
  const totalItems = data?.total ?? 0

  // Calculate filtered totals for quick financial summary
  const totalIncomeFiltered = transactions
    .filter((t: any) => t.type === 'INCOME')
    .reduce((sum: number, t: any) => sum + t.amountCents, 0)

  const totalExpenseFiltered = transactions
    .filter((t: any) => t.type === 'EXPENSE')
    .reduce((sum: number, t: any) => sum + t.amountCents, 0)

  const hasActiveFilters = Boolean(search || type || categoryId || selectedMonth)

  const clearFilters = () => {
    setSearch('')
    setType('')
    setCategoryId('')
    setSelectedMonth('')
    setPage(1)
  }

  return (
    <PageLayout>
      <PageHeader
        title="Transações"
        description="Extrato detalhado, conciliação e histórico financeiro"
        action={
          <Button
            onClick={() => openModal()}
            size="md"
            leftIcon={<Plus size={16} className="text-[#F1ECDA] stroke-[2.5]" />}
            className="w-full sm:w-auto bg-[#111111] text-[#F1ECDA] hover:bg-[#222222] border-[#111111]"
          >
            Nova transação
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="mb-5 p-4 sm:p-5 border-[#DDD7C0] bg-[#FAF8F2]">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
          {/* Search */}
          <div className="sm:col-span-4 relative">
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#758695]">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Buscar por descrição..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="h-10 w-full rounded-xl border border-[#DDD7C0] bg-[#FAF8F2] pl-9 pr-9 text-sm text-[#111111] placeholder:text-[#758695] shadow-subtle transition-all focus:border-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111]/10"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('')
                  setPage(1)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#758695] hover:text-[#111111] p-0.5 rounded cursor-pointer"
                aria-label="Limpar busca"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Type Segmented Buttons */}
          <div className="sm:col-span-3 flex rounded-xl border border-[#DDD7C0] bg-[#F1ECDA] p-1 gap-1">
            <button
              type="button"
              onClick={() => {
                setType('')
                setPage(1)
              }}
              className={cn(
                'flex-1 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer',
                type === '' ? 'bg-[#111111] text-[#F1ECDA] shadow-xs' : 'text-[#5C6D7C] hover:text-[#111111]'
              )}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => {
                setType('EXPENSE')
                setPage(1)
              }}
              className={cn(
                'flex-1 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer',
                type === 'EXPENSE'
                  ? 'bg-[#C94A4A] text-white shadow-xs'
                  : 'text-[#5C6D7C] hover:text-[#111111]'
              )}
            >
              Despesas
            </button>
            <button
              type="button"
              onClick={() => {
                setType('INCOME')
                setPage(1)
              }}
              className={cn(
                'flex-1 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer',
                type === 'INCOME'
                  ? 'bg-[#758695] text-white shadow-xs'
                  : 'text-[#5C6D7C] hover:text-[#111111]'
              )}
            >
              Receitas
            </button>
          </div>

          {/* Month Filter */}
          <div className="sm:col-span-3">
            <Select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value)
                setPage(1)
              }}
              placeholder="Todos os meses"
              options={monthOptions}
            />
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-2">
            <Select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value)
                setPage(1)
              }}
              placeholder="Categorias"
              options={categories.map((c: any) => ({ value: c.id, label: c.name }))}
            />
          </div>
        </div>

        {/* Filter Stats Strip */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-3 font-semibold">
            <span>
              {totalItems} {totalItems === 1 ? 'registro' : 'registros'}
            </span>
            <span>•</span>
            <span className="text-emerald-700">
              +{formatCurrency(totalIncomeFiltered)} em receitas
            </span>
            <span>•</span>
            <span className="text-rose-700">
              -{formatCurrency(totalExpenseFiltered)} em despesas
            </span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 font-bold text-slate-600 hover:text-zinc-950 underline transition-colors cursor-pointer"
            >
              <X size={12} />
              Limpar filtros
            </button>
          )}
        </div>
      </Card>

      {/* Main Ledger Table Card */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <table className="w-full text-left">
              <tbody>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <TableRowSkeleton key={i} />
                ))}
              </tbody>
            </table>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3 border border-emerald-100">
              <ReceiptText size={26} />
            </div>
            <p className="text-base font-bold text-slate-800">Nenhuma transação encontrada</p>
            <p className="mt-1 text-xs text-slate-400 max-w-sm leading-relaxed">
              {hasActiveFilters
                ? 'Nenhum lançamento corresponde aos filtros selecionados. Tente ajustar a busca.'
                : 'Você ainda não registrou nenhuma transação financeira.'}
            </p>
            <div className="mt-5 flex gap-2.5">
              {hasActiveFilters ? (
                <Button variant="secondary" size="sm" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              ) : null}
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus size={15} className="text-emerald-400" />}
                onClick={() => openModal()}
              >
                Registrar agora
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#DDD7C0] bg-[#F6F2E5]/80 text-[11px] font-bold uppercase tracking-wider text-[#5C6D7C]">
                    <th className="py-3.5 px-6">Transação</th>
                    <th className="py-3.5 px-6">Categoria</th>
                    <th className="py-3.5 px-6">Data</th>
                    <th className="py-3.5 px-6 text-right">Valor</th>
                    <th className="py-3.5 px-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD7C0] text-sm">
                  {transactions.map((t: any) => {
                    const isIncome = t.type === 'INCOME'
                    return (
                      <tr
                        key={t.id}
                        className="group hover:bg-[#EFE9D5]/60 transition-colors"
                      >
                        {/* Description & Flow Icon */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-xs',
                                isIncome
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                  : 'bg-rose-50 border-rose-200 text-rose-700'
                              )}
                            >
                              {isIncome ? (
                                <ArrowUpRight size={16} className="stroke-[2.5]" />
                              ) : (
                                <ArrowDownLeft size={16} className="stroke-[2.5]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#111111] group-hover:text-black truncate">
                                {t.description}
                              </p>
                              <span className="text-[11px] text-[#758695] font-medium">
                                Ref #{t.id.slice(-6)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <Badge
                            variant="neutral"
                            dot
                            dotColor={t.categoryColor}
                          >
                            {t.categoryName}
                          </Badge>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-6 whitespace-nowrap text-xs text-[#5C6D7C] font-medium">
                          {formatDate(t.date)}
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-6 whitespace-nowrap text-right">
                          <span
                            className={cn(
                              'text-sm font-extrabold tabular-nums tracking-tight',
                              isIncome ? 'text-emerald-700' : 'text-rose-700'
                            )}
                          >
                            {isIncome ? '+' : '-'}{formatCurrency(t.amountCents)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openModal(t)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#758695] hover:text-[#111111] hover:bg-[#EFE9D5] transition-colors cursor-pointer"
                              title="Editar"
                              aria-label="Editar transação"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteTransaction(t)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#758695] hover:text-[#8A2B2B] hover:bg-[#C94A4A]/10 transition-colors cursor-pointer"
                              title="Excluir"
                              aria-label="Excluir transação"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="sm:hidden divide-y divide-[#DDD7C0] p-2">
              {transactions.map((t: any) => {
                const isIncome = t.type === 'INCOME'
                return (
                  <div key={t.id} className="p-3 flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-xs',
                            isIncome
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-rose-50 border-rose-200 text-rose-700'
                          )}
                        >
                          {isIncome ? (
                            <ArrowUpRight size={16} className="stroke-[2.5]" />
                          ) : (
                            <ArrowDownLeft size={16} className="stroke-[2.5]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-[#111111] truncate">
                            {t.description}
                          </p>
                          <p className="text-[11px] text-[#758695] font-medium">
                            {formatDateRelative(t.date)}
                          </p>
                        </div>
                      </div>

                      <span
                        className={cn(
                          'text-sm font-extrabold tabular-nums tracking-tight shrink-0',
                          isIncome ? 'text-emerald-700' : 'text-rose-700'
                        )}
                      >
                        {isIncome ? '+' : '-'}{formatCurrency(t.amountCents)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <Badge variant="neutral" dot dotColor={t.categoryColor}>
                        {t.categoryName}
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openModal(t)}
                          className="flex h-8 px-2.5 items-center gap-1 text-xs font-bold text-[#111111] hover:text-black bg-[#EFE9D5] active:bg-[#E5DDC2] rounded-lg cursor-pointer"
                        >
                          <Pencil size={13} />
                          Editar
                        </button>
                        <button
                          onClick={() => setDeleteTransaction(t)}
                          className="flex h-8 w-8 items-center justify-center text-[#758695] hover:text-[#8A2B2B] hover:bg-[#C94A4A]/10 rounded-lg cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#DDD7C0] px-6 py-4 bg-[#F6F2E5]/50">
                <span className="text-xs text-[#5C6D7C] font-medium">
                  Página <strong className="text-[#111111]">{page}</strong> de{' '}
                  <strong className="text-[#111111]">{totalPages}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    leftIcon={<ChevronLeft size={14} />}
                    className="border-[#DDD7C0] bg-[#FAF8F2] text-[#111111] hover:bg-[#EFE9D5]"
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    rightIcon={<ChevronRight size={14} />}
                    className="border-[#DDD7C0] bg-[#FAF8F2] text-[#111111] hover:bg-[#EFE9D5]"
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {deleteTransaction && (
        <DeleteConfirmModal
          isOpen={!!deleteTransaction}
          onClose={() => setDeleteTransaction(null)}
          transaction={deleteTransaction}
        />
      )}
    </PageLayout>
  )
}
