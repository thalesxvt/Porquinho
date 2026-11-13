import { PrismaClient, CategoryType } from '@prisma/client'
import bcrypt from 'bcryptjs'
import 'dotenv/config'
import { encrypt } from '../src/utils/encryption'

const prisma = new PrismaClient()

const DEFAULT_CATEGORIES: Array<{
  name: string
  type: CategoryType
  color: string
  icon: string
}> = [
  { name: 'Alimentação',   type: 'EXPENSE', color: '#ef4444', icon: 'UtensilsCrossed' },
  { name: 'Transporte',    type: 'EXPENSE', color: '#f97316', icon: 'Car' },
  { name: 'Moradia',       type: 'EXPENSE', color: '#eab308', icon: 'Home' },
  { name: 'Educação',      type: 'EXPENSE', color: '#3b82f6', icon: 'GraduationCap' },
  { name: 'Lazer',         type: 'EXPENSE', color: '#8b5cf6', icon: 'Gamepad2' },
  { name: 'Saúde',         type: 'EXPENSE', color: '#06b6d4', icon: 'Heart' },
  { name: 'Compras',       type: 'EXPENSE', color: '#ec4899', icon: 'ShoppingBag' },
  { name: 'Assinaturas',   type: 'EXPENSE', color: '#6366f1', icon: 'CreditCard' },
  { name: 'Viagens',       type: 'EXPENSE', color: '#14b8a6', icon: 'Plane' },
  { name: 'Outros',        type: 'EXPENSE', color: '#6b7280', icon: 'MoreHorizontal' },
  { name: 'Salário',       type: 'INCOME',  color: '#22c55e', icon: 'Banknote' },
  { name: 'Freelance',     type: 'INCOME',  color: '#10b981', icon: 'Briefcase' },
  { name: 'Outros',        type: 'INCOME',  color: '#6b7280', icon: 'MoreHorizontal' },
  { name: 'Renda fixa',    type: 'INVESTMENT', color: '#3b82f6', icon: 'Landmark' },
  { name: 'Ações',         type: 'INVESTMENT', color: '#6366f1', icon: 'TrendingUp' },
  { name: 'Outros',        type: 'INVESTMENT', color: '#6b7280', icon: 'MoreHorizontal' },
]

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const passwordHash = await bcrypt.hash('demo123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'demo@porquinho.app' },
    update: {},
    create: {
      email: 'demo@porquinho.app',
      passwordHash,
      name: 'Demo User',
    },
  })

  console.log(`✅ User created: ${user.email}`)

  // Create default categories for demo user
  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { name_type_userId: { name: cat.name, type: cat.type, userId: user.id } },
      update: {},
      create: {
        ...cat,
        isDefault: true,
        userId: user.id,
      },
    })
  }

  console.log(`✅ ${DEFAULT_CATEGORIES.length} categories created`)

  // Transações de demonstração (recria a cada execução)
  const cats = await prisma.category.findMany({ where: { userId: user.id } })
  const cat = (name: string, type: CategoryType) => {
    const c = cats.find((x) => x.name === name && x.type === type)
    if (!c) throw new Error(`Categoria não encontrada: ${name} (${type})`)
    return c.id
  }

  type Tx = [number, 'EXPENSE' | 'INCOME' | 'INVESTMENT', string, string, number, CategoryType]
  // [mês (0-11), tipo, descrição, categoria, reais, tipo da categoria] — dia é derivado
  const months = [6, 7, 8, 9, 10] // jul..nov/2026
  const demo: Array<{ m: number; day: number; type: Tx[1]; desc: string; cat: string; reais: number }> = []
  months.forEach((m, i) => {
    const t = (day: number, type: Tx[1], desc: string, cat: string, reais: number) =>
      demo.push({ m, day, type, desc, cat, reais })
    t(5, 'INCOME', 'Salário', 'Salário', 6500)
    if (i % 2 === 0) t(18, 'INCOME', 'Projeto freelance', 'Freelance', 1200 + i * 150)
    t(6, 'EXPENSE', 'Aluguel', 'Moradia', 1800)
    t(8, 'EXPENSE', 'Supermercado', 'Alimentação', 650 + i * 40)
    t(14, 'EXPENSE', 'Restaurantes', 'Alimentação', 280 + i * 25)
    t(10, 'EXPENSE', 'Combustível e apps', 'Transporte', 320)
    t(12, 'EXPENSE', 'Streaming e software', 'Assinaturas', 89.9)
    t(20, 'EXPENSE', 'Cinema e passeios', 'Lazer', 150 + i * 30)
    if (i % 2 === 1) t(22, 'EXPENSE', 'Compras diversas', 'Compras', 420)
    t(7, 'INVESTMENT', 'Aporte Tesouro Selic', 'Renda fixa', 800 + i * 100)
    t(9, 'INVESTMENT', 'Compra de ações', 'Ações', 400 + i * 50)
    if (i % 3 === 0) t(25, 'INVESTMENT', 'Reserva diversa', 'Outros', 300)
  })

  await prisma.transaction.deleteMany({ where: { userId: user.id } })
  await prisma.transaction.createMany({
    data: demo.map((d) => ({
      amountCents: Math.round(d.reais * 100),
      type: d.type,
      description: encrypt(d.desc),
      date: new Date(Date.UTC(2026, d.m, d.day, 12)),
      categoryId: cat(d.cat, d.type === 'INCOME' ? 'INCOME' : d.type === 'INVESTMENT' ? 'INVESTMENT' : 'EXPENSE'),
      userId: user.id,
    })),
  })
  console.log(`✅ ${demo.length} demo transactions created`)
  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
