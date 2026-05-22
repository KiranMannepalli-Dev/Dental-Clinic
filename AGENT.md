# AGENT.md — BrightSmile Dental Hospital
## Full-Stack Engineering Agent Directive
## End-to-End Build Specification, System Design & Deployment Guide

> **Mandate:** Build this as a senior SDE would — not as a prototype. Every decision must consider scalability, security, performance, and maintainability. Code must be readable by the next engineer. Architecture must be explainable in a system design interview.

---

## AGENT RULES & WORKFLOW (STRICT compliance with DESIGN.md)

You must strictly follow the provided `DESIGN.md` system throughout the entire project lifecycle.

This is not optional guidance.
These are mandatory UI/UX engineering rules and architectural design standards that must be consistently implemented across every page, section, component, interaction, state, and responsive layout.

Do not introduce personal design preferences, trendy UI patterns, random spacing systems, unnecessary animations, excessive gradients, oversized rounded corners, or inconsistent visual decisions outside the defined design system.

The entire application must maintain one unified premium minimal design language.

---

# Mandatory Design System Compliance

You must strictly follow:

* Typography system
* Spacing system
* Layout structure
* Color system
* Card styles
* Button styles
* Radius system
* Motion system
* Responsive behavior
* Accessibility rules
* Loading states
* Error handling UI
* Component consistency
* Performance standards

No deviation is allowed unless explicitly approved.

---

# Core UI Philosophy

The UI must feel:

* Minimal
* Premium
* Professional
* Balanced
* Structured
* Lightweight
* Fast
* Calm
* Modern
* Highly readable

Avoid overdesigned interfaces.

The product should not look:

* flashy
* overly animated
* gradient-heavy
* startup-template-like
* glassmorphism-heavy
* decorative
* cluttered

The goal is clean production-grade UI.

---

# Strict Visual Rules

## Typography

Strictly follow:

* Minimal font weights
* Controlled hierarchy
* Balanced typography scale
* Proper readability
* Clear visibility

Avoid:

* excessive boldness
* random font sizes
* low-opacity text
* decorative typography
* inconsistent heading scales

Use typography hierarchy through:

* spacing
* size
* layout structure
* alignment
* grouping

not excessive font weight.

---

## Layout & Spacing

Maintain:

* Equal spacing systems
* Balanced left/right screen padding
* Consistent vertical rhythm
* Proper section breathing space
* Predictable alignment

Do NOT:

* place elements too close together
* create excessive empty space
* use inconsistent padding values
* randomly change layout structures between pages

Every page must feel visually connected.

---

## Components

### Cards

Strict rules:

* 6px radius only
* no heavy shadows
* no large blur/glass effects
* no floating excessive depth
* subtle borders only
* smooth minimal hover states

### Buttons

Strict rules:

* no pill buttons
* no gradients
* no glow effects
* medium weight typography
* balanced padding
* consistent height system

### Labels / Pills / Tags

Must remain:

* compact
* contextual
* minimal
* visually balanced

Never oversized.

---

# Color System Rules

Strictly use limited colors.

Follow:

* 60-20-10-10 color distribution

Use:

* soft backgrounds
* deep readable foreground colors
* minimal accent usage
* neutral professional palettes

Do NOT use:

* random accent colors
* neon palettes
* saturated gradients
* excessive color variation

All pages must maintain the same color language.

---

# Motion & Animation Rules

Animations must remain subtle and functional.

Allowed:

* smooth hover transitions
* soft fades
* minimal movement
* controlled easing

Avoid:

* bounce animations
* dramatic motion
* floating effects
* exaggerated transitions
* distracting UI animations

Motion must support usability only.

---

# Responsiveness Rules

Every implementation must support:

* Desktop
* Laptop
* Tablet
* Mobile

Responsiveness is mandatory from the beginning.

Do not postpone responsive behavior until later phases.

Maintain:

* proper spacing
* readable typography
* clean stacking
* touch-friendly interactions

across all breakpoints.

---

# Performance Rules

The application must feel fast and lightweight.

Optimize:

* image loading
* font loading
* rendering performance
* bundle size
* lazy loading
* API efficiency

Avoid:

* unnecessary dependencies
* oversized assets
* excessive re-renders
* heavy animations
* layout shifts

Performance is part of UI quality.

---

# Loading States

Every async action must include proper loading states.

Use:

* skeleton loaders
* minimal inline loaders
* lightweight loading feedback

Avoid:

* full-screen blocking loaders
* flashing effects
* oversized spinners

Loading states should feel calm and premium.

---

# Error Handling UI

All pages and forms must include:

* proper empty states
* error states
* retry states
* validation states
* fallback handling

Error UI must remain:

* simple
* readable
* minimal
* non-aggressive

Never use disruptive error experiences.

---

# Accessibility Rules

Accessibility is mandatory.

Ensure:

* readable contrast
* keyboard navigation
* visible focus states
* semantic HTML
* accessible forms
* screen-reader-friendly structure

Accessibility should never be treated as optional.

---

# Development Workflow Rules

Implementation must happen:

# Phase by Phase

# Page by Page

# Section by Section

# Component by Component

Do NOT skip directly to final UI implementation.

---

# Required Workflow

For every page:

## Step 1 — Analyze

Understand:

* page purpose
* user flow
* information hierarchy
* required sections
* UX goals
* responsive behavior

---

## Step 2 — Plan

Before coding:

* list all sections
* list all components
* define spacing structure
* define responsive layout
* define loading/error states
* define interaction behavior

---

## Step 3 — Implement Structure

Build:

* layout containers
* responsive grids
* spacing systems
* section structure

before styling details.

---

## Step 4 — Implement Components

Build all:

* cards
* buttons
* forms
* navigation
* labels
* tables
* modals
* dropdowns

using reusable design system rules.

---

## Step 5 — Implement States

Add:

* loading states
* empty states
* error states
* hover states
* focus states
* disabled states

for every interactive component.

---

## Step 6 — Responsive Validation

Test all breakpoints:

* mobile
* tablet
* desktop

before moving to the next page.

---

## Step 7 — UI Consistency Audit

Before completing a page verify:

* typography consistency
* spacing consistency
* color consistency
* alignment consistency
* hover consistency
* component consistency
* responsive consistency

---

# Strict Implementation Rule

Do NOT:

* skip sections
* leave placeholder UI unfinished
* create inconsistent pages
* implement random spacing
* introduce new styles without approval
* partially implement components
* ignore loading/error states

Every page must feel complete and production-ready before proceeding.

---

# Section Completion Rule

A page is considered complete only if it includes:

* all required sections
* all responsive layouts
* all states
* all interactions
* all accessibility handling
* all visual consistency checks

---

# Reusability Rule

Always prioritize reusable architecture.

Create reusable:

* layout wrappers
* section containers
* typography components
* buttons
* cards
* form components
* modal systems
* spacing utilities

Avoid duplicate implementations.

---

# Final Product Goal

The final application should feel like:

* a professionally engineered SaaS product
* a high-quality premium platform
* a modern production-ready application
* a calm and structured interface system

The UI should feel intentional, minimal, and highly refined in every detail.

---

## 0. PROJECT OVERVIEW

