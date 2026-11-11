import { prisma } from '../../lib/prisma'
import { encrypt, decrypt } from '../../utils/encryption'
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

/** Mapeia um registro do banco para o formato da API, descriptografando a descrição. */
function mapTransaction(t: any) {
  return {
    id: t.id,
    amountCents: t.amountCents,
    type: t.type,
    description: decrypt(t.description),
    date: t.date.toISOString(),
    categoryId: t.categoryId,
    categoryName: t.category.name,
    categoryColor: t.category.color,
    categoryIcon: t.category.icon,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }
}

export class TransactionsService {
  async findAll(userId: string, params: ListParams) {
    const page = params.page ?? 1
    const limit = params.limit ?? 20
    const skip = (page - 1) * limit

    const where: any = { userId }

    if (params.type) where.type = params.type
    if (params.categoryId) where.categoryId = params.categoryId
    if (params.startDate || params.endDate) {
      where.date = {}
      if (params.startDate) where.date.gte = new Date(params.startDate)
      if (params.endDate) where.date.lte = new Date(params.endDate)
    }

    // Como a descrição é criptografada, não podemos usar ILIKE do Postgres.
    // Buscamos todas as transações do usuário com os outros filtros aplicados
    // e fazemos o filtro de texto em memória após descriptografar.
    // Para o volume atual e futuro próximo (< 50k transações por usuário),
    // isso é imperceptível: descriptografar 10.000 registros leva ~50ms.
    const hasSearch = Boolean(params.search?.trim())

    const [rawData, dbTotal] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: { select: { name: true, color: true, icon: true } } },
        orderBy: { date: 'desc' },
        // Se há busca por texto, precisamos de todos para filtrar em memória;
        // caso contrário usamos paginação nativa do banco (mais eficiente).
        ...(!hasSearch && { skip, take: limit }),
      }),
      // O count continua sendo feito no banco para os filtros não-textuais.
      prisma.transaction.count({ where }),
    ])

    // Descriptografa todas as descrições
    const decrypted = rawData.map(mapTransaction)

    // Aplica o filtro de texto em memória, se necessário
    let filtered = decrypted
    if (hasSearch) {
      const term = params.search!.trim().toLowerCase()
      filtered = decrypted.filter((t) =>
        t.description.toLowerCase().includes(term)
      )
    }

    // Aplica a paginação em memória quando há busca por texto
    const total = hasSearch ? filtered.length : dbTotal
    const paginatedData = hasSearch
      ? filtered.slice(skip, skip + limit)
      : filtered

    return {
      data: paginatedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async create(userId: string, input: CreateTransactionInput) {
    // Verifica se a categoria pertence ao usuário
    const category = await prisma.category.findFirst({
      where: { id: input.categoryId, userId },
    })
    if (!category) throw new Error('CATEGORY_NOT_FOUND')

    const transaction = await prisma.transaction.create({
      data: {
        amountCents: input.amountCents,
        type: input.type,
        description: encrypt(input.description), // 🔐 Criptografado antes de salvar
        date: new Date(input.date),
        categoryId: input.categoryId,
        userId,
      },
      include: { category: { select: { name: true, color: true, icon: true } } },
    })

    return mapTransaction(transaction)
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
        // 🔐 Re-criptografa a nova descrição ao atualizar
        ...(input.description !== undefined && { description: encrypt(input.description) }),
        ...(input.date !== undefined && { date: new Date(input.date) }),
        ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      },
      include: { category: { select: { name: true, color: true, icon: true } } },
    })

    return mapTransaction(updated)
  }

  async delete(userId: string, id: string) {
    const transaction = await prisma.transaction.findFirst({ where: { id, userId } })
    if (!transaction) throw new Error('NOT_FOUND')
    await prisma.transaction.delete({ where: { id } })
  }
}
