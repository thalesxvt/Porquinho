import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { useCategories } from '../../hooks/useCategories'
import { toCents, centsToFloat } from '../../lib/formatters'
import { ArrowDownLeft, ArrowUpRight, DollarSign, Calendar, FileText } from 'lucide-react'

const schema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória').max(255),
  amount: z.string().min(1, 'Valor é obrigatório').refine(
    (v) => {
      const n = parseFloat(v.replace(/[^\d.,-]/g, '').replace(',', '.'))
      return !isNaN(n) && n > 0
    },
    'Valor deve ser maior que zero'
  ),
  type: z.enum(['EXPENSE', 'INCOME']),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  date: z.string().min(1, 'Data é obrigatória'),
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

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues
      ? {
          description: defaultValues.description,
          amount: centsToFloat(defaultValues.amountCents),
          type: defaultValues.type,
          categoryId: defaultValues.categoryId,
          date: format(new Date(defaultValues.date), 'yyyy-MM-dd'),
        }
      : {
          type: 'EXPENSE',
          date: format(new Date(), 'yyyy-MM-dd'),
          amount: '',
          description: '',
          categoryId: '',
        },
  })

  const selectedType = watch('type')

  const filteredCategories = categories.filter(
    (c) => c.type === selectedType || c.type === 'BOTH'
  )

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit({
      description: data.description.trim(),
      amountCents: toCents(data.amount),
      type: data.type,
      categoryId: data.categoryId,
      date: new Date(data.date + 'T12:00:00.000Z').toISOString(),
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
            <div className="grid grid-cols-2 rounded-xl border border-[#DDD7C0] bg-[#F1ECDA] p-1 gap-1">
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
          label="Valor (R$)"
          placeholder="0,00"
          type="text"
          inputMode="decimal"
          className="tabular-nums font-semibold"
          leftIcon={<DollarSign size={16} />}
          error={errors.amount?.message}
          {...register('amount')}
        />

        <Input
          label="Data"
          type="date"
          leftIcon={<Calendar size={16} />}
          error={errors.date?.message}
          {...register('date')}
        />
      </div>

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
          {defaultValues ? 'Salvar alterações' : 'Registrar transação'}
        </Button>
      </div>
    </form>
  )
}
