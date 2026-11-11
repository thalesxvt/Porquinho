import bcrypt from 'bcryptjs'
import { prisma } from '../../lib/prisma'
import { signToken } from '../../utils/jwt'
import type { RegisterInput, LoginInput, AuthResponse, UpdateProfileInput } from '@porquinho/types'
import { CategoryType } from '@prisma/client'

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

export class AuthService {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const existing = await prisma.user.findUnique({ where: { email: input.email } })
    if (existing) {
      throw new Error('EMAIL_ALREADY_EXISTS')
    }

    const passwordHash = await bcrypt.hash(input.password, 10)

    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash,
      },
    })

    // Create default categories for new user
    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((cat) => ({
        ...cat,
        isDefault: true,
        userId: user.id,
      })),
    })

    const token = signToken({ userId: user.id, email: user.email })

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email },
    }
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({ where: { email: input.email } })

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
      user: { id: user.id, name: user.name, email: user.email },
    }
  }

  async me(userId: string) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
    return { id: user.id, name: user.name, email: user.email }
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<AuthResponse> {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })

    // If changing email, check if another user has it
    if (input.email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: input.email } })
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
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
      },
    }
  }
}
