# 🐷 Porquinho

> Sistema moderno e refinado de controle financeiro pessoal com foco em agilidade, clareza instantânea de métricas, máxima segurança de dados e zero atrito no registro de receitas e despesas.

![Versão](https://img.shields.io/badge/vers%C3%A3o-1.0.0-emerald)
![Node](https://img.shields.io/badge/node-%3E%3D20-blue)
![React](https://img.shields.io/badge/react-19-cyan)
![TypeScript](https://img.shields.io/badge/typescript-5-blue)
![PostgreSQL](https://img.shields.io/badge/database-postgresql-indigo)
![Segurança](https://img.shields.io/badge/seguran%C3%A7a-AES--256--GCM-emerald)
![PWA](https://img.shields.io/badge/pwa-instal%C3%A1vel-rose)
![TailwindCSS](https://img.shields.io/badge/ui-tailwind-sky)

---

## ✨ Funcionalidades Principais

- **📊 Dashboard Executivo:**
  - Métricas principais em tempo real: Total em Caixa / Saldo Total, Receitas Recebidas, Despesas Realizadas e Investimentos acumulados.
  - Seletor de período dinâmico (Hoje, 7 Dias, Mês e Ano) com navegação inteligente pelos meses que possuem registros históricos.
  - Gráfico de distribuição percentual de despesas por categoria e evolução anual de receitas vs. despesas.
  - Tabela analítica e lista de transações recentes com formatação monetária e temporal precisa.

- **💸 Gestão Completa de Transações:**
  - Lançamento ágil de receitas e despesas com modal de atalho rápido.
  - Filtros combinados por tipo (Todas, Receitas, Despesas), categoria, mês dinâmico e busca textual por descrição.
  - Paginação completa de lançamentos com contagem de registros.
  - Otimização para smartphone: campos de valor abrem teclado numérico nativo (`inputMode="decimal"`).
  - Edição ágil e exclusão de transações com modal de confirmação segura.

- **🏷️ Gestão Flexível de Categorias:**
  - Categorização com paleta de cores para identificação visual imediata.
  - Suporte a categorias para Despesas, Receitas ou Ambos.
  - Total liberdade de gerenciamento: crie, edite e exclua qualquer categoria (inclusive as iniciais), com proteção de integridade relacional caso haja transações vinculadas.

- **📈 Relatórios e Analytics:**
  - Gráficos interativos com alternância de visualização (Barras vs. Área preenchida).
  - Análise profunda por categoria, evolução mensal e divisão semanal.
  - Filtro por categoria específica e navegação por meses dinâmicos.

- **📱 Design System & PWA Mobile-First:**
  - Identidade visual quente e editorial baseada na paleta *Warm Ivory & Obsidian/Charcoal*.
  - **PWA (Progressive Web App):** configurado com Web App Manifest (`manifest.json`), ícones de alta resolução e splash screens para instalação como aplicativo nativo na tela inicial de smartphones (iOS e Android).
  - Dock de navegação inferior ergonômica em grid de 5 colunas com botão central de ação rápida elevado para registro em 1 toque.
  - Totalmente responsivo para smartphone, tablet e desktop.

- **🔒 Segurança Máxima & Privacidade:**
  - **Field-Level Encryption (FLE):** As descrições das transações são criptografadas em repouso com algoritmo autenticado **AES-256-GCM** antes de serem salvas no banco de dados, protegendo a confidencialidade do usuário mesmo em caso de vazamento de dados.
  - Autenticação stateless via JWT com expiração segura e hash de senhas via `bcryptjs`.
  - Rotas protegidas no frontend e middleware de autenticação no backend.
  - Cabeçalhos de segurança HTTP configurados via `helmet` e `cors`.

---

## 🚀 Tecnologias

Este projeto foi estruturado como um monorepo moderno contendo:

- **Frontend (`apps/web`):**
  - [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
  - [Vite](https://vitejs.dev/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [Lucide Icons](https://lucide.dev/)
  - [Recharts](https://recharts.org/) (gráficos de despesas por categoria e evolução temporal)
  - [TanStack Query v5](https://tanstack.com/query) (gerenciamento de estado assíncrono e cache)
  - [Zustand](https://zustand-demo.pmnd.rs/) (estado global de autenticação e modais)
  - [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) (validações estritas de formulários)
  - [Oxlint](https://oxc-project.github.io/) (linter de altíssima performance)
  - PWA Manifest & App Icons para experiência de app instalado

- **Backend (`apps/api`):**
  - [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
  - [Prisma ORM](https://www.prisma.io/) com [PostgreSQL](https://www.postgresql.org/)
  - Criptografia em repouso AES-256-GCM via módulo nativo `crypto` do Node.js
  - Autenticação JWT e hash de senhas com `bcryptjs`
  - Validação estrita de variáveis de ambiente e DTOs com `Zod`
  - Proteção de segurança com `helmet` e `cors`

- **Pacotes Compartilhados (`packages/types`):**
  - Tipos e interfaces TypeScript compartilhadas entre frontend e backend.

- **Infraestrutura:**
  - [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) para banco de dados PostgreSQL local.
  - Compatibilidade de deploy em nuvem com [Vercel](https://vercel.com/) (Frontend) e [Render](https://render.com/) / Railway / Supabase (Backend & DB).

---

## 📁 Estrutura do Monorepo

```
Porquinho/
├── apps/
│   ├── api/             # API REST em Node.js + Express + Prisma + AES-256-GCM
│   └── web/             # Aplicação SPA/PWA em React 19 + Vite + Tailwind CSS
├── packages/
│   └── types/           # Interfaces e tipos TypeScript compartilhados
├── docker-compose.yml   # Contêiner PostgreSQL para desenvolvimento local
├── package.json         # Configuração de workspaces do monorepo
├── PRODUCT.md           # Visão e especificações de produto
└── DESIGN.md            # Guia de tokens e design system (Warm Ivory)
```

---

## 🛠️ Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (v20 ou superior recomendada)
- [Docker](https://www.docker.com/) e Docker Compose
- [npm](https://www.npmjs.com/)

### 1. Clonar o repositório
```bash
git clone https://github.com/thalesxvt/Porquinho.git
cd Porquinho
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
Copie os arquivos de exemplo para os seus respectivos `.env`:

```bash
# Na raiz
cp .env.example .env

# Na API
cp apps/api/.env.example apps/api/.env

# No Web
cp apps/web/.env.example apps/web/.env
```

> [!IMPORTANT]
> **Chave de Criptografia AES-256 (`ENCRYPTION_KEY`)**
> 
> A API utiliza criptografia em nível de campo (**AES-256-GCM**) e exige obrigatoriamente uma chave de 64 caracteres hexadecimais (32 bytes) no arquivo `apps/api/.env`.
> 
> Gere uma chave válida executando no terminal:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```
> Em seguida, cole o valor gerado na variável `ENCRYPTION_KEY` do arquivo `apps/api/.env`.

### 4. Subir o banco de dados (PostgreSQL)
```bash
docker compose up -d
```

### 5. Executar migrações do banco e seeds
```bash
# Aplica o schema do Prisma no banco de dados
npm run db:push --workspace=apps/api

# Popula o banco com categorias padrão
npm run db:seed --workspace=apps/api
```

*(Opcional)* Caso esteja atualizando uma base de dados legada com descrições em texto puro, execute o script de migração para criptografá-las:
```bash
npm run db:encrypt --workspace=apps/api
```

### 6. Iniciar a aplicação em desenvolvimento
```bash
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **API Backend:** [http://localhost:3001](http://localhost:3001)

---

## 📜 Scripts Disponíveis

Na raiz do projeto:

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Executa a API e o Web simultaneamente via Concurrently |
| `npm run dev:web` | Inicia apenas o frontend em modo de desenvolvimento |
| `npm run dev:api` | Inicia apenas a API backend em modo de desenvolvimento |
| `npm run build` | Compila os tipos compartilhados, frontend e backend para produção |
| `npm run lint` | Executa a verificação estática de código com Oxlint em todos os workspaces |
| `npm run db:studio --workspace=apps/api` | Abre o Prisma Studio no navegador para gerenciar o banco |
| `npm run db:push --workspace=apps/api` | Sincroniza o schema do Prisma diretamente com o banco |
| `npm run db:seed --workspace=apps/api` | Executa o seed de categorias padrão no banco |
| `npm run db:encrypt --workspace=apps/api` | Criptografa descrições de transações legadas existentes com AES-256-GCM |

---

## ☁️ Deploy em Produção

O projeto está pronto para deploy em ambientes modernos de computação em nuvem:

- **Frontend (Web):** Otimizado para hospedagem na [Vercel](https://vercel.com/) com configuração de rewrites SPA em `apps/web/vercel.json`.
- **Backend (API):** Pronto para execução em [Render](https://render.com/), Railway, Fly.io ou contêineres Docker independentes.
- **Banco de Dados:** Compatível com qualquer PostgreSQL gerenciado (Supabase, Neon, AWS RDS, Render Postgres).

---

## 📚 Documentação Complementar

- [DESIGN.md](file:///c:/Users/thale/Desktop/Porquinho/DESIGN.md): Guia de tokens de cores (*Warm Ivory*, Carvão e ardósia), tipografia e regras de layout dock.
- [PRODUCT.md](file:///c:/Users/thale/Desktop/Porquinho/PRODUCT.md): Visão de produto, proposta de valor, fluxos críticos e critérios de sucesso.

---

## 📄 Licença

Este projeto é privado e de uso pessoal.
