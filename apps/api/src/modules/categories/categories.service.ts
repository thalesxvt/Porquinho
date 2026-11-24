import { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import type { CreateCategoryInput, UpdateCategoryInput } from '@porquinho/types'

/** Nome + tipo já usado por outra categoria do usuário (@@unique no schema). */
function rethrowNameTaken(e: unknown): never {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
    throw new Error('NAME_TAKEN')
  }
  throw e
}

export class CategoriesService {
  async findAll(userId: string) {
    return prisma.category.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    })
  }

  async create(userId: string, input: CreateCategoryInput) {
    return prisma.category
      .create({
        data: { ...input, userId },
      })
      .catch(rethrowNameTaken)
  }

  async update(userId: string, id: string, input: UpdateCategoryInput) {
    const category = await prisma.category.findFirst({ where: { id, userId } })
    if (!category) throw new Error('NOT_FOUND')

    // Trocar o tipo (ex.: despesa → receita) deixaria os lançamentos existentes com
    // categoria incompatível.
    if (input.type && input.type !== category.type) {
      const [txConflicts, seriesConflicts] = await Promise.all([
        prisma.transaction.count({ where: { categoryId: id, type: { not: input.type } } }),
        prisma.transactionSeries.count({ where: { categoryId: id, active: true, type: { not: input.type } } }),
      ])
      if (txConflicts + seriesConflicts > 0) throw new Error('TYPE_CHANGE_CONFLICT')
    }

    return prisma.category
      .update({
        where: { id },
        data: input,
      })
      .catch(rethrowNameTaken)
  }

  async delete(userId: string, id: string) {
    const category = await prisma.category.findFirst({ where: { id, userId } })
    if (!category) throw new Error('NOT_FOUND')

    // Check if category has transactions
    const count = await prisma.transaction.count({ where: { categoryId: id } })
    if (count > 0) throw new Error('HAS_TRANSACTIONS')

    // A série recorrente é apagada em cascata com a categoria: sem esta checagem,
    // uma recorrência ativa pararia de gerar meses sem nenhum aviso.
    const activeSeries = await prisma.transactionSeries.count({ where: { categoryId: id, active: true } })
    if (activeSeries > 0) throw new Error('HAS_RECURRING')

    return prisma.category.delete({ where: { id } })
  }
}
