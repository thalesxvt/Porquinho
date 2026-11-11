import { useState } from 'react'
import { Plus, Trash2, Tag, ShieldCheck, Check, Pencil } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageLayout } from '../components/layout/PageLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../hooks/useCategories'
import { useToast } from '../components/ui/Toast'
import { Skeleton } from '../components/ui/Skeleton'
import { cn } from '../lib/utils'

const PRESET_COLORS = [
  '#10b981', // Emerald
  '#059669', // Dark Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#d946ef', // Fuchsia
  '#f43f5e', // Rose
  '#ea580c', // Orange
  '#d97706', // Amber
  '#64748b', // Slate
  '#09090b', // Obsidian
]

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50),
  type: z.enum(['EXPENSE', 'INCOME', 'BOTH']),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
})

type FormData = z.infer<typeof schema>

export function Categories() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)

  const { data: categories = [], isLoading } = useCategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'EXPENSE', color: PRESET_COLORS[0], name: '' },
  })

  const currentColor = watch('color')
  const currentName = watch('name')
  const currentType = watch('type')

  const handleOpenCreate = () => {
    setEditingCategory(null)
    reset({ type: 'EXPENSE', color: PRESET_COLORS[0], name: '' })
    setModalOpen(true)
  }

  const handleOpenEdit = (category: any) => {
    setEditingCategory(category)
    reset({
      name: category.name,
      type: category.type,
      color: category.color || PRESET_COLORS[0],
    })
    setModalOpen(true)
  }

  const handleSave = async (data: FormData) => {
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory.id,
          name: data.name.trim(),
          type: data.type,
          color: data.color,
        })
        toast('Categoria atualizada com sucesso!', 'success')
      } else {
        await createMutation.mutateAsync({
          name: data.name.trim(),
          type: data.type,
          color: data.color,
        })
        toast('Categoria criada com sucesso!', 'success')
      }
      setModalOpen(false)
      setEditingCategory(null)
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Erro ao salvar categoria.'
      toast(msg, 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      toast('Categoria excluída com sucesso!', 'success')
      setDeleteTarget(null)
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Não foi possível excluir a categoria. Verifique se há transações vinculadas.'
      toast(msg, 'error')
    }
  }

  const expenseCategories = categories.filter(
    (c: any) => c.type === 'EXPENSE' || c.type === 'BOTH'
  )
  const incomeCategories = categories.filter(
    (c: any) => c.type === 'INCOME' || c.type === 'BOTH'
  )

  const renderCategoryCard = (c: any) => (
    <div
      key={c.id}
      className="group relative flex items-center justify-between rounded-xl border border-[#DDD7C0] bg-[#FAF8F2] p-3.5 shadow-subtle hover:border-[#758695] hover:shadow-surface transition-all duration-150"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs border transition-transform group-hover:scale-105"
          style={{
            backgroundColor: `${c.color || '#758695'}18`,
            color: c.color || '#758695',
            borderColor: `${c.color || '#758695'}35`,
          }}
        >
          <Tag size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm text-[#111111] truncate group-hover:text-black">
            {c.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {c.isDefault ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#758695]">
                <ShieldCheck size={12} className="text-[#758695]" />
                Padrão
              </span>
            ) : (
              <span className="text-[11px] font-medium text-[#111111] bg-[#F1ECDA] border border-[#DDD7C0] px-1.5 py-0.2 rounded">
                Personalizada
              </span>
            )}
            {c.type === 'BOTH' && (
              <span className="text-[10px] font-semibold text-[#758695]">
                • Ambos
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons (always easy to tap) */}
      <div className="flex items-center gap-1 shrink-0 ml-2">
        <button
          onClick={() => handleOpenEdit(c)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#758695] hover:text-[#111111] hover:bg-[#EFE9D5] transition-colors cursor-pointer"
          title="Editar categoria"
          aria-label={`Editar ${c.name}`}
        >
          <Pencil size={15} />
        </button>

        {!c.isDefault && (
          <button
            onClick={() => setDeleteTarget(c)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#758695] hover:text-[#8A2B2B] hover:bg-[#C94A4A]/10 transition-colors cursor-pointer"
            title="Excluir categoria"
            aria-label={`Excluir ${c.name}`}
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <PageLayout>
      <PageHeader
        title="Categorias"
        description="Organize e segmente o destino de todas as suas receitas e despesas"
        action={
          <Button
            onClick={handleOpenCreate}
            leftIcon={<Plus size={16} className="text-[#F1ECDA] stroke-[2.5]" />}
            className="w-full sm:w-auto bg-[#111111] text-[#F1ECDA] hover:bg-[#222222] border-[#111111]"
          >
            Nova categoria
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Expense categories */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-slate-100/90 pb-3">
            <div>
              <CardTitle>Categorias de Despesa</CardTitle>
              <CardDescription>Centros de custo e saídas financeiras</CardDescription>
            </div>
            <Badge variant="expense">{expenseCategories.length}</Badge>
          </CardHeader>

          <div className="p-4 sm:p-5">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : expenseCategories.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Nenhuma categoria de despesa cadastrada.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {expenseCategories.map(renderCategoryCard)}
              </div>
            )}
          </div>
        </Card>

        {/* Income categories */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-slate-100/90 pb-3">
            <div>
              <CardTitle>Categorias de Receita</CardTitle>
              <CardDescription>Fontes de renda e entradas financeiras</CardDescription>
            </div>
            <Badge variant="income">{incomeCategories.length}</Badge>
          </CardHeader>

          <div className="p-4 sm:p-5">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : incomeCategories.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Nenhuma categoria de receita cadastrada.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {incomeCategories.map(renderCategoryCard)}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Create / Edit Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingCategory(null)
        }}
        title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
        description={
          editingCategory
            ? 'Atualize o nome, tipo ou a cor de identificação da categoria.'
            : 'Crie uma etiqueta personalizada para classificar suas transações.'
        }
        size="md"
      >
        <form onSubmit={handleSubmit(handleSave)} className="flex flex-col gap-4">
          <Input
            label="Nome da categoria"
            placeholder="Ex: Assinaturas, Investimentos, Lazer..."
            error={errors.name?.message}
            {...register('name')}
          />

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">Tipo de Uso</label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 rounded-xl border border-slate-200 bg-slate-100/80 p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => field.onChange('EXPENSE')}
                    className={cn(
                      'rounded-lg py-2 text-xs font-bold transition-all cursor-pointer',
                      field.value === 'EXPENSE'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    Despesa
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange('INCOME')}
                    className={cn(
                      'rounded-lg py-2 text-xs font-bold transition-all cursor-pointer',
                      field.value === 'INCOME'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    Receita
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange('BOTH')}
                    className={cn(
                      'rounded-lg py-2 text-xs font-bold transition-all cursor-pointer',
                      field.value === 'BOTH'
                        ? 'bg-zinc-950 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    Ambos
                  </button>
                </div>
              )}
            />
          </div>

          {/* Color Palette Selector */}
          <div>
            <label className="mb-2 block text-xs font-bold text-slate-700">
              Cor de Identificação
            </label>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map((color) => {
                    const isSelected = field.value === color
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => field.onChange(color)}
                        className={cn(
                          'flex h-10 w-full items-center justify-center rounded-xl transition-all cursor-pointer shadow-subtle ring-2 ring-offset-2',
                          isSelected ? 'ring-zinc-950 scale-105' : 'ring-transparent hover:scale-105'
                        )}
                        style={{ backgroundColor: color }}
                        aria-label={`Cor ${color}`}
                      >
                        {isSelected && <Check size={16} className="text-white drop-shadow-sm" />}
                      </button>
                    )
                  })}
                </div>
              )}
            />
          </div>

          {/* Live Preview */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Pré-visualização
            </span>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs"
                style={{
                  backgroundColor: `${currentColor}18`,
                  color: currentColor,
                }}
              >
                <Tag size={18} />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900">
                  {currentName || 'Nome da Categoria'}
                </p>
                <Badge variant="neutral" dot dotColor={currentColor}>
                  {currentType === 'EXPENSE'
                    ? 'Despesa'
                    : currentType === 'INCOME'
                    ? 'Receita'
                    : 'Ambos'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setModalOpen(false)
                setEditingCategory(null)
              }}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingCategory ? 'Salvar alterações' : 'Criar categoria'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Excluir Categoria"
          description="Esta ação removerá a categoria selecionada."
          size="sm"
        >
          <p className="mb-5 text-sm text-slate-600 leading-relaxed">
            Deseja realmente remover a categoria{' '}
            <strong className="text-slate-900">"{deleteTarget.name}"</strong>?
          </p>
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
            >
              Excluir Categoria
            </Button>
          </div>
        </Modal>
      )}
    </PageLayout>
  )
}
