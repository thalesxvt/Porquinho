import { prisma } from '../../lib/prisma'
import type { CreateTransactionInput, UpdateTransactionInput } from '@porquinho/types'

interface ListParams {
  page?: number
  limit?: number
  type?: 'EXPENSE' | 'INCOME'
  categoryId?: string
  search?: string
  startDate?: string
  endDate?: string
}

export class TransactionsService {
  async findAll(userId: string, params: ListParams) {
    const page = params.page ?? 1
    const limit = params.limit ?? 20
    const skip = (page - 1) * limit

    const where: any = { userId }

    if (params.type) where.type = params.type
    if (params.categoryId) where.categoryId = params.categoryId
    if (params.search) where.description = { contains: params.search, mode: 'insensitive' }
    if (params.startDate || params.endDate) {
      where.date = {}
      if (params.startDate) where.date.gte = new Date(params.startDate)
      if (params.endDate) where.date.lte = new Date(params.endDate)
    }

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: { select: { name: true, color: true, icon: true } } },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ])

    return {
      data: data.map((t) => ({
        id: t.id,
        amountCents: t.amountCents,
        type: t.type,
        description: t.description,
        date: t.date.toISOString(),
        categoryId: t.categoryId,
        categoryName: t.category.name,
        categoryColor: t.category.color,
        categoryIcon: t.category.icon,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async create(userId: string, input: CreateTransactionInput) {
    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: { id: input.categoryId, userId },
    })
    if (!category) throw new Error('CATEGORY_NOT_FOUND')

    const transaction = await prisma.transaction.create({
      data: {
        amountCents: input.amountCents,
        type: input.type,
        description: input.description,
        date: new Date(input.date),
        categoryId: input.categoryId,
        userId,
      },
      include: { category: { select: { name: true, color: true, icon: true } } },
    })

    return {
      id: transaction.id,
      amountCents: transaction.amountCents,
      type: transaction.type,
      description: transaction.description,
      date: transaction.date.toISOString(),
      categoryId: transaction.categoryId,
      categoryName: transaction.category.name,
      categoryColor: transaction.category.color,
      categoryIcon: transaction.category.icon,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
    }
  }

  async update(userId: string, id: string, input: UpdateTransactionInput) {
    const transaction = await prisma.transaction.findFirst({ where: { id, userId } })
    if (!transaction) throw new Error('NOT_FOUND')

    if (input.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: input.categoryId, userId },
      })
      if (!category) throw new Error('CATEGORY_NOT_FOUND')
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...(input.amountCents !== undefined && { amountCents: input.amountCents }),
        ...(input.type !== undefined && { type: input.type }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.date !== undefined && { date: new Date(input.date) }),
        ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      },
      include: { category: { select: { name: true, color: true, icon: true } } },
    })

    return {
      id: updated.id,
      amountCents: updated.amountCents,
      type: updated.type,
      description: updated.description,
      date: updated.date.toISOString(),
      categoryId: updated.categoryId,
      categoryName: updated.category.name,
      categoryColor: updated.category.color,
      categoryIcon: updated.category.icon,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    }
  }

  async delete(userId: string, id: string) {
    const transaction = await prisma.transaction.findFirst({ where: { id, userId } })
    if (!transaction) throw new Error('NOT_FOUND')
    await prisma.transaction.delete({ where: { id } })
  }
}
