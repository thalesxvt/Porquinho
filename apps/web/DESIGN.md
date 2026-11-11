---
name: Porquinho
description: Gestão financeira pessoal de alto impacto com foco em clareza instantânea, ergonomia e zero atrito.
colors:
  primary: "#09090b"
  neutral-bg: "#f8fafc"
  neutral-surface: "#ffffff"
  neutral-border: "#e2e8f0"
  neutral-subtle: "#f1f5f9"
  text-primary: "#0f172a"
  text-muted: "#64748b"
  income: "#10b981"
  income-subtle: "#ecfdf5"
  expense: "#f43f5e"
  expense-subtle: "#fff1f2"
typography:
  display:
    fontFamily: "Manrope, Inter, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Manrope, Inter, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Manrope, Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Manrope, Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Manrope, Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "{colors.neutral-subtle}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "20px"
---

# Design System: Porquinho

## Overview

**Creative North Star: "The Obsidian & Emerald Ledger"**

O Porquinho é construído sobre a premissa de que finanças pessoais exigem precisão cirúrgica combinada a uma experiência tátil, limpa e serena. O ruído visual é rigorosamente eliminado: em vez de gráficos barulhentos ou paletas confusas, a interface adota uma disciplina editorial contemporânea. Tons neutros sofisticados (Slate/Zinc) estabelecem o piso de leitura, enquanto o Esmeralda vibrante e o Rosa/Rubi pontuam receitas e despesas com clareza semafórica imediata.

A interface responde ao toque com peso físico e agilidade deliberada: transições rápidas (150-200ms), elevação sutil em repouso e realce ao foco.

**Key Characteristics:**
- Tipografia com alinhamento tabular para todos os valores monetários (`tabular-nums`).
- Superfícies puras sobre fundo neutro quente (`#f8fafc`).
- Hierarquia de contraste rigorosa: títulos fortes, metadados nítidos, texto secundário nunca cinza desbotado.
- Navegação ergonômica e responsiva (Sidebar expansiva no desktop, barra de navegação fluida no mobile).

## Colors

A paleta equilibra autoridade neutra (Obsidian `#09090b`), vitalidade de fluxo positivo (`#10b981`) e disciplina de gastos (`#f43f5e`).

### Primary
- **Obsidian Dark** (`#09090b`): Utilizado para ações primárias, botões de alta relevância, logo e elementos de ancoragem visual.

### Secondary
- **Emerald Green** (`#10b981`): Utilizado para receitas, saldos positivos e indicadores de crescimento financeiro.
- **Rose Ruby** (`#f43f5e`): Utilizado para despesas, débitos e alertas críticos.

### Neutral
- **Slate Canvas** (`#f8fafc`): Fundo geral da aplicação.
- **Pure White** (`#ffffff`): Fundo de cards, modais e containers de dados.
- **Hairline Border** (`#e2e8f0`): Delimitação sutil de superfícies e divisores.
- **Text Slate 900** (`#0f172a`): Cor primária de leitura e títulos.
- **Text Slate 500** (`#64748b`): Rótulos secundários e metadados.

### Named Rules
**The Strict Semantic Hue Rule.** Verde e vermelho/rosa são reservados com exclusividade para fluxo de caixa (receita vs despesa) e status de sucesso/erro. Jamais utilize verde ou vermelho em botões neutros ou decorações de interface.

## Typography

**Display Font:** Manrope (com fallback `Inter, system-ui, -apple-system, sans-serif`)
**Body Font:** Manrope
**Numerals:** Manrope com `tabular-nums` ativo

### Hierarchy
- **Display** (700, 1.75rem / 28px, line-height 1.2, letter-spacing -0.03em): Saldo principal e grandes métricas em destaque.
- **Headline** (600, 1.25rem / 20px, line-height 1.3, letter-spacing -0.02em): Títulos de páginas e cabeçalhos de seções principais.
- **Title** (600, 0.875rem / 14px, line-height 1.4, letter-spacing -0.01em): Títulos de cards, nomes de colunas e modais.
- **Body** (400, 0.875rem / 14px, line-height 1.5): Textos de descrição, campos de formulário e extratos.
- **Label** (500, 0.75rem / 12px, line-height 1.4, letter-spacing 0.01em): Rótulos de KPI, badges e datas.

### Named Rules
**The Tabular Money Rule.** Qualquer representação de moeda, centavos, porcentagens ou datas em tabelas e cards DEVE usar `tabular-nums` para garantir que dígitos tenham largura idêntica e nunca causem vibração visual ao atualizar.

## Layout

- **Grid Base:** Sistema de 12 colunas flexíveis, espaçamentos modulares de 4px (4, 8, 12, 16, 24, 32px).
- **Content Container:** Largura máxima de 1152px (`max-w-6xl`) centralizada com respiros laterais de 16px no mobile e 24px no desktop.
- **Responsive Paradigm:** Sidebar fixa de 240px no desktop (`md:flex`), substituída no mobile por Top Header minimalista e Bottom Bar ergonômica com altura confortável de 64px (`h-16 pb-safe`).

## Elevation & Depth

O Porquinho privilegia superfícies nítidas com sombras ultra-difusas e bordas delicadas de 1px. Não há sombras pesadas com deslocamento bruto nem efeito de vidro decorativo sem função.

### Shadow Vocabulary
- **Resting Surface:** `box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)` com borda hairline `#e2e8f0`.
- **Hover Lift:** `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)`.
- **Modal Elevation:** `box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.06)` com backdrop blur escurecido suavemente.

## Shapes

- **Cards & Modais:** `rounded-xl` (12px) conferindo toque amigável mas estruturado.
- **Controles & Inputs:** `rounded-lg` (8px) para botões, campos de texto e selects.
- **Badges & Tags:** `rounded-full` (pills compactas).

## Components

### Buttons
- **Shape:** `rounded-lg` (8px).
- **Primary:** Fundo `#09090b`, texto branco, micro-interação ao clique (`active:scale-[0.98]`), foco com anel suave.
- **Secondary:** Fundo `#f1f5f9`, texto `#0f172a`, hover `#e2e8f0`.
- **Danger:** Fundo `#fee2e2`, texto `#b91c1c`, hover `#fecaca`.

### Cards
- **Padding:** 20px (`p-5`).
- **Surface:** Fundo branco `#ffffff`, borda hairline `border-slate-200/80`, sombra sutil.

### Inputs & Selects
- **Height:** 38px (`h-[38px]`).
- **Focus:** Borda ativa `#09090b` com anel de foco `ring-2 ring-zinc-950/10`.

## Do's and Don'ts

### Do:
- **Do** formatar todos os valores monetários via `formatCurrency` com `tabular-nums`.
- **Do** manter contraste mínimo de 4.5:1 em todos os textos secundários e metadados.
- **Do** fornecer feedback imediato (loading spinner ou skeleton) em qualquer requisição.
- **Do** manter áreas de toque generosas (mínimo 44px de altura efetiva) em controles interativos mobile.

### Don't:
- **Don't** aplicar gradientes em textos de métricas ou títulos.
- **Don't** utilizar sombras duras ou bordas coloridas espessas em cards.
- **Don't** quebrar a semântica de cores: verde sempre positivo/receita, rosa/vermelho sempre despesa.
