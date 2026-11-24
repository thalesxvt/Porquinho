import bcrypt from 'bcryptjs'
import { prisma } from '../../lib/prisma'
import { signToken } from '../../utils/jwt'
import type { RegisterInput, LoginInput, AuthResponse, AuthUser, UpdateProfileInput } from '@porquinho/types'
import { CategoryType, type User } from '@prisma/client'
import { DEFAULT_ACCOUNT } from '../accounts/accounts.service'

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

/**
 * Busca por e-mail sem diferenciar maiúsculas. Novos e-mails já são gravados em
 * minúsculas, mas contas antigas podem ter sido cadastradas com maiúsculas.
 */
function findUserByEmail(email: string) {
  return prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })
}

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    onboardingCompletedAt: user.onboardingCompletedAt?.toISOString() ?? null,
  }
}

export class AuthService {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const existing = await findUserByEmail(input.email)
    if (existing) {
      throw new Error('EMAIL_ALREADY_EXISTS')
    }

    const passwordHash = await bcrypt.hash(input.password, 10)

    // Tudo ou nada: sem isso, uma falha no meio deixaria o usuário sem categorias.
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: input.email,
          name: input.name,
          passwordHash,
        },
      })

      // Create default categories for new user
      await tx.category.createMany({
        data: DEFAULT_CATEGORIES.map((cat) => ({
          ...cat,
          isDefault: true,
          userId: created.id,
        })),
      })

      // Conta inicial: todas as transações pertencem a alguma conta.
      await tx.account.create({ data: { ...DEFAULT_ACCOUNT, userId: created.id } })
      return created
    })

    const token = signToken({ userId: user.id, email: user.email })

    return {
      token,
      user: toAuthUser(user),
    }
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await findUserByEmail(input.email)

    if (!user) {
      throw new Error('INVALID_CREDENTIALS')
    }

    const passwordMatch = await bcrypt.compare(input.password, user.passwordHash)
    if (!passwordMatch) {
      throw new Error('INVALID_CREDENTIALS')
    }

    const token = signToken({ userId: user.id, email: user.email })

    return {
      token,
      user: toAuthUser(user),
    }
  }

  async me(userId: string) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
    return toAuthUser(user)
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<AuthResponse> {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })

    // If changing email, check if another user has it
    if (input.email !== user.email.toLowerCase()) {
      const existing = await findUserByEmail(input.email)
      if (existing && existing.id !== userId) {
        throw new Error('EMAIL_ALREADY_EXISTS')
      }
    }

    let passwordHash = user.passwordHash

    // If user wants to change password
    if (input.newPassword && input.newPassword.trim().length > 0) {
      if (!input.currentPassword) {
        throw new Error('CURRENT_PASSWORD_REQUIRED')
      }
      const isMatch = await bcrypt.compare(input.currentPassword, user.passwordHash)
      if (!isMatch) {
        throw new Error('INVALID_CURRENT_PASSWORD')
      }
      passwordHash = await bcrypt.hash(input.newPassword, 10)
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        passwordHash,
      },
    })

    const token = signToken({ userId: updated.id, email: updated.email })

    return {
      token,
      user: toAuthUser(updated),
    }
  }

  async completeOnboarding(userId: string): Promise<AuthUser> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { onboardingCompletedAt: new Date() },
    })
    return toAuthUser(user)
  }
}