**Product:** BrightSmile Dental Care — Full-Stack Web Application  
**Purpose:** A production-grade dental hospital website with full CRUD operations, appointment booking, doctor management, blog, gallery, and admin panel — built with dummy but real-looking seeded data.  
**Client:** Demo/Portfolio (Real client data injected later — design for easy swap)  
**Scale Target:** 10,000 MAU, 500 concurrent users, sub-2s page loads globally  
**Compliance:** OWASP Top 10 adherence, GDPR-ready architecture, Accessibility WCAG 2.1 AA  
**Code Style:** No dead code. No commented-out blocks. No magic numbers. Self-documenting code.

---

## 1. TECHNOLOGY STACK

### 1.1 Frontend

```
Framework:     Next.js 14 (App Router) — SSR + SSG hybrid
Language:      TypeScript (strict mode — no `any` allowed)
Styling:       Tailwind CSS v3 (config extends design tokens from DESIGN.md)
UI Components: shadcn/ui (base) — customized to match design system
Icons:         Lucide React
Animations:    Framer Motion (complex) + Tailwind CSS (micro-interactions)
Forms:         React Hook Form + Zod (validation schema)
Date:          date-fns
HTTP Client:   Axios with custom instance + interceptors
State:         Zustand (global) + React Query (server state + caching)
Calendar:      react-day-picker (appointment booking)
Image:         next/image (auto optimize + WebP)
Maps:          Leaflet.js + react-leaflet (no Google Maps)
Carousel:      Embla Carousel
Before/After:  react-compare-image
Rich Text:     Tiptap (blog editor in admin)
SEO:           next/head + next-seo
Analytics:     Plausible (open source, self-hostable)
Error tracking: Sentry (open source plan)
```

### 1.2 Backend

```
Runtime:       Node.js 20 LTS
Framework:     Express.js 5 (with async/await error handling)
Language:      TypeScript (strict)
API Style:     REST API with versioning (/api/v1/...)
Validation:    Zod (shared schema with frontend via monorepo)
Auth:          Passport.js + JWT (access token 15min + refresh token 7d)
File Upload:   Multer + Sharp (image resize/compress on upload)
Email:         Nodemailer + MJML templates + Resend (SMTP)
Rate Limiting: express-rate-limit + redis store
Task Queue:    Bull (Redis-backed) for emails, notifications
Logging:       Winston + Morgan (structured JSON logs)
API Docs:      Swagger / OpenAPI 3.0 (auto-generated)
```

### 1.3 Database

```
Primary DB:    PostgreSQL 16 (via Neon — serverless PostgreSQL, free tier)
ORM:           Prisma (type-safe, schema-first, auto migrations)
Cache:         Redis 7 (via Upstash — serverless Redis, free tier)
File Storage:  Cloudinary (free tier — image CDN + transforms)
Search:        PostgreSQL full-text search (pg_trgm) — no Elasticsearch needed at this scale
```

### 1.4 Infrastructure / DevOps

```
Frontend Host: Vercel (Next.js native, free tier, global CDN)
Backend Host:  Railway.app (free tier, Docker-based, simple deploys)
Database:      Neon (serverless PostgreSQL, generous free tier)
Cache:         Upstash (serverless Redis, free tier)
CDN/Images:    Cloudinary (free tier, 25GB storage, 25GB bandwidth)
Domains:       Namecheap + Vercel DNS
SSL:           Auto via Vercel + Railway
CI/CD:         GitHub Actions
Monitoring:    Better Uptime (uptime) + Sentry (errors) + Plausible (analytics)
Secrets:       GitHub Actions Secrets + Vercel Environment Variables
Containerize:  Docker + docker-compose (local dev parity)
```

### 1.5 Monorepo Structure

```
brightsmile/
├── apps/
│   ├── web/            # Next.js frontend
│   └── api/            # Express.js backend
├── packages/
│   ├── shared/         # Shared TypeScript types, Zod schemas, constants
│   ├── ui/             # (future) shared component library
│   └── config/         # Shared ESLint, Prettier, TypeScript configs
├── scripts/
│   ├── seed.ts         # Database seeder with real-looking dummy data
│   └── migrate.ts      # Migration runner
├── docker-compose.yml  # Local dev: postgres + redis
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── package.json        # Turborepo root
└── turbo.json
```

---

## 2. DATABASE SCHEMA DESIGN

### 2.1 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ───────────────────────────────────────────────

enum AppointmentStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
  NO_SHOW
  RESCHEDULED
}

enum Gender {
  MALE
  FEMALE
  OTHER
  PREFER_NOT_TO_SAY
}

enum ServiceCategory {
  COSMETIC
  ORTHODONTICS
  PEDIATRIC
  ORAL_SURGERY
  PREVENTIVE
  EMERGENCY
  IMPLANTS
  GENERAL
}

enum BlogStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum DayOfWeek {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY
}

// ─── CORE MODELS ─────────────────────────────────────────

model Doctor {
  id                String        @id @default(cuid())
  slug              String        @unique
  firstName         String
  lastName          String
  email             String        @unique
  phone             String?
  avatarUrl         String?
  bio               String?
  qualification     String        // "BDS, MDS"
  specialization    String        // "Orthodontist"
  experience        Int           // years
  rating            Float         @default(5.0)
  reviewCount       Int           @default(0)
  isActive          Boolean       @default(true)
  isFeatured        Boolean       @default(false)
  consultationFee   Decimal       @db.Decimal(10, 2)
  languages         String[]      @default(["English", "Telugu", "Hindi"])
  socialLinks       Json?         // { instagram, linkedin, twitter }
  metaTitle         String?
  metaDescription   String?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  // Relations
  services          DoctorService[]
  availability      DoctorAvailability[]
  appointments      Appointment[]
  reviews           Review[]
  blogs             Blog[]

  @@index([isActive, isFeatured])
  @@index([specialization])
}

model DoctorAvailability {
  id          String    @id @default(cuid())
  doctorId    String
  dayOfWeek   DayOfWeek
  startTime   String    // "09:00"
  endTime     String    // "17:00"
  slotMinutes Int       @default(30)
  isAvailable Boolean   @default(true)
  doctor      Doctor    @relation(fields: [doctorId], references: [id], onDelete: Cascade)

  @@unique([doctorId, dayOfWeek])
}

model Service {
  id                String          @id @default(cuid())
  slug              String          @unique
  name              String
  shortDescription  String
  fullDescription   String
  category          ServiceCategory
  imageUrl          String?
  iconName          String?         // Lucide icon name
  duration          Int             // minutes (average)
  priceMin          Decimal?        @db.Decimal(10, 2)
  priceMax          Decimal?        @db.Decimal(10, 2)
  isActive          Boolean         @default(true)
  isFeatured        Boolean         @default(false)
  sortOrder         Int             @default(0)
  symptoms          String[]
  benefits          String[]
  recoveryTime      String?         // "1-2 days"
  faqs              Json?           // [{ question, answer }]
  metaTitle         String?
  metaDescription   String?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  // Relations
  doctors           DoctorService[]
  appointments      Appointment[]
  beforeAfterImages BeforeAfterImage[]

  @@index([category, isActive])
  @@index([isFeatured])
}

