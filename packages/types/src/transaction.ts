import { z } from 'zod'

export const TransactionTypeEnum = z.enum(['EXPENSE', 'INCOME', 'INVESTMENT'])
export type TransactionType = z.infer<typeof TransactionTypeEnum>

export const TransactionStatusEnum = z.enum(['PENDING', 'PAID'])
export type TransactionStatus = z.infer<typeof TransactionStatusEnum>

// Repetição mensal ao criar: parcelar o valor total em N vezes, ou repetir todo mês.
export const RepeatSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('INSTALLMENT'), count: z.number().int().min(2).max(120) }),
  z.object({ kind: z.literal('RECURRING') }),
])
export type RepeatInput = z.infer<typeof RepeatSchema>

// Ao editar/excluir uma ocorrência de série: só ela, ou ela e as pendentes seguintes.
export const SeriesScopeEnum = z.enum(['one', 'following'])
export type SeriesScope = z.infer<typeof SeriesScopeEnum>

export const PayTransactionSchema = z.object({
  date: z.string().datetime().optional(),
})
export type PayTransactionInput = z.infer<typeof PayTransactionSchema>

const TransactionBaseSchema = z.object({
  amountCents: z.number().int().positive('Valor deve ser positivo'),
  type: TransactionTypeEnum,
  description: z.string().min(1, 'Descrição é obrigatória').max(255),
  date: z.string().datetime(),
  categoryId: z.string().cuid(),
  // Conta da transação; se omitida, a API usa a conta padrão do usuário.
  accountId: z.string().cuid().optional(),
  // Só vale para despesas; a API grava false para os outros tipos.
  paidByOthers: z.boolean().optional(),
  // Padrão PAID. PENDING = conta a pagar/receber, com `date` como vencimento.
  status: TransactionStatusEnum.optional(),
})

export const CreateTransactionSchema = TransactionBaseSchema.extend({
  // Só na criação: gera uma série mensal (parcelas ou recorrência).
  repeat: RepeatSchema.optional(),
})

export const UpdateTransactionSchema = TransactionBaseSchema.partial()

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>

export interface Transaction {
  id: string
  amountCents: number
  type: TransactionType
  paidByOthers: boolean
  status: TransactionStatus
  description: string
  date: string
  seriesId: string | null
  seriesKind: 'INSTALLMENT' | 'RECURRING' | null
  installmentNumber: number | null
  installmentTotal: number | null
  categoryId: string
  categoryName: string
  categoryColor: string
  accountId: string | null
  createdAt: string
  updatedAt: string
}

export interface PaginatedTransactions {
  data: Transaction[]
  total: number
  page: number
  limit: number
  totalPages: number
}
