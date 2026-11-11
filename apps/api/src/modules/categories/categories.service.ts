import { prisma } from '../../lib/prisma'
import type { CreateCategoryInput, UpdateCategoryInput } from '@porquinho/types'

export class CategoriesService {
  async findAll(userId: string) {
    return prisma.category.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    })
  }

  async create(userId: string, input: CreateCategoryInput) {
    return prisma.category.create({
      data: { ...input, userId },
    })
  }

  async update(userId: string, id: string, input: UpdateCategoryInput) {
    const category = await prisma.category.findFirst({ where: { id, userId } })
    if (!category) throw new Error('NOT_FOUND')

    return prisma.category.update({
      where: { id },
      data: input,
    })
  }

  async delete(userId: string, id: string) {
    const category = await prisma.category.findFirst({ where: { id, userId } })
    if (!category) throw new Error('NOT_FOUND')

    // Check if category has transactions
    const count = await prisma.transaction.count({ where: { categoryId: id } })
    if (count > 0) throw new Error('HAS_TRANSACTIONS')

    return prisma.category.delete({ where: { id } })
  }
}
