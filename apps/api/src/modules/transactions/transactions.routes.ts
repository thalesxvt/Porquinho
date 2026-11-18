import { Router } from 'express'
import { TransactionsController } from './transactions.controller'
import { validate } from '../../middleware/validate.middleware'
import { authenticate } from '../../middleware/auth.middleware'
import { CreateTransactionSchema, UpdateTransactionSchema, PayTransactionSchema } from '@porquinho/types'

const router = Router()
const controller = new TransactionsController()

router.use(authenticate)

router.get('/', (req, res) => controller.getAll(req as any, res))
router.post('/', validate(CreateTransactionSchema), (req, res) => controller.create(req as any, res))
router.put('/:id', validate(UpdateTransactionSchema), (req, res) => controller.update(req as any, res))
router.patch('/:id/pay', validate(PayTransactionSchema), (req, res) => controller.pay(req as any, res))
router.delete('/:id', (req, res) => controller.delete(req as any, res))

export { router as transactionsRoutes }
