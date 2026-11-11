import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useDeleteTransaction } from '../../hooks/useTransactions'
import { useToast } from '../ui/Toast'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: any
}

export function DeleteConfirmModal({ isOpen, onClose, transaction }: DeleteConfirmModalProps) {
  const { toast } = useToast()
  const deleteMutation = useDeleteTransaction()

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(transaction.id)
      toast('Movimentação excluída com sucesso')
      onClose()
    } catch {
      toast('Erro ao excluir movimentação', 'error')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Excluir Movimentação" size="sm">
      <p className="mb-5 text-sm text-slate-600 leading-relaxed">
        Tem certeza que deseja excluir a movimentação{' '}
        <span className="font-bold text-slate-900">"{transaction?.description}"</span>?
        Esta ação não poderá ser desfeita.
      </p>
      <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
        <Button variant="secondary" onClick={onClose} disabled={deleteMutation.isPending}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleDelete} isLoading={deleteMutation.isPending}>
          Excluir Definitivamente
        </Button>
      </div>
    </Modal>
  )
}
