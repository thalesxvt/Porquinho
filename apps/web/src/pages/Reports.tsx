import { useState } from 'react'
import { PageLayout } from '../components/layout/PageLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { PeriodSelector, Period } from '../components/dashboard/PeriodSelector'
import { MonthSelector } from '../components/dashboard/MonthSelector'
import { MonthTransactionsTable } from '../components/dashboard/MonthTransactionsTable'
import {
  useSummary,
  useCategoryReport,
  useMonthlyReport,
  useWeeklyReport,
} from '../hooks/useReports'
import { formatCurrency } from '../lib/formatters'
import { KPICard } from '../components/dashboard/KPICard'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  PieChart as PieIcon,
  BarChart2,
  Layers,
  Filter,
} from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import { KPICardSkeleton, ChartSkeleton } from '../components/ui/Skeleton'
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export function Reports() {
  const [period, setPeriod] = useState<Period>('month')
  const [selectedMonthDate, setSelectedMonthDate] = useState<Date>(new Date(2026, 10, 1))
  const [chartView, setChartView] = useState<'bars' | 'area'>('bars')
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('')

  const queryYear = selectedMonthDate.getFullYear()
  const queryMonth = selectedMonthDate.getMonth() + 1

  const dateParams =
    period === 'month'
      ? { date: selectedMonthDate.toISOString() }
      : undefined

  const { data: categories = [] } = useCategories()
  const { data: summary, isLoading: summaryLoading } = useSummary(period, dateParams)
  const { data: byCategory = [], isLoading: categoryLoading } = useCategoryReport(period, dateParams)
  const { data: monthly = [], isLoading: monthlyLoading } = useMonthlyReport(
    queryYear,
    selectedCategoryFilter || undefined
  )
  const { data: weekly = [], isLoading: weeklyLoading } = useWeeklyReport(queryYear, queryMonth)

  const monthlyChartData = monthly.map((m: any) => ({
    name: m.monthLabel,
    Receitas: m.totalIncome / 100,
    Despesas: m.totalExpense / 100,
    Saldo: (m.totalIncome - m.totalExpense) / 100,
  }))

  const weeklyChartData = weekly.map((w: any) => ({
    name: `Sem. ${w.week}`,
    Receitas: w.totalIncome / 100,
    Despesas: w.totalExpense / 100,
    Saldo: (w.totalIncome - w.totalExpense) / 100,
  }))

  const expensePieData = byCategory
    .filter((c: any) => c.type === 'EXPENSE' || !c.type)
    .slice(0, 8)
    .map((c: any) => ({
      name: c.categoryName,
      value: c.total / 100,
      color: c.categoryColor || '#64748b',
    }))

  const totalExpenseVal = expensePieData.reduce((acc: number, cur: any) => acc + cur.value, 0)

  // Savings / investment rate based exclusively on "Investimentos" expenses
  const totalIncome = summary?.totalIncome ?? 0
  const totalInvested = summary?.totalInvested ?? 0
  const savingsRate = totalIncome > 0 ? Math.round((totalInvested / totalIncome) * 100) : 0

  return (
    <PageLayout>
      <PageHeader
        title="Relatórios & Análises"
        description="Diagnóstico contábil aprofundado, fluxo de caixa e centros de custo"
        action={<PeriodSelector value={period} onChange={setPeriod} />}
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

      {/* KPIs Grid */}
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
              previousValue={summary.previousBalance}
              variant={summary.balance >= 0 ? 'balance' : 'expense'}
              icon={<Wallet size={19} />}
              subtext={
                period === 'month' ? (
                  <div className="flex flex-col gap-0.5 text-[11px] leading-tight">
                    {summary.rolloverBalance !== 0 && (
                      <span>
                        Sobra anterior: <strong>{formatCurrency(summary.rolloverBalance)}</strong>
                      </span>
                    )}
                    <span>
                      Resultado do mês:{' '}
                      <strong className={summary.monthBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {summary.monthBalance >= 0 ? '+' : ''}{formatCurrency(summary.monthBalance)}
                      </strong>
                    </span>
                  </div>
                ) : undefined
              }
            />
            <KPICard
              title="Receitas Totais"
              value={summary.totalIncome}
              previousValue={summary.previousIncome}
              variant="income"
              icon={<TrendingUp size={19} />}
            />
            <KPICard
              title="Despesas Totais"
              value={summary.totalExpense}
              previousValue={summary.previousExpense}
              variant="expense"
              icon={<TrendingDown size={19} />}
            />
            <KPICard
              title={period === 'month' ? 'Poupado (Investimentos)' : 'Investimentos (Poupado)'}
              value={totalInvested}
              previousValue={summary.previousInvested}
              variant="savings"
              badgeText={totalIncome > 0 ? `${savingsRate}% da renda` : undefined}
              icon={<PiggyBank size={19} />}
              subtext="Aporte na categoria Investimentos"
            />
          </>
        ) : null}
      </div>

      {/* Main Chart Section: Monthly Cash Flow */}
      <Card className="mb-6 overflow-hidden">
        <CardHeader className="border-b border-[#DDD7C0] pb-3 flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle>Fluxo de Caixa Anual ({queryYear})</CardTitle>
            <CardDescription>
              Comparativo contínuo de entradas, saídas e resultado líquido
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-[#F1ECDA] border border-[#DDD7C0] rounded-xl px-2.5 py-1 text-xs">
              <Filter size={13} className="text-[#758695] shrink-0" />
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#111111] focus:outline-none cursor-pointer pr-1"
                aria-label="Filtrar por categoria"
              >
                <option value="">Todas as categorias</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center rounded-xl border border-[#DDD7C0] bg-[#F1ECDA] p-0.5">
              <button
                onClick={() => setChartView('bars')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                  chartView === 'bars'
                    ? 'bg-[#111111] text-[#F1ECDA] shadow-xs'
                    : 'text-[#5C6D7C] hover:text-[#111111]'
                }`}
              >
                <BarChart2 size={13} />
                Barras
              </button>
              <button
                onClick={() => setChartView('area')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                  chartView === 'area'
                    ? 'bg-[#111111] text-[#F1ECDA] shadow-xs'
                    : 'text-[#5C6D7C] hover:text-[#111111]'
                }`}
              >
                <Layers size={13} />
                Área
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-3 text-xs font-bold">
              <span className="inline-flex items-center gap-1.5 text-[#5C6D7C]">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Receitas
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#5C6D7C]">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                Despesas
              </span>
            </div>
          </div>
        </CardHeader>

        <div className="p-4 sm:p-6">
          {monthlyLoading ? (
            <ChartSkeleton />
          ) : monthlyChartData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-xs text-slate-400">
              Sem dados históricos para este ano
            </div>
          ) : (
            <div className="h-[280px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {chartView === 'bars' ? (
                  <BarChart
                    data={monthlyChartData}
                    barSize={14}
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
                ) : (
                  <AreaChart
                    data={monthlyChartData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
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
                    <Area
                      type="monotone"
                      dataKey="Receitas"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#incomeGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="Despesas"
                      stroke="#f43f5e"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#expenseGrad)"
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </Card>

      {/* Two Column Grid: Weekly breakdown & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly Cashflow */}
        <Card className="overflow-hidden flex flex-col justify-between">
          <CardHeader className="border-b border-[#DDD7C0] pb-3">
            <div>
              <CardTitle>Fluxo Semanal ({queryMonth}/{queryYear})</CardTitle>
              <CardDescription>Detalhamento por semana do mês selecionado</CardDescription>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold">
              <span className="inline-flex items-center gap-1.5 text-[#5C6D7C]">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Receitas
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#5C6D7C]">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Despesas
              </span>
            </div>
          </CardHeader>

          <div className="p-4 sm:p-6 flex-1">
            {weeklyLoading ? (
              <ChartSkeleton />
            ) : weeklyChartData.length === 0 ? (
              <div className="flex h-56 items-center justify-center text-xs text-slate-400">
                Sem dados semanais para este mês
              </div>
            ) : (
              <div className="h-[220px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyChartData}
                    barSize={16}
                    barGap={4}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
                        borderRadius: '12px',
                        boxShadow: '0 10px 20px -3px rgba(0, 0, 0, 0.06)',
                        fontSize: '12px',
                        padding: '8px 12px',
                        fontWeight: 600,
                        color: '#111111',
                      }}
                    />
                    <Bar dataKey="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card className="overflow-hidden flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100/90 pb-3">
            <div>
              <CardTitle>Detalhamento por Categoria</CardTitle>
              <CardDescription>Participação de cada categoria no total do período</CardDescription>
            </div>
            <PieIcon size={18} className="text-slate-400" />
          </CardHeader>

          <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
            {categoryLoading ? (
              <ChartSkeleton />
            ) : expensePieData.length === 0 ? (
              <div className="flex h-56 flex-col items-center justify-center text-center">
                <p className="text-xs font-bold text-slate-600">Sem despesas registradas</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Não há dados para exibir no mês selecionado.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {expensePieData.map((item: any, i: number) => {
                  const pct =
                    totalExpenseVal > 0 ? Math.round((item.value / totalExpenseVal) * 100) : 0
                  return (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-bold text-slate-800 truncate">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2 tabular-nums">
                          <span className="text-[11px] font-semibold text-slate-400">({pct}%)</span>
                          <span className="font-bold text-slate-900">
                            {formatCurrency(item.value * 100)}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Monthly transactions table at the bottom of reports */}
      {period === 'month' && (
        <div className="animate-fade-in">
          <MonthTransactionsTable selectedDate={selectedMonthDate} />
        </div>
      )}
    </PageLayout>
  )
}
