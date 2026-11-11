# 🐷 Porquinho

> Sistema moderno e refinado de controle financeiro pessoal com foco em agilidade, clareza instantânea de métricas e zero atrito no registro de receitas e despesas.

![Versão](https://img.shields.io/badge/vers%C3%A3o-1.0.0-emerald)
![Node](https://img.shields.io/badge/node-%3E%3D20-blue)
![React](https://img.shields.io/badge/react-19-cyan)
![TypeScript](https://img.shields.io/badge/typescript-5-blue)
![PostgreSQL](https://img.shields.io/badge/database-postgresql-indigo)
![TailwindCSS](https://img.shields.io/badge/ui-tailwind-sky)

---

## ✨ Funcionalidades Principais

- **📊 Dashboard Executivo:**
  - Visão mensal com total de Receitas, Despesas, Saldo Líquido e Taxa de Poupança (Savings Rate).
  - Distribuição percentual de despesas por categoria.
  - Lista de transações recentes com status (pago vs. pendente) e indicador de saldo acumulado.

- **💸 Gestão Completa de Transações:**
  - Lançamento ágil de receitas e despesas com modal de atalho rápido.
  - Filtros avançados por tipo (Todas, Receitas, Despesas) e busca por descrição ou categoria.
  - Status de pagamento com alternância rápida (Pago/Pendente).
  - Edição e exclusão de transações com confirmação segura.

- **🏷️ Gestão Flexível de Categorias:**
  - Categorização com paleta de cores para identificação visual imediata.
  - Suporte a categorias para Despesas, Receitas ou Ambos.
  - Total liberdade de gerenciamento: crie, edite e exclua qualquer categoria (inclusive as criadas inicialmente), com proteção de integridade relacional caso haja transações vinculadas.

- **📈 Relatórios e Analytics:**
  - Gráficos interativos com métricas de fluxo de caixa mensal e comparativos.
  - Análise profunda do destino dos recursos financeiros.

- **📱 Design System & Experiência Mobile-First:**
  - Identidade visual quente e editorial baseada na paleta *Warm Ivory & Obsidian/Charcoal*.
  - Dock de navegação inferior em grid de 5 colunas com botão central de ação rápida elevado para registro em 1 toque no celular.
  - Layout totalmente responsivo para smartphone, tablet e desktop.

- **🔒 Autenticação & Segurança:**
  - Autenticação stateless via JWT com expiração segura e hash de senhas via `bcryptjs`.
  - Rotas protegidas no frontend e middleware de autenticação no backend.

---

## 🚀 Tecnologias

Este projeto foi estruturado como um monorepo moderno contendo:

- **Frontend (`apps/web`):**
  - [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
  - [Vite](https://vitejs.dev/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [Lucide Icons](https://lucide.dev/)
  - [Recharts](https://recharts.org/) (gráficos de despesas por categoria e evolução)
  - [TanStack Query v5](https://tanstack.com/query) (gerenciamento de estado de servidor e cache)
  - [Zustand](https://zustand-demo.pmnd.rs/) (estado global de autenticação e modais)
  - [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) (validações estritas)
  - [Oxlint](https://oxc-project.github.io/) (linter de alta performance)

- **Backend (`apps/api`):**
  - [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
  - [Prisma ORM](https://www.prisma.io/) com [PostgreSQL](https://www.postgresql.org/)
  - Autenticação JWT e hash de senhas com `bcryptjs`
  - Validação estrita de DTOs com `Zod`
  - `helmet` e `cors` configurados para proteção de cabeçalhos HTTP

- **Pacotes Compartilhados (`packages/types`):**
  - Tipos e interfaces compartilhadas de DTOs e entidades entre frontend e backend.

- **Infraestrutura:**
  - [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) para banco de dados PostgreSQL local.

---

## 📁 Estrutura do Monorepo

```
Porquinho/
├── apps/
│   ├── api/             # API REST em Node.js + Express + Prisma
│   └── web/             # Aplicação SPA em React 19 + Vite + Tailwind CSS
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
| `npm run build` | Compila os tipos, frontend e backend para produção |
| `npm run db:studio --workspace=apps/api` | Abre o Prisma Studio no navegador para gerenciar o banco |

---

## 📚 Documentação Complementar

- [DESIGN.md](file:///c:/Users/thale/Desktop/Porquinho/DESIGN.md): Guia de tokens de cores (Warm Ivory, Carvão e ardósia), tipografia e regras de layout dock.
- [PRODUCT.md](file:///c:/Users/thale/Desktop/Porquinho/PRODUCT.md): Visão de produto, proposta de valor, fluxos críticos e critérios de sucesso.

---

## 📄 Licença

Este projeto é privado e de uso pessoal.