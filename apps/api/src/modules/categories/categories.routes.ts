import { Router } from 'express'
import { CategoriesController } from './categories.controller'
import { validate } from '../../middleware/validate.middleware'
import { authenticate } from '../../middleware/auth.middleware'
import { CreateCategorySchema, UpdateCategorySchema } from '@porquinho/types'

const router = Router()
const controller = new CategoriesController()

router.use(authenticate)

router.get('/', (req, res) => controller.getAll(req as any, res))
router.post('/', validate(CreateCategorySchema), (req, res) => controller.create(req as any, res))
router.put('/:id', validate(UpdateCategorySchema), (req, res) => controller.update(req as any, res))
router.delete('/:id', (req, res) => controller.delete(req as any, res))

export { router as categoriesRoutes }
