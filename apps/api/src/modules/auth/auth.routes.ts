import { Router } from 'express'
import { AuthController } from './auth.controller'
import { validate } from '../../middleware/validate.middleware'
import { authenticate } from '../../middleware/auth.middleware'
import { RegisterSchema, LoginSchema, UpdateProfileSchema } from '@porquinho/types'

const router = Router()
const controller = new AuthController()

router.post('/register', validate(RegisterSchema), (req, res) => controller.register(req, res))
router.post('/login', validate(LoginSchema), (req, res) => controller.login(req, res))
router.get('/me', authenticate, (req, res) => controller.me(req as any, res))
router.put('/profile', authenticate, validate(UpdateProfileSchema), (req, res) => controller.updateProfile(req as any, res))

export { router as authRoutes }
