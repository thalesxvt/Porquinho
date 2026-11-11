import { Response } from 'express'
import { TransactionsService } from './transactions.service'
import type { AuthRequest } from '../../middleware/auth.middleware'

const service = new TransactionsService()

export class TransactionsController {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    const { page, limit, type, categoryId, search, startDate, endDate } = req.query as any
    const result = await service.findAll(req.userId!, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      type,
      categoryId,
      search,
      startDate,
      endDate,
    })
    res.json({ data: result })
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const transaction = await service.create(req.userId!, req.body)
      res.status(201).json({ data: transaction })
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'CATEGORY_NOT_FOUND') {
        res.status(404).json({ error: 'Categoria não encontrada' })
        return
      }
      throw error
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const transaction = await service.update(req.userId!, req.params.id, req.body)
      res.json({ data: transaction })
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        res.status(404).json({ error: 'Transação não encontrada' })
        return
      }
      if (error instanceof Error && error.message === 'CATEGORY_NOT_FOUND') {
        res.status(404).json({ error: 'Categoria não encontrada' })
        return
      }
      throw error
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      await service.delete(req.userId!, req.params.id)
      res.status(204).send()
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        res.status(404).json({ error: 'Transação não encontrada' })
        return
      }
      throw error
    }
  }
}
