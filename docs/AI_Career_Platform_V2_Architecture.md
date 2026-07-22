# AI Career Platform - Version 2.0 Architecture

This master specification document outlines the comprehensive architecture for the AI Career Intelligence Platform. It expands upon the MVP (Phase 1) foundation and fully integrates the Intelligence Layer (Phase 2) and Career Operating System (Phase 3). 

## 1. Phased Roadmap

### Phase 1: Foundation (MVP)
- **Core Modules**: Auth, User Profile, Resume Upload, Job Aggregation (Adzuna, Jooble, etc.).
- **Search**: PostgreSQL Full-Text Search.
- **Interactivity**: Save Jobs, Basic Alerts, simple LLM Match Scoring.

### Phase 2: Intelligence Layer (The Differentiator)
- **Search Context Engine**: Profiles, resumes, GitHub, and portfolios merge to form a unified context.
- **AI Engines**: Recommendation Engine, Semantic Search (pgvector + OpenSearch), AI Job Enrichment (extracting skills, salaries, benefits from raw job descriptions).
- **Intelligence**: Company Intelligence, Salary Intelligence, Developer Profiles (GitHub/Portfolio analysis).
- **Infrastructure**: BullMQ for background tasks, Redis for caching and queues, OpenSearch for scalable full-text indexing.

### Phase 3: Career Operating System
- **Career Management**: AI Career Coach, Skill Gap Analysis, Learning Recommendations, Career Timeline.
- **Application Automation**: One-Click Apply (ATS integrations), Interview Simulator.
- **Employer Tools**: Recruiter Dashboard, AI Candidate Ranking, Search Analytics.
- **Global**: Multi-language support, localized formatting.

---

## 2. Expanded Database Schema (Prisma)

To support the V2 architecture, the database expands from ~8 models to 40+ models to handle embeddings, search analytics, complex relationships, and AI enrichment.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  extensions = [pgvector(map: "vector")]
}

// ==========================================
// 1. AUTH & USERS
// ==========================================

model User {
  id                String    @id @default(uuid())
  email             String    @unique
  passwordHash      String?
  role              Role      @default(CANDIDATE) // CANDIDATE, EMPLOYER, RECRUITER, ADMIN
  
  firstName         String?
  lastName          String?
  headline          String?
  preferredLocation String?
  remotePreference  String?
  expectedSalaryMin Int?
  expectedSalaryMax Int?
  currency          String    @default("USD")
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  resumes           Resume[]
  portfolio         Portfolio?
  githubProfile     GitHubProfile?
  userSkills        UserSkill[]
  educations        Education[]
  experiences       Experience[]
  certifications    Certification[]
  languages         Language[]
  
  applications      Application[]
  savedJobs         SavedJob[]
  jobAlerts         JobAlert[]
  savedSearches     SavedSearch[]
  searchHistory     SearchHistory[]
  
  careerGoals       CareerGoal[]
  aiConversations   AIConversation[]
  
  companyId         String?
  company           Company?  @relation("CompanyEmployees", fields: [companyId], references: [id])
  
  userEmbedding     UserEmbedding?
  activityLogs      ActivityLog[]
  devices           Device[]
  oauthConnections  OAuthConnection[]
}

enum Role {
  CANDIDATE
  EMPLOYER
  RECRUITER
  ADMIN
}

model OAuthConnection {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  provider        String    // 'google', 'linkedin', 'github'
  providerId      String
  accessToken     String?
  refreshToken    String?
  @@unique([provider, providerId])
}

model Device {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  fcmToken        String?
  deviceType      String
  lastActiveAt    DateTime  @default(now())
}

// ==========================================
// 2. CANDIDATE PROFILE & INTELLIGENCE
// ==========================================

model Resume {
  id              String          @id @default(uuid())
  userId          String
  user            User            @relation(fields: [userId], references: [id])
  isPrimary       Boolean         @default(false)
  title           String?
  versions        ResumeVersion[]
  createdAt       DateTime        @default(now())
}

model ResumeVersion {
  id              String    @id @default(uuid())
  resumeId        String
  resume          Resume    @relation(fields: [resumeId], references: [id])
  fileUrl         String
  parsedText      String    @db.Text
  
  atsScore        Float?
  resumeScore     Float?
  missingSkills   Json?     // Array of strings
  
  embedding       Unsupported("vector(1536)")?
  createdAt       DateTime  @default(now())
}

