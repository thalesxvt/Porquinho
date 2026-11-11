/**
 * Script de migração: criptografa as descrições de transações já existentes no banco.
 *
 * Executar UMA única vez após adicionar ENCRYPTION_KEY ao .env:
 *   npx ts-node prisma/migrate-encrypt.ts
 *
 * O script é idempotente: pula linhas que já estejam criptografadas (prefixo enc:v1).
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { encrypt, isEncrypted } from '../src/utils/encryption'

const prisma = new PrismaClient()

async function main() {
  console.log('🔐 Iniciando migração de criptografia de descrições...\n')

  const transactions = await prisma.transaction.findMany({
    select: { id: true, description: true },
  })

  console.log(`📋 Total de transações encontradas: ${transactions.length}`)

  let migrated = 0
  let skipped = 0
  let failed = 0

  for (const tx of transactions) {
    try {
      if (isEncrypted(tx.description)) {
        skipped++
        continue
      }

      const encryptedDescription = encrypt(tx.description)
      await prisma.transaction.update({
        where: { id: tx.id },
        data: { description: encryptedDescription },
      })
      migrated++
    } catch (err) {
      console.error(`  ❌ Falha na transação ${tx.id}:`, err)
      failed++
    }
  }

  console.log('\n✅ Migração concluída!')
  console.log(`   Criptografadas : ${migrated}`)
  console.log(`   Já cifradas    : ${skipped} (puladas)`)
  console.log(`   Falhas         : ${failed}`)
}

main()
  .catch((e) => {
    console.error('Erro fatal na migração:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
