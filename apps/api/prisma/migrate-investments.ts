/**
 * Migra dados existentes para o tipo INVESTMENT e para categorias por tipo.
 *
 * Antes: investimento era uma categoria (ex.: "Investimentos") usada em transações EXPENSE,
 *        e categorias "BOTH" (ex.: "Outros") serviam a despesa e receita.
 * Agora: investimento é um tipo de transação próprio e cada categoria tem um único tipo.
 *
 * Rode DEPOIS de `npm run db:push` (que adiciona INVESTMENT aos enums).
 *
 *   npm run db:investments -- --dry-run          # simula tudo e desfaz (nada é gravado)
 *   npm run db:investments                       # aplica
 *   npm run db:investments -- --add-defaults     # aplica e cria Renda fixa/Ações/Outros (investimento) se faltarem
 *
 * Segurança:
 *  - Cada usuário é migrado em uma transação de banco.
 *  - O saldo (receitas − despesas − investimentos) do usuário é comparado antes e depois;
 *    se mudar, a transação daquele usuário é desfeita.
 *  - Só transações EXPENSE entram como INVESTMENT. Receitas em categorias "invest*" continuam receitas.
 *  - Idempotente: pode ser executado mais de uma vez.
 */
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()
const DRY_RUN = process.argv.includes('--dry-run')
const ADD_DEFAULTS = process.argv.includes('--add-defaults')

class DryRunRollback extends Error {}

const INVESTMENT_DEFAULTS = [
  { name: 'Renda fixa', color: '#3b82f6', icon: 'Landmark' },
  { name: 'Ações', color: '#6366f1', icon: 'TrendingUp' },
  { name: 'Outros', color: '#6b7280', icon: 'MoreHorizontal' },
]

async function balanceOf(tx: Prisma.TransactionClient, userId: string) {
  const rows = await tx.transaction.groupBy({
    by: ['type'],
    where: { userId },
    _sum: { amountCents: true },
  })
  const sum = (t: string) => rows.find((r) => r.type === t)?._sum.amountCents ?? 0
  return sum('INCOME') - sum('EXPENSE') - sum('INVESTMENT')
}

async function migrateUser(tx: Prisma.TransactionClient, userId: string) {
  const stats = { movedToInvestment: 0, categoriesConverted: 0, categoriesSplit: 0, defaultsAdded: 0 }
  const before = await balanceOf(tx, userId)

  // 1) Categorias legadas "BOTH": original vira EXPENSE; cria cópias INCOME e INVESTMENT.
  const both = await tx.category.findMany({ where: { userId, type: 'BOTH' } })
  for (const cat of both) {
    await tx.category.update({ where: { id: cat.id }, data: { type: 'EXPENSE' } })
    for (const type of ['INCOME', 'INVESTMENT'] as const) {
      const copy = await tx.category.upsert({
        where: { name_type_userId: { name: cat.name, type, userId } },
        update: {},
        create: { name: cat.name, type, color: cat.color, icon: cat.icon, isDefault: cat.isDefault, userId },
      })
      if (type === 'INCOME') {
        await tx.transaction.updateMany({
          where: { categoryId: cat.id, type: 'INCOME' },
          data: { categoryId: copy.id },
        })
      }
    }
    stats.categoriesSplit++
  }

  // 2) Categorias com "invest" no nome: despesas nelas viram INVESTMENT.
  const investCats = await tx.category.findMany({
    where: { userId, type: { not: 'INVESTMENT' }, name: { contains: 'invest', mode: 'insensitive' } },
  })
  for (const cat of investCats) {
    const expenseCount = await tx.transaction.count({ where: { categoryId: cat.id, type: 'EXPENSE' } })
    const otherCount = await tx.transaction.count({ where: { categoryId: cat.id, type: { not: 'EXPENSE' } } })

    if (otherCount === 0) {
      // Só despesas (ou vazia). Se já existe INVESTMENT de mesmo nome (ex.: criada
      // pela separação de "BOTH"), mescla nela e remove a original, que fica vazia.
      const existing = await tx.category.findUnique({
        where: { name_type_userId: { name: cat.name, type: 'INVESTMENT', userId } },
      })
      if (existing) {
        const moved = await tx.transaction.updateMany({
          where: { categoryId: cat.id, type: 'EXPENSE' },
          data: { type: 'INVESTMENT', categoryId: existing.id },
        })
        await tx.category.delete({ where: { id: cat.id } })
        stats.movedToInvestment += moved.count
      } else {
        // A própria categoria vira INVESTMENT.
        const moved = await tx.transaction.updateMany({
          where: { categoryId: cat.id, type: 'EXPENSE' },
          data: { type: 'INVESTMENT' },
        })
        await tx.category.update({ where: { id: cat.id }, data: { type: 'INVESTMENT' } })
        stats.movedToInvestment += moved.count
        stats.categoriesConverted++
      }
    } else if (expenseCount > 0) {
      // Mistura (ex.: receitas de dividendos): mantém a categoria e leva só as despesas
      // para uma categoria de mesmo nome do tipo INVESTMENT.
      const copy = await tx.category.upsert({
        where: { name_type_userId: { name: cat.name, type: 'INVESTMENT', userId } },
        update: {},
        create: { name: cat.name, type: 'INVESTMENT', color: cat.color, icon: cat.icon, isDefault: cat.isDefault, userId },
      })
      const moved = await tx.transaction.updateMany({
        where: { categoryId: cat.id, type: 'EXPENSE' },
        data: { type: 'INVESTMENT', categoryId: copy.id },
      })
      stats.movedToInvestment += moved.count
      stats.categoriesSplit++
    }
    // Só receitas: não mexe.
  }

  // 3) (opcional) categorias padrão de investimento
  if (ADD_DEFAULTS) {
    for (const d of INVESTMENT_DEFAULTS) {
      const exists = await tx.category.findUnique({
        where: { name_type_userId: { name: d.name, type: 'INVESTMENT', userId } },
      })
      if (!exists) {
        await tx.category.create({ data: { ...d, type: 'INVESTMENT', isDefault: true, userId } })
        stats.defaultsAdded++
      }
    }
  }

  const after = await balanceOf(tx, userId)
  if (before !== after) {
    throw new Error(`Saldo divergiu para o usuário ${userId}: antes=${before} depois=${after}`)
  }
  return { ...stats, balance: after }
}

async function main() {
  console.log(DRY_RUN ? '🔎 DRY RUN — nada será gravado' : '🚀 Aplicando migração')
  const users = await prisma.user.findMany({ select: { id: true } })
  const totals = { users: 0, failed: 0, movedToInvestment: 0, categoriesConverted: 0, categoriesSplit: 0, defaultsAdded: 0 }

  for (const u of users) {
    try {
      await prisma.$transaction(
        async (tx) => {
          const s = await migrateUser(tx, u.id)
          totals.users++
          totals.movedToInvestment += s.movedToInvestment
          totals.categoriesConverted += s.categoriesConverted
          totals.categoriesSplit += s.categoriesSplit
          totals.defaultsAdded += s.defaultsAdded
          if (DRY_RUN) throw new DryRunRollback()
        },
        { timeout: 60_000 }
      )
    } catch (e) {
      if (e instanceof DryRunRollback) continue
      totals.failed++
      console.error(`❌ usuário ${u.id} não migrado (desfeito):`, (e as Error).message)
    }
  }

  console.log(JSON.stringify(totals, null, 2))
  if (DRY_RUN) console.log('ℹ️  Dry run: totals acima são o que SERIA alterado (users = processados sem erro).')
  if (totals.failed > 0) process.exitCode = 1
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