model UserEmbedding {
  id              String    @id @default(uuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id])
  // Composite embedding representing resume + github + portfolio + preferences
  embedding       Unsupported("vector(1536)")? 
  updatedAt       DateTime  @updatedAt
}

model Portfolio {
  id              String    @id @default(uuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id])
  websiteUrl      String?
  behanceUrl      String?
  dribbbleUrl     String?
  overallScore    Float?
  seoScore        Float?
  perfScore       Float?
  projects        PortfolioProject[]
}

model PortfolioProject {
  id              String    @id @default(uuid())
  portfolioId     String
  portfolio       Portfolio @relation(fields: [portfolioId], references: [id])
  title           String
  description     String?   @db.Text
  url             String?
  technologies    Json?
}

model GitHubProfile {
  id              String    @id @default(uuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id])
  username        String
  url             String
  developerScore  Float?
  openSourceScore Float?
  repositories    GitHubRepository[]
}

model GitHubRepository {
  id              String        @id @default(uuid())
  profileId       String
  profile         GitHubProfile @relation(fields: [profileId], references: [id])
  name            String
  url             String
  primaryLanguage String?
  description     String?
  stars           Int           @default(0)
  frameworks      Json?
}

// ==========================================
// 3. SKILLS & KNOWLEDGE GRAPH
// ==========================================

model Skill {
  id              String      @id @default(uuid())
  name            String      @unique
  category        String?
  userSkills      UserSkill[]
  jobSkills       JobSkill[]
  aliases         SkillAlias[]
  // For Skill Knowledge Graph (e.g. React -> Next.js)
  relatedFrom     SkillGraphRelation[] @relation("FromSkill")
  relatedTo       SkillGraphRelation[] @relation("ToSkill")
}

model SkillAlias {
  id              String    @id @default(uuid())
  skillId         String
  skill           Skill     @relation(fields: [skillId], references: [id])
  aliasName       String    @unique
}

model SkillGraphRelation {
  id              String    @id @default(uuid())
  fromSkillId     String
  fromSkill       Skill     @relation("FromSkill", fields: [fromSkillId], references: [id])
  toSkillId       String
  toSkill         Skill     @relation("ToSkill", fields: [toSkillId], references: [id])
  relationship    String    // 'PREREQUISITE', 'RELATED', 'FRAMEWORK_OF'
  weight          Float     @default(1.0)
}

model UserSkill {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  skillId         String
  skill           Skill     @relation(fields: [skillId], references: [id])
  proficiency     String?
  yearsExperience Float?
  source          String?   // 'RESUME', 'GITHUB', 'MANUAL'
  @@unique([userId, skillId])
}

// ==========================================
// 4. EXPERIENCE, EDUCATION, CAREER
// ==========================================

model Education {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  institution     String
  degree          String?
  fieldOfStudy    String?
  startDate       DateTime?
  endDate         DateTime?
}

model Experience {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  companyName     String
  title           String
  description     String?   @db.Text
  startDate       DateTime
  endDate         DateTime?
  isCurrent       Boolean   @default(false)
}

model Certification {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  name            String
  issuer          String
  issueDate       DateTime?
  url             String?
}

model Language {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  name            String
  proficiency     String    // 'NATIVE', 'FLUENT', 'BASIC'
}

model CareerGoal {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  targetRole      String
  targetSalary    Int?
  timelineMonths  Int?
  status          String    // 'ACTIVE', 'ACHIEVED'
}

model SkillGap {
  id              String    @id @default(uuid())
  userId          String
  targetRoleId    String?   // Optional linkage to a specific job or general role
  missingSkills   Json
  createdAt       DateTime  @default(now())
}

model LearningRecommendation {
  id              String    @id @default(uuid())
  userId          String
  courseName      String
  courseUrl       String
  provider        String    // 'Coursera', 'Udemy'
  skillId         String?
}

// ==========================================
// 5. PROVIDERS & COMPANIES
// ==========================================

model Provider {
  id              String    @id @default(uuid())
  name            String    @unique // 'Adzuna', 'Jooble', 'Greenhouse'
  type            String    // 'AGGREGATOR', 'ATS'
  isActive        Boolean   @default(true)
  syncFrequency   String?   // cron format
  jobSources      JobSource[]
}

