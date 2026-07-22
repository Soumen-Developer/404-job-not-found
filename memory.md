# CY-Jobs Project Memory

This file serves as the single source of truth for tracking project development, configurations, architectural decisions, and visual enhancements.

---

## 🚀 Project Vision
**CY-Jobs** is an AI-powered Career Intelligence Platform (Career Operating System) that helps candidates discover matching opportunities, analyze skill gaps, and track applications, while helping employers rank candidates using intelligence layers.

---

## 🛠️ Architectural & Backend State

### 1. Monorepo Setup
- **Workspaces:** `frontend` (Next.js 16.2.10, Turbopack), `backend` (Fastify 5.10.0, TypeScript, Prisma).
- **Package Manager:** `pnpm` (Workspace configured via `pnpm-workspace.yaml`).

### 2. Backend Environment & Configurations
- **Database:** PostgreSQL running in Docker Compose (`localhost:5432`).
- **Redis:** Redis running in Docker Compose. Port mapped to **`6380`** on the host.
- **Environment variables (`backend/.env`):**
  - `DATABASE_URL` set to Postgres container.
  - `REDIS_PORT=6380` configured to establish Redis worker connection.
- **TypeScript:** Added `"prisma/**/*.ts"` to `tsconfig.json`'s `"include"` field to enable type resolution for Prisma seed scripts in IDEs.

### 3. Database Seeding (`backend/prisma/seed.ts`)
- Configured database clearing steps in correct dependency order (`JobMatch`, `SavedJob`, `Application`, `Resume`, `JobSkill`, `UserSkill`, `User`, `Job`, `Skill`) before inserting data. Seeding is fully **idempotent** and safe to run repeatedly.

### 4. Code Quality & Linting
- **ESLint v9 Flat Config:** Configured flat configs in both frontend (`eslint.config.mjs`) and backend (`eslint.config.mjs` using `typescript-eslint`).
- **Status:** All workspace linting and production building runs successfully (`pnpm run lint` and `pnpm run build` pass cleanly).

### 5. CI/CD Workflows
- **GitHub Actions (`.github/workflows/ci.yml`):** Set up CI workflow running on Node.js 20 with `pnpm` caching. Automatically triggers on push and pull requests to verify code quality (runs linting and building commands).

---

## 🎨 UI & Design Implementation

### 1. Landing Page Design (`frontend/src/app/page.tsx`)
- Inspired by the premium Dribbble shot and mockups: [Job Finding App Web - Dribbble](https://dribbble.com/shots/27165898-Job-Finding-App-Web-Where-Talent-Meets-Opportunity).
- **Tactile Character:** Added a subtle grid pattern background using a radial CSS gradient and a warm yellow highlight underline under key titles to give the UI a distinct, high-fidelity tactile character.
- **Authentic Brand Logos:** Created customized CSS-styled representations of brand logos (Slack, Amazon, Kellogg's, Bemis, Deribit) in the trusted partners bar instead of generic text.
- **Colors:** Strictly uses **System Design Colors** defined in `tailwind.config.js`:
  - Primary Blue: `#1976D2` (Primary actions, key elements)
  - Secondary Green: `#2ECC71`
  - Dark Slate Gray: `#364153` (Text and header elements)
  - Footer Blue: `#003263`
- **Icons:** Standardized entirely on `lucide-react` icons (No raw emoji characters are used).
- **Localized Currencies:** India-based jobs are configured to show salary ranges in Indian Rupees (`₹`) while international jobs correctly show in their native currencies (e.g. `$` or `£`).
- **Responsiveness:** Fully responsive landing page including mobile menu toggling, wrapping, layout alignment, and responsive grid layouts.

### 2. Assets Generated
- **Hero illustration:** `/hero_illustration.png` (minimalist modern vector illustration of a professional woman working at a desk).
- **Onboarding/Testimonial graphic:** `/onboarding_library.png` (a professional candidate reading a book in front of bookshelves).
- **Client Testimonial face:** `/testimonial_headshot.png` (John Cina headshot, CEO of Slack, matching the red hoodie design).

---

## 📝 Recent Updates
- **Prisma Schema Updates**: Extended `Job` and `User` models to include recommendation attributes (`githubUsername`, `salaryMin`, `salaryMax`, `employmentType`, `remote`, `experienceLevel`).
- **Git Hygiene**: Configured `.gitignore` to explicitly prevent `docker/postgres/data` and `docker/redis/data` volumes from being committed to the repository.
- **Recommendation Engine**: Implemented logic in `recommendation.service.ts` to score job matches based on skills, experience, location, and salary expectations.

## 📈 Next Milestones
- [ ] Connect Frontend dashboard with Backend API.
- [ ] Implement user authentication flows (register/login).
- [ ] Develop Resume Upload & Parsing components.
- [ ] Implement AI Match explanation and detail popups.
