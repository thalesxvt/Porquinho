# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Indivíduos que buscam controle financeiro pessoal descomplicado e ágil no dia a dia, registrando receitas e despesas cotidianas para manter suas finanças sob controle sem sobrecarga burocrática ou planilhas confusas.

## Product Purpose
O Porquinho existe para oferecer clareza financeira imediata. Permite que o usuário compreenda sua saúde financeira em segundos — saldo líquido real, despesas do período, fontes de receita e capacidade de economia —, proporcionando controle e tranquilidade através de um fluxo de registro sem atrito.

## Positioning
Controle financeiro pessoal direto, visual e rápido. Em vez de ferramentas bancárias inchadas ou planilhas intimidadoras, o Porquinho foca naquilo que realmente importa: clareza do saldo, métricas-chave visíveis de imediato, visualização gráfica intuitiva e rapidez de registro em qualquer dispositivo.

## Operating Context
- Uso frequente e rotineiro em mobile (registro em trânsito de compras diárias) e desktop (planejamento mensal, análise de relatórios e conciliação).
- Rotina de conferência mensal e semanal para acompanhamento de despesas por categoria e evolução anual.

## Capabilities and Constraints
- **Autenticação:** Cadastro e login de usuários seguros via token JWT.
- **Movimentações:** Gestão completa (CRUD) de receitas e despesas com descrição, valor (em centavos no core), data e categoria vinculada.
- **Painel de Controle:** Cards de KPI em tempo real (Saldo atual, Total de Receitas, Total de Despesas, Economia acumulada).
- **Relatórios & Gráficos:** Filtros temporais (semana, mês, ano), evolução mensal anual e divisão de despesas por categoria (Recharts).
- **Categorias:** Gerenciamento customizado de categorias com nomes e paletas de cores distintas.
- **Stack Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React, TanStack Query, Zustand, React Router DOM v6, Recharts.

## Brand Commitments
- **Nome:** Porquinho.
- **Tom de voz:** Claro, encorajador, confiável e livre de atritos ou jargões financeiros complexos.
- **Ícone e Identidade:** Metáfora do cofrinho / porquinho, transmitindo segurança e economia inteligente de forma contemporânea e refinada.

## Product Principles
1. **Clareza em Segundos:** Informações essenciais (saldo, receitas, despesas) compreensíveis no primeiro olhar.
2. **Zero Atrito:** Registrar uma nova movimentação deve ser uma ação de segundos, sem formulários cansativos.
3. **Ergonomia e Fluidez:** Experiência consistente e confortável em telas móveis (bottom navigation, áreas de toque generosas) e desktops (painéis organizados).
4. **Precisão e Confiabilidade:** Tratamento rigoroso de valores monetários com formatação local brasileira (R$ / BRL) e integridade visual dos dados.

