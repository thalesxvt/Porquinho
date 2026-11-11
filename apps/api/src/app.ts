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
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

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
