import { Response } from 'express'
import { CategoriesService } from './categories.service'
import type { AuthRequest } from '../../middleware/auth.middleware'

const service = new CategoriesService()

export class CategoriesController {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    const categories = await service.findAll(req.userId!)
    res.json({ data: categories })
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    const category = await service.create(req.userId!, req.body)
    res.status(201).json({ data: category })
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const category = await service.update(req.userId!, req.params.id, req.body)
      res.json({ data: category })
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
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
        res.status(404).json({ error: 'Categoria não encontrada' })
        return
      }
      if (error instanceof Error && error.message === 'HAS_TRANSACTIONS') {
        res.status(409).json({ error: 'Categoria possui movimentações associadas' })
        return
      }
      throw error
    }
  }
}
