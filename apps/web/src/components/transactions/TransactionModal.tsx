import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { TransactionForm } from './TransactionForm'
import { SeriesScopeChoice } from './SeriesScopeChoice'
import { useCreateTransaction, useUpdateTransaction, type SeriesScope } from '../../hooks/useTransactions'
import { useToast } from '../ui/Toast'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction?: any
}

export function TransactionModal({ isOpen, onClose, transaction }: TransactionModalProps) {
  const { toast } = useToast()
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  // A escolha vale só para a transação em que foi feita: ao abrir outra, volta a "Só esta".
  const [choice, setChoice] = useState<{ id?: string; scope: SeriesScope }>({ scope: 'one' })
  const scope: SeriesScope = choice.id === transaction?.id ? choice.scope : 'one'
  const setScope = (next: SeriesScope) => setChoice({ id: transaction?.id, scope: next })

  // O Dashboard abre o modal com uma data sugerida, sem id: isso é uma criação.
  const isEditing = Boolean(transaction?.id)
  const isSeriesItem = isEditing && Boolean(transaction?.seriesId)

  const handleSubmit = async (data: any) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: transaction.id, scope, ...data })
        toast(
          scope === 'following' ? 'Transação e próximas atualizadas!' : 'Transação atualizada com sucesso!',
          'success'
        )
      } else {
        const created = await createMutation.mutateAsync(data)
        toast(
          data.repeat?.kind === 'INSTALLMENT'
            ? `Parcelamento em ${data.repeat.count}x registrado!`
            : data.repeat?.kind === 'RECURRING'
              ? 'Lançamento mensal registrado!'
              : created?.status === 'PENDING'
                ? 'Conta registrada como pendente!'
                : 'Transação registrada com sucesso!',
          'success'
        )
      }
      onClose()
    } catch (err: any) {
      toast(err?.response?.data?.error || 'Erro ao salvar transação. Verifique os dados.', 'error')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar transação' : 'Nova transação'}
      description={
        isEditing
          ? 'Altere os campos abaixo para atualizar o lançamento.'
          : 'Preencha os dados da receita ou despesa para atualizar seu saldo.'
      }
      size="md"
    >
      {isSeriesItem && (
        <div className="mb-4">
          <SeriesScopeChoice
            label={
              transaction.seriesKind === 'INSTALLMENT'
                ? `Parcela ${transaction.installmentNumber}/${transaction.installmentTotal} — aplicar a`
                : 'Lançamento mensal — aplicar a'
            }
            value={scope}
            onChange={setScope}
          />
        </div>
      )}
      <TransactionForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={createMutation.isPending || updateMutation.isPending}
        defaultValues={transaction}
      />
    </Modal>
  )
}
