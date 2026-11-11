import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import type { AuthRequest } from '../../middleware/auth.middleware'

const service = new AuthService()

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await service.register(req.body)
      res.status(201).json({ data: result })
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS') {
        res.status(409).json({ error: 'Email já cadastrado' })
        return
      }
      throw error
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await service.login(req.body)
      res.json({ data: result })
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
        res.status(401).json({ error: 'Email ou senha incorretos' })
        return
      }
      throw error
    }
  }

  async me(req: AuthRequest, res: Response): Promise<void> {
    const user = await service.me(req.userId!)
    res.json({ data: user })
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await service.updateProfile(req.userId!, req.body)
      res.json({ data: result })
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'EMAIL_ALREADY_EXISTS') {
          res.status(409).json({ error: 'Este email já está sendo utilizado por outra conta.' })
          return
        }
        if (error.message === 'CURRENT_PASSWORD_REQUIRED') {
          res.status(400).json({ error: 'Informe a senha atual para definir uma nova senha.' })
          return
        }
        if (error.message === 'INVALID_CURRENT_PASSWORD') {
          res.status(401).json({ error: 'Senha atual incorreta.' })
          return
        }
      }
      throw error
    }
  }
}
