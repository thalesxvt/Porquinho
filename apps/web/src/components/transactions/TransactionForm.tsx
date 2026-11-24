import { useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { useCategories } from '../../hooks/useCategories'
import { useActiveAccount } from '../../hooks/useAccounts'
import { toCents, centsToFloat, formatCurrency } from '../../lib/formatters'
import { cn } from '../../lib/utils'
import { ArrowDownLeft, ArrowUpRight, TrendingUp, DollarSign, Calendar, FileText, Hash } from 'lucide-react'

const schema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória').max(255),
  amount: z.string().min(1, 'Valor é obrigatório').refine(
    (v) => {
      const n = parseFloat(v.replace(/[^\d.,-]/g, '').replace(',', '.'))
      return !isNaN(n) && n > 0
    },
    'Valor deve ser maior que zero'
  ),
  type: z.enum(['EXPENSE', 'INCOME', 'INVESTMENT']),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  // Vazio só se as contas ainda não carregaram: a API usa a conta padrão.
  accountId: z.string(),
  date: z.string().min(1, 'Data é obrigatória'),
  status: z.enum(['PAID', 'PENDING']),
  // Só na criação: NONE = avulsa, INSTALLMENT = parcelar o total, RECURRING = todo mês.
  repeatKind: z.enum(['NONE', 'INSTALLMENT', 'RECURRING']),
  installments: z.string(),
}).superRefine((data, ctx) => {
  if (data.repeatKind !== 'INSTALLMENT') return
  const n = Number(data.installments)
  if (!Number.isInteger(n) || n < 2 || n > 120) {
    ctx.addIssue({ code: 'custom', path: ['installments'], message: 'Entre 2 e 120 parcelas' })
  }
})

type FormData = z.infer<typeof schema>

interface TransactionFormProps {
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: any
}

