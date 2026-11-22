import type { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { encrypt, decrypt } from '../../utils/encryption'
import { resolveAccountId } from '../accounts/accounts.service'
import { buildInstallments, dayBounds, nextOccurrences, recurringHorizon, todayAtNoon } from './series'
import { extendRecurringSeries } from './series.service'
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
  SeriesScope,
  TransactionStatus,
} from '@porquinho/types'

interface ListParams {
  accountId?: string
  page?: number
  limit?: number
  type?: 'EXPENSE' | 'INCOME' | 'INVESTMENT'
  categoryId?: string
  search?: string
  startDate?: string
  endDate?: string
  status?: TransactionStatus
  /** Só pendentes com vencimento já passado. */
  overdue?: boolean
}

/** Relações carregadas junto com cada transação para montar a resposta. */
export const transactionInclude = {
  category: { select: { name: true, color: true, icon: true } },
  series: { select: { kind: true, installmentCount: true } },
} satisfies Prisma.TransactionInclude

type TransactionRow = Prisma.TransactionGetPayload<{ include: typeof transactionInclude }>

/** Mapeia um registro do banco para o formato da API, descriptografando a descrição. */
export function mapTransaction(t: TransactionRow) {
  return {
    id: t.id,
    amountCents: t.amountCents,
    type: t.type,
    status: t.status,
    description: decrypt(t.description),
    date: t.date.toISOString(),
    categoryId: t.categoryId,
    categoryName: t.category.name,
    categoryColor: t.category.color,
    categoryIcon: t.category.icon,
    accountId: t.accountId,
    seriesId: t.seriesId,
    seriesKind: t.series?.kind ?? null,
    installmentNumber: t.installmentNumber,
    installmentTotal: t.series?.installmentCount ?? null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }
}

export class TransactionsService {
  async findAll(userId: string, params: ListParams) {
    const page = params.page ?? 1
    const limit = params.limit ?? 20
    const skip = (page - 1) * limit

    await extendRecurringSeries(userId)

    const where: Prisma.TransactionWhereInput = {
      userId,
      accountId: await resolveAccountId(userId, params.accountId),
    }

    if (params.type) where.type = params.type
    if (params.categoryId) where.categoryId = params.categoryId
    if (params.status) where.status = params.status

    const dateFilter: Prisma.DateTimeFilter = {}
    if (params.startDate) dateFilter.gte = new Date(params.startDate)
    if (params.endDate) dateFilter.lte = new Date(params.endDate)

    const today = dayBounds(todayAtNoon())
    if (params.overdue) {
      where.status = 'PENDING'
      dateFilter.lt = today.start
    }
    if (Object.keys(dateFilter).length > 0) where.date = dateFilter

    // Sem período nem status escolhidos, a lista "Todas" esconde as pendentes que
    // ainda vão vencer — senão meses de recorrências futuras tomariam o topo da lista.
    // As atrasadas continuam aparecendo.
    if (!params.status && !params.overdue && !params.startDate && !params.endDate) {
      where.OR = [{ status: 'PAID' }, { date: { lt: today.end } }]
    }

    // Pendentes fazem mais sentido por ordem de vencimento (a próxima primeiro).
    const orderBy: Prisma.TransactionOrderByWithRelationInput =
      where.status === 'PENDING' ? { date: 'asc' } : { date: 'desc' }

    // Como a descrição é criptografada, não podemos usar ILIKE do Postgres.
    // Buscamos todas as transações do usuário com os outros filtros aplicados
    // e fazemos o filtro de texto em memória após descriptografar.
    // Para o volume atual e futuro próximo (< 50k transações por usuário),
    // isso é imperceptível: descriptografar 10.000 registros leva ~50ms.
    const hasSearch = Boolean(params.search?.trim())

    const [rawData, dbTotal] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: transactionInclude,
        orderBy,
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

    const accountId = await resolveAccountId(userId, input.accountId)

    const status = input.status ?? 'PAID'
    const date = new Date(input.date)
    const common = {
      type: input.type,
      description: encrypt(input.description), // 🔐 Criptografado antes de salvar
      categoryId: input.categoryId,
      accountId,
      userId,
    }

    const repeat = input.repeat
    if (!repeat) {
      const transaction = await prisma.transaction.create({
        data: { ...common, amountCents: input.amountCents, date, status },
        include: transactionInclude,
      })
      return mapTransaction(transaction)
    }

    // Série mensal: a 1ª ocorrência recebe o status escolhido, as seguintes ficam pendentes.
    const occurrences: { number: number | null; amountCents: number; date: Date }[] =
      repeat.kind === 'INSTALLMENT'
        ? buildInstallments(input.amountCents, repeat.count, date)
        : [date, ...nextOccurrences(date, date.getUTCDate(), recurringHorizon(todayAtNoon()))]
            .map((d) => ({ number: null, amountCents: input.amountCents, date: d }))

    const last = occurrences[occurrences.length - 1]

    const firstId = await prisma.$transaction(async (tx) => {
      const series = await tx.transactionSeries.create({
        data: {
          ...common,
          kind: repeat.kind,
          installmentCount: repeat.kind === 'INSTALLMENT' ? repeat.count : null,
          dayOfMonth: date.getUTCDate(),
          generatedUntil: last.date,
          // Valor das ocorrências seguintes (nas parcelas, a parcela sem o resto).
          amountCents: last.amountCents,
        },
      })

      await tx.transaction.createMany({
        data: occurrences.map((o, i) => ({
          ...common,
          amountCents: o.amountCents,
          date: o.date,
          status: i === 0 ? status : ('PENDING' as const),
          seriesId: series.id,
          installmentNumber: o.number,
        })),
      })

      const first = await tx.transaction.findFirstOrThrow({
        where: { seriesId: series.id },
        orderBy: { date: 'asc' },
        select: { id: true },
      })
      return first.id
    })

    const first = await prisma.transaction.findUniqueOrThrow({
      where: { id: firstId },
      include: transactionInclude,
    })
    return mapTransaction(first)
  }

