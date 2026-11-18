import { prisma } from '../../lib/prisma'
import {
  RECURRING_HORIZON_MONTHS,
  nextOccurrences,
  occurrenceDate,
  recurringHorizon,
  todayAtNoon,
} from './series'

/**
 * Mantém as séries recorrentes ativas do usuário geradas até ~12 meses à frente.
 * Chamada antes de listar transações e de montar vencimentos/previsão, no mesmo
 * espírito de `ensureDefaultAccount`: barata quando não há nada a fazer e idempotente.
 */
export async function extendRecurringSeries(userId: string) {
  const today = todayAtNoon()
  const horizon = recurringHorizon(today)
  // Só estende quando a folga cai abaixo de ~1 mês, para não gravar a cada requisição.
  const threshold = occurrenceDate(today, RECURRING_HORIZON_MONTHS - 1, today.getUTCDate())

  const due = await prisma.transactionSeries.findMany({
    where: { userId, kind: 'RECURRING', active: true, generatedUntil: { lt: threshold } },
  })

  for (const series of due) {
    const dates = nextOccurrences(series.generatedUntil, series.dayOfMonth, horizon)
    if (dates.length === 0) continue

    await prisma.$transaction(async (tx) => {
      // Trava otimista: se outra requisição já estendeu esta série, não gera de novo.
      const { count } = await tx.transactionSeries.updateMany({
        where: { id: series.id, generatedUntil: series.generatedUntil },
        data: { generatedUntil: dates[dates.length - 1] },
      })
      if (count === 0) return

      await tx.transaction.createMany({
        data: dates.map((date) => ({
          amountCents: series.amountCents,
          type: series.type,
          paidByOthers: series.paidByOthers,
          // Já criptografado no molde. Copiar o texto cifrado é seguro: o IV só se
          // repete junto com o mesmo conteúdo, nunca com um texto diferente.
          description: series.description,
          date,
          status: 'PENDING' as const,
          categoryId: series.categoryId,
          accountId: series.accountId,
          userId,
          seriesId: series.id,
        })),
      })
    })
  }
}