model DoctorService {
  doctorId  String
  serviceId String
  doctor    Doctor  @relation(fields: [doctorId], references: [id], onDelete: Cascade)
  service   Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@id([doctorId, serviceId])
}

model Patient {
  id            String        @id @default(cuid())
  firstName     String
  lastName      String
  email         String
  phone         String
  dateOfBirth   DateTime?
  gender        Gender?
  address       String?
  bloodGroup    String?
  allergies     String[]      @default([])
  notes         String?
  isActive      Boolean       @default(true)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  appointments  Appointment[]
  reviews       Review[]

  @@index([email])
  @@index([phone])
}

model Appointment {
  id                String            @id @default(cuid())
  bookingRef        String            @unique  // "BS-2024-001234"
  patientId         String
  doctorId          String
  serviceId         String
  appointmentDate   DateTime
  startTime         String            // "14:00"
  endTime           String            // "14:30"
  status            AppointmentStatus @default(PENDING)
  notes             String?
  chiefComplaint    String?
  isFirstVisit      Boolean           @default(false)
  insuranceProvider String?
  cancelReason      String?
  reminderSentAt    DateTime?
  confirmedAt       DateTime?
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  patient           Patient           @relation(fields: [patientId], references: [id])
  doctor            Doctor            @relation(fields: [doctorId], references: [id])
  service           Service           @relation(fields: [serviceId], references: [id])

  @@index([appointmentDate, status])
  @@index([patientId])
  @@index([doctorId, appointmentDate])
  @@index([bookingRef])
}

model Review {
  id          String   @id @default(cuid())
  patientId   String
  doctorId    String?
  rating      Int      // 1-5
  title       String?
  content     String
  isVerified  Boolean  @default(false)
  isPublished Boolean  @default(false)
  source      String   @default("website") // website, google
  createdAt   DateTime @default(now())

  patient     Patient  @relation(fields: [patientId], references: [id])
  doctor      Doctor?  @relation(fields: [doctorId], references: [id])

  @@index([isPublished, rating])
  @@index([doctorId])
}

model Blog {
  id               String     @id @default(cuid())
  slug             String     @unique
  title            String
  excerpt          String
  content          String     // HTML from Tiptap
  featuredImageUrl String?
  authorId         String
  category         String
  tags             String[]   @default([])
  status           BlogStatus @default(DRAFT)
  readTimeMinutes  Int        @default(5)
  viewCount        Int        @default(0)
  metaTitle        String?
  metaDescription  String?
  publishedAt      DateTime?
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt

  author           Doctor     @relation(fields: [authorId], references: [id])

  @@index([status, publishedAt])
  @@index([category])
  @@index([slug])
}

model GalleryImage {
  id          String   @id @default(cuid())
  url         String
  thumbUrl    String
  caption     String?
  category    String   // clinic, team, operations, events
  altText     String
  sortOrder   Int      @default(0)
  isPublished Boolean  @default(true)
  createdAt   DateTime @default(now())

  @@index([category, isPublished])
}

model BeforeAfterImage {
  id          String   @id @default(cuid())
  serviceId   String
  beforeUrl   String
  afterUrl    String
  caption     String?
  patientNote String?
  isPublished Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())

  service     Service  @relation(fields: [serviceId], references: [id])

  @@index([serviceId, isPublished])
}

model ContactSubmission {
  id         String   @id @default(cuid())
  name       String
  email      String
  phone      String?
  subject    String
  message    String
  isRead     Boolean  @default(false)
  isResolved Boolean  @default(false)
  notes      String?  // admin notes
  createdAt  DateTime @default(now())

  @@index([isRead, createdAt])
}

model ClinicHoliday {
  id    String   @id @default(cuid())
  date  DateTime @unique
  name  String
  type  String   @default("holiday") // holiday, maintenance

  @@index([date])
}

model InsuranceProvider {
  id        String  @id @default(cuid())
  name      String
  logoUrl   String?
  isActive  Boolean @default(true)
  sortOrder Int     @default(0)
}

model Admin {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String
  role         String   @default("admin") // admin, superadmin
  isActive     Boolean  @default(true)
  lastLogin    DateTime?
  createdAt    DateTime @default(now())
}

