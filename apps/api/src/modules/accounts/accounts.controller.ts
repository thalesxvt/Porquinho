import { Response } from 'express'
import { AccountsService } from './accounts.service'
import type { AuthRequest } from '../../middleware/auth.middleware'

const service = new AccountsService()

const ERRORS: Record<string, [number, string]> = {
  NOT_FOUND: [404, 'Conta não encontrada'],
  NAME_TAKEN: [409, 'Já existe uma conta com esse nome'],
  HAS_TRANSACTIONS: [409, 'A conta possui transações. Mova ou exclua as transações antes.'],
  LAST_ACCOUNT: [409, 'Você precisa ter ao menos uma conta'],
  HAS_RECURRING: [409, 'A conta é usada por uma recorrência ativa. Encerre a recorrência antes.'],
}

function handleKnownError(error: unknown, res: Response): boolean {
  if (error instanceof Error && ERRORS[error.message]) {
    const [status, message] = ERRORS[error.message]
    res.status(status).json({ error: message })
    return true
  }
  return false
}

export class AccountsController {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    const accounts = await service.findAll(req.userId!)
    res.json({ data: accounts })
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const account = await service.create(req.userId!, req.body)
      res.status(201).json({ data: account })
    } catch (error) {
      if (!handleKnownError(error, res)) throw error
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const account = await service.update(req.userId!, req.params.id, req.body)
      res.json({ data: account })
    } catch (error) {
      if (!handleKnownError(error, res)) throw error
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      await service.delete(req.userId!, req.params.id)
      res.status(204).send()
    } catch (error) {
      if (!handleKnownError(error, res)) throw error
    }
  }
}
