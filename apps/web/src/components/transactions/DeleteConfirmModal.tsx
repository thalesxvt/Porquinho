import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { SeriesScopeChoice } from './SeriesScopeChoice'
import { useDeleteTransaction, type SeriesScope } from '../../hooks/useTransactions'
import { useToast } from '../ui/Toast'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: any
}

export function DeleteConfirmModal({ isOpen, onClose, transaction }: DeleteConfirmModalProps) {
  const { toast } = useToast()
  const deleteMutation = useDeleteTransaction()
  const [scope, setScope] = useState<SeriesScope>('one')
  const isSeriesItem = Boolean(transaction?.seriesId)

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ id: transaction.id, scope })
      toast(scope === 'following' ? 'Transação e próximas excluídas' : 'Transação excluída com sucesso')
      onClose()
    } catch {
      toast('Erro ao excluir transação', 'error')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Excluir Transação" size="sm">
      <p className="mb-5 text-sm text-slate-600 leading-relaxed">
        Tem certeza que deseja excluir a transação{' '}
        <span className="font-bold text-slate-900">"{transaction?.description}"</span>?
        Esta ação não poderá ser desfeita.
      </p>
      {isSeriesItem && (
        <div className="mb-5">
          <SeriesScopeChoice
            label={transaction.seriesKind === 'RECURRING' ? 'Lançamento mensal — excluir' : 'Parcelamento — excluir'}
            value={scope}
            onChange={setScope}
          />
        </div>
      )}
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
