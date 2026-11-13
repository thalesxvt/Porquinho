import { Rectangle } from 'recharts'

/**
 * Forma da barra de Despesas quando empilhada com Investimentos.
 * Arredonda o topo só se não houver investimento acima (senão o topo é da barra azul).
 */
export function expenseBarShape(radius: number) {
  return function ExpenseBarShape(props: any) {
    const hasInvestment = Number(props?.payload?.Investimentos ?? 0) > 0
    const r = hasInvestment ? 0 : radius
    return <Rectangle {...props} radius={[r, r, 0, 0]} />
  }
}
