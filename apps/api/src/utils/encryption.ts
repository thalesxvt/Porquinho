/**
 * Field-Level Encryption (AES-256-GCM)
 *
 * Criptografa strings sensíveis (ex: `description` de transações) antes de
 * persistir no banco e descriptografa ao ler.
 *
 * Formato do texto cifrado armazenado:
 *   enc:v1:<iv_hex>:<authTag_hex>:<ciphertext_hex>
 *
 * - `enc:v1` → prefixo de versão; permite identificar se o campo está cifrado
 *              e facilita rotação de algoritmo/chave no futuro
 * - `iv`     → vetor de inicialização de 12 bytes, aleatório por operação
 * - `authTag`→ tag de autenticação GCM de 16 bytes (detecta adulteração)
 * - `cipher` → dado cifrado em hexadecimal
 *
 * A chave deve ser fornecida via variável de ambiente ENCRYPTION_KEY
 * como uma string hexadecimal de 64 chars (= 32 bytes = 256 bits).
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_BYTES = 12   // 96 bits — recomendado pelo NIST para GCM
const TAG_BYTES = 16  // 128 bits
const PREFIX = 'enc:v1'

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error(
      'ENCRYPTION_KEY inválida ou ausente. ' +
      'Defina uma chave hexadecimal de 64 caracteres (32 bytes) no .env.'
    )
  }
  return Buffer.from(hex, 'hex')
}

/**
 * Criptografa uma string em texto claro.
 * Retorna sempre um valor diferente mesmo para o mesmo input (IV aleatório).
 */
export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()

  return [
    PREFIX,
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted.toString('hex'),
  ].join(':')
}

/**
 * Descriptografa um valor produzido por `encrypt()`.
 * Se o valor não possuir o prefixo `enc:v1` (campo legado em texto claro),
 * devolve o próprio valor sem modificação — compatibilidade com dados anteriores.
 */
export function decrypt(value: string): string {
  if (!value.startsWith(PREFIX + ':')) {
    // Campo não criptografado (criado antes da implementação FLE)
    return value
  }

  const parts = value.split(':')
  // Formato: enc:v1:<iv>:<authTag>:<cipher> → 5 partes
  if (parts.length !== 5) {
    throw new Error('Formato de dado criptografado inválido.')
  }

  const [, , ivHex, authTagHex, ciphertextHex] = parts
  const key = getKey()
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const ciphertext = Buffer.from(ciphertextHex, 'hex')

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString('utf8')
}

/**
 * Retorna true se o valor já está criptografado pelo sistema.
 */
export function isEncrypted(value: string): boolean {
  return value.startsWith(PREFIX + ':')
}
