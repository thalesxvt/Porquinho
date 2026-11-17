import { useState } from 'react'
import { Plus, Trash2, Wallet, Check, Pencil } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Account } from '@porquinho/types'
import { PageLayout } from '../components/layout/PageLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { useToast } from '../components/ui/Toast'
import {
  useActiveAccount,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
} from '../hooks/useAccounts'
import { useAccountStore } from '../stores/account.store'
import { formatCurrency } from '../lib/formatters'
import { cn } from '../lib/utils'

const PRESET_COLORS = [
  '#09090b', // Obsidian
  '#ea580c', // Orange
  '#d97706', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#d946ef', // Fuchsia
  '#f43f5e', // Rose
  '#64748b', // Slate
  '#059669', // Dark Emerald
]

const schema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(40),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
})

type FormData = z.infer<typeof schema>

export function Accounts() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Account | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null)

  const { accounts, account: active, isLoading } = useActiveAccount()
  const selectAccount = useAccountStore((s) => s.selectAccount)
  const createMutation = useCreateAccount()
  const updateMutation = useUpdateAccount()
  const deleteMutation = useDeleteAccount()
  const { toast } = useToast()

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', color: PRESET_COLORS[1] },
  })

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', color: PRESET_COLORS[1] })
    setModalOpen(true)
  }

  const openEdit = (a: Account) => {
    setEditing(a)
    reset({ name: a.name, color: a.color })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
  }

  const errorMessage = (err: any, fallback: string) =>
    err?.response?.data?.error || err?.response?.data?.message || fallback

  const handleSave = async (data: FormData) => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, ...data })
        toast('Conta atualizada!', 'success')
      } else {
        const created = await createMutation.mutateAsync(data)
        // Quem cria uma conta quase sempre quer começar a lançar nela.
        selectAccount(created.id)
        toast(`Conta "${created.name}" criada e selecionada.`, 'success')
      }
      closeModal()
    } catch (err) {
      toast(errorMessage(err, 'Erro ao salvar conta.'), 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      toast('Conta excluída.', 'success')
      setDeleteTarget(null)
    } catch (err) {
      toast(errorMessage(err, 'Não foi possível excluir a conta.'), 'error')
    }
  }

  const deleteBlockedReason = (a: Account) => {
    if (accounts.length <= 1) return 'Você precisa ter ao menos uma conta.'
    if (a.transactionCount > 0) return 'Só é possível excluir contas sem transações.'
    return null
  }

  return (
    <PageLayout>
      <PageHeader
        title="Contas"
        description="Separe dinheiros que não se misturam, como VR ou outro banco. Cada conta tem saldo e relatórios próprios."
        action={
          <Button
            onClick={openCreate}
            leftIcon={<Plus size={16} className="text-[#F1ECDA] stroke-[2.5]" />}
            className="w-full sm:w-auto bg-[#111111] text-[#F1ECDA] hover:bg-[#222222] border-[#111111]"
          >
            Nova conta
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-slate-100/90 pb-3">
          <div>
            <CardTitle>Suas contas</CardTitle>
            <CardDescription>Toque em uma conta para vê-la no painel</CardDescription>
          </div>
          <Badge variant="neutral">{accounts.length}</Badge>
        </CardHeader>

        <div className="p-4 sm:p-5">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {accounts.map((a) => {
                const isActive = a.id === active?.id
                return (
                  <div
                    key={a.id}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl border bg-[#FAF8F2] p-3.5 shadow-subtle transition-all duration-150',
                      isActive ? 'border-[#111111]' : 'border-[#DDD7C0] hover:border-[#758695]'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => selectAccount(a.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left cursor-pointer"
                      aria-label={`Ver conta ${a.name}`}
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
                        style={{ backgroundColor: `${a.color}18`, color: a.color, borderColor: `${a.color}35` }}
                      >
                        <Wallet size={17} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-bold text-[#111111]">{a.name}</p>
                          {isActive && (
                            <span className="shrink-0 rounded-full bg-[#111111] px-1.5 py-0.5 text-[10px] font-bold text-[#F1ECDA]">
                              Ativa
                            </span>
                          )}
                        </div>
                        <p
                          className={cn(
                            'text-xs font-bold tabular-nums',
                            a.balanceCents < 0 ? 'text-rose-600' : 'text-[#5C6D7C]'
                          )}
                        >
                          {formatCurrency(a.balanceCents)}
                          <span className="ml-1.5 font-medium text-[#758695]">
                            · {a.transactionCount} {a.transactionCount === 1 ? 'transação' : 'transações'}
                          </span>
                        </p>
                      </div>
                    </button>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => openEdit(a)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#758695] hover:text-[#111111] hover:bg-[#EFE9D5] transition-colors cursor-pointer"
                        title="Editar conta"
                        aria-label={`Editar ${a.name}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(a)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#758695] hover:text-[#8A2B2B] hover:bg-[#C94A4A]/10 transition-colors cursor-pointer"
                        title="Excluir conta"
                        aria-label={`Excluir ${a.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Criar / editar */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar conta' : 'Nova conta'}
        description={
          editing
            ? 'Altere o nome ou a cor da conta.'
            : 'Ex.: VR, VA, Nubank, Carteira. O saldo começa em zero; lance uma receita para o saldo inicial.'
        }
        size="md"
      >
        <form onSubmit={handleSubmit(handleSave)} className="flex flex-col gap-4">
          <Input
            label="Nome da conta"
            placeholder="Ex: VR, Nubank, Carteira..."
            error={errors.name?.message}
            {...register('name')}
          />

          <div>
            <label className="mb-2 block text-xs font-bold text-slate-700">Cor de identificação</label>
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

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={closeModal}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
              {editing ? 'Salvar alterações' : 'Criar conta'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Excluir */}
      {deleteTarget && (
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Excluir conta"
          size="sm"
        >
          {deleteBlockedReason(deleteTarget) ? (
            <>
              <p className="mb-5 text-sm text-slate-600 leading-relaxed">
                <strong className="text-slate-900">"{deleteTarget.name}"</strong> não pode ser excluída.{' '}
                {deleteBlockedReason(deleteTarget)}
              </p>
              <div className="flex justify-end pt-3 border-t border-slate-100">
                <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                  Entendi
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="mb-5 text-sm text-slate-600 leading-relaxed">
                Deseja realmente excluir a conta{' '}
                <strong className="text-slate-900">"{deleteTarget.name}"</strong>?
              </p>
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleteMutation.isPending}>
                  Cancelar
                </Button>
                <Button variant="danger" onClick={handleDelete} isLoading={deleteMutation.isPending}>
                  Excluir conta
                </Button>
              </div>
            </>
          )}
        </Modal>
      )}
    </PageLayout>
  )
}
