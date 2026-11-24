import { z } from 'zod'

export const CreateAccountSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(40),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
  /** Saldo que a conta já tinha antes do primeiro lançamento, em centavos (pode ser negativo). */
  initialBalanceCents: z.number().int().min(-100_000_000_000).max(100_000_000_000).optional(),
})

export const UpdateAccountSchema = CreateAccountSchema.partial()

export type CreateAccountInput = z.infer<typeof CreateAccountSchema>
export type UpdateAccountInput = z.infer<typeof UpdateAccountSchema>

export interface Account {
  id: string
  name: string
  color: string
  /** Saldo inicial informado pelo usuário, em centavos. */
  initialBalanceCents: number
  /** Saldo atual da conta em centavos (saldo inicial + receitas − despesas − investimentos). */
  balanceCents: number
  transactionCount: number
  /** A conta mais antiga do usuário: recebe transações quando nenhuma conta é informada. */
  isDefault: boolean
  createdAt: string
}
