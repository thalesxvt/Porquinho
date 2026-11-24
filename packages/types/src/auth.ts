import { z } from 'zod'

// E-mail sempre sem espaços e em minúsculas: "Fulana@Gmail.com" e
// "fulana@gmail.com" são o mesmo login.
const emailField = z.string().trim().toLowerCase().email('Email inválido')

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: emailField,
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export const LoginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Senha é obrigatória'),
})

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: emailField,
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres').optional().or(z.literal('')),
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>

export interface AuthUser {
  id: string
  name: string
  email: string
  /** ISO; null enquanto o usuário não concluiu o tour de boas-vindas. */
  onboardingCompletedAt: string | null
}

export interface AuthResponse {
  token: string
  user: AuthUser
}
