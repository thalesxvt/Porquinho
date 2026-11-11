import { env } from './config/env'
import { app } from './app'
import { prisma } from './lib/prisma'

async function main() {
  // Test database connection
  await prisma.$connect()
  console.log('✅ Database connected')

  app.listen(env.PORT, () => {
    console.log(`🚀 API running on http://localhost:${env.PORT}`)
    console.log(`📊 Environment: ${env.NODE_ENV}`)
  })
}

main().catch((err) => {
  console.error('❌ Failed to start server:', err)
  process.exit(1)
})
