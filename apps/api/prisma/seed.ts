import { PrismaClient, CategoryType } from '@prisma/client'
import bcrypt from 'bcryptjs'

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
  { name: 'Outros',        type: 'BOTH',    color: '#6b7280', icon: 'MoreHorizontal' },
  { name: 'Salário',       type: 'INCOME',  color: '#22c55e', icon: 'Banknote' },
  { name: 'Freelance',     type: 'INCOME',  color: '#10b981', icon: 'Briefcase' },
  { name: 'Investimentos', type: 'INCOME',  color: '#84cc16', icon: 'TrendingUp' },
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
      where: { name_userId: { name: cat.name, userId: user.id } },
      update: {},
      create: {
        ...cat,
        isDefault: true,
        userId: user.id,
      },
    })
  }

  console.log(`✅ ${DEFAULT_CATEGORIES.length} categories created`)
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
