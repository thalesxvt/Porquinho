import { Response } from 'express'
import { TransactionsService } from './transactions.service'
import type { AuthRequest } from '../../middleware/auth.middleware'

const service = new TransactionsService()

const ERRORS: Record<string, [number, string]> = {
  NOT_FOUND: [404, 'Transação não encontrada'],
  CATEGORY_NOT_FOUND: [404, 'Categoria não encontrada'],
  ACCOUNT_NOT_FOUND: [404, 'Conta não encontrada'],
  AMOUNT_TOO_SMALL: [400, 'Valor pequeno demais para o número de parcelas'],
}

/** `?scope=following` aplica a mudança também às pendentes seguintes da série. */
function parseScope(value: unknown): 'one' | 'following' {
  return value === 'following' ? 'following' : 'one'
}

function parseStatus(value: unknown): 'PENDING' | 'PAID' | undefined {
  return value === 'PENDING' || value === 'PAID' ? value : undefined
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
    const { accountId, page, limit, type, categoryId, search, startDate, endDate, status, overdue } = req.query as any
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
        status: parseStatus(status),
        overdue: overdue === 'true',
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
      const transaction = await service.update(req.userId!, req.params.id, req.body, parseScope(req.query.scope))
      res.json({ data: transaction })
    } catch (error) {
      if (!handleKnownError(error, res)) throw error
    }
  }

  async pay(req: AuthRequest, res: Response): Promise<void> {
    try {
      const transaction = await service.pay(req.userId!, req.params.id, req.body?.date)
      res.json({ data: transaction })
    } catch (error) {
      if (!handleKnownError(error, res)) throw error
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      await service.delete(req.userId!, req.params.id, parseScope(req.query.scope))
      res.status(204).send()
    } catch (error) {
      if (!handleKnownError(error, res)) throw error
    }
  }
}
