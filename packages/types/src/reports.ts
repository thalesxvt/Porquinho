export interface PeriodFilter {
  period: 'week' | 'month' | 'year'
}

export interface Summary {
  totalIncome: number       // centavos do período
  totalExpense: number      // centavos do período
  totalInvested: number     // centavos de transações do tipo INVESTMENT no período
  monthBalance: number      // centavos líquido do período (income - expense - invested)
  rolloverBalance: number   // centavos saldo que sobrou do mês anterior
  balance: number           // centavos saldo total disponível (rolloverBalance + monthBalance)
  previousIncome: number
  previousExpense: number
  previousInvested: number  // centavos investidos no período anterior
  previousBalance: number
}

export interface CategorySummary {
  categoryId: string
  categoryName: string
  categoryColor: string
  total: number             // centavos
  percentage: number
  count: number
}

export interface WeeklySummary {
  week: string              // 'Semana 1', etc
  startDate: string
  endDate: string
  totalExpense: number
  totalIncome: number
  totalInvested: number
}

export interface MonthlySummary {
  month: string             // '2024-01', etc
  monthLabel: string        // 'Jan', 'Fev', etc
  totalExpense: number
  totalIncome: number
  totalInvested: number
  balance: number
}