export function TransactionForm({
  onSubmit,
  onCancel,
  isLoading,
  defaultValues,
}: TransactionFormProps) {
  const { data: categories = [] } = useCategories()
  const { accounts, accountId: activeAccountId } = useActiveAccount()
  // Edição mantém a conta da transação; criação usa a conta ativa no seletor.
  const initialAccountId = defaultValues?.accountId ?? activeAccountId ?? ''
  // O Dashboard abre o modal só com uma data sugerida: isso ainda é uma criação.
  const isEditing = Boolean(defaultValues?.id)

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: isEditing
      ? {
          description: defaultValues.description,
          amount: centsToFloat(defaultValues.amountCents),
          type: defaultValues.type,
          categoryId: defaultValues.categoryId,
          accountId: initialAccountId,
          date: format(new Date(defaultValues.date), 'yyyy-MM-dd'),
          status: defaultValues.status ?? 'PAID',
          repeatKind: 'NONE',
          installments: '2',
        }
      : {
          type: 'EXPENSE',
          // Criação pode vir com uma data sugerida ('yyyy-MM-dd'). Usamos a string
          // direto: new Date('yyyy-MM-dd') é meia-noite UTC, e no Brasil isso
          // ainda é o dia anterior.
          date: defaultValues?.date
            ? String(defaultValues.date).slice(0, 10)
            : format(new Date(), 'yyyy-MM-dd'),
          amount: '',
          description: '',
          categoryId: '',
          accountId: initialAccountId,
          status: 'PAID',
          repeatKind: 'NONE',
          installments: '2',
        },
  })

  const selectedType = watch('type')
  const status = watch('status')
  const date = watch('date')
  const repeatKind = watch('repeatKind')
  const amount = watch('amount')
  const installments = watch('installments')

  // Data futura sugere "A pagar" — até a pessoa escolher a situação manualmente.
  const statusTouched = useRef(isEditing)
  useEffect(() => {
    if (statusTouched.current || !date) return
    setValue('status', date > format(new Date(), 'yyyy-MM-dd') ? 'PENDING' : 'PAID')
  }, [date, setValue])

  const isIncome = selectedType === 'INCOME'
  const paidLabel = isIncome ? 'Recebido' : 'Pago'
  const pendingLabel = isIncome ? 'A receber' : 'A pagar'

  // Prévia das parcelas, com o resto na primeira (igual à API).
  const installmentPreview = (() => {
    const n = Number(installments)
    const cents = amount ? toCents(amount) : 0
    if (repeatKind !== 'INSTALLMENT' || !Number.isInteger(n) || n < 2 || n > 120 || cents < n) return null
    const base = Math.floor(cents / n)
    const first = base + (cents - base * n)
    return first === base
      ? `${n}x de ${formatCurrency(base)}`
      : `1x de ${formatCurrency(first)} + ${n - 1}x de ${formatCurrency(base)}`
  })()

  const filteredCategories = categories.filter(
    (c) => c.type === selectedType || c.type === 'BOTH'
  )

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit({
      description: data.description.trim(),
      amountCents: toCents(data.amount),
      type: data.type,
      categoryId: data.categoryId,
      accountId: data.accountId || undefined,
      date: new Date(data.date + 'T12:00:00.000Z').toISOString(),
      status: data.status,
      ...(!isEditing && data.repeatKind === 'INSTALLMENT' && {
        repeat: { kind: 'INSTALLMENT', count: Number(data.installments) },
      }),
      ...(!isEditing && data.repeatKind === 'RECURRING' && { repeat: { kind: 'RECURRING' } }),
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
      {/* Type Toggle */}
      <div>
        <label className="mb-1.5 block text-xs font-bold text-slate-700">Tipo de Fluxo</label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-3 rounded-xl border border-[#DDD7C0] bg-[#F1ECDA] p-1 gap-1">
              <button
                type="button"
                onClick={() => field.onChange('EXPENSE')}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  field.value === 'EXPENSE'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-[#5C6D7C] hover:text-[#111111] hover:bg-[#FAF8F2]/60'
                }`}
              >
                <ArrowDownLeft size={16} className="stroke-[2.5]" />
                Despesa
              </button>
              <button
                type="button"
                onClick={() => field.onChange('INCOME')}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  field.value === 'INCOME'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-[#5C6D7C] hover:text-[#111111] hover:bg-[#FAF8F2]/60'
                }`}
              >
                <ArrowUpRight size={16} className="stroke-[2.5]" />
                Receita
              </button>
              <button
                type="button"
                onClick={() => field.onChange('INVESTMENT')}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  field.value === 'INVESTMENT'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-[#5C6D7C] hover:text-[#111111] hover:bg-[#FAF8F2]/60'
                }`}
              >
                <TrendingUp size={16} className="stroke-[2.5]" />
                Investimento
              </button>
            </div>
          )}
        />
      </div>

      {/* Description */}
      <Input
        label="Descrição"
        placeholder="Ex: Supermercado, Aluguel, Salário mensal..."
        leftIcon={<FileText size={16} />}
        error={errors.description?.message}
        {...register('description')}
      />

      {/* Amount & Date in 2 columns on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          label={repeatKind === 'INSTALLMENT' ? 'Valor total (R$)' : 'Valor (R$)'}
          placeholder="0,00"
          type="text"
          inputMode="decimal"
          className="tabular-nums font-semibold"
          leftIcon={<DollarSign size={16} />}
          error={errors.amount?.message}
          {...register('amount')}
        />

        <Input
          label={status === 'PENDING' ? 'Vencimento' : 'Data'}
          type="date"
          leftIcon={<Calendar size={16} />}
          error={errors.date?.message}
          {...register('date')}
        />
      </div>

      {/* Situação: já saiu/entrou no saldo, ou é uma conta a pagar/receber */}
      <div>
        <label className="mb-1.5 block text-xs font-bold text-slate-700">Situação</label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-1 rounded-xl border border-[#DDD7C0] bg-[#F1ECDA] p-1">
              {([['PAID', paidLabel], ['PENDING', pendingLabel]] as const).map(([value, text]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={field.value === value}
                  onClick={() => {
                    statusTouched.current = true
                    field.onChange(value)
                  }}
                  className={cn(
                    'rounded-lg py-2 text-xs font-bold transition-all cursor-pointer',
                    field.value === value
                      ? 'bg-[#111111] text-[#F1ECDA] shadow-sm'
                      : 'text-[#5C6D7C] hover:text-[#111111] hover:bg-[#FAF8F2]/60'
                  )}
                >
                  {text}
                </button>
              ))}
            </div>
          )}
        />
        {status === 'PENDING' && (
          <p className="mt-1.5 text-[11px] text-[#758695]">
            Só entra no saldo quando você marcar como {isIncome ? 'recebido' : 'pago'}.
          </p>
        )}
      </div>

      {/* Repetição: só ao criar */}
      {!isEditing && (
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-700">Repetir</label>
          <Controller
            name="repeatKind"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-3 gap-1 rounded-xl border border-[#DDD7C0] bg-[#F1ECDA] p-1">
                {([['NONE', 'Não'], ['INSTALLMENT', 'Parcelar'], ['RECURRING', 'Todo mês']] as const).map(
                  ([value, text]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={field.value === value}
                      onClick={() => field.onChange(value)}
                      className={cn(
                        'rounded-lg py-2 text-xs font-bold transition-all cursor-pointer',
                        field.value === value
                          ? 'bg-[#111111] text-[#F1ECDA] shadow-sm'
                          : 'text-[#5C6D7C] hover:text-[#111111] hover:bg-[#FAF8F2]/60'
                      )}
                    >
                      {text}
                    </button>
                  )
                )}
              </div>
            )}
          />
          {repeatKind === 'INSTALLMENT' && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-start">
              <Input
                label="Número de parcelas"
                type="text"
                inputMode="numeric"
                className="tabular-nums font-semibold"
                leftIcon={<Hash size={16} />}
                error={errors.installments?.message}
                {...register('installments')}
              />
              <p className="text-xs text-[#5C6D7C] sm:pt-8 tabular-nums font-semibold">
                {installmentPreview ?? 'Informe o valor total'}
              </p>
            </div>
          )}
          {repeatKind !== 'NONE' && (
            <p className="mt-1.5 text-[11px] text-[#758695]">
              {repeatKind === 'INSTALLMENT'
                ? 'Uma parcela por mês. A partir da 2ª, ficam a pagar até você marcar.'
                : 'Lança os próximos 12 meses como a pagar e continua gerando sozinho.'}
            </p>
          )}
        </div>
      )}

      {/* Category */}
      <Select
        label="Categoria"
        placeholder="Selecione uma categoria..."
        options={filteredCategories.map((c) => ({
          value: c.id,
          label: c.name,
        }))}
        error={errors.categoryId?.message}
        {...register('categoryId')}
      />

      {/* Conta: só aparece quando há mais de uma */}
      {accounts.length > 1 && (
        <Select
          label="Conta"
          options={accounts.map((a) => ({ value: a.id, label: a.name }))}
          error={errors.accountId?.message}
          {...register('accountId')}
        />
      )}

      {/* Action buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-4 mt-2 border-t border-slate-100">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant={selectedType === 'EXPENSE' ? 'danger' : 'primary'}
          isLoading={isLoading}
          className="w-full sm:w-auto"
        >
          {isEditing ? 'Salvar alterações' : 'Registrar transação'}
        </Button>
      </div>
    </form>
  )
}
