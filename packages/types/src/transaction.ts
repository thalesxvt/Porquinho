import { z } from 'zod'

export const TransactionTypeEnum = z.enum(['EXPENSE', 'INCOME', 'INVESTMENT'])
export type TransactionType = z.infer<typeof TransactionTypeEnum>

export const CreateTransactionSchema = z.object({
  amountCents: z.number().int().positive('Valor deve ser positivo'),
  type: TransactionTypeEnum,
  description: z.string().min(1, 'Descrição é obrigatória').max(255),
  date: z.string().datetime(),
  categoryId: z.string().cuid(),
})

export const UpdateTransactionSchema = CreateTransactionSchema.partial()

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>

export interface Transaction {
  id: string
  amountCents: number
  type: TransactionType
  description: string
  date: string
  categoryId: string
  categoryName: string
  categoryColor: string
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
