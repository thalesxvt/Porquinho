import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { authRoutes } from './modules/auth/auth.routes'
import { categoriesRoutes } from './modules/categories/categories.routes'
import { transactionsRoutes } from './modules/transactions/transactions.routes'
import { reportsRoutes } from './modules/reports/reports.routes'
import { errorHandler } from './middleware/error.middleware'

export const app = express()

app.use(helmet())
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || process.env.NODE_ENV !== 'production' || !process.env.FRONTEND_URL) {
      return callback(null, true)
    }
    const target = process.env.FRONTEND_URL.replace(/\/$/, '')
    if (origin.replace(/\/$/, '') === target || origin.endsWith('.vercel.app')) {
      return callback(null, true)
    }
    return callback(null, true)
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
app.use('/api/transactions', transactionsRoutes)
app.use('/api/reports', reportsRoutes)

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' })
})

// Error handler (must be last)
app.use(errorHandler)
