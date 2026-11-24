export interface TourStep {
  /** Valor de `data-tour` do elemento destacado. Sem alvo, o balão aparece centralizado. */
  target?: string
  title: string
  body: string
}

/** Todos os passos acontecem no Dashboard, então o tour nunca precisa trocar de página. */
export const TOUR_STEPS: TourStep[] = [
  {
    title: 'Bem-vindo ao Porquinho! 🐷',
    body: 'Em menos de um minuto você vai saber onde fica cada coisa. Pode pular quando quiser.',
  },
  {
    target: 'account-switcher',
    title: 'Suas contas',
    body: 'Separe o dinheiro que não se mistura: banco, carteira, VR… Em "Gerenciar contas" você também define o saldo inicial de cada uma.',
  },
  {
    target: 'new-transaction',
    title: 'Nova transação',
    body: 'Registre gastos, receitas e investimentos por aqui (no computador, a tecla N também abre). Dá para lançar parcelas e contas recorrentes.',
  },
  {
    target: 'kpis',
    title: 'Resumo do período',
    body: 'Saldo, receitas, despesas e investimentos da conta escolhida, atualizados a cada lançamento.',
  },
  {
    target: 'upcoming',
    title: 'O que vem por aí',
    body: 'Contas a pagar e a receber e a previsão do seu saldo para os próximos meses.',
  },
  {
    target: 'nav',
    title: 'Navegação',
    body: 'Veja todas as transações, os relatórios por categoria e organize suas categorias.',
  },
  {
    target: 'profile',
    title: 'Tudo pronto!',
    body: 'Se quiser rever este tutorial, ele fica no seu perfil.',
  },
]
