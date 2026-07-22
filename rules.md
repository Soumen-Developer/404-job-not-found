# CY-Jobs Developer Guidelines & Rules

This document outlines the coding standards, code styles, linting, database rules, and git commit guidelines to ensure code quality and consistency across the workspaces.

---

## 💻 Code Style & Typescript Rules

### 1. General JavaScript/TypeScript Conventions
- **Explicit Types:** Avoid using the `any` type. Always declare explicit types or interfaces for parameters, return values, and state.
- **Null & Undefined:** Use `undefined` for uninitialized fields/parameters, and `null` when a value is explicitly absent (especially matching database Prisma fields).
- **Import Ordering:** Group imports logically:
  1. React/Next.js core libraries.
  2. Third-party packages (e.g. `lucide-react`, `@prisma/client`).
  3. Shared workspace utilities and configurations.
  4. Local components, constants, or types.

### 2. Linting & Formatting
- All workspaces must adhere to the local ESLint v9 Flat Config rules.
- Run `pnpm run lint` before committing any code. No ESLint errors are allowed.
- Run `pnpm run format` (which uses Prettier) to format files before pushing changes.

---

## 🗄️ Database Standards (Prisma & Postgres)

### 1. Migrations
- Never modify existing migrations inside `prisma/migrations` directly.
- Always use the Prisma CLI to generate new migrations:
  `pnpm --filter @cy-jobs/backend exec prisma migrate dev --name <migration_name>`
- Verify database state on local Postgres via Docker before running migrations.

### 2. Idempotent Seeding
- The database seed script (`prisma/seed.ts`) must remain **idempotent**.
- Always clean/reset all tables at the beginning of the `main()` function in the correct reverse dependency order to avoid foreign key violations.
- When creating static lookup datasets (like Skills), use `prisma.model.upsert` matching on unique fields.

### 3. Schema Updates & Type Safety
- When modifying `schema.prisma`, always run `npx prisma generate` (or via pnpm) to regenerate the TypeScript types.
- If your IDE reports missing properties on Prisma models after generation, restart the IDE's TypeScript language server.

### 4. Git & Docker Volumes
- **NEVER** commit Docker database volumes (`docker/postgres/data/` or `docker/redis/data/`) to git. Always ensure they are covered by `.gitignore`.

---

## 🚀 CI/CD & Verification Rules

- **Pre-commit checks:** Before submitting a Pull Request, run the complete quality pipeline locally:
  `pnpm run lint && pnpm run build`
- **Continuous Integration:** The GitHub Actions workflow (`ci.yml`) will fail if:
  - There are any ESLint errors.
  - The project fails to build/compile.
  - There are type resolution errors.

---

## 📝 Git Commit Guidelines

Commit messages must follow the **Conventional Commits** specification:

```
<type>(<scope>): <description>

[optional body]
```

### Types:
- `feat`: A new user-facing feature (e.g., `feat(auth): add login page UI`).
- `fix`: A bug fix (e.g., `fix(backend): resolve fastify plugin mismatch`).
- `docs`: Documentation changes (e.g., `docs(readme): update setup steps`).
- `style`: Changes that do not affect code logic (formatting, missing semi-colons, etc.).
- `refactor`: A code change that neither fixes a bug nor adds a feature.
- `chore`: Maintenance tasks, dependencies updates, config adjustments.
