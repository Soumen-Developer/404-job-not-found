# AI Career Platform — Project Brief (Single Build)

One release, fully detailed. Part 1 is every feature broken down to the sub-feature level.
Part 2 explains exactly how each piece works — the pipelines, the schema, the folder structure,
the API contracts, and the build order.

---

# PART 1 — Features (Full Detail)

## 1. Authentication & Users

- **Register:** email, password, name. Password hashed with bcrypt before storage — never stored
  in plain text.
- **Login:** email + password → JWT access token (short-lived, e.g. 24h). No refresh token in
  this build — user re-logs in after expiry. Keeps auth simple; refresh token rotation is a
  real feature but adds complexity this project doesn't need yet.
- **Auth guard:** every protected route checks the JWT via a NestJS guard; unauthenticated
  requests get 401.
- **User profile fields:** name, email, preferred location, preferred employment type (full-time
  / contract / internship), expected salary range. These feed the search defaults, they're not
  a separate module.
- **Edit profile:** update name and preferences.
- **No password reset flow, no OAuth/social login, no email verification** in this build —
  these are real gaps for a production launch but not required to validate the core product.

## 2. Resume

- **Upload:** single PDF file, max 5MB, one active resume per user (re-uploading replaces the
  previous one — no version history in this build).
- **Text extraction:** `pdf-parse` pulls raw text from the PDF.
- **Skill extraction:** raw text is matched against a static skills dictionary (a maintained list
  of ~500 common tech skills — React, Node.js, Python, AWS, etc.) using case-insensitive
  substring/word-boundary matching. This is not NLP or an LLM call — it's fast, free, and
  "good enough" to seed matching. (LLM-based extraction is a real upgrade path but adds cost and
  latency this build doesn't need for every upload.)
- **Editable skills:** after upload, the user sees the extracted skill list and can manually
  add/remove skills the extractor missed or got wrong. This single UI screen matters — resume
  parsers are never 100% accurate, and letting the user correct it costs almost nothing to build
  but meaningfully improves match quality.
- **No resume builder, no ATS scoring, no multiple resume versions** — out of scope for this
  build; OpenResume already does the builder piece well if that's ever wanted as a separate tool.

## 3. Job Aggregation

- **Sources (all real, licensed):**
  - **Adzuna** — REST API, needs `app_id` + `app_key`, has good India/global coverage.
  - **Jooble** — REST API, needs `api_key`, free tier.
  - **Remotive** — public JSON API, no key required, remote-only listings.
  - **Greenhouse / Lever public job boards** — many companies expose an unauthenticated
    `boards-api.greenhouse.io/v1/boards/{company}/jobs` or Lever equivalent; start with a
    fixed list of ~20 companies (the same pattern career-ops uses) rather than trying to
    discover every company's board dynamically.
- **Sync schedule:** a cron job runs every 6 hours, calling each provider in sequence (not
  parallel, to stay within free-tier rate limits), collecting results, and passing them through
  normalization → dedup → save.
- **Normalization:** every provider returns different field names and shapes. Each provider's
  adapter is responsible for mapping its raw response into the shared `NormalizedJob` shape
  before anything else touches it — search, matching, and the frontend never see provider-specific
  formats.
- **Deduplication:** primary key is `[sourceId, externalId]` — if the same source returns the
  same job ID twice (re-fetched on the next sync), it's an upsert, not a duplicate insert. This
  build does **not** attempt cross-source dedup (e.g., detecting that the same job was posted on
  both Adzuna and a company's Greenhouse board) — that requires fuzzy title/company matching and
  is a real but non-trivial feature saved for a later iteration.
- **Failure handling:** if one provider's API call fails (timeout, rate limit, bad response), log
  the failure and continue with the others — one broken source should never block the whole sync.
- **Source status:** each `JobSource` has an `isActive` flag so a broken/deprecated provider can
  be disabled without a code change.

## 4. Job Search

- **Keyword search:** full-text search across title, company, and description using Postgres's
  built-in `tsvector`/`tsquery` — no separate search engine.
- **Filters:** location (text match), remote/hybrid/on-site (boolean/enum), employment type,
  salary range (min/max), posted-date recency.
- **Sorting:** relevance (default, Postgres `ts_rank`), most recent, salary (high to low).
- **Pagination:** page + limit query params, total count returned for the frontend to render
  page controls.
- **Empty state:** if a search returns zero results, the response still includes a valid
  `pagination` object with `total: 0` — the frontend handles the empty-state UI, the backend
  never returns an error for "no matches."
- **No autocomplete, no typo correction, no semantic/AI search** in this build — these are real
  UX improvements but depend on either a search engine (autocomplete) or an LLM (semantic search)
  neither of which is justified before there's a working keyword search to improve on.

## 5. Job Details

- Full description, company, location, salary range, employment type, posted date, source name
  (so the user knows where it came from), and the external apply URL.
- Apply button links out to the original posting — **this build does not submit applications**,
  it surfaces them. One-click apply is explicitly out of scope (it requires per-ATS integration
  work that's a project of its own).
- Match score + explanation shown inline if the user has an uploaded resume (see Feature 6).

## 6. AI Match Scoring

- **Trigger:** computed the first time a logged-in user (with an uploaded resume) opens a job
  detail page, or requests it directly via the match endpoint. Not pre-computed for every job in
  the database against every user — that's wasted computation for jobs nobody looks at.
- **Inputs:** the user's extracted resume skills (Feature 2) + the job's title, description, and
  extracted skills.
- **Method:** a single LLM call with a structured prompt (see Part 2 for the exact prompt shape)
  that returns a 0–100 score, a list of matched skills, and a list of missing skills. This
  replaces the pgvector/embeddings approach from the earlier draft — no vector database needed,
  and the explanation ("why this matches") comes for free from the same call instead of a
  separate cosine-similarity step plus a separate explanation step.
- **Caching:** the result is stored in `JobMatch`, keyed by `[userId, jobId]`. It's only
  recomputed if the user uploads a new resume (the old cached matches become stale and get
  cleared on re-upload) — this keeps LLM API costs bounded instead of recomputing on every page
  view.
- **Display:** score shown as a number with a short "why" — matched skills with a checkmark,
  missing skills flagged, not just a bare percentage.

## 7. Saved Jobs

- Save / unsave a job from the search results or detail page.
- Dedicated "Saved Jobs" page listing everything saved, most recently saved first.
- No folders/tags/notes on saved jobs — flat list only.

## 8. Job Alerts

- **Creating an alert:** user saves a search (the query string + active filters) with one click
  from the search results page.
- **Digest logic:** a daily cron job re-runs each saved search, compares results against the
  `createdAt`/`postedAt` timestamp of the last check, and if there are new jobs matching, sends
  a single digest email listing them (title, company, link) — not one email per new job.
- **Managing alerts:** view and delete saved searches from an "Alerts" page.
- **No SMS/WhatsApp/push notifications, no instant (real-time) alerts, no alert frequency
  customization** — daily digest by email only.

---

# PART 2 — How It's Built

## Tech stack

Next.js (frontend) → NestJS (backend) → PostgreSQL (single database, full-text search built in).
One LLM provider (any chat-completion API) handles resume-to-job matching directly — no
embeddings, no vector database. No Redis, no OpenSearch, no BullMQ, no Kubernetes.

## Pipeline 1 — Job Sync (runs on a schedule, no user involved)

```
Cron trigger (every 6 hours)
        ↓
For each active JobSource:
        ↓
    Call provider.fetchJobs(defaultQueries)   ← e.g. ["software engineer", "developer", "frontend"]
        ↓
    Map raw response → NormalizedJob[]         ← provider-specific adapter logic
        ↓
    On failure: log + skip to next provider    ← one bad source never blocks the sync
        ↓
Merge all NormalizedJob[] from every provider
        ↓
Upsert into `Job` table on [sourceId, externalId]
        ↓
Postgres search_vector column auto-updates (it's a generated column)
        ↓
Done — no separate indexing step required
```

## Pipeline 2 — Job Search (runs per user request)

```
GET /api/v1/jobs/search?q=...&filters...
        ↓
Build a Postgres query:
    WHERE search_vector @@ websearch_to_tsquery('english', q)
    AND (filters applied as additional WHERE clauses)
    ORDER BY ts_rank(search_vector, query) DESC   ← or postedAt/salary if sort param given
    LIMIT / OFFSET for pagination
        ↓
Return jobs[] + pagination{}
```

No provider calls happen during search — search only ever reads from the local `Job` table,
which is why the sync pipeline runs independently on a schedule instead of live per search.

## Pipeline 3 — AI Match Scoring (runs when a user opens a job or requests a match)

```
GET /api/v1/jobs/:id/match  (auth required)
        ↓
Check JobMatch table for existing [userId, jobId] row
        ↓
   Found? → return cached { score, matched, missing }
        ↓
   Not found? → continue:
        ↓
Fetch user's latest Resume.skills + Job.title/description/skills
        ↓
Build LLM prompt:
    "Given this candidate's skills: [skills list]
     And this job description: [title + description]
     Return JSON: { score: 0-100, matched: string[], missing: string[] }"
        ↓
Call LLM, parse JSON response
        ↓
Save to JobMatch (upsert on [userId, jobId])
        ↓
Return { score, matched, missing }
```

**Cache invalidation:** on resume re-upload, delete all `JobMatch` rows for that `userId` so
stale scores don't linger against the old resume.

## Pipeline 4 — Job Alerts (runs on a schedule)

```
Cron trigger (daily)
        ↓
For each SavedSearch:
        ↓
    Re-run the same search query + filters against `Job`
        ↓
    Filter to jobs where postedAt > SavedSearch.lastCheckedAt (or createdAt on first run)
        ↓
    New matches found? → queue one digest email (title, company, applyUrl per job)
        ↓
    Update SavedSearch.lastCheckedAt
        ↓
Send digest emails (batched, not one email per job)
```

## Database schema (Prisma)

Save as `backend/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String        @id @default(uuid())
  email             String        @unique
  passwordHash      String
  name              String?
  preferredLocation String?
  preferredType     String?       // "full_time" | "contract" | "internship"
  expectedSalaryMin Int?
  expectedSalaryMax Int?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  resumes           Resume[]
  savedJobs         SavedJob[]
  savedSearches     SavedSearch[]
  jobMatches        JobMatch[]
}

model Resume {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  fileUrl    String
  parsedText String?  @db.Text
  skills     Json?    // string[] — auto-extracted, user-editable after upload
  uploadedAt DateTime @default(now())
}

model JobSource {
  id       String  @id @default(uuid())
  name     String  @unique // "adzuna" | "jooble" | "remotive" | "greenhouse"
  isActive Boolean @default(true)
  jobs     Job[]
}

model Job {
  id             String     @id @default(uuid())
  sourceId       String
  source         JobSource  @relation(fields: [sourceId], references: [id])
  externalId     String     // ID from the source API — used for dedup
  title          String
  company        String
  location       String?
  remote         Boolean    @default(false)
  employmentType String?    // "full_time" | "part_time" | "contract" | "internship"
  salaryMin      Int?
  salaryMax      Int?
  currency       String?
  description    String     @db.Text
  applyUrl       String
  skills         Json?      // string[]
  postedAt       DateTime?
  createdAt      DateTime   @default(now())
  savedBy        SavedJob[]
  matches        JobMatch[]

  @@unique([sourceId, externalId]) // prevents duplicate ingestion
  @@index([title, company])
}

model SavedJob {
  id      String   @id @default(uuid())
  userId  String
  user    User     @relation(fields: [userId], references: [id])
  jobId   String
  job     Job      @relation(fields: [jobId], references: [id])
  savedAt DateTime @default(now())

  @@unique([userId, jobId])
}

model JobMatch {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  jobId      String
  job        Job      @relation(fields: [jobId], references: [id])
  score      Int      // 0-100
  matched    Json     // string[] of matched skills
  missing    Json     // string[] of missing skills
  computedAt DateTime @default(now())

  @@unique([userId, jobId]) // cache — recomputed only when resume changes
}

model SavedSearch {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  query           String
  filters         Json?
  lastCheckedAt   DateTime  @default(now())
  createdAt       DateTime  @default(now())
}
```

Full-text search index — built into Postgres:

```sql
-- Run as a migration after prisma db push
ALTER TABLE "Job" ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title,'') || ' ' || coalesce(company,'') || ' ' || coalesce(description,''))
  ) STORED;
CREATE INDEX job_search_idx ON "Job" USING GIN (search_vector);
```

## Backend folder structure (NestJS)

```
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts       # register, login, bcrypt hashing
│   │   │   ├── auth.module.ts
│   │   │   └── jwt.strategy.ts
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.module.ts
│   │   ├── resume/
│   │   │   ├── resume.controller.ts
│   │   │   ├── resume.service.ts     # pdf-parse extraction + skill dictionary matching
│   │   │   ├── skills-dictionary.ts  # static list of ~500 skills for keyword matching
│   │   │   └── resume.module.ts
│   │   ├── jobs/
│   │   │   ├── jobs.controller.ts
│   │   │   ├── jobs.service.ts       # search (ts_rank query), get by id, save/unsave
│   │   │   └── jobs.module.ts
│   │   ├── providers/
│   │   │   ├── provider.interface.ts # interface JobProvider { fetchJobs(query): Promise<NormalizedJob[]> }
│   │   │   ├── adzuna.provider.ts
│   │   │   ├── jooble.provider.ts
│   │   │   ├── remotive.provider.ts
│   │   │   ├── greenhouse.provider.ts
│   │   │   └── aggregator.service.ts # calls all providers, normalizes, dedupes, upserts
│   │   ├── match/
│   │   │   ├── match.controller.ts
│   │   │   ├── match.service.ts      # LLM call + cache read/write against JobMatch
│   │   │   └── prompts.ts            # the exact prompt template, kept out of the service logic
│   │   └── alerts/
│   │       ├── alerts.controller.ts
│   │       ├── alerts.service.ts
│   │       └── alerts.cron.ts        # daily digest job
│   ├── common/
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   └── dto/
│   └── prisma/
│       └── prisma.service.ts
├── scripts/
│   └── sync-jobs.ts   # invoked by cron: node dist/scripts/sync-jobs.js
├── .env
└── package.json
```

## Frontend folder structure (Next.js)

```
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # landing / search
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── jobs/
│   │   ├── page.tsx              # search results
│   │   └── [id]/page.tsx         # job detail + match score
│   ├── saved/page.tsx
│   ├── alerts/page.tsx
│   ├── resume/page.tsx           # upload + editable extracted skills
│   └── profile/page.tsx
├── components/
│   ├── SearchBar.tsx
│   ├── FilterPanel.tsx
│   ├── JobCard.tsx
│   ├── MatchExplanation.tsx      # score + matched/missing skill chips
│   ├── SkillEditor.tsx           # add/remove extracted resume skills
│   └── Navbar.tsx
├── lib/
│   └── api.ts                    # fetch wrapper for backend calls
└── package.json
```

## API endpoints — full contracts

### `POST /api/v1/auth/register`
```json
// Request
{ "email": "string", "password": "string", "name": "string" }
// Response 201
{ "id": "uuid", "email": "string", "token": "jwt" }
// Errors: 409 if email already registered
```

### `POST /api/v1/auth/login`
```json
// Request
{ "email": "string", "password": "string" }
// Response 200
{ "token": "jwt" }
// Errors: 401 on bad credentials
```

### `GET /api/v1/users/me` (auth required)
```json
// Response 200
{
  "id": "uuid", "email": "string", "name": "string",
  "preferredLocation": "string", "preferredType": "string",
  "expectedSalaryMin": 800000, "expectedSalaryMax": 1500000
}
```

### `PATCH /api/v1/users/me` (auth required)
```json
// Request — any subset of updatable fields
{ "name": "string", "preferredLocation": "string", "expectedSalaryMin": 900000 }
// Response 200 — updated user object
```

### `POST /api/v1/resume/upload` (auth required, multipart/form-data)
```
// Request: file field "resume" (PDF, max 5MB)
// Response 201
{ "id": "uuid", "fileUrl": "string", "skills": ["React", "Node.js", "PostgreSQL"] }
// Side effect: deletes any cached JobMatch rows for this user
```

### `PATCH /api/v1/resume/skills` (auth required)
```json
// Request — user-corrected skill list, replaces the auto-extracted one
{ "skills": ["React", "Node.js", "PostgreSQL", "Docker"] }
// Response 200 { "skills": [...] }
```

### `GET /api/v1/jobs/search`
```
// Query params: q, location, remote (bool), employmentType, salaryMin, salaryMax, sort, page, limit
// sort: "relevance" (default) | "recent" | "salary"
// Response 200
{
  "jobs": [
    {
      "id": "uuid", "title": "string", "company": "string", "location": "string",
      "remote": true, "employmentType": "full_time",
      "salaryMin": 800000, "salaryMax": 1500000, "currency": "INR",
      "postedAt": "iso-date", "applyUrl": "string"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 134 }
}
```

### `GET /api/v1/jobs/:id`
```json
// Response 200 — full Job record including description, source name
// Errors: 404 if not found
```

### `POST /api/v1/jobs/:id/save` (auth required)
```json
// Response 201 { "saved": true }
```

### `DELETE /api/v1/jobs/:id/save` (auth required)
```json
// Response 200 { "saved": false }
```

### `GET /api/v1/jobs/saved` (auth required)
```json
// Response 200 — array of saved Job records, most recently saved first
```

### `GET /api/v1/jobs/:id/match` (auth required)
```json
// Response 200 — cached if it exists, computed via LLM on first request
{
  "score": 82,
  "matched": ["React", "TypeScript", "Node.js"],
  "missing": ["Docker", "AWS"]
}
// Errors: 400 if the user has no uploaded resume yet
```

### `POST /api/v1/alerts` (auth required)
```json
// Request
{ "query": "string", "filters": { "remote": true, "salaryMin": 1200000 } }
// Response 201
{ "id": "uuid" }
```

### `GET /api/v1/alerts` (auth required)
```json
// Response 200 — array of the user's saved searches
```

### `DELETE /api/v1/alerts/:id` (auth required)
```json
// Response 200 { "deleted": true }
```

## Build order

**Week 1:** Auth module end-to-end (register/login/JWT, bcrypt) → Prisma schema + migrations →
Users module + profile fields → Postgres full-text search index set up and tested with seed data.

**Week 2:** Provider interface + Adzuna + Jooble + Remotive providers, each returning
`NormalizedJob[]` → aggregator service (merge + dedup) → sync script running against a real DB on
a cron → jobs search endpoint with filters and sorting.

**Week 3:** Resume upload + `pdf-parse` extraction + skills-dictionary matching + skill edit
endpoint → saved jobs endpoints → match endpoint (LLM prompt, JSON parsing, `JobMatch` caching,
cache invalidation on resume re-upload).

**Week 4:** Alerts (save search endpoint, daily cron, digest email) → frontend: search page,
job detail page with match display, saved jobs page, resume upload + skill editor page, alerts
page, profile page.

**Week 5:** Bug fixes, empty-state handling (no resume uploaded, zero search results, sync
failures, LLM call failures), loading states, basic error boundaries across the app.

## Definition of Done

- A user can register, log in, set profile preferences, upload a resume and correct its
  extracted skills, search jobs by keyword and filters with working pagination and sorting, view
  a job detail page showing an AI match score with matched/missing skills, save and unsave jobs,
  and create a saved search that emails a digest when new matching jobs appear.
- Jobs in the database come from at least 3 real providers (Adzuna, Jooble, Remotive minimum),
  synced on a 6-hour schedule, with zero duplicate entries per source.
- Match scores are cached and only recomputed after a resume re-upload — not recalculated on
  every page view.
- No Redis, no OpenSearch, no pgvector, no BullMQ, no Kubernetes anywhere in the stack.
