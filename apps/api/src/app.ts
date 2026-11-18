import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { authRoutes } from './modules/auth/auth.routes'
import { categoriesRoutes } from './modules/categories/categories.routes'
import { transactionsRoutes } from './modules/transactions/transactions.routes'
import { reportsRoutes } from './modules/reports/reports.routes'
import { accountsRoutes } from './modules/accounts/accounts.routes'
import { errorHandler } from './middleware/error.middleware'

export const app = express()

// Atrás do proxy do host, o IP real do cliente vem em X-Forwarded-For
// (necessário para o limite de tentativas de login funcionar por IP).
app.set('trust proxy', 1)

const normalizeOrigin = (o: string) => o.trim().replace(/\/$/, '')

// Origens aceitas em produção: FRONTEND_URL + CORS_EXTRA_ORIGINS (separadas por vírgula).
const allowedOrigins = new Set(
  [process.env.FRONTEND_URL, ...(process.env.CORS_EXTRA_ORIGINS ?? '').split(',')]
    .filter((o): o is string => Boolean(o && o.trim()))
    .map(normalizeOrigin)
)

app.use(helmet())
app.use(cors({
  origin: (origin, callback) => {
    // Sem Origin (curl, apps nativos) ou fora de produção: libera.
    if (!origin || process.env.NODE_ENV !== 'production' || allowedOrigins.size === 0) {
      return callback(null, true)
    }
    if (allowedOrigins.has(normalizeOrigin(origin))) {
      return callback(null, true)
    }
    return callback(new Error('CORS_NOT_ALLOWED'))
  },
  credentials: true,
}))
app.use(express.json())

// Root info
app.get('/', (_req, res) => {
  res.json({
    name: '🐷 Porquinho API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      transactions: '/api/transactions',
      categories: '/api/categories',
      accounts: '/api/accounts',
      reports: '/api/reports',
    },
  })
})

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/categories', categoriesRoutes)
app.use('/api/accounts', accountsRoutes)
app.use('/api/transactions', transactionsRoutes)
app.use('/api/reports', reportsRoutes)

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' })
})

// Error handler (must be last)
app.use(errorHandler)
