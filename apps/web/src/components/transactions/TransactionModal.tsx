import { Modal } from '../ui/Modal'
import { TransactionForm } from './TransactionForm'
import { useCreateTransaction, useUpdateTransaction } from '../../hooks/useTransactions'
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

  const handleSubmit = async (data: any) => {
    try {
      if (transaction?.id) {
        await updateMutation.mutateAsync({ id: transaction.id, ...data })
        toast('Movimentação atualizada com sucesso!', 'success')
      } else {
        await createMutation.mutateAsync(data)
        toast('Movimentação registrada com sucesso!', 'success')
      }
      onClose()
    } catch {
      toast('Erro ao salvar movimentação. Verifique os dados.', 'error')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? 'Editar movimentação' : 'Nova movimentação'}
      description={
        transaction
          ? 'Altere os campos abaixo para atualizar o lançamento.'
          : 'Preencha os dados da receita ou despesa para atualizar seu saldo.'
      }
      size="md"
    >
      <TransactionForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={createMutation.isPending || updateMutation.isPending}
        defaultValues={transaction}
      />
    </Modal>
  )
}
