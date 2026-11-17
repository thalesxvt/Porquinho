import { Router } from 'express'
import { AccountsController } from './accounts.controller'
import { validate } from '../../middleware/validate.middleware'
import { authenticate } from '../../middleware/auth.middleware'
import { CreateAccountSchema, UpdateAccountSchema } from '@porquinho/types'

const router = Router()
const controller = new AccountsController()

router.use(authenticate)

router.get('/', (req, res) => controller.getAll(req as any, res))
router.post('/', validate(CreateAccountSchema), (req, res) => controller.create(req as any, res))
router.put('/:id', validate(UpdateAccountSchema), (req, res) => controller.update(req as any, res))
router.delete('/:id', (req, res) => controller.delete(req as any, res))

export { router as accountsRoutes }
