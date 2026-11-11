/**
 * Converts a float value (R$ 149.90) to integer cents (14990)
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100)
}

/**
 * Converts integer cents (14990) to float (149.90)
 */
export function fromCents(cents: number): number {
  return cents / 100
}

/**
 * Formats cents to Brazilian Real string: 14990 → "R$ 149,90"
 */
export function formatBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(fromCents(cents))
}
