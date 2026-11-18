import { useId } from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card'
import { ChartSkeleton } from '../ui/Skeleton'
import { useForecast } from '../../hooks/useReports'
import { formatCurrency, formatCurrencyCompact } from '../../lib/formatters'
import { cn } from '../../lib/utils'

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** "2027-03" → "março de 2027" */
function longMonth(month: string): string {
  const [y, m] = month.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

interface ForecastCardProps {
  months?: number
  /** Mostra a tabela mês a mês abaixo do gráfico (página de Relatórios). */
  showTable?: boolean
  className?: string
}

/** Saldo previsto: parte do saldo de hoje e soma as contas pendentes de cada mês. */
export function ForecastCard({ months = 6, showTable = false, className }: ForecastCardProps) {
  const { data, isLoading } = useForecast(months)
  // IDs únicos para os gradientes do SVG (evita colisão se houver dois gráficos na tela).
  const gid = useId().replace(/:/g, '')

  const chartData = data
    ? [
        { name: 'Hoje', Saldo: data.currentBalance / 100 },
        ...data.months.map((m) => ({ name: capitalize(m.monthLabel), Saldo: m.endingBalance / 100 })),
      ]
    : []

  const firstNegative = data?.months.find((m) => m.endingBalance < 0)
  const hasPending = data?.months.some((m) => m.expectedIncome || m.expectedExpense || m.expectedInvested)
  const values = chartData.map((d) => d.Saldo)
  const goesNegative = values.some((v) => v < 0)

  // Ponto onde o gradiente troca de verde para vermelho (o zero, em % da altura).
  const max = Math.max(...values, 0)
  const min = Math.min(...values, 0)
  const zeroOffset = max === min ? 0 : max / (max - min)
  // Gradiente só quando a linha cruza o zero: numa linha reta (sem variação) o
  // gradiente do traço não aparece, então usamos cor sólida.
  const stroke = values.every((v) => v >= 0)
    ? '#10b981'
    : values.every((v) => v < 0)
      ? '#f43f5e'
      : `url(#${gid}-stroke)`

  return (
    <Card className={cn('overflow-hidden flex flex-col', className)}>
      <CardHeader className="border-b border-[#DDD7C0] pb-3">
        <div>
          <CardTitle>Previsão de saldo</CardTitle>
          <CardDescription>Saldo de hoje somado às contas a pagar e a receber dos próximos meses</CardDescription>
        </div>
      </CardHeader>

      {firstNegative && (
        <div className="mx-4 mt-4 sm:mx-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-800">
          <AlertTriangle size={15} className="mt-px shrink-0" aria-hidden="true" />
          <span>
            Seu saldo fica negativo em {longMonth(firstNegative.month)} (
            <span className="tabular-nums">{formatCurrency(firstNegative.endingBalance)}</span>).
          </span>
        </div>
      )}

      <div className="p-4 sm:p-5 flex-1">
        {isLoading || !data ? (
          <ChartSkeleton />
        ) : (
          <>
            <div className="h-[220px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`${gid}-stroke`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset={zeroOffset} stopColor="#10b981" />
                      <stop offset={zeroOffset} stopColor="#f43f5e" />
                    </linearGradient>
                    <linearGradient id={`${gid}-fill`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset={0} stopColor="#10b981" stopOpacity={0.22} />
                      <stop offset={zeroOffset} stopColor="#10b981" stopOpacity={0.04} />
                      <stop offset={zeroOffset} stopColor="#f43f5e" stopOpacity={0.04} />
                      <stop offset={1} stopColor="#f43f5e" stopOpacity={0.22} />
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
                    width={78}
                    tickFormatter={(v) => formatCurrencyCompact(Math.round(Number(v) * 100))}
                  />
                  {goesNegative && <ReferenceLine y={0} stroke="#f43f5e" strokeDasharray="4 4" />}
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(Math.round(Number(value) * 100)), 'Saldo previsto']}
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
                    dataKey="Saldo"
                    stroke={stroke}
                    strokeWidth={2.5}
                    fill={`url(#${gid}-fill)`}
                    dot={{ r: 3, strokeWidth: 0, fill: '#111111' }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {!hasPending && (
              <p className="mt-3 text-center text-[11px] text-[#758695]">
                Sem contas pendentes nos próximos meses: o saldo fica estável.
              </p>
            )}

            {showTable && (
              <div className="mt-4 overflow-x-auto border-t border-[#DDD7C0] pt-3">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase tracking-wider text-[#5C6D7C]">
                      <th className="py-2 pr-3">Mês</th>
                      <th className="py-2 px-3 text-right">A receber</th>
                      <th className="py-2 px-3 text-right">A pagar</th>
                      <th className="py-2 px-3 text-right">Investir</th>
                      <th className="py-2 pl-3 text-right">Saldo previsto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDD7C0] tabular-nums font-semibold">
                    {data.months.map((m) => (
                      <tr key={m.month}>
                        <td className="py-2 pr-3 text-[#111111]">{capitalize(longMonth(m.month))}</td>
                        <td className="py-2 px-3 text-right text-emerald-700">{formatCurrency(m.expectedIncome)}</td>
                        <td className="py-2 px-3 text-right text-rose-700">{formatCurrency(m.expectedExpense)}</td>
                        <td className="py-2 px-3 text-right text-blue-700">{formatCurrency(m.expectedInvested)}</td>
                        <td
                          className={cn(
                            'py-2 pl-3 text-right font-extrabold',
                            m.endingBalance < 0 ? 'text-rose-700' : 'text-[#111111]'
                          )}
                        >
                          {formatCurrency(m.endingBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-2 text-[11px] text-[#758695]">
                  Contas atrasadas entram no mês atual. Despesas pagas por terceiros não entram.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  )
}
