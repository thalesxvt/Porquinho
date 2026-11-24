import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { AuthController } from './auth.controller'
import { validate } from '../../middleware/validate.middleware'
import { authenticate } from '../../middleware/auth.middleware'
import { RegisterSchema, LoginSchema, UpdateProfileSchema } from '@porquinho/types'

const router = Router()
const controller = new AuthController()

// Freia força bruta: 10 tentativas que falharam por IP a cada 15 minutos em
// login/cadastro. Logins certos não contam: quem divide a mesma rede (mesmo IP)
// não se bloqueia só por entrar em vários aparelhos.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: { error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
})

router.post('/register', authLimiter, validate(RegisterSchema), (req, res) => controller.register(req, res))
router.post('/login', authLimiter, validate(LoginSchema), (req, res) => controller.login(req, res))
router.get('/me', authenticate, (req, res) => controller.me(req as any, res))
router.post('/onboarding/complete', authenticate, (req, res) => controller.completeOnboarding(req as any, res))
router.put('/profile', authenticate, validate(UpdateProfileSchema), (req, res) => controller.updateProfile(req as any, res))

export { router as authRoutes }
