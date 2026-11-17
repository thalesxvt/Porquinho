import { Response } from 'express'
import { ReportsService } from './reports.service'
import { resolveAccountId } from '../accounts/accounts.service'
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

  /** Conta pedida na query (validada) ou a conta padrão do usuário. Responde 404 se inválida. */
  private async getAccountId(req: AuthRequest, res: Response): Promise<string | null> {
    try {
      return await resolveAccountId(req.userId!, (req.query.accountId as string) || undefined)
    } catch (error) {
      if (error instanceof Error && error.message === 'ACCOUNT_NOT_FOUND') {
        res.status(404).json({ error: 'Conta não encontrada' })
        return null
      }
      throw error
    }
  }

  async getSummary(req: AuthRequest, res: Response): Promise<void> {
    const accountId = await this.getAccountId(req, res)
    if (!accountId) return
    const period = (req.query.period as 'week' | 'month' | 'year') ?? 'month'
    const refDate = this.getRefDate(req)
    const data = await service.getSummary(req.userId!, accountId, period, refDate)
    res.json({ data })
  }

  async getByCategory(req: AuthRequest, res: Response): Promise<void> {
    const accountId = await this.getAccountId(req, res)
    if (!accountId) return
    const period = (req.query.period as 'week' | 'month' | 'year') ?? 'month'
    const refDate = this.getRefDate(req)
    const data = await service.getByCategory(req.userId!, accountId, period, refDate)
    res.json({ data })
  }

  async getWeekly(req: AuthRequest, res: Response): Promise<void> {
    const accountId = await this.getAccountId(req, res)
    if (!accountId) return
    const now = new Date()
    const year = parseInt(req.query.year as string) || now.getFullYear()
    const month = parseInt(req.query.month as string) || now.getMonth() + 1
    const data = await service.getWeekly(req.userId!, accountId, year, month)
    res.json({ data })
  }

  async getAvailableMonths(req: AuthRequest, res: Response): Promise<void> {
    const accountId = await this.getAccountId(req, res)
    if (!accountId) return
    const data = await service.getAvailableMonths(req.userId!, accountId)
    res.json({ data })
  }

  async getMonthly(req: AuthRequest, res: Response): Promise<void> {
    const accountId = await this.getAccountId(req, res)
    if (!accountId) return
    const year = parseInt(req.query.year as string) || new Date().getFullYear()
    const categoryId = (req.query.categoryId as string) || undefined
    const data = await service.getMonthly(req.userId!, accountId, year, categoryId)
    res.json({ data })
  }
}