model SiteSettings {
  id              String @id @default("singleton")
  clinicName      String
  tagline         String?
  phone           String
  emergencyPhone  String
  email           String
  address         String
  city            String
  mapLat          Float
  mapLng          Float
  socialLinks     Json   // { whatsapp, instagram, facebook, youtube }
  seoTitle        String?
  seoDescription  String?
  analyticsId     String?
  updatedAt       DateTime @updatedAt
}
```

---

## 3. API DESIGN

### 3.1 API Structure & Versioning

```
Base URL:     /api/v1
Auth prefix:  /api/v1/auth
Public:       /api/v1/public/*    (no auth required, rate limited)
Admin:        /api/v1/admin/*     (JWT admin required)
```

### 3.2 REST API Endpoints

#### APPOINTMENTS

```
POST   /api/v1/public/appointments           — Book appointment
GET    /api/v1/public/appointments/slots     — Get available slots (query: doctorId, date)
GET    /api/v1/public/appointments/ref/:ref  — Get appointment by booking ref
POST   /api/v1/public/appointments/:id/cancel — Cancel appointment (with token)

GET    /api/v1/admin/appointments            — List all (paginated, filterable)
GET    /api/v1/admin/appointments/:id        — Get single
PATCH  /api/v1/admin/appointments/:id/status — Update status
DELETE /api/v1/admin/appointments/:id        — Soft delete
GET    /api/v1/admin/appointments/stats      — Dashboard stats
```

#### DOCTORS

```
GET    /api/v1/public/doctors               — List active doctors
GET    /api/v1/public/doctors/:slug         — Get doctor profile
GET    /api/v1/public/doctors/:id/reviews   — Get doctor reviews

GET    /api/v1/admin/doctors               — List all
POST   /api/v1/admin/doctors               — Create doctor
GET    /api/v1/admin/doctors/:id           — Get single
PUT    /api/v1/admin/doctors/:id           — Full update
PATCH  /api/v1/admin/doctors/:id           — Partial update
DELETE /api/v1/admin/doctors/:id           — Soft delete (isActive: false)
POST   /api/v1/admin/doctors/:id/avatar    — Upload avatar (multipart)
PUT    /api/v1/admin/doctors/:id/availability — Update availability schedule
```

#### SERVICES

```
GET    /api/v1/public/services             — List active services (filterable by category)
GET    /api/v1/public/services/:slug       — Get service detail

GET    /api/v1/admin/services              — List all
POST   /api/v1/admin/services              — Create
PUT    /api/v1/admin/services/:id          — Update
DELETE /api/v1/admin/services/:id          — Soft delete
POST   /api/v1/admin/services/:id/image    — Upload image
```

#### REVIEWS

```
POST   /api/v1/public/reviews              — Submit review (rate limited: 1/24h per email)

GET    /api/v1/admin/reviews               — List all
PATCH  /api/v1/admin/reviews/:id/publish   — Publish/unpublish
DELETE /api/v1/admin/reviews/:id           — Delete
```

#### BLOG

```
GET    /api/v1/public/blog                 — List published posts (paginated)
GET    /api/v1/public/blog/:slug           — Get post (increments viewCount)
GET    /api/v1/public/blog/categories      — Get all categories + counts
GET    /api/v1/public/blog/search?q=       — Full-text search

POST   /api/v1/admin/blog                  — Create post
GET    /api/v1/admin/blog/:id              — Get (any status)
PUT    /api/v1/admin/blog/:id              — Update
PATCH  /api/v1/admin/blog/:id/publish      — Toggle publish
DELETE /api/v1/admin/blog/:id              — Delete
```

#### GALLERY

```
GET    /api/v1/public/gallery              — List published images (by category)
GET    /api/v1/public/gallery/before-after — Before/After images (by service)

POST   /api/v1/admin/gallery               — Upload image (multipart)
PATCH  /api/v1/admin/gallery/:id           — Update metadata
DELETE /api/v1/admin/gallery/:id           — Delete (also delete from Cloudinary)
POST   /api/v1/admin/gallery/before-after  — Upload B/A pair
```

#### CONTACT

```
POST   /api/v1/public/contact              — Submit contact form

GET    /api/v1/admin/contacts              — List submissions
PATCH  /api/v1/admin/contacts/:id/read     — Mark read
PATCH  /api/v1/admin/contacts/:id/resolve  — Mark resolved
```

#### AUTH (Admin)

```
POST   /api/v1/auth/login                  — Login (email + password)
POST   /api/v1/auth/refresh                — Refresh access token
POST   /api/v1/auth/logout                 — Invalidate refresh token
PATCH  /api/v1/auth/change-password        — Change password (auth required)
```

#### SETTINGS

```
GET    /api/v1/public/settings             — Public site settings
GET    /api/v1/public/insurance-providers  — Active insurance providers
GET    /api/v1/public/holidays             — Upcoming clinic holidays

GET    /api/v1/admin/settings              — All settings
PUT    /api/v1/admin/settings              — Update settings
POST   /api/v1/admin/holidays              — Add holiday
DELETE /api/v1/admin/holidays/:id          — Remove holiday
```

### 3.3 API Response Format

Every response MUST follow this envelope pattern:

```typescript
// Success
{
  "success": true,
  "data": { ... },      // or array for lists
  "meta": {             // pagination (for lists)
    "page": 1,
    "limit": 10,
    "total": 245,
    "totalPages": 25
  },
  "message": "Appointment booked successfully"  // optional, human-readable
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",          // machine-readable
    "message": "Validation failed",       // human-readable summary
    "details": [                          // field-level errors (optional)
      { "field": "phone", "message": "Must be 10 digits" },
      { "field": "email", "message": "Invalid email format" }
    ]
  },
  "requestId": "req_abc123"             // for support/debugging
}
```

**Error Codes:**
```
VALIDATION_ERROR        — 400
UNAUTHORIZED            — 401
FORBIDDEN               — 403
NOT_FOUND               — 404
CONFLICT                — 409 (e.g., slot already booked)
RATE_LIMITED            — 429
INTERNAL_ERROR          — 500
SERVICE_UNAVAILABLE     — 503
```

### 3.4 Pagination Pattern

```
Query params: ?page=1&limit=10&sort=createdAt&order=desc&search=...&filter[category]=COSMETIC
```

---

## 4. SECURITY IMPLEMENTATION

### 4.1 Authentication & Authorization

```
Access Token:   JWT, 15 minutes expiry, signed with RS256 (asymmetric)
Refresh Token:  JWT, 7 days expiry, stored in httpOnly Secure SameSite=Strict cookie
Token rotation: New refresh token issued on every refresh (detect reuse attacks)
Blacklist:      Redis stores invalidated tokens (logout, password change)
Admin roles:    admin | superadmin (RBAC — check on every admin route)
```

**Middleware Stack (every request):**
```typescript
// Order matters — always this order:
1. requestId()         — attach unique request ID
2. helmet()            — security headers
3. cors(config)        — CORS whitelist
4. express.json({limit: '10kb'})  — body size limit
5. rateLimiter         — per-IP rate limiting
6. sanitize()          — XSS sanitization (DOMPurify on input)
7. authenticate()      — JWT verify (public routes skip)
8. authorize(roles)    — role check (admin routes)
```

### 4.2 Security Headers (via Helmet.js)

```javascript
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://hcaptcha.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://*.unsplash.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://api.brightsmile.com"],
      frameSrc: ["https://hcaptcha.com"],
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
})
```

### 4.3 Rate Limiting

```typescript
// Global: 100 req / 15 min per IP
// Auth endpoints: 5 req / 15 min per IP
// Contact form: 3 req / 1 hour per IP
// Review submission: 1 req / 24 hours per email
// Appointment booking: 10 req / 1 hour per IP
// Slot check: 30 req / 1 min per IP (high frequency needed)
```

### 4.4 Input Validation

```typescript
// Zod schema example — Appointment booking:
const BookAppointmentSchema = z.object({
  serviceId: z.string().cuid(),
  doctorId: z.string().cuid(),
  appointmentDate: z.string().datetime(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  patient: z.object({
    firstName: z.string().min(2).max(50).trim(),
    lastName: z.string().min(2).max(50).trim(),
    email: z.string().email().toLowerCase().trim(),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),
    dateOfBirth: z.string().datetime().optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
    isFirstVisit: z.boolean().default(true),
    chiefComplaint: z.string().max(500).optional(),
    insuranceProvider: z.string().max(100).optional(),
  }),
  captchaToken: z.string().min(1, "Please complete the captcha"),
});
```

### 4.5 SQL Injection Prevention

- Prisma ORM: parameterized queries by default
- Never concatenate user input into raw SQL
- Raw queries (if needed): always use tagged template literals `prisma.$queryRaw`

### 4.6 File Upload Security

```typescript
const uploadConfig = {
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      cb(new AppError('Only JPEG, PNG, WebP allowed', 400));
      return;
    }
    cb(null, true);
  }
};
// After upload: re-process with Sharp (strips EXIF, validates actual image)
// Upload to Cloudinary: never serve from /uploads
// Delete /uploads temp files immediately after Cloudinary upload
```

---

## 5. CACHING STRATEGY

### 5.1 Redis Cache Layers

```typescript
// Cache key naming convention: 
// "{resource}:{identifier}:{variant}"
// Examples:
// "service:implants:full"
// "doctors:list:featured"
// "slots:doctor123:2024-01-15"
// "blog:post:my-slug"

const CACHE_TTL = {
  SITE_SETTINGS:    86400,   // 24h  (changes rarely)
  SERVICES_LIST:    3600,    // 1h   (changes infrequently)
  SERVICE_DETAIL:   3600,    // 1h
  DOCTORS_LIST:     1800,    // 30m
  DOCTOR_PROFILE:   1800,    // 30m
  BLOG_LIST:        600,     // 10m  (new posts more frequent)
  BLOG_POST:        600,     // 10m
  INSURANCE_LIST:   86400,   // 24h
  HOLIDAYS:         86400,   // 24h
  SLOTS:            60,      // 1m   (highly dynamic — bookings happen fast)
  REVIEWS:          300,     // 5m
  GALLERY:          3600,    // 1h
};
```

**Cache Invalidation:**
```typescript
// On write operations, invalidate related cache keys
// Doctor updated → delete: doctors:list:*, doctor:slug:*, doctor:id:*
// Appointment booked → delete: slots:doctorId:date:*
// Service updated → delete: services:*, service:slug:*
// Use Redis pattern delete for prefix-based invalidation
```

### 5.2 Next.js Cache (Frontend)

```typescript
// Fetch cache config per route:

// Fully static (revalidate daily):
export const revalidate = 86400; // Insurance, static pages

// ISR (revalidate on demand or time-based):
// Services page: revalidate = 3600
// Blog list: revalidate = 600
// Blog post: revalidate = 600

// Dynamic (no cache):
// Appointment booking: no cache
// Admin panel: no cache (headers: no-store)

// Next.js fetch cache tags for on-demand revalidation:
const services = await fetch('/api/services', { 
  next: { tags: ['services'], revalidate: 3600 } 
});
// After admin updates: revalidateTag('services')
```

### 5.3 HTTP Cache Headers

```
Public assets (/_next/static/): Cache-Control: public, max-age=31536000, immutable
Images (Cloudinary CDN):        Handled by Cloudinary (CDN-level caching)
API GET responses (public):     Cache-Control: public, s-maxage=60, stale-while-revalidate=300
API GET responses (admin):      Cache-Control: no-store
API POST/PUT/DELETE:            Cache-Control: no-store
HTML pages:                     Managed by Next.js per route config
```

---

## 6. SEED DATA SPECIFICATION

### 6.1 Seed Script (`scripts/seed.ts`)

The seeder must be idempotent (safe to run multiple times — uses upsert not insert).

**Doctor Data (seed 8 doctors):**
```typescript
const DOCTORS = [
  {
    slug: "dr-arjun-mehta",
    firstName: "Arjun", lastName: "Mehta",
    qualification: "BDS, MDS (Orthodontics), FICD",
    specialization: "Orthodontist",
    experience: 14,
    bio: "Dr. Arjun Mehta is a renowned orthodontist with over 14 years of experience transforming smiles with precision. He trained at Manipal College of Dental Sciences and completed his MDS with a gold medal. He specializes in invisible aligners, ceramic braces, and complex bite corrections.",
    rating: 4.9, reviewCount: 312,
    consultationFee: 500,
    languages: ["English", "Hindi", "Telugu"],
    avatarUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400", // Unsplash doctor image
  },
  {
    slug: "dr-priya-reddy",
    firstName: "Priya", lastName: "Reddy",
    qualification: "BDS, MDS (Cosmetic Dentistry)",
    specialization: "Cosmetic Dentist",
    experience: 10, rating: 4.8, reviewCount: 284,
    consultationFee: 600,
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
    bio: "Dr. Priya Reddy is Hyderabad's most sought-after cosmetic dentist, known for creating naturally beautiful smiles through veneers, whitening, and smile makeovers. She completed her advanced training in aesthetic dentistry from Thailand.",
  },
  // ... 6 more with similar richness
];
```

**Service Data (seed 12 services):**
```typescript
const SERVICES = [
  {
    slug: "dental-implants",
    name: "Dental Implants",
    shortDescription: "Permanent tooth replacement that looks, feels, and functions exactly like your natural teeth.",
    category: "IMPLANTS",
    duration: 90,
    priceMin: 25000, priceMax: 45000,
    symptoms: ["Missing one or more teeth", "Loose dentures affecting quality of life", "Jawbone deterioration", "Difficulty chewing or speaking"],
    benefits: ["Permanent solution lasting 20+ years", "No impact on adjacent teeth", "Preserves jawbone density", "Natural appearance and feel", "No dietary restrictions"],
    recoveryTime: "3-6 months (full osseointegration)",
    faqs: [
      { question: "Is the procedure painful?", answer: "The procedure is performed under local anesthesia, ensuring you feel no pain. Mild discomfort for 2-3 days after is normal and managed with prescribed medication." },
      { question: "How long do implants last?", answer: "With proper oral hygiene, dental implants can last a lifetime. The crown may need replacement after 15-20 years due to normal wear." },
      { question: "Am I a good candidate?", answer: "Most adults with good general health qualify. Our doctors will evaluate your jawbone density, gum health, and medical history during consultation." },
    ],
  },
  // ... 11 more services
];
```

**Blog Data (seed 10 posts):**
- "5 Warning Signs You Need to Visit a Dentist This Week"
- "Invisalign vs Traditional Braces: Which Is Right for You in 2025?"
- "How to Brush Your Teeth the Right Way (Most People Get This Wrong)"
- "The Truth About Teeth Whitening: What Actually Works"
- "Everything You Need to Know Before Getting Dental Implants"
- "Kids and Cavities: A Parent's Complete Prevention Guide"
- "Root Canal Treatment: Myths vs. Facts You Need to Know"
- "How Stress Is Destroying Your Teeth Without You Knowing"
- "The Best Foods for Strong, Healthy Teeth"
- "Emergency Dental Care: What to Do When You Break a Tooth"

**Review Data (seed 60+ reviews):**
- Spread across all doctors
- Mix of 4 and 5 star ratings (one or two 3-star for realism)
- Detailed text reviews with treatment specifics
- Dates spread over last 2 years

**Gallery Data:**
- 30 clinic photos (Unsplash interior/medical images)
- 20 before/after pairs (placeholder pairs from dental stock)
- Proper categories, alt texts

**Slots Generation:**
- Generate availability for next 60 days for each doctor
- Respect DoctorAvailability table for hours
- Some slots pre-booked (realistic 60% occupancy on popular days)

---

## 7. FRONTEND ARCHITECTURE

### 7.1 Next.js App Router Structure

```
apps/web/
├── app/
│   ├── layout.tsx              # Root layout (fonts, providers, nav, footer)
│   ├── page.tsx                # Home
│   ├── loading.tsx             # Global loading (NProgress bar)
│   ├── error.tsx               # Global error boundary
│   ├── not-found.tsx           # 404 page
│   │
│   ├── about/
│   │   └── page.tsx
│   ├── services/
│   │   ├── page.tsx            # Services listing
│   │   └── [slug]/
│   │       ├── page.tsx        # Service detail (SSG)
│   │       └── loading.tsx
│   ├── doctors/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── appointment/
│   │   └── page.tsx            # Multi-step booking (client component)
│   ├── gallery/
│   │   └── page.tsx
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   ├── emergency/
│   │   └── page.tsx
│   ├── insurance/
│   │   └── page.tsx
│   │
│   └── admin/
│       ├── layout.tsx          # Admin layout (auth guard)
│       ├── login/
│       │   └── page.tsx
│       ├── dashboard/
│       │   └── page.tsx
│       ├── appointments/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── doctors/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/page.tsx
│       ├── services/
│       │   └── page.tsx
│       ├── blog/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── gallery/
│       │   └── page.tsx
│       ├── reviews/
│       │   └── page.tsx
│       ├── contacts/
│       │   └── page.tsx
│       └── settings/
│           └── page.tsx
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── MobileDrawer.tsx
│   │   ├── Footer.tsx
│   │   ├── FloatingButtons.tsx
│   │   └── PageWrapper.tsx     # Handles page transitions
│   │
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── TrustStrip.tsx
│   │   ├── ServicesSection.tsx
│   │   ├── WhyChooseUs.tsx
│   │   ├── DoctorsSection.tsx
│   │   ├── BeforeAfterSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── AppointmentCTABanner.tsx
│   │   ├── InsuranceSection.tsx
│   │   └── BlogPreview.tsx
│   │
│   ├── ui/                     # Base reusable components (shadcn extended)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Textarea.tsx
│   │   ├── Checkbox.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Spinner.tsx
│   │   ├── Alert.tsx
│   │   ├── Pagination.tsx
│   │   ├── Breadcrumb.tsx
│   │   ├── Rating.tsx
│   │   └── AnimatedCounter.tsx
│   │
│   ├── appointment/
│   │   ├── BookingWizard.tsx   # Parent step controller
│   │   ├── Step1Service.tsx
│   │   ├── Step2Doctor.tsx
│   │   ├── Step3DateTime.tsx
│   │   ├── Step4Details.tsx
│   │   ├── Step5Confirm.tsx
│   │   ├── SuccessState.tsx
│   │   └── ProgressIndicator.tsx
│   │
│   ├── doctors/
│   │   ├── DoctorCard.tsx
│   │   ├── DoctorGrid.tsx
│   │   └── DoctorProfile.tsx
│   │
│   ├── services/
│   │   ├── ServiceCard.tsx
│   │   ├── ServiceGrid.tsx
│   │   └── ServiceFilters.tsx
│   │
│   ├── gallery/
│   │   ├── GalleryGrid.tsx
│   │   ├── Lightbox.tsx
│   │   └── BeforeAfterSlider.tsx
│   │
│   ├── blog/
│   │   ├── BlogCard.tsx
│   │   ├── BlogGrid.tsx
│   │   └── TableOfContents.tsx
│   │
│   ├── seo/
│   │   └── JsonLd.tsx          # Structured data schemas
│   │
│   └── admin/
│       ├── AdminSidebar.tsx
│       ├── DataTable.tsx
│       ├── StatsCard.tsx
│       ├── ImageUpload.tsx
│       └── RichTextEditor.tsx
│
├── hooks/
│   ├── useIntersectionObserver.ts
│   ├── useAnimatedCounter.ts
│   ├── useScrollDirection.ts
│   ├── useMediaQuery.ts
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   └── useToast.ts
│
├── lib/
│   ├── api.ts                  # Axios instance with interceptors
│   ├── queryClient.ts          # React Query config
│   ├── utils.ts                # cn(), formatDate(), formatCurrency()
│   ├── validators.ts           # Client-side Zod schemas (shared)
│   └── constants.ts
│
├── store/
│   ├── appointmentStore.ts     # Zustand — booking wizard state
│   └── authStore.ts            # Admin auth state
│
├── types/
│   └── index.ts                # All TypeScript interfaces
│
└── public/
    ├── fonts/                  # Self-hosted Manrope + Inter subsets
    ├── images/
    │   ├── logo.svg
    │   ├── logo-white.svg
    │   └── og-image.png
    └── icons/
        └── dental-sprite.svg   # Custom dental SVG icons
```

### 7.2 Data Fetching Pattern

```typescript
// Server Components (RSC) — use for initial page data:
// page.tsx files fetch data directly from API (server-side)

// Client Components — use React Query for:
// - Real-time or frequently updated data
// - After user interaction (e.g., filtering, pagination)
// - Appointment slots (highly dynamic)

// React Query Config:
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,       // 5 minutes
      gcTime: 1000 * 60 * 30,          // 30 minutes in memory
      retry: (failureCount, error) => {
        // Don't retry 404, 401, 403
        if ([404, 401, 403].includes(error.status)) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    }
  }
});
```

### 7.3 State Management Rules

```
Zustand (global client state):
  - Appointment wizard state (currentStep, formData, selectedService/Doctor)
  - Admin auth state (user, token)
  - Toast queue

React Query (server state):
  - All API fetched data
  - Mutations with optimistic updates where appropriate

URL State (search params):
  - Filters, pagination, sort orders
  - Selected tab (services category, gallery category)
  - Search query

Local state (useState):
  - UI toggles (menu open, modal open)
  - Form field focus states
  - Hover states (rarely needed — prefer CSS)

sessionStorage:
  - Appointment wizard backup (recover on refresh)
```

---

## 8. BACKEND ARCHITECTURE

### 8.1 Express App Structure

```
apps/api/
├── src/
│   ├── app.ts                  # Express app setup, middleware
│   ├── server.ts               # HTTP server start
│   │
│   ├── config/
│   │   ├── env.ts              # Env validation with Zod
│   │   ├── database.ts         # Prisma client singleton
│   │   ├── redis.ts            # Redis client singleton
│   │   └── cloudinary.ts       # Cloudinary config
│   │
│   ├── routes/
│   │   ├── index.ts            # Route aggregator
│   │   ├── public/
│   │   │   ├── appointments.ts
│   │   │   ├── doctors.ts
│   │   │   ├── services.ts
│   │   │   ├── reviews.ts
│   │   │   ├── blog.ts
│   │   │   ├── gallery.ts
│   │   │   ├── contact.ts
│   │   │   └── settings.ts
│   │   ├── admin/
│   │   │   ├── appointments.ts
│   │   │   ├── doctors.ts
│   │   │   ├── services.ts
│   │   │   ├── reviews.ts
│   │   │   ├── blog.ts
│   │   │   ├── gallery.ts
│   │   │   ├── contacts.ts
│   │   │   └── settings.ts
│   │   └── auth.ts
│   │
│   ├── controllers/            # Request handlers (thin — delegate to services)
│   ├── services/               # Business logic
│   ├── middleware/
│   │   ├── auth.ts             # JWT verify + role check
│   │   ├── rateLimiter.ts
│   │   ├── validate.ts         # Zod validation middleware
│   │   ├── upload.ts           # Multer + Sharp pipeline
│   │   ├── cache.ts            # Redis cache middleware
│   │   ├── requestId.ts
│   │   └── errorHandler.ts     # Global error handler
│   │
│   ├── lib/
│   │   ├── cache.ts            # Redis get/set/invalidate helpers
│   │   ├── email.ts            # Nodemailer + MJML templates
│   │   ├── slots.ts            # Slot generation & availability logic
│   │   ├── booking-ref.ts      # "BS-2024-001234" generator
│   │   └── cloudinary.ts       # Upload helpers
│   │
│   ├── workers/
│   │   ├── emailWorker.ts      # Bull worker for async emails
│   │   └── reminderWorker.ts   # Bull worker for appointment reminders
│   │
│   └── types/
│       └── index.ts
```

### 8.2 Slot Availability Logic

```typescript
// This is a critical and nuanced algorithm:

async function getAvailableSlots(doctorId: string, date: string): Promise<string[]> {
  // 1. Check cache first
  const cacheKey = `slots:${doctorId}:${date}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // 2. Get doctor's availability for this day of week
  const dayOfWeek = getDayOfWeek(date); // MONDAY, TUESDAY, etc.
  const availability = await prisma.doctorAvailability.findUnique({
    where: { doctorId_dayOfWeek: { doctorId, dayOfWeek } }
  });
  if (!availability?.isAvailable) return [];

  // 3. Check if date is a clinic holiday
  const holiday = await prisma.clinicHoliday.findUnique({
    where: { date: new Date(date) }
  });
  if (holiday) return [];

  // 4. Generate all slots for the day
  const allSlots = generateTimeSlots(
    availability.startTime,    // "09:00"
    availability.endTime,      // "17:00"
    availability.slotMinutes   // 30
  );

  // 5. Remove already-booked slots
  const booked = await prisma.appointment.findMany({
    where: {
      doctorId,
      appointmentDate: new Date(date),
      status: { in: ['PENDING', 'CONFIRMED'] }
    },
    select: { startTime: true }
  });
  const bookedTimes = new Set(booked.map(a => a.startTime));

  // 6. Remove past slots (if date is today)
  const available = allSlots.filter(slot => {
    if (bookedTimes.has(slot)) return false;
    if (isToday(date) && isPastTime(slot)) return false;
    return true;
  });

  // 7. Cache for 60 seconds
  await redis.setEx(cacheKey, 60, JSON.stringify(available));

  return available;
}
```

### 8.3 Email Template System

```typescript
// Templates (MJML → HTML):
// 1. appointment-confirmation.mjml   — Patient receives after booking
// 2. appointment-reminder.mjml       — 24h before appointment
// 3. appointment-cancellation.mjml   — When cancelled
// 4. contact-received.mjml           — Auto-reply to contact form
// 5. contact-admin-notify.mjml       — Notify admin of new contact

// Bull queue for async processing:
emailQueue.add('appointment-confirmation', {
  to: patient.email,
  patientName: patient.firstName,
  bookingRef: appointment.bookingRef,
  doctor: doctor.name,
  service: service.name,
  date: appointment.appointmentDate,
  time: appointment.startTime,
});
```

---

## 9. ADMIN PANEL SPECIFICATION

### 9.1 Admin Dashboard Stats

```
Stat cards (real-time data, 30s auto-refresh):
- Today's Appointments: count + status breakdown
- This Month Revenue: sum of consultation fees for completed appointments
- Pending Approvals: PENDING appointment count
- New Contacts: unread contact submissions count

Charts:
- Appointments per Day (last 30 days): line chart
- Appointments by Service: pie/donut chart
- Doctor Utilization: horizontal bar chart
- Monthly Trend: area chart
```

### 9.2 Appointments Management Table

```
Columns: Booking Ref | Patient | Service | Doctor | Date & Time | Status | Actions
Filters: Status | Doctor | Service | Date Range | Search (name/ref/phone)
Sort: Date (default desc) | Name | Status
Actions per row: View | Edit Status | Cancel | Delete
Bulk: Mark Confirmed | Export CSV
Pagination: 20 per page default
```

### 9.3 Admin Auth Guard

```typescript
// middleware: requireAdmin
// Check: JWT in Authorization header OR httpOnly cookie
// Validate: token not blacklisted in Redis
// Check: user.isActive === true
// Log: every admin action to audit log table (add AuditLog model)
```

---

## 10. CI/CD PIPELINE

### 10.1 GitHub Actions — CI (`ci.yml`)

```yaml
name: CI
on: [pull_request, push to main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - Checkout
      - Setup Node 20
      - Install dependencies (pnpm)
      - Run: pnpm lint          (ESLint)
      - Run: pnpm typecheck     (tsc --noEmit)

  test:
    runs-on: ubuntu-latest
    services:
      postgres: (test database)
      redis: (test redis)
    steps:
      - Checkout
      - Install
      - Run: pnpm test          (Vitest — unit tests)
      - Run: pnpm test:api      (Supertest — integration tests)
      - Upload coverage to Codecov

  build:
    needs: [lint-and-typecheck, test]
    steps:
      - Build Next.js
      - Build Express API
      - Check bundle size (fail if > budget)
```

### 10.2 GitHub Actions — Deploy (`deploy.yml`)

```yaml
name: Deploy
on: push to main (after CI passes)

jobs:
  deploy-frontend:
    steps:
      - Vercel CLI deploy (production)
      - Run: revalidate ISR cache (POST to /api/revalidate)

  deploy-backend:
    steps:
      - Railway CLI deploy
      - Run: prisma migrate deploy (production migrations)
      - Health check: GET /health — wait for 200

  notify:
    steps:
      - Post deployment summary to Slack/Discord webhook
```

### 10.3 Environment Variables

```bash
# apps/api — never commit .env — use GitHub Secrets
DATABASE_URL=           # Neon PostgreSQL connection string
REDIS_URL=              # Upstash Redis URL
JWT_SECRET=             # RS256 private key (base64)
JWT_PUBLIC_KEY=         # RS256 public key (base64)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=         # Email sending
HCAPTCHA_SECRET=        # Captcha verification
FRONTEND_URL=           # CORS whitelist

# apps/web
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_HCAPTCHA_SITEKEY=
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
SENTRY_DSN=
CRON_SECRET=            # Secret for /api/revalidate
```

---

## 11. MONITORING & OBSERVABILITY

### 11.1 Health Check Endpoint

```typescript
// GET /health — public, no auth
// Returns 200 with:
{
  status: "healthy",
  version: "1.0.0",
  uptime: 123456,        // seconds
  database: "connected",
  redis: "connected",
  timestamp: "ISO-8601"
}
// Returns 503 if any critical dependency is down
```

### 11.2 Structured Logging

```typescript
// Every request logs:
{
  requestId: "req_abc123",
  method: "POST",
  path: "/api/v1/public/appointments",
  statusCode: 201,
  duration: 234,          // ms
  userId: null,           // or admin id
  ip: "hashed-ip",        // never raw IP in logs (privacy)
  userAgent: "...",
}

// Every error logs:
{
  requestId: "req_abc123",
  error: {
    message: "...",
    stack: "...",          // only in non-production
    code: "VALIDATION_ERROR",
  }
}
```

### 11.3 Monitoring Stack

```
Uptime:        Better Uptime — check /health every 60s, alert on 2 failures
Errors:        Sentry — capture unhandled exceptions, source maps, performance
Analytics:     Plausible — pageviews, sources, conversions (privacy-first)
Alerts:        Sentry → email + Slack webhook on new error
DB:            Neon dashboard — connection pool, query stats
```

### 11.4 Performance Budgets

```
Core Web Vitals targets (per Lighthouse):
LCP (Largest Contentful Paint): < 2.5s
CLS (Cumulative Layout Shift):  < 0.1
FID/INP:                        < 200ms
TTFB (Time to First Byte):      < 800ms
Total bundle (initial JS):      < 150KB gzipped
Total bundle (per route):       < 100KB gzipped additional
Image optimization:             All images WebP, <200KB each, lazy loaded
```

---

## 12. LOCAL DEVELOPMENT SETUP

### 12.1 Prerequisites

```bash
Node.js 20+, pnpm 8+, Docker Desktop
```

### 12.2 Getting Started

```bash
# 1. Clone and install
git clone https://github.com/your-org/brightsmile.git
cd brightsmile
pnpm install

# 2. Environment setup
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# Fill in .env values (local dev uses docker postgres/redis)

# 3. Start infrastructure
docker-compose up -d    # PostgreSQL + Redis

# 4. Database setup
pnpm db:migrate         # Run Prisma migrations
pnpm db:seed            # Seed with dummy data

# 5. Start development
pnpm dev                # Runs both frontend (3000) and api (4000) via Turborepo

# Additional scripts:
pnpm db:studio          # Prisma Studio — visual DB browser
pnpm db:reset           # Drop + re-migrate + re-seed (dev only)
pnpm lint               # ESLint all packages
pnpm typecheck          # TypeScript check all packages
pnpm test               # Vitest unit tests
pnpm test:api           # API integration tests
pnpm build              # Build all packages for production
```

### 12.3 `docker-compose.yml`

```yaml
version: '3.9'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: brightsmile_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dev"]
      interval: 5s

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --save 20 1 --loglevel warning

volumes:
  postgres_data:
```

---

## 13. TESTING STRATEGY

### 13.1 Unit Tests (Vitest)

```
Test files co-located: *.test.ts next to source file
Coverage targets:
  - Utilities: 100%
  - Service layer (business logic): 90%+
  - Slot availability algorithm: 100% (critical)
  - Validation schemas: 90%+
  - Controllers: skip (test at integration level)

Key test cases:
  - Slot generation with various schedules
  - Booking ref uniqueness
  - Price formatting
  - Date utilities (timezone handling)
  - Zod schema validation (valid + invalid inputs)
```

### 13.2 Integration Tests (Supertest)

```
Database: isolated test DB (in-memory SQLite via Prisma or separate Neon branch)
Tests:
  - POST /appointments — success, validation errors, slot conflict
  - GET /slots — various scenarios (holidays, fully booked, weekends)
  - Auth flow — login, refresh, logout, reuse detection
  - Rate limiting — verify blocks after threshold
  - File upload — valid image, oversized, wrong type
```

### 13.3 E2E Tests (Playwright — add later milestone)

```
Critical flows:
  - Home → Services → Service Detail → Book Appointment → Success
  - Admin login → View appointments → Change status
  - Contact form submission
```

---

## 14. IMAGE SEEDING FROM INTERNET

All dummy images sourced from open license APIs. Never hotlink — download and upload to Cloudinary during seed.

```typescript
// In seed script:
async function seedImage(unsplashId: string, folder: string): Promise<string> {
  const url = `https://images.unsplash.com/photo-${unsplashId}?w=800&q=80&auto=format`;
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  
  // Compress with Sharp before upload
  const compressed = await sharp(Buffer.from(buffer))
    .resize(800, 600, { fit: 'cover' })
    .webp({ quality: 80 })
    .toBuffer();
  
  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload_stream(
    { folder: `brightsmile/${folder}`, resource_type: 'image' },
    (error, result) => result
  ).end(compressed);
  
  return result.secure_url;
}

// Unsplash IDs for doctors (already licensed for demo use):
// Doctor portraits: Use UI Faces or Dicebear avatars for consistency in demo
// Clinic photos: architectural/interior from Unsplash
// Dental procedures: medical stock from Pexels (also free)
```

---

## 15. CONTENT SEEDING DETAILS

### Taglines per Service (seed data)

```
Dental Implants:  "Restore Your Smile. Restore Your Life."
Teeth Whitening:  "Brightness That Lasts Beyond the Chair."
Braces:           "Straighten Your Path to a Perfect Smile."
Invisalign:       "Invisible. Comfortable. Life-Changing."
Root Canal:       "Pain-Free. Fast. Permanent Relief."
Smile Design:     "Your Dream Smile, Engineered to Perfection."
Pediatric Care:   "Building Healthy Habits from the Very First Tooth."
Implants:         "The Closest Thing to Nature You'll Ever Experience."
```

### Hero Copy Variations (A/B test ready)

```
Variant A:
  H1: "Advanced Dental Care for Your Perfect Smile"
  Sub: "Trusted by 20,000+ patients across Hyderabad for world-class dental treatments."

Variant B:
  H1: "Hyderabad's Most Trusted Dental Specialists"
  Sub: "From cosmetic to emergency — complete dental care under one roof."
```

---

## 16. DEPLOYMENT CHECKLIST

Pre-launch validation (run before every production deploy):

```
□ All environment variables set in Vercel + Railway dashboards
□ Database migrations applied (prisma migrate deploy)
□ Seed data verified in production DB
□ CORS origin includes production frontend URL
□ Rate limiting configured for production load
□ Sentry DSN configured for both frontend and backend
□ Cloudinary signed uploads (not unsigned) in production
□ hCaptcha secret key is production key
□ Email provider (Resend) verified domain + DNS records
□ SSL certificates active (auto via Vercel/Railway)
□ /health endpoint returns 200
□ Lighthouse score: Performance > 90, Accessibility > 95, SEO > 95
□ Core Web Vitals passing in PageSpeed Insights
□ robots.txt and sitemap.xml accessible
□ OG images rendering in social previews (Twitter Card Validator)
□ Structured data (JSON-LD) validated in Google Rich Results Test
□ 404 page tested
□ Mobile viewport tested on actual device (not just DevTools)
□ Form submissions tested end-to-end (appointment + contact)
□ Admin login functional
□ Image CDN (Cloudinary) loading via HTTPS
□ No console errors in production browser
□ CSP headers not blocking any legitimate resources
□ Backup verified: Neon daily auto-backup enabled
```

---

## 17. CODE QUALITY STANDARDS

```typescript
// ESLint config extends: next/core-web-vitals, @typescript-eslint/strict
// Prettier: single quotes, 2 space indent, 100 char line width, trailing commas
// Import order: react → next → external → internal (absolute) → relative
// No barrel exports (index.ts re-exports) — causes tree-shaking issues
// All async functions must have explicit return types
// No `any` type — use `unknown` + type narrowing
// No `!` non-null assertion — use proper null checks
// Magic numbers → named constants
// Comments: explain WHY, not WHAT (code explains what)
// Every exported function has JSDoc with @param and @returns
// Component props → always typed interface, not inline type
// API service functions → always in /lib/api.ts, never raw fetch in component
// Error boundaries around all async data-fetching sections
// Loading states for every async operation (no undefined → content flash)
```

---

## 18. FUTURE EXTENSION POINTS (Architecture Ready)

These are NOT built now but architecture must not block them:

```
□ Multi-clinic support: add clinicId FK to Appointment, Doctor, Service
□ Online payments: Razorpay integration hook in appointment confirm step
□ Patient portal: JWT-based patient auth (separate from admin)
□ Telemedicine: WebRTC signaling server, separate service
□ SMS notifications: Twilio hook in emailWorker (same queue, different channel)
□ Multi-language (i18n): next-intl already installed, message files ready
□ PWA: service worker, offline appointment form caching
□ Dark mode: CSS variables already defined (DESIGN.md § 11)
□ AI Chatbot: sidebar widget, separate API endpoint
□ Analytics dashboard: expand admin dashboard with Recharts
```

---

*AGENT.md v1.0 — BrightSmile Dental Hospital — Confidential Build Directive*  
*Prepared for: AI Agent / Senior Developer*  
*Last updated: 2025*
