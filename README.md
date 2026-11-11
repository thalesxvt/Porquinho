# 🐷 Porquinho

> Sistema moderno e refinado de controle financeiro pessoal com foco em agilidade, clareza instantânea de métricas e zero atrito no registro de receitas e despesas.

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

- **Backend (`apps/api`):**
  - [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
  - [Prisma ORM](https://www.prisma.io/) com [PostgreSQL](https://www.postgresql.org/)
  - Autenticação JWT e hash de senhas com `bcryptjs`
  - Validação de DTOs com `Zod`

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
│   └── web/             # Aplicação SPA em React 19 + Vite + Tailwind
├── packages/
│   └── types/           # Interfaces e tipos TypeScript compartilhados
├── docker-compose.yml   # Contêiner PostgreSQL para desenvolvimento local
├── package.json         # Workspaces do monorepo
├── PRODUCT.md           # Visão e especificações de produto
└── DESIGN.md            # Guia de tokens e design system
```

---

## 🛠️ Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 20 ou superior recomendada)
- [Docker](https://www.docker.com/) e Docker Compose
- [npm](https://www.npmjs.com/)

### 1. Clonar o repositório
```bash
git clone https://github.com/<seu-usuario>/porquinho.git
cd porquinho
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
# Executa migrações do Prisma e popula categorias padrão
npm run db:push --workspace=apps/api
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

- `npm run dev` - Executa a API e o Web simultaneamente via Concurrently
- `npm run dev:web` - Inicia apenas o frontend
- `npm run dev:api` - Inicia apenas a API
- `npm run build` - Compila os tipos, frontend e backend para produção

---

## 📄 Licença

Este projeto é privado e de uso pessoal.