model JobSource {
  id              String    @id @default(uuid())
  providerId      String
  provider        Provider  @relation(fields: [providerId], references: [id])
  companyId       String?   // For ATS parsing mapped to a specific company
  url             String?
  isActive        Boolean   @default(true)
  jobs            Job[]
}

model Company {
  id              String    @id @default(uuid())
  name            String    @unique
  logoUrl         String?
  website         String?
  industry        String?
  size            String?
  description     String?   @db.Text
  funding         String?
  techStack       Json?
  
  rating          Float?
  
  jobs            Job[]
  employees       User[]    @relation("CompanyEmployees")
  reviews         CompanyReview[]
  followers       CompanyFollow[]
  salaryInsights  SalaryInsight[]
  
  embedding       Unsupported("vector(1536)")?
}

model CompanyReview {
  id              String    @id @default(uuid())
  companyId       String
  company         Company   @relation(fields: [companyId], references: [id])
  userId          String?
  rating          Float
  reviewText      String?   @db.Text
  pros            String?
  cons            String?
  createdAt       DateTime  @default(now())
}

model CompanyFollow {
  id              String    @id @default(uuid())
  userId          String
  companyId       String
  company         Company   @relation(fields: [companyId], references: [id])
  createdAt       DateTime  @default(now())
  @@unique([userId, companyId])
}

model SalaryInsight {
  id              String    @id @default(uuid())
  companyId       String?
  company         Company?  @relation(fields: [companyId], references: [id])
  role            String
  location        String
  averageSalary   Int
  minSalary       Int
  maxSalary       Int
  currency        String
  updatedAt       DateTime  @updatedAt
}

// ==========================================
// 6. JOBS & AI ENRICHMENT
// ==========================================

model Job {
  id              String    @id @default(uuid())
  title           String
  companyId       String?
  company         Company?  @relation(fields: [companyId], references: [id])
  companyName     String?   // Fallback
  
  sourceId        String
  source          JobSource @relation(fields: [sourceId], references: [id])
  externalId      String?
  
  description     String    @db.Text
  employmentType  String?
  workMode        String?
  
  salaryMin       Int?
  salaryMax       Int?
  currency        String    @default("USD")
  
  experienceMin   Int?
  experienceMax   Int?
  
  applyUrl        String?
  isEasyApply     Boolean   @default(false)
  visaSponsored   Boolean   @default(false)
  benefits        Json?
  
  status          JobStatus @default(OPEN)
  
  postedAt        DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  jobSkills       JobSkill[]
  locations       JobLocation[]
  applications    Application[]
  savedBy         SavedJob[]
  recommendations Recommendation[]
  
  embedding       Unsupported("vector(1536)")?
  
  @@unique([sourceId, externalId])
}

enum JobStatus {
  OPEN
  CLOSED
  DRAFT
  SPAM
}

model JobSkill {
  id              String    @id @default(uuid())
  jobId           String
  job             Job       @relation(fields: [jobId], references: [id])
  skillId         String
  skill           Skill     @relation(fields: [skillId], references: [id])
  isOptional      Boolean   @default(false)
  @@unique([jobId, skillId])
}

model JobLocation {
  id              String    @id @default(uuid())
  jobId           String
  job             Job       @relation(fields: [jobId], references: [id])
  country         String
  state           String?
  city            String?
}

model JobImportLog {
  id              String    @id @default(uuid())
  providerId      String
  status          String    // 'SUCCESS', 'FAILED'
  jobsImported    Int       @default(0)
  errorMessage    String?
  createdAt       DateTime  @default(now())
}

model FraudDetection {
  id              String    @id @default(uuid())
  jobId           String
  fraudScore      Float
  reason          String?
  resolved        Boolean   @default(false)
  createdAt       DateTime  @default(now())
}

// ==========================================
// 7. SEARCH CONTEXT & ANALYTICS
// ==========================================

model SearchHistory {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  query           String
  filters         Json?
  createdAt       DateTime  @default(now())
}

model SavedSearch {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  query           String
  filters         Json?
  createdAt       DateTime  @default(now())
  lastExecutedAt  DateTime?
}

model SearchAnalytics {
  id              String    @id @default(uuid())
  query           String
  count           Int       @default(1)
  date            DateTime  @default(now())
}

