---
name: Porquinho
description: Gestão financeira pessoal contemporânea com estética editorial quente (Warm Ivory & Obsidian), clareza instantânea de métricas, ergonomia mobile nativa e zero atrito no registro de transações.
colors:
  primary: "#111111"
  neutral-bg: "#F1ECDA"
  neutral-surface: "#FAF8F2"
  neutral-border: "#DDD7C0"
  neutral-subtle: "#E5EAEF"
  neutral-hover: "#E8E1CA"
  text-primary: "#111111"
  text-muted: "#5C6D7C"
  text-subtle: "#758695"
  income: "#10b981"
  income-dark: "#059669"
  income-subtle: "#ecfdf5"
  expense: "#f43f5e"
  expense-dark: "#e11d48"
  expense-subtle: "#fff1f2"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, Manrope, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Plus Jakarta Sans, Manrope, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Plus Jakarta Sans, Manrope, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Plus Jakarta Sans, Manrope, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Plus Jakarta Sans, Manrope, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.01em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
rounded:
  sm: "6px"
  md: "10px"
  lg: "12px"
  xl: "16px"
  2xl: "20px"
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
    textColor: "#F1ECDA"
    rounded: "{rounded.xl}"
    padding: "10px 18px"
  button-secondary:
    backgroundColor: "{colors.neutral-surface}"
    borderColor: "{colors.neutral-border}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "10px 18px"
  card:
    backgroundColor: "{colors.neutral-surface}"
    borderColor: "{colors.neutral-border}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.2xl}"
    padding: "20px sm:24px"
---

# Design System: Porquinho

## Overview

**Creative North Star: "The Warm Ivory & Obsidian Ledger"**

O Porquinho foi desenhado a partir da premissa de que o controle financeiro pessoal não precisa se parecer com planilhas frias de auditoria corporativa nem com apps bancários convencionais. A interface adota uma disciplina editorial contemporânea ancorada em tons quentes e táteis: o fundo creme pergaminho (`#F1ECDA`), cartões em marfim suave (`#FAF8F2`) e bordas delicadas em tom areia mineral (`#DDD7C0`).

Contrastando com a suavidade das superfícies, o preto obsidian (`#111111`) atua como âncora estrutural para tipografia de alto impacto, botões de ação e navegação. As cores semafóricas de fluxo financeiro (Esmeralda para receitas e Rosa/Rubi para despesas) operam com máxima precisão e moderação, sem nunca poluir a serenidade do layout.

**Pilares Fundamentais:**
- **Terminologia Padronizada:** Ação e entidade unificadas sob o termo **"Transações"** em toda a aplicação.
- **Tipografia Esculpida:** `Plus Jakarta Sans` para hierarquia de títulos e texto corrido, combinada a `JetBrains Mono` com números tabulares (`tabular-nums`) para integridade contábil.
- **Ergonomia Mobile Nativa:** Dock inferior estrito em grid de 5 colunas rígidas com botão "Novo" perfeitamente centralizado (50%) e slots equidistantes.
- **Feedback Sem Atrito:** Alertas inline com ícones de contexto (`AlertCircle`) e notificações toast pontuais sem recarregamento de página.

---

## Colors & Semantic Tokens

### Primary & Dark Accents
- **Preto Obsidian (`#111111`):** Âncora do design. Utilizado em botões primários, botões flutuantes, logo principal, títulos dominantes e estados ativos.
- **Preto Hover (`#222222`):** Feedback de hover e foco em botões e controles escuros.

### Canvas & Surfaces (Warm Ivory)
- **Creme Canvas (`#F1ECDA`):** Fundo mestre da aplicação inteira, transmitindo serenidade visual e eliminando o cansaço ocular do branco estéril.
- **Marfim Surface (`#FAF8F2`):** Fundo de cards, modais, cabeçalhos móveis e docas flutuantes.
- **Creme 100 (`#F6F2E5`):** Cabeçalhos de tabelas, áreas selecionadas e hover de linhas.
- **Areia Mineral Border (`#DDD7C0`):** Contorno de 1px em todos os cards, divisórias, inputs e tabelas.
- **Creme Hover (`#EFE9D5` / `#E8E1CA`):** Interação e hover de botões secundários e linhas clicáveis.

### Editorial Slates (Cinza Textual)
- **Cinza Muted (`#5C6D7C`):** Subtítulos, metadados, descrições secundárias e legendas explicativas.
- **Cinza Subtle (`#758695`):** Ícones em estado inativo, atalhos de teclado, placeholders e badges neutros.
- **Cinza Chip (`#E5EAEF`):** Fundo de avatares, chips e marcadores de estado neutro.

### Cash Flow Semantics
- **Income Emerald (`#10b981` / Dark `#059669` / Subtle `#ecfdf5`):** Indicador exclusivo de receitas, taxas de economia positivas e saldos favoráveis.
- **Expense Rose (`#f43f5e` / Dark `#e11d48` / Deep `#8A2B2B` / Subtle `#fff1f2`):** Indicador exclusivo de despesas, débitos, alertas e ações destrutivas confirmadas.

> [!IMPORTANT]
> **The Strict Semantic Hue Rule:** Verde e Rosa/Vermelho são canais exclusivos de fluxo de caixa (receita vs despesa) ou status de feedback (sucesso vs erro). Nunca os utilize em botões genéricos de navegação ou cartões neutros.

