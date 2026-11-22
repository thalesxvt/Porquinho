import { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import type { CreateAccountInput, UpdateAccountInput } from '@porquinho/types'

export const DEFAULT_ACCOUNT = { name: 'Principal', color: '#09090b' }

function isUniqueViolation(e: unknown) {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002'
}

/**
 * Garante que o usuário tenha ao menos uma conta e devolve a padrão (a mais antiga).
 * Também move para ela transações antigas sem conta, o que torna a migração de
 * bases existentes automática e idempotente.
 */
export async function ensureDefaultAccount(userId: string) {
  let account = await prisma.account.findFirst({ where: { userId }, orderBy: { createdAt: 'asc' } })
  if (!account) {
    try {
      account = await prisma.account.create({ data: { ...DEFAULT_ACCOUNT, userId } })
    } catch (e) {
      // Duas requisições simultâneas podem tentar criar a conta padrão.
      if (!isUniqueViolation(e)) throw e
      account = await prisma.account.findFirstOrThrow({ where: { userId }, orderBy: { createdAt: 'asc' } })
    }
  }
  await prisma.transaction.updateMany({
    where: { userId, accountId: null },
    data: { accountId: account.id },
  })
  return account
}

/** Valida que a conta pertence ao usuário; sem conta informada, usa a padrão. */
export async function resolveAccountId(userId: string, accountId?: string | null) {
  if (!accountId) return (await ensureDefaultAccount(userId)).id
  const account = await prisma.account.findFirst({ where: { id: accountId, userId }, select: { id: true } })
  if (!account) throw new Error('ACCOUNT_NOT_FOUND')
  return account.id
}

export class AccountsService {
  async findAll(userId: string) {
    await ensureDefaultAccount(userId)

    const [accounts, sums, counts] = await Promise.all([
      prisma.account.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
      prisma.transaction.groupBy({
        by: ['accountId', 'type'],
        // Saldo = só o que já foi pago/recebido; pendentes não entram.
        where: { userId, status: 'PAID' },
        _sum: { amountCents: true },
      }),
      prisma.transaction.groupBy({
        by: ['accountId'],
        where: { userId },
        _count: true,
      }),
    ])

    return accounts.map((a, index) => {
      const sum = (type: string) =>
        sums.find((s) => s.accountId === a.id && s.type === type)?._sum.amountCents ?? 0
      return {
        id: a.id,
        name: a.name,
        color: a.color,
        balanceCents: sum('INCOME') - sum('EXPENSE') - sum('INVESTMENT'),
        transactionCount: counts.find((c) => c.accountId === a.id)?._count ?? 0,
        isDefault: index === 0,
        createdAt: a.createdAt.toISOString(),
      }
    })
  }

  async create(userId: string, input: CreateAccountInput) {
    try {
      return await prisma.account.create({ data: { name: input.name.trim(), color: input.color, userId } })
    } catch (e) {
      if (isUniqueViolation(e)) throw new Error('NAME_TAKEN')
      throw e
    }
  }

  async update(userId: string, id: string, input: UpdateAccountInput) {
    const account = await prisma.account.findFirst({ where: { id, userId } })
    if (!account) throw new Error('NOT_FOUND')
    try {
      return await prisma.account.update({
        where: { id },
        data: {
          ...(input.name !== undefined && { name: input.name.trim() }),
          ...(input.color !== undefined && { color: input.color }),
        },
      })
    } catch (e) {
      if (isUniqueViolation(e)) throw new Error('NAME_TAKEN')
      throw e
    }
  }

  async delete(userId: string, id: string) {
    const account = await prisma.account.findFirst({ where: { id, userId } })
    if (!account) throw new Error('NOT_FOUND')

    const [txCount, accountCount] = await Promise.all([
      prisma.transaction.count({ where: { accountId: id } }),
      prisma.account.count({ where: { userId } }),
    ])
    if (accountCount <= 1) throw new Error('LAST_ACCOUNT')
    if (txCount > 0) throw new Error('HAS_TRANSACTIONS')

    await prisma.account.delete({ where: { id } })
  }
}