model TrendingSearch {
  id              String    @id @default(uuid())
  query           String
  score           Float
  updatedAt       DateTime  @updatedAt
}

model SearchSuggestion {
  id              String    @id @default(uuid())
  prefix          String    @unique
  suggestions     Json      // Array of strings
}

// ==========================================
// 8. RECOMMENDATIONS & MATCHING
// ==========================================

model Recommendation {
  id              String    @id @default(uuid())
  userId          String
  jobId           String
  job             Job       @relation(fields: [jobId], references: [id])
  overallScore    Float
  reasoning       String?   @db.Text
  isViewed        Boolean   @default(false)
  isDismissed     Boolean   @default(false)
  createdAt       DateTime  @default(now())
}

model RecommendationScore {
  id              String    @id @default(uuid())
  recommendationId String
  type            String    // 'RESUME_MATCH', 'GITHUB_MATCH', 'SALARY_MATCH'
  score           Float
}

model JobAlert {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  query           String
  filters         Json?
  frequency       String    // 'DAILY', 'WEEKLY', 'INSTANT'
  channels        String[]  // ['EMAIL', 'PUSH']
  createdAt       DateTime  @default(now())
}

model AIConversation {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  context         String    // 'CAREER_COACH', 'INTERVIEW_PREP'
  messages        Json      // Array of chat history
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// ==========================================
// 9. APPLICATIONS, TRACKING, NOTIFICATIONS
// ==========================================

model Application {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  jobId           String
  job             Job       @relation(fields: [jobId], references: [id])
  
  status          ApplicationStatus @default(APPLIED)
  matchScore      Float?
  
  appliedAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  timeline        ApplicationTimeline[]
  interviews      Interview[]
  offers          Offer[]
}

enum ApplicationStatus {
  APPLIED
  REVIEWING
  SCREENING
  INTERVIEWING
  OFFERED
  HIRED
  REJECTED
  WITHDRAWN
}

model ApplicationTimeline {
  id              String    @id @default(uuid())
  applicationId   String
  application     Application @relation(fields: [applicationId], references: [id])
  status          ApplicationStatus
  note            String?
  createdAt       DateTime  @default(now())
}

model SavedJob {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  jobId           String
  job             Job       @relation(fields: [jobId], references: [id])
  savedAt         DateTime  @default(now())
  @@unique([userId, jobId])
}

model Interview {
  id              String      @id @default(uuid())
  applicationId   String
  application     Application @relation(fields: [applicationId], references: [id])
  scheduledAt     DateTime
  type            String      // 'TECHNICAL', 'HR', 'BEHAVIORAL'
  feedback        String?     @db.Text
}

model Offer {
  id              String      @id @default(uuid())
  applicationId   String
  application     Application @relation(fields: [applicationId], references: [id])
  baseSalary      Int
  currency        String
  equity          String?
  status          String      // 'PENDING', 'ACCEPTED', 'DECLINED'
}

model Notification {
  id              String    @id @default(uuid())
  userId          String
  type            String    // 'ALERT', 'APPLICATION_UPDATE', 'RECOMMENDATION'
  title           String
  body            String
  isRead          Boolean   @default(false)
  createdAt       DateTime  @default(now())
}

model ActivityLog {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  action          String    // 'VIEWED_JOB', 'APPLIED', 'UPDATED_RESUME'
  metadata        Json?
  createdAt       DateTime  @default(now())
}

// ==========================================
// 10. ATS INTEGRATIONS & WEBHOOKS
// ==========================================

model ATSIntegration {
  id              String    @id @default(uuid())
  companyId       String
  provider        String    // 'GREENHOUSE', 'LEVER'
  apiKey          String?
  status          String    // 'ACTIVE', 'ERROR'
  createdAt       DateTime  @default(now())
}

model Webhook {
  id              String    @id @default(uuid())
  url             String
  event           String    // 'JOB_POSTED', 'APPLICATION_RECEIVED'
  secret          String?
  createdAt       DateTime  @default(now())
}
```

---

## 3. Search Orchestrator & Context Engine

Unlike a simple keyword search, the V2 architecture relies on a **Search Context Engine** that dynamically personalizes queries.

### Search Flow Pipeline
1. **Context Building**: When a user queries, the backend retrieves their `UserEmbedding` (combining Resume + GitHub + Preferences).
2. **Intent Search (NLP)**: "Remote Next.js jobs above ₹20L" is translated into structured filters by an LLM or NLP microservice.
3. **OpenSearch Aggregation**: The structured query hits OpenSearch, returning a broad set of keyword and faceted matches.
4. **AI Ranking (pgvector)**: The Top 1000 OpenSearch results are pushed into PostgreSQL `pgvector` to calculate cosine similarity against the `UserEmbedding`.
5. **Enrichment & Explainability**: The final Top 20 results are enriched with an "Explainable Search" prompt sent to an LLM: *"Why does this candidate match this job?"*

---

## 4. Provider Manager & AI Enrichment

The Aggregator is decoupled into a robust Provider Manager utilizing **BullMQ**.

- **Provider Interface**: Pluggable adapters for Adzuna, Jooble, Greenhouse, and custom corporate ATS platforms.
- **Queueing**: BullMQ schedules and rate-limits API scraping to avoid IP bans.
- **AI Job Enrichment**: Raw job descriptions pass through an LLM to extract:
  - Required Skills (mapped to `Skill` Knowledge Graph).
  - Benefits & Remote status.
  - Salary estimations (if missing).
  - Embeddings are generated and saved to `JobEmbedding`.

---

## 5. Intelligence Layer (GitHub, Portfolio, Salary)

- **GitHub Intelligence**: Background workers clone/scan repositories using heuristics (or LLMs) to extract language usage, framework adoption (e.g., detecting Next.js in `package.json`), and assign an `openSourceScore`.
- **Portfolio Intelligence**: Scrapes user-provided URLs, checking SEO, Lighthouse scores, and semantic tech stacks.
- **Company & Salary Intelligence**: Aggregates historic data across `Job` postings to provide dynamic `SalaryInsight` statistics.

---

## 6. Microservices & Infrastructure

### 6.1 Redis & BullMQ
Redis powers both caching and asynchronous job processing:
- **`sync-jobs-queue`**: Distributes load across providers.
- **`llm-enrichment-queue`**: Batches LLM requests for Resume parsing and Job enrichment.
- **`email-alert-queue`**: Processes `SavedSearch` and `JobAlert` tables for daily digests.
- **Cache**: Fast retrieval for `Company`, `TrendingSearch`, and `SalaryInsight`.

### 6.2 OpenSearch
An OpenSearch cluster indexes `Job` data.
- **Typo Correction & Synonyms**: Maps "ReactJS" to "React".
- **Geo-Search**: Handles complex radius queries.

### 6.3 Backend Architecture (NestJS + Python)
- **NestJS Gateway**: Manages Auth, REST APIs, and core CRUD.
- **Python AI Microservice (FastAPI)**: Dedicated to running `sentence-transformers` for creating `UserEmbedding` and `JobEmbedding`, handling RAG, and executing Semantic Search.

### 6.4 Deployment (Kubernetes / AWS ECS)
To manage the background workers, OpenSearch nodes, and caching:
- **Containers**: Dockerized NestJS, Python FastApi, Next.js.
- **Orchestration**: Kubernetes (EKS) or AWS ECS for autoscaling the BullMQ worker nodes during heavy aggregation syncs.
- **Database**: Amazon Aurora PostgreSQL (optimized for `pgvector`).

---

## 7. Frontend Architecture (Next.js)

The frontend evolves from simple job listings into a complete Career Dashboard.
- `/dashboard`: Career timeline, saved jobs, applied jobs, application status.
- `/profile`: Connected GitHub, Portfolio scores, Skill Graph, AI Resume Builder.
- `/coach`: AI Chatbot interface for interview prep and salary negotiation.
- `/companies/[id]`: Deep dive into company intelligence, benefits, and matched roles.

---

## 8. Complete Feature Specification (V2 & V3)

The following feature breakdown represents the full scope of the AI Career Intelligence Platform, differentiating it from traditional job boards.

### 1. User Management

**Registration & Authentication**
Features
- Email/Password Authentication
- Google Login
- GitHub Login
- LinkedIn Login
- OTP Login
- Password Reset
- Multi-Factor Authentication
- Session Management
- Device Management

**User Profile**
Store complete professional profile.

**Basic Information**
- Name
- Profile Picture
- Headline
- About
- Location
- Timezone
- Nationality
- Languages

**Professional**
- Current Company
- Current Role
- Experience
- Expected Salary
- Notice Period
- Employment Status

**Education**
- Degree
- University
- CGPA
- Passing Year

**Preferences**
- Remote
- Hybrid
- Onsite
- Preferred Companies
- Preferred Locations
- Preferred Industries
- Job Types
- Salary Range

### 2. Resume Intelligence

Instead of just storing PDFs.

**Resume Upload**
- PDF
- DOCX
- TXT

**Resume Parser**
Extract
- Name
- Email
- Phone
- Skills
- Experience
- Education
- Certifications
- Projects
- Achievements
- Languages
- Interests

**Resume AI**
Generate
- ATS Score
- Resume Strength
- Missing Keywords
- Missing Skills
- Resume Summary
- Resume Suggestions

**Resume Versioning**
Maintain
- Resume v1
- Resume v2
- Resume v3
Comparison

### 3. GitHub Intelligence

Optional.
If connected.

**Profile Analysis**
Extract
- Followers
- Organizations
- Bio
- Website
- Public Repositories

**Repository Analysis**
Detect
- Languages
- Frameworks
- Libraries
- Cloud
- DevOps
- Databases
- Testing

**AI Skill Extraction**
Instead of counting repos, Analyze:
- README
- package.json
- requirements.txt
- Dockerfile
- GitHub Actions
- Topics
- Commits

**GitHub Score**
Generate
- Developer Score
- Open Source Score
- Activity Score
- Project Quality
- Skill Confidence

Gracefully handle:
- Empty accounts
- Private repositories
- Fork-only profiles
- Inactive profiles

### 4. Portfolio Intelligence

Supported
- Personal Website
- GitHub Pages
- Behance
- Dribbble
- Figma
- CodePen
- Medium
- Dev.to

Analyze
- Technologies
- SEO
- Performance
- Accessibility
- Projects
- Live Demo
- Contact Information

### 5. Job Aggregation Engine

Multiple Providers
- Internal
- Employer Portal
- JobSpy
- Jooble
- Adzuna
- Remotive
- Greenhouse
- Lever
- Ashby
- Workday
- Google Jobs
- Future APIs

Every provider becomes a scalable plugin.

### 6. Job Normalization

Every provider returns different fields. Normalize:
- Job Title
- Company
- Salary
- Location
- Experience
- Skills
- Benefits
- Employment Type
- Description
- Apply URL
- Source
- Posted Date

### 7. AI Job Enrichment

Generate
- Skill Extraction
- Technology Extraction
- Benefits
- Responsibilities
- Qualifications
- Industry
- Department
- Role Category
- Employment Type
- AI Summary
- Keywords
- Embeddings

### 8. Search Engine

**Standard Search**
- Keyword
- Company
- Role
- Skills
- Technology
- Industry
- Recruiter
- Location

**AI Search**
- Natural Language
- Intent Search
- Semantic Search
- Query Expansion
- Typo Correction
- Related Searches
- Conversational Search

Examples
- "Remote React jobs above 20 LPA"
- "Backend jobs matching my resume"
- "Jobs better than my current company"

### 9. Search Context Engine

Every search builds
- Search Query
* User Profile
* Resume
* GitHub
* Portfolio
* Preferences
* Career Goals
* Search History
* Saved Jobs
* Applied Jobs
* Market Trends

This becomes **SearchContext**. Everything uses this.

### 10. Search Filters
- Location
- Remote
- Hybrid
- Salary
- Experience
- Employment Type
- Company
- Benefits
- Visa
- Relocation
- Industry
- Skills
- Technologies
- Education
- Posted Date
- Company Size
- Funding Stage

### 11. AI Recommendation Engine

Score every job.
- Resume Match
- Profile Match
- GitHub Match
- Portfolio Match
- Skill Match
- Experience Match
- Salary Match
- Location Match
- Career Goal Match
- Popularity
- Freshness
- Company Quality
- Market Demand

Final AI Score

### 12. Explainable AI

Instead of 92%, Show: Why this job matches
- Matching Skills
- Missing Skills
- Salary Comparison
- Growth Opportunity
- Interview Probability
- Estimated Success Rate

### 13. Skill Intelligence
- Skill Graph
- Skill Aliases
- Skill Relationships
- Market Demand
- Salary Trends
- Learning Resources
- Related Skills
- Popular Companies
- Popular Roles
- Future Demand

### 14. Company Intelligence
- Company Profile
- Industry
- Size
- Funding
- Revenue
- Culture
- Benefits
- Hiring Trends
- Open Jobs
- Salary Range
- Technology Stack
- Employee Reviews
- Interview Reviews

### 15. Salary Intelligence
- Average Salary
- Median Salary
- City-wise Salary
- Country-wise Salary
- PPP Adjustment
- Currency Conversion
- Cost of Living
- Negotiation Suggestions
- Salary Growth Prediction

### 16. Application Management
- One-click Apply (where supported)
- Resume Selection
- Cover Letter
- Application Tracking
- Interview Tracking
- Offer Tracking
- Rejected Applications
- Withdraw Applications

### 17. AI Cover Letter
Generate Personalized Cover Letter:
- Role Specific
- Company Specific
- Technology Specific

### 18. Saved Items
- Saved Jobs
- Saved Searches
- Saved Companies
- Saved Recruiters
- Saved Skills

### 19. Notifications
- Job Alerts
- Salary Alerts
- Application Updates
- Interview Updates
- Recruiter Messages
- Skill Recommendations
- Learning Recommendations

### 20. AI Career Coach
- Career Advice
- Learning Roadmap
- Interview Questions
- Resume Review
- Portfolio Review
- GitHub Review
- Salary Negotiation
- Career Switching
- Promotion Planning

### 21. Learning Recommendations

Based on: Missing Skills, Market Trends, Career Goal

Recommend:
- Courses
- Books
- Videos
- Certifications
- Projects
- Practice Platforms

### 22. Analytics Dashboard

**Candidate**
- Applications
- Success Rate
- Interview Rate
- Resume Views
- Recruiter Views
- Skill Growth
- Salary Growth

**Employer**
- Applications
- Hiring Funnel
- Candidate Quality
- Time to Hire
- Conversion Rate

### 23. Employer Portal
- Company Profile
- Post Jobs
- Manage Jobs
- AI Candidate Ranking
- Resume Search
- Interview Scheduling
- Offer Management
- Hiring Analytics
- Team Management

### 24. Admin Portal
- User Management
- Employer Management
- Job Moderation
- Provider Management
- Search Analytics
- Revenue Dashboard
- Feature Flags
- System Health
- Audit Logs

### 25. Search Analytics
- Popular Searches
- No Result Searches
- Trending Skills
- Trending Companies
- Search Performance
- Conversion Rate
- Click-through Rate
- Recommendation Accuracy

### 26. AI Search Feedback
Users can:
- Like Recommendations
- Dislike Recommendations
- Hide Jobs
- Mark Irrelevant
- Improve AI

### 27. Security
- JWT
- OAuth
- RBAC
- API Rate Limiting
- Audit Logs
- Encryption
- GDPR Compliance
- Resume Privacy Controls

### 28. Background Processing
- Resume Parsing
- GitHub Sync
- Portfolio Crawl
- Job Aggregation
- Job Deduplication
- Recommendation Refresh
- Notification Queue

### 29. Integrations
- GitHub
- LinkedIn
- Google
- JobSpy
- Jooble
- Adzuna
- OpenAI/LLM
- Email Providers
- SMS
- Push Notifications
- Calendar (Interview Scheduling)
- ATS Systems (Greenhouse, Lever), Email/SMS/Push providers, and Calendar for Interview Scheduling.

### 30. Future AI Features
- AI Mock Interviews
- AI Video Resume Review
- AI Recruiter Assistant
- AI Hiring Forecast
- AI Salary Negotiator
- AI Career Simulator
- AI Skill Forecast (future demand prediction)
- AI Mentor
- AI Team Fit Analysis
- AI Company Culture Matching

---

### ⭐ What Makes Your Platform Different

Most platforms stop at **"Here are jobs matching your search."**

Your platform goes further:
- Aggregates jobs from multiple providers into one unified search.
- Understands the user's **resume, GitHub, portfolio, profile, and preferences**.
- Uses AI to rank and explain why jobs match.
- Identifies skill gaps and recommends how to improve.
- Tracks the user's career progress over time.
- Helps with applications, interviews, salary negotiation, and long-term career planning.

In other words, you're not building a **job search website**—you're building an **AI-powered Career Intelligence Platform** that supports users from discovering opportunities to landing jobs and growing throughout their careers.
