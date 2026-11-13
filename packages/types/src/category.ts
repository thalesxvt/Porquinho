import { z } from 'zod'

export const CategoryTypeEnum = z.enum(['EXPENSE', 'INCOME', 'INVESTMENT', 'BOTH'])
export type CategoryType = z.infer<typeof CategoryTypeEnum>

// 'BOTH' existe apenas em categorias legadas; novas categorias escolhem um tipo.
export const CategoryInputTypeEnum = z.enum(['EXPENSE', 'INCOME', 'INVESTMENT'])

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50),
  type: CategoryInputTypeEnum,
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
  icon: z.string().optional(),
})

export const UpdateCategorySchema = CreateCategorySchema.partial()

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>

export interface Category {
  id: string
  name: string
  type: CategoryType
  color: string
  icon?: string
  isDefault: boolean
  createdAt: string
}
