import { Response } from 'express'
import { ReportsService } from './reports.service'
import type { AuthRequest } from '../../middleware/auth.middleware'

const service = new ReportsService()

export class ReportsController {
  private getRefDate(req: AuthRequest): Date {
    if (req.query.date) {
      return new Date(req.query.date as string)
    }
    if (req.query.year && req.query.month) {
      const year = parseInt(req.query.year as string, 10)
      const month = parseInt(req.query.month as string, 10)
      return new Date(year, month - 1, 15)
    }
    return new Date()
  }

  async getSummary(req: AuthRequest, res: Response): Promise<void> {
    const period = (req.query.period as 'week' | 'month' | 'year') ?? 'month'
    const refDate = this.getRefDate(req)
    const data = await service.getSummary(req.userId!, period, refDate)
    res.json({ data })
  }

  async getByCategory(req: AuthRequest, res: Response): Promise<void> {
    const period = (req.query.period as 'week' | 'month' | 'year') ?? 'month'
    const refDate = this.getRefDate(req)
    const data = await service.getByCategory(req.userId!, period, refDate)
    res.json({ data })
  }

  async getWeekly(req: AuthRequest, res: Response): Promise<void> {
    const now = new Date()
    const year = parseInt(req.query.year as string) || now.getFullYear()
    const month = parseInt(req.query.month as string) || now.getMonth() + 1
    const data = await service.getWeekly(req.userId!, year, month)
    res.json({ data })
  }

  async getMonthly(req: AuthRequest, res: Response): Promise<void> {
    const year = parseInt(req.query.year as string) || new Date().getFullYear()
    const categoryId = (req.query.categoryId as string) || undefined
    const data = await service.getMonthly(req.userId!, year, categoryId)
    res.json({ data })
  }
}