---

## Typography

- **Interface & Textos:** `Plus Jakarta Sans`, com fallback para `Manrope, system-ui, -apple-system, sans-serif`.
- **Valores & Dados Numéricos:** `JetBrains Mono` ou `Plus Jakarta Sans` com a classe obrigatória `tabular-nums`.

### Escala Tipográfica

| Nível | Peso | Tamanho | Line-height | Letter-spacing | Aplicação |
|---|---|---|---|---|---|
| **Display** | 800 (ExtraBold) | `1.75rem` (28px) | 1.2 | `-0.03em` | Saldo global, grandes totais e hero |
| **Headline** | 700 (Bold) | `1.25rem` (20px) | 1.3 | `-0.02em` | Títulos de página (`PageHeader`) |
| **Title** | 700 (Bold) | `0.875rem` (14px) | 1.4 | `-0.01em` | Títulos de cards, colunas e modais |
| **Body** | 500 (Medium) | `0.875rem` (14px) | 1.5 | `normal` | Textos corridos, inputs e tabelas |
| **Label** | 600 (SemiBold) | `0.75rem` (12px) | 1.4 | `0.01em` | Badges, datas, KPIs e filtros |
| **Mono** | 500 / 600 | `0.875rem` (14px) | 1.4 | `-0.02em` | Moedas, percentuais e códigos (`tabular-nums`) |

---

## Layout & Responsive Architecture

### Desktop (`md:` e superior)
- **Sidebar Fixa (240px):** Fixada à esquerda com o logotipo estilizado `PorquinhoLogo`, botão proeminente de `Nova transação` com atalho de teclado `[N]`, menu com rotas ativas realçadas e cartão inferior de perfil de usuário.
- **Área de Conteúdo Centralizada:** Container fluido com limite de largura `max-w-6xl` (1152px) e padding generoso.

### Mobile (`< 768px`)
- **Top Bar (h-16):** Fixo no topo com logo e atalhos rápidos touch-friendly.
- **Bottom Navigation Dock (Grid de 5 Colunas):** 
  - Estrutura estrita com `grid grid-cols-5 items-center` para divisão exata de 20% da largura por slot.
  - **Botão "Novo":** Localizado na 3ª coluna, cravado matematicamente a 50% de centro horizontal, com elevação flutuante (`-mt-6`), anel protetor (`ring-4 ring-[#FAF8F2]`) e micro-interação tátil.
  - **Slots laterais:** *Dashboard* e *Transações* à esquerda; *Relatórios* e *Categorias* à direita, garantindo distâncias e alinhamentos simétricos.

---

## Component Specifications

### 1. Botões (`Button.tsx`)
- **Primary:** `bg-[#111111] text-[#F1ECDA] hover:bg-[#222222] rounded-xl font-bold shadow-sm active:scale-[0.98]`.
- **Secondary:** `bg-[#FAF8F2] border border-[#DDD7C0] text-[#111111] hover:bg-[#E8E1CA] rounded-xl font-bold`.
- **Danger:** `bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-xl font-bold`.

### 2. Cards (`Card.tsx`)
- **Base:** `rounded-2xl border border-[#DDD7C0] bg-[#FAF8F2] shadow-surface p-5 sm:p-6`.
- **Header:** Borda divisória inferior sutil `border-b border-[#DDD7C0]/60 pb-4`.

### 3. Entradas de Dados (`Input.tsx` & `Select.tsx`)
- **Formato:** `rounded-xl border border-[#DDD7C0] bg-[#FAF8F2] text-sm text-[#111111] placeholder:text-[#758695]`.
- **Foco:** `focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10 outline-none transition-all`.

### 4. Banners de Alerta & Feedback
- **Alerta de Erro:** Caixa informativa não intrusiva com `rounded-xl border border-rose-300 bg-rose-50/90 p-3 text-xs text-rose-900` acompanhada pelo ícone `AlertCircle (size={16})`.
- **Toasts:** Notificações flutuantes posicionadas no canto inferior direito com auto-dismiss em 3.5 segundos.

### 5. Modais (`Modal.tsx`)
- **Container:** `rounded-2xl border border-[#DDD7C0] bg-[#FAF8F2] shadow-modal`.
- **Backdrop:** `bg-[#111111]/60 backdrop-blur-sm animate-fade-in`.

---

## Do's and Don'ts

### Do:
- **Do** utilizar exclusivamente o termo **"Transação / Transações"** em botões, tabelas, modais e mensagens de erro.
- **Do** envolver todo valor monetário (`R$ 1.250,00`) com formatação BRL e classe `tabular-nums`.
- **Do** manter a paleta quente (`#F1ECDA`, `#FAF8F2`, `#DDD7C0`) consistente sem reinserir fundos frios/azuis.
- **Do** garantir que qualquer novo item adicionado na barra mobile respeite o grid de alinhamento simétrico.

### Don't:
- **Don't** utilizar o termo descontinuado "Movimentações" em qualquer parte da interface ou do código.
- **Don't** forçar recarregamento de página (`window.location.href`) ao receber erros de validação ou credenciais inválidas.
- **Don't** utilizar sombras duras ou pretas puras sem difusão em cards ou modais.
- **Don't** comprimir ou alterar a proporção do botão central flutuante na navegação mobile.
