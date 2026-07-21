# CY-Jobs - AI-Powered Career Operating System

CY-Jobs is an intelligent, AI-powered career intelligence platform designed to serve as the central hub for a candidate's professional journey—bridging the gap between academic education (complementing CareerYatraa) and career growth.

---

## 🏗️ Project Architecture

CY-Jobs is structured as a **pnpm monorepo** containing separate workspaces for the frontend client, the backend API server, and shared package configurations.

```
CY-Jobs/
├── .github/workflows/   # CI/CD pipelines (GitHub Actions)
├── backend/             # Fastify API, Prisma ORM, BullMQ background workers
├── frontend/            # Next.js App Router, Tailwind CSS v4, Lucide React
├── docker/              # Docker Compose configs for PostgreSQL, Redis, MinIO
├── packages/            # Shared configuration packages
│   ├── tsconfig/        # Shared base tsconfig files
│   └── eslint-config/   # Shared legacy lint config
├── memory.md            # Active project state & tracking log
├── design.md            # Brand guidelines, UI mockups, and typography
└── rules.md             # Developer guidelines, code styles, and lint rules
```

---

## 🛠️ Tech Stack

- **Monorepo Manager:** `pnpm` Workspaces
- **Frontend:** Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, Lucide React
- **Backend:** Fastify v5, TypeScript, tsoa (Router/Swagger generation), BullMQ (Queue system)
- **Database & Storage:** PostgreSQL, Prisma ORM, Redis (worker queues), MinIO (S3-compatible file uploads)
- **CI/CD:** GitHub Actions (Linting, Building verification)

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js:** v20 or higher
- **pnpm:** v9.0.0 or higher
- **Docker & Docker Compose**

### 2. Infrastructure Setup
Spin up the local PostgreSQL database, Redis, and MinIO storage containers using Docker Compose:
```bash
# From the project root
docker compose -f docker/compose/docker-compose.yml up -d
```

### 3. Dependency Installation
Install workspace dependencies and link packages using `pnpm`:
```bash
pnpm install
```

### 4. Database Setup & Seeding
Configure migrations and seed candidate, skill, and job records:
```bash
# Apply database migrations
pnpm --filter @cy-jobs/backend exec prisma migrate dev

# Regenerate Prisma Client types
pnpm --filter @cy-jobs/backend exec prisma generate

# Seed database with initial data
pnpm --filter @cy-jobs/backend exec prisma db seed
```
> **Note:** Do not commit Docker database volumes (`docker/postgres/data` or `docker/redis/data`) to version control. Ensure the `.gitignore` rules are respected.

### 5. Running the Application
Start both the Frontend and Backend development servers concurrently:
```bash
pnpm run dev
```
- **Frontend URL:** [http://localhost:3000](http://localhost:3000)
- **Backend API URL:** [http://localhost:3001](http://localhost:3001)
- **Swagger Docs:** [http://localhost:3001/docs](http://localhost:3001/docs)

---

## 🧹 Quality Checks

- **Linting:** Run linter across all workspaces:
  ```bash
  pnpm run lint
  ```
- **Formatting:** Run Prettier formatting:
  ```bash
  pnpm run format
  ```
- **Building:** Test building projects for production compile:
  ```bash
  pnpm run build
  ```
