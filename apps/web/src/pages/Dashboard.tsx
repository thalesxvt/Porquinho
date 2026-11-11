import { useState } from 'react'
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  PieChart as PieIcon,
} from 'lucide-react'
import { PageLayout } from '../components/layout/PageLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { PeriodSelector, Period } from '../components/dashboard/PeriodSelector'
import { MonthSelector } from '../components/dashboard/MonthSelector'
import { MonthTransactionsTable } from '../components/dashboard/MonthTransactionsTable'
import { KPICard } from '../components/dashboard/KPICard'
import { RecentTransactions } from '../components/dashboard/RecentTransactions'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { KPICardSkeleton, ChartSkeleton } from '../components/ui/Skeleton'
import { useSummary, useCategoryReport, useMonthlyReport } from '../hooks/useReports'
import { formatCurrency } from '../lib/formatters'
import { useTransactionModalStore } from '../stores/transactionModal.store'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export function Dashboard() {
  const [period, setPeriod] = useState<Period>('month')
  const [selectedMonthDate, setSelectedMonthDate] = useState<Date>(new Date(2026, 10, 1))
  const { openModal } = useTransactionModalStore()

  const dateParams =
    period === 'month'
      ? { date: selectedMonthDate.toISOString() }
      : undefined

  const { data: summary, isLoading: summaryLoading } = useSummary(period, dateParams)
  const { data: byCategory = [], isLoading: categoryLoading } = useCategoryReport(period, dateParams)
  const { data: monthly = [], isLoading: monthlyLoading } = useMonthlyReport(selectedMonthDate.getFullYear())

  const monthlyChartData = monthly.map((m: any) => ({
    name: m.monthLabel,
    Receitas: m.totalIncome / 100,
    Despesas: m.totalExpense / 100,
    Saldo: (m.totalIncome - m.totalExpense) / 100,
  }))

  const pieData = byCategory.slice(0, 6).map((c: any) => ({
    name: c.categoryName,
    value: c.total / 100,
    color: c.categoryColor || '#64748b',
  }))

  const totalExpensesInPie = pieData.reduce((sum: number, item: any) => sum + item.value, 0)

  // Total invested in the period
  const totalInvested = summary?.totalInvested ?? 0

  return (
    <PageLayout>
      <PageHeader
        title="Painel Geral"
        description="Acompanhamento patrimonial e liquidez em tempo real"
        action={
          <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-2.5">
            <PeriodSelector value={period} onChange={setPeriod} />
            <Button
              onClick={() =>
                openModal({
                  date:
                    period === 'month'
                      ? selectedMonthDate.toISOString().slice(0, 10)
                      : undefined,
                })
              }
              size="md"
              leftIcon={<Plus size={16} className="text-[#F1ECDA] stroke-[2.5]" />}
              className="shrink-0 bg-[#111111] text-[#F1ECDA] hover:bg-[#222222] border-[#111111]"
            >
              <span className="hidden xs:inline">Nova transação</span>
              <span className="xs:hidden">Novo</span>
            </Button>
          </div>
        }
      />

      {/* Month Navigator when period is 'month' */}
      {period === 'month' && (
        <div className="mb-6 animate-fade-in">
          <MonthSelector
            selectedDate={selectedMonthDate}
            onChange={setSelectedMonthDate}
          />
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="mb-6 grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
        {summaryLoading ? (
          <>
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
          </>
        ) : summary ? (
          <>
            <KPICard
              title={period === 'month' ? 'Total em Caixa' : 'Saldo Total'}
              value={summary.balance}
              variant={summary.balance >= 0 ? 'balance' : 'expense'}
              icon={<Wallet size={19} />}
              hideFooter
            />
            <KPICard
              title="Receitas Recebidas"
              value={summary.totalIncome}
              variant="income"
              icon={<TrendingUp size={19} />}
              hideFooter
            />
            <KPICard
              title="Despesas Realizadas"
              value={summary.totalExpense}
              variant="expense"
              icon={<TrendingDown size={19} />}
              hideFooter
            />
            <KPICard
              title={period === 'month' ? 'Poupado (Investimentos)' : 'Investimentos (Poupado)'}
              value={totalInvested}
              variant="savings"
              icon={<PiggyBank size={19} />}
              hideFooter
            />
          </>
        ) : null}
      </div>

      {/* Charts Row */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Monthly evolution */}
        <Card className="lg:col-span-2 overflow-hidden flex flex-col justify-between">
          <CardHeader className="border-b border-[#DDD7C0] pb-3">
            <div>
              <CardTitle>Evolução Mensal</CardTitle>
              <CardDescription>
                Histórico de receitas vs despesas de {selectedMonthDate.getFullYear()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="inline-flex items-center gap-1.5 text-[#5C6D7C]">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Receitas
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#5C6D7C]">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                Despesas
              </span>
            </div>
          </CardHeader>

          <div className="p-4 sm:p-5 flex-1">
            {monthlyLoading ? (
              <ChartSkeleton />
            ) : monthlyChartData.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-xs text-[#758695]">
                Sem registros neste ano
              </div>
            ) : (
              <div className="h-[250px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyChartData}
                    barSize={12}
                    barGap={4}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#DDD7C0" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#5C6D7C', fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#5C6D7C' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `R$${v}`}
                    />
                    <Tooltip
                      cursor={{ fill: '#F1ECDA' }}
                      formatter={(value: any, name: any) => [
                        formatCurrency(Number(value) * 100),
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: '#FAF8F2',
                        border: '1px solid #DDD7C0',
                        borderRadius: '14px',
                        boxShadow: '0 10px 25px -4px rgba(0, 0, 0, 0.08)',
                        fontSize: '12px',
                        padding: '10px 14px',
                        fontWeight: 600,
                        color: '#111111',
                      }}
                    />
                    <Bar dataKey="Receitas" fill="#10b981" radius={[5, 5, 0, 0]} />
                    <Bar dataKey="Despesas" fill="#f43f5e" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </Card>

        {/* Category distribution */}
        <Card className="overflow-hidden flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100/90 pb-3">
            <div>
              <CardTitle>Despesas por Categoria</CardTitle>
              <CardDescription>
                Centros de custo no período selecionado
              </CardDescription>
            </div>
          </CardHeader>

          <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
            {categoryLoading ? (
              <div className="flex h-56 items-center justify-center">
                <ChartSkeleton />
              </div>
            ) : pieData.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-2.5">
                  <PieIcon size={20} />
                </div>
                <p className="text-xs font-bold text-slate-600">Sem despesas registradas</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Não há despesas neste mês selecionado.
                </p>
              </div>
            ) : (
              <>
                <div className="h-[170px] w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={76}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((_entry: any, index: number) => (
                          <Cell key={index} fill={pieData[index].color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any, name: any) => [
                          formatCurrency(Number(value) * 100),
                          name,
                        ]}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 10px 20px -3px rgba(0, 0, 0, 0.06)',
                          fontSize: '12px',
                          padding: '8px 12px',
                          fontWeight: 600,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Total
                    </span>
                    <span className="text-xs font-extrabold text-slate-900 tabular-nums">
                      {formatCurrency(totalExpensesInPie * 100)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
                  {pieData.slice(0, 5).map((item: any, i: number) => {
                    const pct =
                      totalExpensesInPie > 0
                        ? Math.round((item.value / totalExpensesInPie) * 100)
                        : 0
                    return (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="truncate text-slate-600 font-semibold">{item.name}</span>
                          <span className="text-[11px] text-slate-400 tabular-nums font-medium">
                            ({pct}%)
                          </span>
                        </div>
                        <span className="font-bold text-slate-900 tabular-nums shrink-0">
                          {formatCurrency(item.value * 100)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* When in Monthly view: show complete monthly ledger with edit & delete */}
      {period === 'month' ? (
        <div className="mb-6 animate-fade-in">
          <MonthTransactionsTable selectedDate={selectedMonthDate} />
        </div>
      ) : (
        <RecentTransactions />
      )}
    </PageLayout>
  )
}