  async update(userId: string, id: string, input: UpdateTransactionInput, scope: SeriesScope = 'one') {
    const transaction = await prisma.transaction.findFirst({ where: { id, userId } })
    if (!transaction) throw new Error('NOT_FOUND')

    if (input.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: input.categoryId, userId },
      })
      if (!category) throw new Error('CATEGORY_NOT_FOUND')
    }

    // Mover a transação para outra conta: valida que a conta é do usuário.
    const accountId = input.accountId ? await resolveAccountId(userId, input.accountId) : undefined

    // Campos que valem para a série inteira (data e status são de cada ocorrência).
    const shared = {
      ...(input.amountCents !== undefined && { amountCents: input.amountCents }),
      ...(input.type !== undefined && { type: input.type }),
      // 🔐 Re-criptografa a nova descrição ao atualizar
      ...(input.description !== undefined && { description: encrypt(input.description) }),
      ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      ...(accountId !== undefined && { accountId }),
    }

    const data = {
      ...shared,
      ...(input.date !== undefined && { date: new Date(input.date) }),
      ...(input.status !== undefined && { status: input.status }),
    }

    if (scope === 'following' && transaction.seriesId) {
      // Propaga para as pendentes seguintes e para o molde; as já pagas nunca mudam em massa.
      await prisma.$transaction([
        prisma.transaction.update({ where: { id }, data }),
        prisma.transaction.updateMany({
          where: {
            seriesId: transaction.seriesId,
            status: 'PENDING',
            date: { gt: transaction.date },
            id: { not: id },
          },
          data: shared,
        }),
        prisma.transactionSeries.update({ where: { id: transaction.seriesId }, data: shared }),
      ])
    } else {
      await prisma.transaction.update({ where: { id }, data })
    }

    const updated = await prisma.transaction.findUniqueOrThrow({
      where: { id },
      include: transactionInclude,
    })
    return mapTransaction(updated)
  }

  /** Marca uma pendente como paga/recebida, na data informada (padrão: hoje). */
  async pay(userId: string, id: string, date?: string) {
    const transaction = await prisma.transaction.findFirst({ where: { id, userId } })
    if (!transaction) throw new Error('NOT_FOUND')

    const updated = await prisma.transaction.update({
      where: { id },
      data: { status: 'PAID', date: date ? new Date(date) : todayAtNoon() },
      include: transactionInclude,
    })
    return mapTransaction(updated)
  }

  async delete(userId: string, id: string, scope: SeriesScope = 'one') {
    const transaction = await prisma.transaction.findFirst({ where: { id, userId } })
    if (!transaction) throw new Error('NOT_FOUND')

    if (scope === 'following' && transaction.seriesId) {
      // Encerra a série: apaga esta e as pendentes seguintes; as já pagas ficam.
      await prisma.$transaction([
        prisma.transaction.deleteMany({
          where: { seriesId: transaction.seriesId, status: 'PENDING', date: { gt: transaction.date } },
        }),
        prisma.transaction.delete({ where: { id } }),
        prisma.transactionSeries.update({
          where: { id: transaction.seriesId },
          data: { active: false },
        }),
      ])
    } else {
      await prisma.transaction.delete({ where: { id } })
    }

    // Série sem nenhuma ocorrência restante some junto — senão uma recorrente
    // apagada item a item voltaria a gerar meses futuros.
    if (transaction.seriesId) {
      await prisma.transactionSeries.deleteMany({
        where: { id: transaction.seriesId, transactions: { none: {} } },
      })
    }
  }
}
