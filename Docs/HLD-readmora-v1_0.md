# Readmora — High Level Design (HLD)

```
Version      : 1.0.0
Status       : Draft
Last Updated : 2026-04-08
Owner        : Platform Engineering / Founder-Architect
Reviewers    : Engineering Lead, CTO, DevOps Lead, Security Lead
Stakeholders : Product, Engineering, Infrastructure, Security
```

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Goals & Non-Goals](#2-goals--non-goals)
3. [System Context Diagram](#3-system-context-diagram)
4. [Architecture Overview](#4-architecture-overview)
5. [Component Design](#5-component-design)
6. [Data Architecture](#6-data-architecture)
7. [API Design Summary](#7-api-design-summary)
8. [Authentication & Authorization Architecture](#8-authentication--authorization-architecture)
9. [Infrastructure & Deployment Architecture](#9-infrastructure--deployment-architecture)
10. [Scalability & Performance Design](#10-scalability--performance-design)
11. [Reliability & Resilience Design](#11-reliability--resilience-design)
12. [Security Architecture](#12-security-architecture)
13. [Observability Architecture](#13-observability-architecture)
14. [Multi-Tenancy Design](#14-multi-tenancy-design)
15. [Background Jobs & Async Processing](#15-background-jobs--async-processing)
16. [Integration Architecture](#16-integration-architecture)
17. [Decision Log (ADR Summary)](#17-decision-log-adr-summary)
18. [Open Questions & Risks](#18-open-questions--risks)
19. [Future Roadmap (Phase 2+)](#19-future-roadmap-phase-2)
20. [Glossary](#20-glossary)
21. [Changelog](#21-changelog)

---

## 1. Executive Summary

Readmora is a personal book-tracking and discovery web application targeting avid readers who are dissatisfied with the stagnant UX of existing platforms like Goodreads and The StoryGraph. The product lets readers log their reading life across four shelves (Want to Read, Currently Reading, Finished, DNF), receive AI-generated book analyses via the Gemini API, and express their reading identity through five curated colour "vibe" themes. It combines the functional utility of a reading tracker with the visual personality of a lifestyle app — a gap no current competitor fills.

The platform serves three primary user types: aesthetic readers who want a visually expressive reading identity, avid readers who need fast AI-powered book insights without leaving the app, and casual readers who want simple shelf management with low friction. Internally, a small founder-led engineering team (1–2 engineers) owns the full stack. Externally, the system integrates with Supabase (auth + database + storage), Google Gemini (AI), Razorpay (payments), Open Library (book metadata), and Resend (transactional email). Monetisation is freemium: a free tier capped at 3 AI summaries per week drives conversion to Premium (₹149/month or ₹999/year), which unlocks unlimited AI access.

At launch, the system is designed for ~1,000 concurrent users and 10,000 MAU within six months, scaling to ~50,000 MAU at the two-year horizon. The core architectural style is a **serverless monolith**: a single Next.js 14 (App Router) application deployed on Vercel, with serverless API routes handling all backend logic, and Supabase providing the managed data layer. This approach maximises iteration speed for a small team while Vercel's edge infrastructure provides production-grade availability without operational overhead.

---

## 2. Goals & Non-Goals

### 2.1 Goals

**Functional Goals**
- Allow users to sign up via Google OAuth or Email/Password and complete a 5-step onboarding in under 3 minutes
- Provide four reading shelves (Want to Read, Currently Reading, Finished, DNF) with full CRUD operations
- Deliver AI-generated book summaries (themes, writing style, audience fit) via Gemini API within 8 seconds for uncached and under 1 second for cached requests
- Enforce a server-side rate limit of 3 AI summaries per week for free-tier users with no client-side bypass possible
- Support Goodreads CSV import of up to 2,000 books with shelf mapping
- Offer 5 curated colour vibe themes applied globally via CSS custom properties, persisted to user profiles
- Accept Razorpay Premium subscriptions (monthly ₹149, annual ₹999) with HMAC-verified webhook handling
- Support basic book search by title and author via the Open Library API

**Non-Functional Goals**
- Page LCP < 2.5s on a 4G connection
- AI summary response < 8s (fresh), < 1s (cached)
- System availability ≥ 99.5% (combined Vercel + Supabase SLA)
- All API keys and secrets server-side only — never exposed to the browser
- RLS-enforced row-level data isolation: no user can access another user's shelf, usage, or profile data
- WCAG 2.1 AA accessibility compliance across all 5 vibe themes
- GDPR-compliant account deletion with full cascade of personal data
- TypeScript strict mode throughout; ESLint + Prettier enforced in CI

### 2.2 Non-Goals

**Out of scope for v1:**
- Native iOS or Android applications (responsive web covers mobile in v1)
- Social features: follows, public feeds, reviews feed, or community discussions
- AI-generated personalised reading recommendations
- In-app reading / e-reader functionality
- Direct bookstore or Amazon purchase links
- Team or book club reading features
- Multi-language support (English-only v1)
- Full admin dashboard UI (Supabase Studio used for internal ops in v1)

**Deferred to future phases:**
- Reading streaks, gamification, and annual reading-wrapped reports
- Native mobile apps (React Native)
- AI recommendations based on shelf + vibe
- Publisher and author partnerships

### 2.3 Success Metrics

| Metric | Target | Measurement Method |
|---|---|---|
| Registered Users | 10,000 | Month 6 post-launch |
| DAU/MAU Ratio | ≥ 25% | PostHog analytics |
| Onboarding Completion Rate | ≥ 75% | PostHog funnel |
| AI Summary p95 Response (cached) | < 1s | Vercel function logs |
| AI Summary p95 Response (fresh) | < 8s | Vercel function logs |
| Home Feed LCP | < 2.5s | Core Web Vitals / Vercel Analytics |
| Free-to-Premium Conversion | ≥ 15% | Month 12 — Razorpay + DB |
| AI Usage Cost / Free User | < ₹2/month | Gemini API billing |
| System Availability | ≥ 99.5% | Vercel + Supabase uptime dashboards |
| Goodreads Import Completion | ≥ 40% of eligible users | PostHog event |

---

## 3. System Context Diagram

```text
                        ┌──────────────────────────────────────────┐
   [Reader / User]      │               READMORA                   │      [Admin / Founder]
   (Browser / Mobile)   │                                          │      (Supabase Studio)
         │              │  ┌────────────────────────────────────┐  │             │
         │ HTTPS        │  │     Next.js 14 App Router          │  │      Direct DB access
         │              │  │  (Vercel Edge + Serverless Fns)    │  │
         └─────────────►│  │                                    │  │◄────────────┘
                        │  │  ┌──────────┐  ┌───────────────┐  │  │
                        │  │  │ UI Layer │  │  API Routes   │  │  │
                        │  │  │(React 19)│  │  /api/v1/*    │  │  │
                        │  │  └──────────┘  └───────┬───────┘  │  │
                        │  └──────────────────────┬─┼──────────┘  │
                        └─────────────────────────┼─┼─────────────┘
                                                  │ │
          ┌───────────────────┬───────────────────┘ └────────────────────┐
          │ HTTPS (supabase-js)│                                          │ HTTPS (REST)
          ▼                    ▼                                          ▼
  ┌───────────────┐   ┌────────────────┐   ┌────────────┐   ┌────────────────────┐
  │  Supabase     │   │  Gemini API    │   │  Razorpay  │   │  Open Library API  │
  │               │   │  (Google AI)   │   │            │   │  (book metadata)   │
  │  - Auth (JWT) │   │  Gemini 1.5    │   │  - Checkout│   │  (public, no auth) │
  │  - Postgres 15│   │  Flash         │   │  - Webhook │   └────────────────────┘
  │  - Storage    │   │  (AI summaries)│   │  - Subs    │
  └───────────────┘   └────────────────┘   └────────────┘
                                                  │ HTTPS (webhook POST)
                                                  ▼
                                        [Readmora /api/v1/webhooks/razorpay]
                                              (HMAC-verified)

  ┌────────────────┐
  │  Resend        │   ◄── HTTPS (API) ── API Route (payment events, expiry reminders)
  │  (Email)       │
  └────────────────┘

  ┌────────────────┐
  │  PostHog       │   ◄── HTTPS (client SDK) ── Browser (analytics events)
  │  (Analytics)   │
  └────────────────┘

  ┌────────────────┐
  │  Vercel CDN    │   ◄── Static assets, Next.js ISR pages served at edge
  │  (Edge Network)│
  └────────────────┘
```

---

## 4. Architecture Overview

### 4.1 Architectural Style & Justification

| Pattern | Chosen? | Reason |
|---|---|---|
| Serverless Monolith | ✅ Yes | Single Next.js 14 app on Vercel. 1–2 engineers cannot maintain distributed services. Vercel serverless functions provide per-route scaling without ops overhead. |
| Microservices | ❌ No | Unjustified complexity for an MVP team of 1–2. No independent scaling requirements between components at this stage. |
| Event-Driven / Message Queue | ❌ No | No sustained async workloads requiring queue durability. Webhook handling and cron jobs are handled inline by Vercel serverless functions and Supabase cron. |
| Traditional Serverful Monolith | ❌ No | No dedicated server to manage. Vercel abstracts infra entirely — optimal for a zero-ops team. |
| CQRS | ❌ No | Read/write patterns are simple enough for a single Postgres schema. Premature for v1 scale. |
| Event Sourcing | ❌ No | No audit trail requirements beyond payment logs. Adds complexity with no v1 benefit. |

> 📌 Assumption: The team is 1–2 engineers with a strong Next.js background. The serverless monolith pattern is the only viable choice that meets the 8-week MVP timeline without sacrificing production readiness.

### 4.2 High-Level Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│            Next.js 14 App Router (React 19)                      │
│   Server Components │ Client Components │ Tailwind CSS 4         │
│   Vibe Theme System (CSS custom properties on <html>)            │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTPS (TLS 1.3)
┌─────────────────────────────▼───────────────────────────────────┐
│                     VERCEL EDGE NETWORK                          │
│    CDN (static assets) │ ISR │ Edge Middleware (auth guard)      │
└──────────┬──────────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────────┐
│                 NEXT.JS SERVERLESS API ROUTES                    │
│                    /api/v1/* (server-side only)                  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │ /ai/summary  │  │/books/search │  │ /webhooks/razorpay    │  │
│  │ (rate-limit  │  │(Open Library │  │ (HMAC verification +  │  │
│  │  enforced)   │  │  proxy)      │  │  subscription update) │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬───────────┘  │
│         │                 │                       │              │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌───────────▼───────────┐  │
│  │/subscription │  │/onboarding/  │  │  /import/goodreads    │  │
│  │   /status    │  │  complete    │  │  (CSV processing)     │  │
│  └──────────────┘  └──────────────┘  └───────────────────────┘  │
└──────────┬──────────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────────┐
│                         DATA LAYER                               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    SUPABASE                              │    │
│  │  Postgres 15 (RLS) │ Auth (JWT) │ Storage (avatars)     │    │
│  │                                                          │    │
│  │  Tables: profiles │ books │ shelf_entries │ ai_summaries │    │
│  │          ai_usage │ vibes │ subscriptions                │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  Gemini 1.5 Flash │ Razorpay │ Open Library │ Resend │ PostHog  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Technology Stack

| Layer | Technology | Justification |
|---|---|---|
| Frontend Framework | Next.js 14 (App Router) | Server components, ISR, API routes in one framework. Best-in-class DX for React teams. |
| UI Library | React 19 | Latest stable; concurrent features beneficial for streamed AI responses. |
| Styling | Tailwind CSS 4 | Utility-first; pairs naturally with Next.js. Custom properties enable runtime vibe theming. |
| Language | TypeScript (strict mode) | Type safety across full stack. Shared types between API routes and components. |
| Auth | Supabase Auth | OAuth + Email out of the box; JWT sessions; RLS integration. Eliminates auth build entirely. |
| Primary Database | Supabase (Postgres 15) | Managed Postgres with RLS, real-time, and Storage in one platform. No separate DB infra to run. |
| Object Storage | Supabase Storage | Avatar images. Co-located with DB reduces latency; managed signed URLs. |
| AI | Google Gemini 1.5 Flash | Free tier (15 RPM) sufficient with global caching. High-quality literary analysis. Low cost at scale. |
| Payments | Razorpay | India-first; UPI + cards + netbanking; INR pricing; webhook SDK well-documented. |
| Email | Resend | Simple REST API; generous free tier (3,000 emails/month). Next.js-native integrations. |
| Book Metadata | Open Library API | Free, no API key, extensive ISBN coverage. Covers 90%+ of expected book searches. |
| Hosting / Serverless | Vercel | Zero-ops deployment for Next.js. Global edge CDN. Auto-scaling serverless functions. |
| Analytics | PostHog | Privacy-first. Self-hostable in future. Free tier adequate for v1. Funnel + event tracking. |
| CSV Parsing | PapaParse (client-side) | Parses Goodreads CSV in-browser. No raw reading history ever transits to server. |
| CI/CD | GitHub Actions | Native to Git workflow. Free for open/private repos at this scale. |

---

## 5. Component Design

---

### NextjsFrontend

**Type**            : Service (SSR + Static)
**Responsibility**  : Renders all user-facing UI using React Server Components and Client Components; owns routing, vibe theme system, and client-side CSV parsing.
**Owned By**        : Platform Engineering
**Language/Runtime**: TypeScript / React 19 / Next.js 14
**Scales**          : Horizontally (Vercel edge replicas — automatic)
**Stateful**        : No (state managed in Supabase or browser session)

#### Interfaces

| Interface | Protocol | Direction | Consumer / Producer |
|---|---|---|---|
| Page Requests | HTTPS | Inbound | End User (Browser) |
| API Route Calls | HTTPS (fetch) | Outbound | NextjsApiRoutes |
| Supabase JS Client | HTTPS (REST / WebSocket) | Outbound | Supabase Auth + DB |
| PostHog SDK | HTTPS | Outbound | PostHog Analytics |

#### Key Responsibilities
- Render all pages: landing, onboarding (5 steps), home feed, book detail, settings
- Apply vibe theme by setting `data-vibe` attribute on `<html>` via CSS custom properties — no JS overhead
- Parse Goodreads CSV client-side using PapaParse; pass structured data to API route
- Guard routes using Supabase Auth session; redirect unauthenticated users to login
- Display AI summary with usage counter badge for free users; render paywall modal on 429 response

#### What It Does NOT Own
- Rate limit enforcement (owned by NextjsApiRoutes)
- Subscription status decisions (validated server-side on every AI request)
- Direct external API calls to Gemini or Razorpay (all proxied via API routes)

#### Data Owned
- No persistent data. Reads from Supabase DB via API routes or supabase-js client.

#### Dependencies
- NextjsApiRoutes, SupabaseAuth, SupabaseDB (via supabase-js)

#### SLA / SLO

| Metric | Target |
|---|---|
| Availability | 99.5% (Vercel SLA) |
| LCP (Home Feed) | < 2.5s on 4G |
| Vibe Theme Switch | < 100ms (CSS-only, no network) |

---

### NextjsApiRoutes

**Type**            : Service (Serverless Functions)
**Responsibility**  : Owns all server-side business logic: AI rate limiting, Razorpay webhook verification, book search proxying, subscription status checks, and onboarding completion.
**Owned By**        : Platform Engineering
**Language/Runtime**: TypeScript / Node.js 20 (Vercel Serverless)
**Scales**          : Horizontally (Vercel auto-scales each route independently)
**Stateful**        : No

#### Interfaces

| Interface | Protocol | Direction | Consumer / Producer |
|---|---|---|---|
| REST API | HTTPS | Inbound | NextjsFrontend / Razorpay (webhook) |
| Supabase Admin Client | HTTPS (service role) | Outbound | SupabaseDB |
| Gemini SDK | HTTPS | Outbound | Gemini API |
| Razorpay SDK | HTTPS | Outbound | Razorpay |
| Open Library API | HTTPS | Outbound | Open Library |
| Resend API | HTTPS | Outbound | Resend |

#### Key Responsibilities
- `POST /api/v1/ai/summary` — Validate JWT, check `ai_usage` table, call Gemini if uncached, write to `ai_summaries`, increment usage counter
- `GET /api/v1/books/search` — Proxy search to Open Library; normalise response to internal schema; upsert matched books into `books` table
- `GET /api/v1/subscription/status` — Return current `subscription_status` and `subscription_expires_at` for authenticated user
- `POST /api/v1/webhooks/razorpay` — Verify HMAC signature; handle `payment.captured`, `payment.failed`, `subscription.cancelled`, `subscription.charged`
- `POST /api/v1/onboarding/complete` — Set `onboarding_complete = true` on `profiles`
- `POST /api/v1/import/goodreads` — Accept parsed CSV payload; batch-upsert shelf entries

#### What It Does NOT Own
- UI rendering (owned by NextjsFrontend)
- Database schema migrations (owned by Supabase CLI / engineering)
- Email template design (Resend handles rendering)

#### Data Owned
- No persistent data store. Reads/writes exclusively via SupabaseDB using service role key.

#### Dependencies
- SupabaseDB (service role), GeminiAPI, RazorpayGateway, OpenLibraryAPI, ResendEmail

#### SLA / SLO

| Metric | Target |
|---|---|
| Availability | 99.5% |
| AI Summary p99 (cached) | < 1s |
| AI Summary p99 (fresh) | < 8s |
| Webhook Processing p99 | < 3s |
| All other routes p99 | < 500ms |

---

### SupabaseAuth

**Type**            : Service (Managed — Supabase)
**Responsibility**  : Issues and validates JWTs for all authenticated sessions; manages OAuth provider flows (Google); handles email/password auth with verification.
**Owned By**        : Supabase (managed) / Platform Engineering (configuration)
**Language/Runtime**: Managed (GoTrue under the hood)
**Scales**          : Horizontally (managed by Supabase)
**Stateful**        : Yes (session store internal to Supabase)

#### Interfaces

| Interface | Protocol | Direction | Consumer / Producer |
|---|---|---|---|
| OAuth Redirect | HTTPS | Inbound | End User (via Google) |
| JWT Issuance | HTTPS (REST) | Outbound | NextjsFrontend (supabase-js) |
| JWT Verification | In-process (RLS) | Internal | SupabaseDB (via `auth.uid()`) |

#### Key Responsibilities
- Handle Google OAuth 2.0 code exchange and session creation
- Issue short-lived JWTs (access token) + refresh tokens for all sessions
- Trigger `handle_new_user()` database function on new signup to create `profiles` row
- Send email verification links for Email/Password signups via built-in Supabase email

#### What It Does NOT Own
- Subscription status (owned by `profiles` table)
- Role management beyond `authenticated` / `service_role` (handled by RLS policies)

#### Data Owned
- `auth.users` table (internal to Supabase, not directly accessible)
- `auth.identities` table (OAuth provider links)

#### Dependencies
- Google OAuth 2.0 (external), Supabase SMTP (for email verification)

#### SLA / SLO

| Metric | Target |
|---|---|
| Availability | 99.9% (Supabase Pro SLA) |
| Token Issuance p99 | < 500ms |

---

### SupabaseDB

**Type**            : Database (Managed Postgres 15)
**Responsibility**  : Single source of truth for all persistent application data; enforces row-level security to guarantee per-user data isolation.
**Owned By**        : Platform Engineering
**Language/Runtime**: PostgreSQL 15 (Supabase managed)
**Scales**          : Vertically (Supabase plan upgrade) + Read replicas (Supabase Pro+)
**Stateful**        : Yes

#### Interfaces

| Interface | Protocol | Direction | Consumer / Producer |
|---|---|---|---|
| Postgres Wire Protocol | HTTPS (PostgREST) | Inbound | NextjsApiRoutes (service role), NextjsFrontend (anon/authed) |
| Supabase JS Client | HTTPS | Inbound | NextjsFrontend |

#### Key Responsibilities
- Persist all application tables: `profiles`, `books`, `shelf_entries`, `ai_summaries`, `ai_usage`, `vibes`, `subscriptions`
- Enforce RLS policies — every table with user data has `auth.uid() = user_id` policies
- Run `handle_new_user()` trigger on `auth.users` insert
- Enforce `UNIQUE(user_id, book_id)` on `shelf_entries` to prevent duplicate shelf entries

#### What It Does NOT Own
- Auth token issuance (SupabaseAuth)
- File storage (SupabaseStorage)
- Business logic / rate limit calculations (NextjsApiRoutes)

#### Data Owned
- All tables listed in Section 6.1

#### Dependencies
- SupabaseAuth (for `auth.uid()` in RLS policies)

#### SLA / SLO

| Metric | Target |
|---|---|
| Availability | 99.9% (Supabase Pro SLA) |
| Query p99 (simple RLS select) | < 100ms |
| Write p99 | < 200ms |

---

### SupabaseStorage

**Type**            : Object Storage (Managed)
**Responsibility**  : Stores and serves user avatar images via private buckets with time-limited signed URLs.
**Owned By**        : Platform Engineering
**Language/Runtime**: Managed (S3-compatible — Supabase)
**Scales**          : Horizontally (managed — unlimited)
**Stateful**        : Yes

#### Interfaces

| Interface | Protocol | Direction | Consumer / Producer |
|---|---|---|---|
| Upload | HTTPS (supabase-js Storage API) | Inbound | NextjsFrontend |
| Signed URL Fetch | HTTPS | Inbound | Browser (image display) |

#### Key Responsibilities
- Store avatar images (max 2MB, JPEG/PNG/WebP) in a private bucket `avatars/`
- Generate short-lived signed URLs for avatar display
- Enforce bucket RLS: users may only write to their own `avatars/{user_id}/` path

#### What It Does NOT Own
- Book cover images (fetched directly from Open Library CDN URLs, stored as `cover_url` TEXT in `books`)

#### Data Owned
- `avatars/` private bucket

#### SLA / SLO

| Metric | Target |
|---|---|
| Upload p95 | < 2s (2MB file) |
| Signed URL generation | < 100ms |

---

### GeminiAPI

**Type**            : External Service
**Responsibility**  : Generates AI-powered literary analyses of books (themes, writing style, plot overview, audience fit) on demand from NextjsApiRoutes.
**Owned By**        : Google (external)
**Language/Runtime**: REST API (Google AI SDK)
**Scales**          : Externally managed
**Stateful**        : No

#### Interfaces

| Interface | Protocol | Direction | Consumer / Producer |
|---|---|---|---|
| `/v1/models/generate` | HTTPS | Outbound | NextjsApiRoutes |

#### Key Responsibilities
- Accept structured literary analysis prompts and return markdown-formatted responses
- Apply safety filters for adult/explicit content

#### What It Does NOT Own
- Caching of responses (owned by `ai_summaries` table in SupabaseDB)
- Rate limit tracking (owned by `ai_usage` table)

#### SLA / SLO

| Metric | Target |
|---|---|
| Response Time p95 | < 6s (fresh request) |
| Free Tier RPM | 15 RPM (Gemini Flash) |

---

### RazorpayGateway

**Type**            : External Service (Payment Gateway)
**Responsibility**  : Processes Premium subscription payments (monthly ₹149 / annual ₹999) and delivers webhook events to Readmora to update subscription status.
**Owned By**        : Razorpay (external)
**Language/Runtime**: REST API + JavaScript SDK
**Scales**          : Externally managed
**Stateful**        : No (from Readmora perspective; state lives in `subscriptions` table)

#### Interfaces

| Interface | Protocol | Direction | Consumer / Producer |
|---|---|---|---|
| Checkout JS | HTTPS (browser SDK) | Outbound | NextjsFrontend |
| Webhook | HTTPS (POST) | Inbound | `POST /api/v1/webhooks/razorpay` |

#### Key Responsibilities
- Present payment checkout modal in-browser
- Process card / UPI / netbanking payments
- Send HMAC-signed webhook events for: `payment.captured`, `payment.failed`, `subscription.cancelled`, `subscription.charged`

#### What It Does NOT Own
- Subscription status in Readmora DB (updated by NextjsApiRoutes on webhook receipt)

---

### OpenLibraryAPI

**Type**            : External Service (Book Metadata)
**Responsibility**  : Provides book metadata (title, author, ISBN, cover, description, genres) via public REST API, proxied by Readmora's search route.
**Owned By**        : Internet Archive (external)
**Language/Runtime**: REST API (no auth required)
**Scales**          : Externally managed
**Stateful**        : No

#### Interfaces

| Interface | Protocol | Direction | Consumer / Producer |
|---|---|---|---|
| Search API | HTTPS | Outbound | NextjsApiRoutes `/api/v1/books/search` |

---

### ResendEmail

**Type**            : External Service (Transactional Email)
**Responsibility**  : Delivers transactional emails: payment confirmation, subscription expiry reminders, and payment failure notifications.
**Owned By**        : Resend (external)
**Language/Runtime**: REST API
**Scales**          : Externally managed
**Stateful**        : No

#### Interfaces

| Interface | Protocol | Direction | Consumer / Producer |
|---|---|---|---|
| Send Email | HTTPS | Outbound | NextjsApiRoutes (webhook handler, cron) |

---

## 6. Data Architecture

### 6.1 Data Store Summary

| Store | Technology | Use Case | Scaling Strategy |
|---|---|---|---|
| Primary DB | Supabase Postgres 15 | All application data — profiles, shelves, AI cache, subscriptions | Vertical (plan upgrade); read replicas on Supabase Pro |
| Object Storage | Supabase Storage | User avatar images | Native (managed, unlimited) |
| Analytics | PostHog (cloud) | User behaviour events, funnel analysis | Managed — PostHog cloud |

> 📌 Assumption: No Redis cache is used in v1. Supabase Postgres provides sufficient query speed at this scale. AI summaries are cached in the `ai_summaries` table (Postgres), which serves as the application-layer cache for Gemini responses. Redis is a Phase 2 consideration.

> 📌 Assumption: No message queue is used in v1. Razorpay webhooks are handled synchronously by the API route. Subscription expiry is managed by a Supabase cron job (pg_cron). These are sufficient for v1 async requirements.

### 6.2 Schema Overview

#### `profiles`
```sql
CREATE TABLE profiles (
  id                     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username               TEXT UNIQUE NOT NULL,
  avatar_url             TEXT,
  bio                    TEXT,
  genre_preferences      TEXT[]   DEFAULT '{}',
  vibe_preference        TEXT     DEFAULT 'wildflower',
  onboarding_complete    BOOLEAN  DEFAULT false,
  subscription_status    TEXT     DEFAULT 'free'
                         CHECK (subscription_status IN ('free', 'premium')),
  subscription_expires_at TIMESTAMPTZ,
  razorpay_customer_id   TEXT,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);
```

#### `books`
```sql
CREATE TABLE books (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  author           TEXT NOT NULL,
  isbn             TEXT UNIQUE,
  cover_url        TEXT,
  description      TEXT,
  published_year   INT,
  genres           TEXT[] DEFAULT '{}',
  open_library_key TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
```

#### `shelf_entries`
```sql
CREATE TABLE shelf_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id     UUID NOT NULL REFERENCES books(id),
  shelf       TEXT NOT NULL CHECK (shelf IN
              ('want_to_read','currently_reading','finished','dnf')),
  rating      SMALLINT CHECK (rating BETWEEN 1 AND 5),
  notes       TEXT,
  started_at  DATE,
  finished_at DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);
```

#### `ai_summaries` (Global Cache)
```sql
CREATE TABLE ai_summaries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id          UUID NOT NULL UNIQUE REFERENCES books(id),
  summary_markdown TEXT NOT NULL,
  generated_at     TIMESTAMPTZ DEFAULT NOW(),
  model_version    TEXT DEFAULT 'gemini-1.5-flash'
);
-- Writable by service_role only; publicly readable
```

#### `ai_usage` (Per-User Rate Limiting)
```sql
CREATE TABLE ai_usage (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start  DATE NOT NULL,       -- ISO Monday
  usage_count SMALLINT DEFAULT 0,
  UNIQUE(user_id, week_start)
);
-- Writable by service_role only
```

#### `subscriptions` (Audit Log)
```sql
CREATE TABLE subscriptions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  razorpay_payment_id      TEXT UNIQUE NOT NULL,
  razorpay_subscription_id TEXT UNIQUE,
  plan                     TEXT NOT NULL CHECK (plan IN ('monthly','annual')),
  amount_paise             INT  NOT NULL,
  status                   TEXT NOT NULL,
  created_at               TIMESTAMPTZ DEFAULT NOW()
);
```

#### `vibes` (Seed / Lookup)
```sql
CREATE TABLE vibes (
  id              TEXT PRIMARY KEY,   -- e.g. 'wildflower'
  display_name    TEXT NOT NULL,
  color_bg        TEXT NOT NULL,
  color_primary   TEXT NOT NULL,
  color_secondary TEXT NOT NULL,
  color_accent    TEXT NOT NULL,
  color_muted     TEXT NOT NULL
);
-- Publicly readable; seeded at deploy time
```

### 6.3 Database Design Principles

**Primary Keys:** UUID (`gen_random_uuid()`) across all tables. Avoids sequential ID enumeration attacks; safe for distributed inserts; consistent with Supabase Auth's UUID user IDs.

**Soft Deletes:** User data is never hard-deleted on account removal — Postgres `ON DELETE CASCADE` on all `user_id` foreign keys ensures automatic purge when the `auth.users` row is deleted (triggered by the account deletion flow). Payment records (`subscriptions`) are retained for 7 years per legal/tax requirements and are excluded from cascade.

**Multi-tenancy:** Shared database, shared schema with `user_id` foreign key on every user-owned table. RLS policies enforce `auth.uid() = user_id` on every DML operation. Cross-user queries are impossible at the database layer.

**Indexing Strategy:**

| Table | Index | Query Pattern |
|---|---|---|
| `shelf_entries` | `(user_id, shelf)` | "Get all books on user's 'finished' shelf" |
| `shelf_entries` | `(user_id, book_id)` | UNIQUE — prevents duplicates, also serves lookup |
| `ai_usage` | `(user_id, week_start)` | UNIQUE — primary rate limit lookup |
| `ai_summaries` | `(book_id)` | UNIQUE — cache hit check |
| `profiles` | `(username)` | UNIQUE — real-time uniqueness check during onboarding |
| `books` | `(isbn)` | UNIQUE — Goodreads import ISBN dedup |

**Normalisation:** 3NF for all OLTP tables. No denormalisation in v1 — query patterns are simple enough that joins are inexpensive.

### 6.4 Data Flow Diagram

```text
[User: "Get AI Summary for Book X"]
          │
          ▼
POST /api/v1/ai/summary  { book_id }
          │
          ▼
  Validate JWT (Supabase Auth)
          │
          ▼
  Check ai_summaries WHERE book_id = X
  ├── HIT  → return cached markdown
  │         → UPSERT ai_usage (increment count)
  │
  └── MISS → check ai_usage (free limit?)
               ├── BLOCKED → return HTTP 429 + { upgradeRequired: true }
               │
               └── OK → call Gemini API
                         → INSERT ai_summaries
                         → UPSERT ai_usage
                         → return markdown to client

[User: "Upgrade to Premium"]
          │
          ▼
  Razorpay Checkout Modal (browser)
          │
          ▼ (on payment success)
  POST /api/v1/webhooks/razorpay
          │
          ▼
  Verify HMAC signature
          │
          ▼
  UPDATE profiles SET subscription_status = 'premium',
                      subscription_expires_at = NOW() + interval
  INSERT subscriptions (audit record)
          │
          ▼
  Send payment confirmation email (Resend)

[Cron: Daily subscription expiry check]
          │
          ▼
  SELECT profiles WHERE subscription_expires_at < NOW()
          │
          ▼
  UPDATE profiles SET subscription_status = 'free'
  Send expiry reminder email (Resend)
```

### 6.5 Data Retention & Lifecycle

| Data Type | Retention Period | Deletion Strategy |
|---|---|---|
| User profile + shelf data | Until account deletion | Cascade delete via `auth.users` row removal |
| AI summaries | Indefinite (global cache) | Never deleted — not user-specific |
| AI usage records | Cascade on account deletion | Cascade via `user_id` FK |
| Payment records (`subscriptions`) | 7 years | Manual archival; excluded from cascade |
| Avatar images | Until account deletion | Storage bucket cleanup on account deletion |
| Analytics events (PostHog) | 2 years | PostHog retention policy |

### 6.6 Data Privacy Classification

| Table | Classification | Notes |
|---|---|---|
| `profiles` | PII | Username, avatar URL, email (in auth.users) |
| `shelf_entries` | Personal | Reading history |
| `ai_usage` | Personal | Behavioural |
| `subscriptions` | Financial / PII-adjacent | Razorpay IDs; retain 7 years |
| `books`, `vibes`, `ai_summaries` | Public | No user data |

---

## 7. API Design Summary

**API Style:** REST over Next.js App Router API Routes. No GraphQL in v1 (unnecessary complexity for this data shape and team size). No gRPC (all traffic is browser-originated HTTPS).

**Versioning:** URL-prefix versioning from day one (`/api/v1/...`). Allows non-breaking evolution.

**Response Envelope:** All routes return `{ data: T | null, error: string | null }`.

**Authentication:** All authenticated routes validate the Supabase JWT via `createServerClient` from `@supabase/ssr`. The service role key is used only server-side for privileged writes (rate limit increments, subscription updates).

### Internal API Routes

| Route | Method | Auth Required | Purpose |
|---|---|---|---|
| `/api/v1/ai/summary` | POST | ✅ JWT | Get AI book summary (rate-limited; Gemini-backed) |
| `/api/v1/books/search` | GET | Optional | Proxy search to Open Library |
| `/api/v1/subscription/status` | GET | ✅ JWT | Return subscription status + expiry |
| `/api/v1/webhooks/razorpay` | POST | HMAC signature | Handle Razorpay payment events |
| `/api/v1/onboarding/complete` | POST | ✅ JWT | Set `onboarding_complete = true` |
| `/api/v1/import/goodreads` | POST | ✅ JWT | Batch-upsert shelf entries from parsed CSV |

### Communication Patterns

| Type | Protocol | Use Case |
|---|---|---|
| Synchronous (client→server) | HTTPS REST | All page data, shelf mutations, search |
| Synchronous (server→external) | HTTPS REST | Gemini, Razorpay, Open Library, Resend |
| Webhook (inbound) | HTTPS POST + HMAC | Razorpay payment events |
| Real-time (optional, future) | Supabase Realtime (WebSocket) | Subscription status push (v2) |

### API Gateway Responsibilities

Vercel Edge Middleware handles:
- **Auth guard:** Redirect unauthenticated requests to `/login` for protected routes
- **Rate limiting:** Vercel's built-in edge rate limiting applied to `/api/v1/ai/summary` (secondary defence; primary is server-side DB check)
- **HTTPS enforcement:** Vercel enforces TLS 1.3; no HTTP served

> 📌 Assumption: No dedicated API gateway (Kong, AWS API Gateway) is used in v1. Vercel Edge Middleware and Next.js middleware provide sufficient gatekeeping at this scale.

---

## 8. Authentication & Authorization Architecture

**Identity Provider:** Supabase Auth (managed GoTrue). No in-house auth build.

### Authentication Flows Supported

| Flow | Supported | Notes |
|---|---|---|
| Email + Password | ✅ Yes | Bcrypt-hashed via Supabase; email verification required before app access |
| OAuth 2.0 (Google) | ✅ Yes | PKCE flow via Supabase Auth; profile auto-created on first sign-in |
| Magic Link | ❌ No | Not in v1 — adds email flow complexity |
| MFA (TOTP) | ❌ No | Not in v1 — target audience doesn't demand it; v2 consideration |
| API Key (M2M) | ❌ No | No third-party integrations requiring M2M in v1 |
| SAML 2.0 | ❌ No | No enterprise customers in v1 |

### Token Architecture

```text
[Sign-in]
     │
     ▼
Supabase Auth issues:
  ├── Access Token (JWT, 1-hour expiry)
  │     └── Payload: { sub: user_uuid, role: "authenticated", exp, iat }
  └── Refresh Token (opaque, stored in HttpOnly cookie by supabase-js)
           │
           ▼ (on expiry)
  Auto-refresh via supabase-js SDK → new access token issued
           │
           ▼ (on sign-out)
  Refresh token revoked in Supabase Auth
```

> 📌 Assumption: Access tokens expire at 1 hour (Supabase default). Refresh tokens have a 7-day rolling window. These values are configurable in Supabase Auth settings.

### Authorization Model: RBAC via Supabase RLS

Roles:
- `anon` — unauthenticated users; can read `books`, `vibes` only
- `authenticated` — signed-in users; can CRUD their own rows (enforced by `auth.uid() = user_id` RLS)
- `service_role` — server-side only (API routes); bypasses RLS for privileged operations (rate limit write, subscription update)

**Permission Matrix:**

| Table | anon | authenticated (own rows) | service_role |
|---|---|---|---|
| `profiles` | ❌ | SELECT, UPDATE | ALL |
| `books` | SELECT | SELECT | ALL |
| `shelf_entries` | ❌ | ALL (own) | ALL |
| `ai_summaries` | SELECT | SELECT | ALL |
| `ai_usage` | ❌ | SELECT (own) | ALL |
| `subscriptions` | ❌ | SELECT (own) | ALL |
| `vibes` | SELECT | SELECT | ALL |

---

## 9. Infrastructure & Deployment Architecture

### 9.1 Cloud Provider & Region Strategy

| Provider | Primary Region | DR Strategy | Justification |
|---|---|---|---|
| Vercel (hosting) | Global Edge (auto) | Multi-region by default | Next.js-native; zero-ops; global CDN included |
| Supabase (data) | ap-south-1 (Mumbai) | Supabase Pro: daily backups + PITR | India-first user base; low latency to target market |

> 📌 Assumption: Supabase project is provisioned in `ap-south-1` (AWS Mumbai) to minimise latency for the primary India-based user base.

### 9.2 Infrastructure Components

| Component | Service | Configuration |
|---|---|---|
| Compute | Vercel Serverless Functions | Auto-scaled; Node.js 20 runtime; 10s timeout (AI route: 30s) |
| CDN / Edge | Vercel Edge Network | Static assets, ISR pages served at edge globally |
| DNS | Vercel DNS | `readmora.app` → Vercel managed domain |
| TLS | Vercel (auto-provisioned) | TLS 1.3; auto-renewal via Let's Encrypt |
| Database | Supabase (Postgres 15) | Free → Pro at ~3,000 MAU (~$25/month); connection pooling via Supabase Pooler (PgBouncer) |
| Storage | Supabase Storage | Private `avatars` bucket; 1GB free tier |
| Secrets | Vercel Environment Variables | Server-only vars (`GEMINI_API_KEY`, `RAZORPAY_KEY_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`) never exposed to browser |

### 9.3 Deployment Pipeline

```text
[Git Push to main]
       │
       ▼
[GitHub Actions]
  ├── TypeScript type check (tsc --noEmit)
  ├── ESLint + Prettier check
  ├── Unit tests (Jest / Vitest)
  └── Build check (next build)
       │
       ▼ (on success)
[Vercel Preview Deploy]  ← Auto-deployed on every PR
       │
       ▼ (on merge to main)
[Vercel Production Deploy]
  ├── Zero-downtime (Vercel atomic deploys)
  └── Instant rollback available (previous deployment stays live until new one is healthy)
       │
       ▼
[Post-deploy]
  └── Smoke test: health check + AI summary endpoint (mocked)
```

### 9.4 Deployment Strategy

| Environment | Strategy | Rollback Time | Notes |
|---|---|---|---|
| Production | Atomic deploy (Vercel) | < 1 minute | Vercel keeps previous deployment live; instant rollback via dashboard |
| Preview | Per-PR preview URL | N/A | Isolated Vercel preview environment per PR |
| Development | Local (`next dev`) | N/A | `.env.local` with Supabase dev project |

### 9.5 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=           # Safe to expose (public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # Safe to expose (public, RLS-constrained)
SUPABASE_SERVICE_ROLE_KEY=          # SERVER ONLY — never expose to browser

# Gemini
GEMINI_API_KEY=                     # SERVER ONLY

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=        # Safe to expose (public key for Checkout JS)
RAZORPAY_KEY_SECRET=                # SERVER ONLY
RAZORPAY_WEBHOOK_SECRET=            # SERVER ONLY

# Email
RESEND_API_KEY=                     # SERVER ONLY

# App
NEXT_PUBLIC_APP_URL=https://readmora.app

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=            # Safe to expose
NEXT_PUBLIC_POSTHOG_HOST=           # Safe to expose
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` must **never** appear in any client-side bundle. Verified via `NEXT_PUBLIC_` prefix convention — only vars prefixed with `NEXT_PUBLIC_` are included in the browser bundle.

---

## 10. Scalability & Performance Design

### 10.1 Scaling Strategy

| Component | Scaling Type | Trigger | Notes |
|---|---|---|---|
| Next.js Frontend + API Routes | Horizontal (automatic) | Per-request (Vercel serverless) | Each function invocation is independent |
| SupabaseDB | Vertical (plan upgrade) + Read replicas | Storage > 80% or connection count | Upgrade free → Pro at ~3,000 MAU |
| SupabaseStorage | Horizontal (managed) | Automatic | No action needed |
| GeminiAPI | External | Upgrade to paid tier at >15 RPM sustained | Monitor via Gemini console |

### 10.2 Caching Strategy

| Cache Layer | Technology | TTL | Invalidation | What's Cached |
|---|---|---|---|---|
| AI Summary | Postgres `ai_summaries` | Indefinite | Never (immutable per book) | Gemini response per `book_id` |
| Book Metadata | Postgres `books` table | Indefinite | On Open Library data change (manual) | Title, author, cover, ISBN |
| Static Assets | Vercel CDN | 1 year (immutable hash) | Content hash change | JS bundles, images, fonts |
| ISR Pages | Vercel Edge | 60s revalidation | `revalidatePath()` on shelf mutation | Home feed, book detail pages |
| Session | Supabase Auth (HttpOnly cookie) | 1 hour JWT / 7-day refresh | Sign-out | User session |

### 10.3 Performance Targets

| Operation | p50 | p95 | p99 |
|---|---|---|---|
| Home feed load (LCP) | < 1s | < 2s | < 2.5s |
| Shelf add / update | < 200ms | < 400ms | < 500ms |
| Book search | < 300ms | < 700ms | < 1s |
| AI summary (cached) | < 200ms | < 600ms | < 1s |
| AI summary (fresh / Gemini) | < 4s | < 7s | < 8s |
| Vibe theme switch | < 16ms | < 50ms | < 100ms |
| Goodreads import (1,000 rows) | < 10s | < 20s | < 30s |

### 10.4 Bottleneck Analysis

| Potential Bottleneck | Risk | Mitigation |
|---|---|---|
| Gemini API free tier (15 RPM) | High | Global `ai_summaries` cache means Gemini is called once per book ever; at 10,000 MAU × 3/week = 30k requests/week but hit-rate will be very high for popular books |
| Supabase free tier DB size (500MB) | Medium | Monitor via Supabase dashboard; upgrade to Pro ($25/mo) at 300MB |
| Supabase connection pool (free tier: 15 direct connections) | High | Use Supabase's built-in Supavisor (connection pooler) for serverless routes; always use pooled connection string in API routes |
| Open Library API latency | Medium | Cache book metadata in Postgres `books` table on first search; subsequent searches hit DB, not Open Library |
| Large Goodreads CSV (2,000 rows) | Medium | Parsed client-side (PapaParse); server receives structured JSON, not raw CSV; batch upsert in single DB transaction |
| Vercel function cold starts | Low | Vercel functions warm quickly (< 200ms); not a user-facing issue at this scale |

---

## 11. Reliability & Resilience Design

### 11.1 Availability Targets

| Tier | SLA | Architecture |
|---|---|---|
| Core Web App | 99.5% | Vercel + Supabase combined SLA |
| AI Summary Feature | 99.0% | Gemini dependency; graceful fallback shown |
| Payment Webhooks | 99.5% | Razorpay retries webhooks for 24h; idempotent handler |

### 11.2 Failure Modes & Mitigations

| Failure Mode | Probability | Impact | Mitigation |
|---|---|---|---|
| Gemini API timeout or error | Medium | Medium | Show "Summary temporarily unavailable" toast; do NOT decrement usage counter; retry not automatic (user re-triggers) |
| Razorpay webhook delayed | Low | High | Poll `/api/v1/subscription/status` every 5s for 60s post-payment; Razorpay retries webhooks for 24 hours |
| Razorpay webhook duplicate | Low | Medium | Idempotency: check `razorpay_payment_id` uniqueness in `subscriptions` before processing |
| Supabase DB unavailable | Low | Critical | Vercel functions return 503; user sees error state; Supabase Pro has 99.9% SLA |
| Supabase Auth down | Low | Critical | App unusable for new sign-ins; existing JWT sessions continue working until expiry |
| Bad Vercel deployment | Medium | High | Instant rollback via Vercel dashboard (< 1 minute); previous deployment stays routed until new one passes health check |
| Gemini cost spike | Medium | Financial | `ai_summary_enabled` feature flag in `feature_flags` table; can disable in < 1 minute |
| Open Library API down | Medium | Low | Book search degrades gracefully: show "Search temporarily unavailable"; existing shelf data unaffected |
| Goodreads CSV format change | Low | Low | Client-side parser; format version detection; feature flag `goodreads_import_enabled` |

### 11.3 Resilience Patterns Applied

| Pattern | Applied To | Implementation |
|---|---|---|
| Idempotency | Razorpay webhook handler | Check `razorpay_payment_id` in `subscriptions` before update |
| Graceful Degradation | Gemini AI feature | Show fallback message; preserve usage counter |
| Feature Flags | Gemini, Goodreads import, Payments | `feature_flags` table in Supabase; checked at API route entry |
| Retry (client-side polling) | Post-payment status update | Frontend polls `/api/v1/subscription/status` every 5s × 12 (60s max) |
| Timeout | Gemini API call | 10s hard timeout in API route; error returned if exceeded |
| Atomic Deployment | All deployments | Vercel atomic deploys — old version serves traffic until new is healthy |

### 11.4 Disaster Recovery

| Scenario | RPO | RTO | Recovery Procedure |
|---|---|---|---|
| Vercel deployment failure | 0 (no data loss) | < 1 minute | Instant rollback to previous Vercel deployment |
| Supabase DB corruption | < 24 hours (free tier daily backup) | < 2 hours | Restore from Supabase daily backup; PITR available on Pro |
| Accidental data deletion | < 24 hours | < 2 hours | Restore from Supabase backup; RLS prevents mass deletions |
| Gemini API key compromise | 0 | < 15 minutes | Rotate `GEMINI_API_KEY` in Vercel env vars; redeploy |
| Razorpay webhook secret compromise | 0 | < 15 minutes | Rotate `RAZORPAY_WEBHOOK_SECRET` in Razorpay dashboard + Vercel env vars |

---

## 12. Security Architecture

### 12.1 Security Layers

```text
[Internet]
    │
    ▼
[Vercel DDoS Protection + TLS 1.3]  ← All traffic HTTPS; Vercel auto-blocks volumetric attacks
    │
    ▼
[Vercel Edge Middleware]             ← Auth guard; redirect unauthenticated to /login
    │
    ▼
[Next.js API Routes]                 ← JWT validation; HMAC webhook verification; input validation (Zod)
    │
    ▼
[Supabase RLS]                       ← Row-level isolation; service_role bypasses only from server
    │
    ▼
[Supabase Postgres]                  ← AES-256 encryption at rest; TLS 1.3 in transit
```

### 12.2 Security Controls

| Domain | Control | Implementation |
|---|---|---|
| Transport | TLS 1.3 enforced | Vercel enforces HTTPS; HSTS header set; no HTTP served |
| Authentication | JWT + Supabase Auth | 1-hour access tokens; 7-day refresh tokens; HttpOnly cookies |
| Authorization | RLS (row-level RBAC) | Every user-owned table has `auth.uid() = user_id` RLS policy |
| Webhook Auth | HMAC-SHA256 | `x-razorpay-signature` verified against `RAZORPAY_WEBHOOK_SECRET` before processing |
| Input Validation | Zod schemas | All API route inputs validated at entry; reject malformed requests |
| Secret Management | Vercel Env Vars (server-only) | `GEMINI_API_KEY`, `RAZORPAY_KEY_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` never in browser bundle |
| File Upload | Type + size validation | Avatar: max 2MB, JPEG/PNG/WebP only; validated in API route before Storage write |
| CSV Injection | PapaParse client-side | CSV parsed to JSON in browser; server never executes CSV content |
| API Key Exposure | `NEXT_PUBLIC_` convention | Only `NEXT_PUBLIC_*` vars are in browser bundle; all secrets use bare var names |
| Data Encryption | AES-256 at rest | Supabase default; Vercel Storage encrypted at rest |
| PII in Logs | Structured logging only | Never log email, avatar URLs, reading history, or payment IDs in plain text |
| Dependency Scanning | Dependabot | Automated PRs for CVE patches; reviewed weekly |

### 12.3 Threat Model

| Threat | Mitigation |
|---|---|
| AI rate limit bypass via client manipulation | Rate limit checked server-side against `ai_usage` via service role; RLS alone insufficient (API routes use service role for writes) |
| Razorpay webhook spoofing | HMAC-SHA256 signature verified on every webhook; 401 returned on mismatch |
| Cross-user shelf data access | RLS policies on `shelf_entries`, `ai_usage`, `profiles` reject any `auth.uid() != user_id` access |
| Service role key exposure | Key only present in Vercel server-side env; never appears in Next.js `NEXT_PUBLIC_*` vars |
| Supabase anon key abuse | Anon key is intentionally limited (can only read `books`, `vibes`); no privileged operations possible with anon key |
| Mass account enumeration | Username uniqueness API (debounced) doesn't reveal email; generic auth errors used |
| Open redirect | Next.js redirect destinations whitelisted; no arbitrary redirects |

### 12.4 Compliance Considerations

| Standard | Applicable? | Notes |
|---|---|---|
| GDPR | ✅ Yes | "Delete My Account" cascade purges all personal data; privacy policy required before launch |
| IT Act, 2000 (India) | ✅ Yes | Privacy policy and ToS required; India-first product |
| PCI-DSS | ✅ Delegated | Razorpay handles card data; Readmora never stores card numbers; Razorpay is PCI-DSS Level 1 certified |
| SOC 2 | ❌ No (v1) | Not required for consumer app at this stage; revisit at enterprise tier |
| HIPAA | ❌ No | No health data involved |

---

## 13. Observability Architecture

### 13.1 The Three Pillars

| Pillar | Tool | What It Covers |
|---|---|---|
| Metrics | Vercel Analytics + Supabase Dashboard | Core Web Vitals, function invocation counts, DB query times, error rates |
| Logs | Vercel Function Logs | Structured logs from API routes; Supabase Auth logs for sign-in events |
| Traces | Vercel Observability (built-in) | Request lifecycle per serverless function invocation |
| Product Analytics | PostHog | Onboarding funnel, feature usage, vibe distribution, AI summary usage |

> 📌 Assumption: No Prometheus/Grafana stack in v1. Vercel's built-in observability and Supabase's dashboard provide sufficient visibility at this scale. Sentry is planned for v1.1 for error tracking and alerting.

### 13.2 Key Metrics to Monitor

| Category | Metric | Source | Alert Threshold |
|---|---|---|---|
| Availability | Function error rate | Vercel Dashboard | > 2% → investigate immediately |
| Latency | AI summary p95 response | Vercel Logs | > 8s → check Gemini status |
| Business | AI summary usage / day | PostHog | > 80% of Gemini daily quota → alert |
| Business | Premium conversions / week | Razorpay + PostHog | Drop > 50% week-on-week → investigate |
| Data | Supabase DB size | Supabase Dashboard | > 400MB (free: 500MB cap) → upgrade plan |
| Auth | Failed sign-in rate | Supabase Auth logs | > 50/hour from single IP → possible brute force |
| Onboarding | Funnel completion rate | PostHog | Drop below 60% → UX investigation |

### 13.3 Log Standards

All API route logs must emit structured JSON:

```json
{
  "timestamp"  : "2026-04-08T10:00:00.000Z",
  "level"      : "INFO | WARN | ERROR",
  "route"      : "/api/v1/ai/summary",
  "user_id"    : "uuid | null",
  "request_id" : "uuid",
  "duration_ms": 3420,
  "status"     : 200,
  "message"    : "AI summary served from cache",
  "context"    : { "book_id": "uuid", "cached": true }
}
```

**Never log:** email addresses, avatar URLs, JWT tokens, Razorpay payment IDs, reading history content.

**Always log:** auth events (sign-in, sign-out, failed auth), rate limit hits (429s), webhook receipt + processing result, Gemini API errors with status code.

### 13.4 Alerting Strategy

> 📌 Assumption: v1 uses manual monitoring (Vercel dashboard, Supabase dashboard, PostHog). Automated alerting via Sentry + PagerDuty is a v1.1 item.

| Severity | Condition | Response | Channel |
|---|---|---|---|
| P0 | Supabase DB down / Vercel deploy failing | Immediate — check Supabase status + Vercel status | Founder Slack / phone |
| P1 | Gemini API returning 5xx consistently | Within 1 hour — disable `ai_summary_enabled` feature flag | Founder Slack |
| P2 | Razorpay webhook failures (payments not processing) | Within 4 hours — check webhook logs in Razorpay dashboard | Founder Slack |
| P3 | DB size > 400MB | Next business day — upgrade Supabase plan | Founder Slack |

---

## 14. Multi-Tenancy Design

Readmora is a **B2C consumer application** — not a B2B multi-tenant platform. There are no tenant organisations. Data isolation is between individual users, not companies.

**Isolation Model:** Shared database, shared schema with `user_id` column on every user-owned table. Supabase RLS enforces `auth.uid() = user_id` at the database layer — cross-user access is structurally impossible.

| Isolation Model | Chosen? | Reason |
|---|---|---|
| Shared DB, shared schema (user_id RLS) | ✅ Yes | Correct model for B2C — each user is their own "tenant"; RLS enforces isolation; simple ops |
| Shared DB, separate schema per tenant | ❌ No | Designed for B2B org isolation — overkill and wrong abstraction for individual users |
| Separate DB per tenant | ❌ No | Completely inappropriate for a consumer app with 10,000+ individual users |

**User Data Guarantees:**
- No API route using the anon or authenticated role can return another user's shelf entries, usage data, or profile
- Service role access is restricted to API routes only (never browser); used exclusively for rate limit writes and subscription updates
- Account deletion cascades all user-owned rows via FK `ON DELETE CASCADE`

---

## 15. Background Jobs & Async Processing

> 📌 Assumption: No message queue (Redis, RabbitMQ, etc.) is used in v1. All background processing is handled by Supabase `pg_cron` (for scheduled jobs) and Vercel serverless functions (for webhook-triggered work).

| Job Name | Trigger | Mechanism | Priority | Retry Policy | Idempotent? |
|---|---|---|---|---|---|
| Subscription Expiry Check | Daily cron (00:00 UTC) | Supabase `pg_cron` | High | 1x; alert on failure | ✅ Yes — checks `subscription_expires_at < NOW()` |
| Expiry Reminder Email | 3 days before expiry (cron) | `pg_cron` → Resend | Medium | 1x; log failure | ✅ Yes — check if reminder already sent |
| Payment Failure Email | `payment.failed` webhook | Razorpay → API route → Resend | High | Razorpay retries webhook 3× | ✅ Yes — Razorpay webhook idempotency key |
| Goodreads Import | User action (onboarding) | Client-side parse → API route batch upsert | Low | 0x (user retries manually) | ✅ Yes — `UNIQUE(user_id, book_id)` upsert |
| AI Summary Cache | First request per book | Inline in `/api/v1/ai/summary` | N/A | Failure = no cache write; next request retries | ✅ Yes — `UNIQUE(book_id)` on `ai_summaries` |

### Subscription Expiry Cron (Supabase pg_cron)

```sql
-- Run daily at 00:00 UTC
SELECT cron.schedule(
  'expire-subscriptions',
  '0 0 * * *',
  $$
    UPDATE profiles
    SET subscription_status = 'free'
    WHERE subscription_status = 'premium'
      AND subscription_expires_at < NOW();
  $$
);
```

---

## 16. Integration Architecture

| Integration | Type | Protocol | Auth Method | Failure Impact | Fallback |
|---|---|---|---|---|---|
| Supabase (Auth + DB + Storage) | Inbound/Outbound | HTTPS (REST + WebSocket) | Anon key (client), Service role key (server) | Critical — app unusable | Error page; Supabase status page |
| Gemini API | Outbound | HTTPS (REST) | `GEMINI_API_KEY` server env var | Medium — AI feature disabled | "Summary temporarily unavailable" toast; usage counter not decremented |
| Razorpay | Outbound (checkout) + Inbound (webhook) | HTTPS | `RAZORPAY_KEY_ID` (client), HMAC `RAZORPAY_WEBHOOK_SECRET` (server) | High — payments disabled | Show error; Razorpay status page; `premium_payments_enabled` flag |
| Open Library API | Outbound | HTTPS (REST) | None (public) | Low — book search disabled | "Search unavailable" message; existing shelf data unaffected |
| Resend | Outbound | HTTPS (REST) | `RESEND_API_KEY` server env var | Low — emails not sent | Log failure; no user-facing impact (email is supplementary) |
| PostHog | Outbound (client SDK) | HTTPS | `NEXT_PUBLIC_POSTHOG_KEY` | Low — analytics gaps | No user-facing impact; events simply not recorded |

**Timeout Policy:** All outbound API calls use a hard timeout:

| Integration | Timeout |
|---|---|
| Gemini API | 10s |
| Open Library API | 5s |
| Razorpay SDK | 10s |
| Resend API | 5s |

---

## 17. Decision Log (ADR Summary)

| # | Decision | Chosen Option | Rejected Options | Reason |
|---|---|---|---|---|
| 1 | Architecture pattern | Serverless Monolith (Next.js on Vercel) | Microservices, traditional server | 1–2 engineers; 8-week timeline; zero-ops imperative |
| 2 | Database | Supabase (Postgres 15 + RLS) | PlanetScale, Neon, self-hosted Postgres | Bundles auth + DB + storage; RLS is perfect for user isolation; free tier covers MVP |
| 3 | Auth strategy | Supabase Auth (JWT + refresh) | Auth0, Clerk, NextAuth.js | Already committed to Supabase; same SDK; no extra vendor |
| 4 | AI provider | Google Gemini 1.5 Flash | OpenAI GPT-4o, Anthropic Claude | Free tier (15 RPM) sufficient with caching; cost near-zero for MVP; quality high |
| 5 | Payment gateway | Razorpay | Stripe, Cashfree | India-first; UPI support; INR pricing; webhook SDK well-documented; lower fees in India |
| 6 | AI summary caching | Postgres `ai_summaries` table | Redis, in-memory, CDN | Global per-book cache; already have Postgres; no additional infrastructure; durable |
| 7 | Rate limiting | Server-side DB check (`ai_usage` table, service role) | Client-side, Redis, middleware-only | Only server-side is trustworthy; service role write prevents client bypass |
| 8 | Theme system | CSS custom properties on `<html>` via `data-vibe` | CSS-in-JS, Tailwind theme variants, JS class toggling | Zero JS bundle cost; instant switch (no rerender); SSR-safe; trivial to persist via profile |
| 9 | CSV parsing | PapaParse (client-side) | Server-side parsing, streaming | Privacy — reading history never transits to server as raw CSV; PapaParse is battle-tested |
| 10 | Message queue | None (v1) | Redis, BullMQ, Supabase Realtime | No sustained async workloads that require queue durability; pg_cron covers scheduled jobs |

---

## 18. Open Questions & Risks

### 18.1 Open Questions

| # | Question | Owner | Due Date |
|---|---|---|---|
| 1 | Final production domain confirmed (`readmora.app`)? | PM | Week 1 |
| 2 | Supabase SMTP or custom Resend domain for auth emails? | Engineering | Week 2 |
| 3 | Should "DNF" shelf be visible on a future public profile? | PM | Week 3 |
| 4 | Gemini safety filter behaviour for adult fiction genres — test required | Engineering | Week 2 |
| 5 | Razorpay KYC activation timeline — impacts `premium_payments_enabled` flag go-live | PM | Week 2 |
| 6 | Font finalisation: Lora (headings) + Inter (body) confirmed? | Design | Week 2 |
| 7 | PostHog self-host vs cloud at scale? | Engineering | Month 3 review |

### 18.2 Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Gemini free tier exhausted (15 RPM sustained) | Medium | High | Global summary caching dramatically reduces RPM; monitor via Gemini console; `ai_summary_enabled` kill-switch |
| Razorpay KYC delay blocks payments at launch | Low | High | Launch without payments enabled (`premium_payments_enabled = false`); soft-launch free tier only |
| Supabase free tier DB hits 500MB cap | Low | High | Monitor Supabase dashboard weekly; upgrade to Pro ($25/mo) at 300MB |
| Goodreads changes CSV export format | Low | Medium | Client-side parser; add format version detection; `goodreads_import_enabled` kill-switch |
| Vibe colour palettes fail WCAG 2.1 AA contrast | Medium | Medium | Audit all 5 palettes against 4.5:1 ratio before beta; Design owns this |
| Vercel function timeout on large Goodreads import (2,000 rows) | Low | Medium | Batch upsert in chunks of 200; client parses CSV and sends paginated requests |
| Open Library API rate limiting (no auth = IP-shared) | Low | Low | Cache book results in `books` table on first search; repeat searches hit DB |

---

## 19. Future Roadmap (Phase 2+)

| Phase | Feature / Change | Trigger |
|---|---|---|
| v1.1 | Sentry error tracking + alerting | Post-launch stability; replace console.error |
| v1.1 | Email: weekly reading digest | User engagement; retention metric |
| v2 | Reading groups / book clubs | Community feature request; DAU growth |
| v2 | AI reading recommendations (shelf + vibe → suggestions) | Core differentiator evolution; Gemini context window |
| v2 | Annual reading wrapped / stats report | Retention; viral sharing hook |
| v2 | Reading streaks + gamification | Engagement; DAU/MAU ratio improvement |
| v2 | Supabase Realtime (subscription status push) | Eliminate polling for post-payment UI update |
| v3 | Native iOS + Android apps (React Native) | Mobile-first user segment; > 50,000 MAU trigger |
| v3 | Redis session cache + hot query cache | If Supabase DB becomes query bottleneck at scale |
| v3 | Multi-region Supabase (read replicas in EU/US) | Global user base; latency SLA |
| v3 | Publisher / author partnerships | Monetisation diversification |

---

## 20. Glossary

| Term | Definition |
|---|---|
| HLD | High Level Design — system architecture without implementation detail |
| SLA | Service Level Agreement — contractual uptime commitment |
| SLO | Service Level Objective — internal target, stricter than SLA |
| RTO | Recovery Time Objective — maximum tolerable downtime after a failure |
| RPO | Recovery Point Objective — maximum tolerable data loss window |
| RLS | Row Level Security — Supabase/Postgres feature enforcing per-row access control via policies |
| JWT | JSON Web Token — signed token encoding user identity; issued by Supabase Auth |
| HMAC | Hash-based Message Authentication Code — used to verify Razorpay webhook signatures |
| ISR | Incremental Static Regeneration — Next.js feature that revalidates static pages at runtime |
| LCP | Largest Contentful Paint — Core Web Vitals metric for perceived page load speed |
| Vibe | A named colour palette applied globally via CSS custom properties to theme the entire UI |
| Shelf | A reading list category in Readmora: Want to Read / Currently Reading / Finished / DNF |
| DNF | Did Not Finish — shelf for books the user abandoned |
| AI Summary | A Gemini-generated book analysis covering themes, writing style, plot overview, and audience fit |
| Global Cache | The `ai_summaries` table — one AI summary per book, shared across all users |
| Free Tier | Default plan: 3 AI summaries per week; all other features unlimited |
| Premium | Paid subscription (₹149/month or ₹999/year): unlimited AI summaries |
| Week Reset | AI usage counter resets every Sunday 00:00 UTC (ISO week boundary) |
| service_role | Supabase role that bypasses RLS; used only in server-side API routes via `SUPABASE_SERVICE_ROLE_KEY` |
| Serverless Monolith | A single deployable application (Next.js) whose backend is composed of independently-invocable serverless functions rather than always-on processes |
| pg_cron | Postgres extension (enabled in Supabase) for scheduling SQL jobs as cron tasks |
| PKCE | Proof Key for Code Exchange — OAuth 2.0 security extension used by Supabase Auth for browser-based OAuth flows |
| WCAG | Web Content Accessibility Guidelines — international standard for web accessibility |
| PII | Personally Identifiable Information — data that can identify an individual (name, email, avatar) |

---

## 21. Changelog

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0.0 | 2026-04-08 | Platform Engineering | Initial draft — generated from PRD-readmora-v1_0 |
