import { Router } from 'express'
import { ReportsController } from './reports.controller'
import { authenticate } from '../../middleware/auth.middleware'

const router = Router()
const controller = new ReportsController()

router.use(authenticate)

router.get('/summary', (req, res) => controller.getSummary(req as any, res))
router.get('/by-category', (req, res) => controller.getByCategory(req as any, res))
router.get('/weekly', (req, res) => controller.getWeekly(req as any, res))
router.get('/available-months', (req, res) => controller.getAvailableMonths(req as any, res))
router.get('/monthly', (req, res) => controller.getMonthly(req as any, res))

export { router as reportsRoutes }
