import { Response } from 'express'
import { TransactionsService } from './transactions.service'
import type { AuthRequest } from '../../middleware/auth.middleware'

const service = new TransactionsService()

const ERRORS: Record<string, [number, string]> = {
  NOT_FOUND: [404, 'Transação não encontrada'],
  CATEGORY_NOT_FOUND: [404, 'Categoria não encontrada'],
  ACCOUNT_NOT_FOUND: [404, 'Conta não encontrada'],
}

function handleKnownError(error: unknown, res: Response): boolean {
  if (error instanceof Error && ERRORS[error.message]) {
    const [status, message] = ERRORS[error.message]
    res.status(status).json({ error: message })
    return true
  }
  return false
}

export class TransactionsController {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    const { accountId, page, limit, type, categoryId, search, startDate, endDate } = req.query as any
    try {
      const result = await service.findAll(req.userId!, {
        accountId,
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        type,
        categoryId,
        search,
        startDate,
        endDate,
      })
      res.json({ data: result })
    } catch (error) {
      if (!handleKnownError(error, res)) throw error
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const transaction = await service.create(req.userId!, req.body)
      res.status(201).json({ data: transaction })
    } catch (error) {
      if (!handleKnownError(error, res)) throw error
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const transaction = await service.update(req.userId!, req.params.id, req.body)
      res.json({ data: transaction })
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
