# 📚 Readmora — Product Requirements Document

---

## 📋 SECTION 0 — DOCUMENT CONTROL

| Field | Value |
|---|---|
| **Document Version** | v1.0 |
| **Status** | Draft |
| **Author(s)** | [TBD — Owner: Founder/PM] |
| **Last Updated** | April 2026 |
| **Platform** | Web (Next.js 14) + Mobile-responsive |

### Reviewers & Approvers

| Name | Role | Sign-off Status |
|---|---|---|
| [TBD] | Engineering Lead | Pending |
| [TBD] | Design Lead | Pending |
| [TBD] | QA Lead | Pending |

### Change Log

| Version | Date | Author | Summary |
|---|---|---|---|
| v1.0 | Apr 2026 | [Founder] | Initial draft |

---

## 📌 SECTION 1 — OVERVIEW

### 1.1 Product Title
**Readmora** — *Your reading life, with personality.*

### 1.2 Executive Summary
Readmora is a personal book-tracking and discovery app that lets readers log what they're reading, get AI-powered book summaries via Gemini, and express their reading personality through curated colour vibe themes. It combines the social warmth of Goodreads with the visual identity of a lifestyle app, backed by Supabase (auth + DB), a Gemini AI integration with a rate-limited free tier, and Razorpay for premium subscriptions.

### 1.3 Background & Context
Goodreads — the dominant book tracking platform — has barely updated its UX since Amazon acquired it in 2013. Users are increasingly vocal about its poor UI, absence of modern features (AI summaries, vibe-based discovery), and lack of personality customisation. StoryGraph emerged as a modern alternative but still lacks AI-native features and visual personalisation. Readmora targets this gap: a modern, beautiful, AI-enhanced reading companion.

### 1.4 Problem Statement
Avid readers have no tool that simultaneously: (a) tracks their reading life beautifully, (b) provides instant AI-powered book summaries without external navigation, and (c) lets them personalise the aesthetic experience to match their mood and reading personality — all without a steep paywall.

### 1.5 Opportunity Statement
If Readmora ships successfully, readers get a single app for tracking, discovery, and AI-assisted understanding — reducing friction between "I want to read this" and "I understand this book." Premium subscriptions unlock unlimited AI usage, creating a clear monetisation path without alienating free users.

### 1.6 Strategic Alignment
- **OKR 1:** Reach 10,000 MAU within 6 months of launch
- **OKR 2:** Achieve 15% free-to-premium conversion within 12 months
- **OKR 3:** Maintain Gemini API costs under ₹15,000/month via rate limiting

---

## 🎯 SECTION 2 — GOALS, OBJECTIVES & SUCCESS METRICS

### 2.1 Business Goals
- Acquire 10,000 registered users within 6 months of public launch
- Convert 15% of MAU to paid (Premium) within Year 1
- Keep Gemini API cost-per-free-user under ₹2/month via 3-summary/week cap

### 2.2 Product Objectives
- Deliver a frictionless onboarding that gets users to a personalised feed in < 3 minutes
- Make AI book summaries feel native, not bolted-on
- Make colour vibe themes a viral, shareable identity feature
- Enable Goodreads migration to reduce switching cost to zero

### 2.3 Key Performance Indicators (KPIs)

| KPI | Target | Timeframe |
|---|---|---|
| Registered Users | 10,000 | Month 6 |
| DAU/MAU Ratio | ≥ 25% | Month 6 |
| AI Summary Usage (free) | ≤ 3/user/week | Ongoing |
| Premium Conversion Rate | ≥ 15% | Month 12 |
| Onboarding Completion Rate | ≥ 75% | Month 3 |
| Goodreads Import Completion | ≥ 40% of eligible users | Month 3 |
| p95 Interaction to Next Paint (INP) | < 200ms | Ongoing |
| p95 Page Load Time | < 2s | Ongoing |

### 2.4 Success Criteria
- User can sign up, complete onboarding, and see a personalised home feed in under 3 minutes
- AI book summary loads within 5 seconds for any book in catalogue
- Free user rate limit (3/week) enforced server-side with no bypass via client manipulation
- All 5 colour vibe themes render correctly across mobile and desktop
- Razorpay payment flow completes end-to-end in test and production

### 2.5 Anti-Goals
- **Not a social network.** No follow/feed/comment system in v1. Reading is personal first.
- **Not a full e-book reader.** No in-app reading of book content.
- **Not a book store.** No direct purchase integration in v1.
- **Not AI-generated book content.** Summaries are about the book, never reproduce copyrighted text.
- **Not multi-language.** English-only in v1.

---

## 🔭 SECTION 3 — SCOPE

### 3.1 In-Scope
- Web app (Next.js 14, App Router, mobile-responsive)
- Authentication: Google OAuth, Apple Sign-In, Email/Password (via Supabase Auth)
- Onboarding flow: username → avatar → genres → vibes → Goodreads import
- Book shelf management: Want to Read, Currently Reading, Finished, DNF
- AI Book Summaries (Gemini API) — free tier capped at 3/week, unlimited for Premium
- 5 Colour Vibe Themes (user-selectable, persisted to profile)
- Goodreads CSV import
- Razorpay payment integration (Premium subscription: monthly + annual)
- Supabase database with RLS-enforced multi-tenancy
- Basic search (book title, author)

### 3.2 Out-of-Scope (v1)
- Native iOS/Android apps (responsive web covers mobile in v1)
- Social features (follows, public feeds, reviews feed)
- AI-generated reading recommendations (v2)
- In-app reading / e-reader functionality
- Direct Amazon / bookstore purchase links
- Team/club reading features
- Multi-language support

### 3.3 Future Considerations (Parking Lot)
- Reading groups / book clubs (v2)
- AI reading recommendations based on shelf + vibe
- Publisher / author partnerships
- Reading streaks and gamification
- Native mobile apps (React Native)
- Annual reading wrapped / stats report

---

## 👥 SECTION 4 — USER PERSONAS & STAKEHOLDERS

### 4.1 Primary Personas

#### Persona 1: The Aesthetic Reader — "Priya"
- **Role:** College student / young professional
- **Goals:** Track reading, share aesthetic reading life on social media
- **Pain Points:** Goodreads is ugly; no way to express reading personality visually
- **Tech Proficiency:** High (uses Notion, Instagram, Spotify)
- **Frequency:** Daily (checks before bed or during commute)

#### Persona 2: The Avid Reader — "Arjun"
- **Role:** Software engineer, reads 30+ books/year
- **Goals:** Maintain reading history, get quick book summaries without spoilers
- **Pain Points:** Goodreads is slow; wants summaries that are analysis, not spoilers
- **Tech Proficiency:** High
- **Frequency:** 3-4x per week

#### Persona 3: The Casual Reader — "Meera"
- **Role:** Working professional, reads 5-10 books/year
- **Goals:** Remember what to read next, understand books she abandoned halfway
- **Pain Points:** Forgets books, can't remember why she stopped
- **Tech Proficiency:** Medium
- **Frequency:** Weekly

### 4.2 Secondary Personas
- **Admin:** Internal team managing feature flags, user reports, Gemini usage monitoring
- **Power User / Beta Tester:** Early adopters who help validate vibe themes and onboarding

### 4.3 Internal Stakeholders
| Name | Role | Interest |
|---|---|---|
| Founder/PM | Product strategy | All decisions |
| Lead Engineer | Architecture | Sections 6, 8, 9, 10 |
| Designer | UX/UI | Sections 4, 11, 12 |
| QA | Testing | Section 13 |

### 4.4 External Stakeholders
| Entity | Role |
|---|---|
| Supabase | Auth + DB provider |
| Google (Gemini) | AI API provider |
| Razorpay | Payment gateway |
| Goodreads | Source for CSV import data format |

### 4.5 RACI Matrix

| Activity | PM | Engineering | Design | QA |
|---|---|---|---|---|
| Feature prioritisation | A | C | C | I |
| DB schema design | C | A/R | I | I |
| UI/UX design | C | I | A/R | I |
| Supabase RLS policies | A | R | I | C |
| Razorpay integration | A | R | I | C |
| Gemini rate limit logic | A | R | I | R |
| QA sign-off | I | C | I | A/R |

---

## ⚙️ SECTION 5 — FUNCTIONAL REQUIREMENTS

### 5.1 Feature List (MoSCoW)

| Feature | Priority |
|---|---|
| Supabase Auth (Google/Apple/Email) | Must Have |
| Onboarding flow (5 steps) | Must Have |
| Book shelf (Want/Reading/Finished/DNF) | Must Have |
| AI Book Summary (Gemini, rate-limited) | Must Have |
| Colour Vibe Themes (5 palettes) | Must Have |
| Goodreads CSV Import | Must Have |
| Razorpay Premium Subscription | Must Have |
| Book search | Must Have |
| AI usage counter + paywall prompt | Must Have |
| Avatar upload | Should Have |
| Personalised home feed | Should Have |
| Reading stats (books/year, genres) | Could Have |
| Public profile page | Won't Have (v1) |

---

### 5.2 Feature Descriptions

#### FR-001: Authentication (Supabase Auth)
- **Description:** Users sign in via Google OAuth, Apple Sign-In, or Email+Password. All auth handled by Supabase Auth SDK.
- **Business Rationale:** Frictionless sign-up reduces drop-off. Social login preferred by target demographic.
- **Inputs:** Provider token (OAuth) or email + password
- **Outputs:** Supabase session (JWT), user row created in `profiles` table via trigger
- **Business Rules:**
  - On first sign-in, trigger creates `profiles` row with `onboarding_complete = false`
  - Email must be verified before accessing the app (email flow only)
- **Edge Cases:**
  - Duplicate email across providers → merge accounts (Supabase handles via `identities` table)
  - Apple hides email → store Apple-provided relay email
- **Error Handling:** Generic "Sign-in failed, please try again" toast. Log specific error server-side.

---

#### FR-002: Onboarding Flow (5 Steps)
- **Description:** First-time users are guided through a 5-step onboarding before landing on the home feed.
- **Steps:**
  1. **Username + Avatar** — Text input for username (alphanumeric, 3–20 chars, unique). Optional avatar upload (max 2MB, JPEG/PNG/WebP). Stored in Supabase Storage.
  2. **Genre Selection** — Chip/tag UI. User picks ≥ 5 from a predefined list of 20 genres (Fantasy, Romance, Thriller, Sci-Fi, Non-Fiction, Self-Help, History, Mystery, Literary Fiction, Horror, Graphic Novel, Poetry, Biography, Business, Philosophy, Science, Travel, Crime, Young Adult, Children's).
  3. **Vibe Selection** — User picks exactly 3 keywords from: Dark Academia, Cosy, Thriller, Romance, Botanical, Harvest, Periwinkle Dream, Sakura to personalize discovery. They then choose **one active Vibe Theme** (see FR-006) for the UI. Selecting a theme sets it as a persistent preference.
  4. **Goodreads Import (Optional)** — CSV file upload. Parsed client-side, books mapped to internal schema. Skip option available.
  5. **Complete** — `onboarding_complete = true` written to `profiles`. Redirect to home feed.
- **Business Rules:**
  - Steps 1–3 are required. Steps 4–5 are skippable.
  - Username uniqueness validated in real-time (debounced 500ms) against `profiles` table.
  - Progress is persisted — if user drops off mid-onboarding, they resume where they left off.
- **Edge Cases:**
  - Invalid CSV format → show error with sample CSV link
  - Avatar upload failure → allow skip, show warning
  - Username taken → inline error, suggest alternatives

---

#### FR-003: Book Shelf Management
- **Description:** Core feature. Users maintain 4 shelves: Want to Read, Currently Reading, Finished, Did Not Finish (DNF).
- **Inputs:** Book (from search or import), shelf selection, optional: start date, finish date, rating (1–5 stars), notes
- **Outputs:** Shelf entry stored in `shelf_entries` table; home feed updated
- **Business Rules:**
  - A book can only be on one shelf at a time. Moving shelves updates existing row.
  - `finished_at` is auto-populated when moved to "Finished" shelf.
  - Rating is optional. Only books on "Finished" shelf can be rated.
- **Edge Cases:**
  - Duplicate book add → update existing shelf entry, show "Already on shelf" toast
  - Book not in database → allow manual entry (title, author, cover URL)

---

#### FR-004: AI Book Summary (Gemini API)
- **Description:** Users can request an AI-generated summary/analysis of any book on their shelf or any searched book.
- **Business Rationale:** Core differentiator. Reduces the need to open multiple tabs. Summaries are analytical (themes, characters, writing style) — never reproduce book text.
- **Rate Limiting:**
  - **Free users:** 3 AI summaries per week (Monday 00:00 UTC rese - ISO-8601)
  - **Premium users:** Unlimited
  - Counter stored in `ai_usage` table with `week_start` (ISO week)
- **Inputs:** `book_id`, `user_id`
- **Outputs:** AI-generated markdown text (themes, plot overview [non-spoiler], writing style, why you'd love it)
- **Business Rules:**
  - Rate limit is enforced **server-side** in the API route (never trust client)
  - If free user has exhausted 3/week, return `HTTP 429` with paywall modal trigger
  - Summaries are cached in `ai_summaries` table (keyed by `book_id`) — same book hit by 1000 users = 1 Gemini API call, not 1000
  - Summary is generated once per book globally and reused. Only the first requestor triggers the API call.
  - User's per-week counter increments only when a **new** (uncached) summary is generated OR when they request a summary for the first time (cached or not — reading is still a "use")
- **Gemini Prompt Template:**
```
You are a literary analyst. Provide a structured book summary and analysis for "{book_title}" by "{author}". Include:
1. A brief non-spoiler plot overview (3-4 sentences)
2. Core themes
3. Writing style and tone
4. Who would love this book (reader profile)
5. One memorable quote (publicly available, no copyright concern)
Do NOT reproduce any significant portion of the book text.
```
- **Edge Cases:**
  - Gemini API timeout (>10s) → return error toast, do NOT decrement usage counter
  - Book not in Gemini's knowledge → return "Summary not available for this title yet"
  - Explicit/adult content books → Gemini safety filters applied; fallback message shown

---

#### FR-005: Goodreads CSV Import
- **Description:** Users upload a Goodreads export CSV. Books are parsed and added to the appropriate shelf.
- **Goodreads CSV Column Mapping:**

| Goodreads Column | Readmora Field |
|---|---|
| Title | `book.title` |
| Author | `book.author` |
| ISBN | `book.isbn` |
| My Rating | `shelf_entry.rating` |
| Exclusive Shelf | `shelf_entry.shelf` (read→Finished, to-read→Want to Read, currently-reading→Currently Reading) |
| Date Read | `shelf_entry.finished_at` |

- **Business Rules:**
  - CSV parsed client-side using PapaParse. No raw CSV stored server-side.
  - Books matched to internal DB by ISBN first, then title+author fuzzy match.
  - Unmatched books are added as manual entries.
  - Max import: 2,000 books. Excess rows ignored with warning.
- **Edge Cases:**
  - Malformed CSV → show row-level errors, allow partial import
  - Duplicate books (already on shelf) → skip with count in summary modal

---

#### FR-006: Colour Vibe Themes
- **Description:** Users choose a colour vibe that transforms the entire app's visual theme. Vibe is persisted in `profiles.vibe_preference` and applied globally.
- **Available Vibes & Palettes:**

| Vibe Name | Background | Primary | Secondary | Accent | Muted |
|---|---|---|---|---|---|
| **Winter Frost** | #F8CCAA (Dawn) | #525871 (Concrete) | #857C91 (Warm Steel) | #CD9FA0 (Rosewood) | #F2C1A3 (Peaches & Cream) |
| **Sakura** | #F2CF2A (Misty Rose) | #443025 (Dark Chocolate) | #7F5836 (Aloewood) | #EC9C9D (Sakura) | #AA7F66 (Milk Tea) |
| **Botanical** | #DEC59E (Brandy) | #202808 (Pine Tree) | #33432B (Kombu Green) | #C4866D (Pale Copper) | #6A784D (Dingley) |
| **Wildflower** | #E8ECF8 (Frosted Pearl) | #A2A6F2 (Periwinkle Dream) | #B6B9F2 (Lilac Sky) | #F28627 (Tangerine Glow) | #F2AE2E (Golden Honey) |
| **Harvest** | #F5EDD6 (Cream) | #C64632 (Tomato) | #9DA33C (Pear) | #8E9B7B (Sage) | #F2C599 (Honey) |

- **Implementation:** CSS custom properties (`--color-bg`, `--color-primary`, etc.) set via `data-vibe` attribute on `<html>`. Theme switching is instant (no reload).
- **Business Rules:**
  - Default vibe = Wildflower (neutral, accessible)
  - Vibe selected during onboarding Step 3 is applied immediately
  - Vibe can be changed anytime from Settings
  - Vibe preference persisted to `profiles.vibe_preference` (synced across devices)

---

#### FR-007: Razorpay Premium Subscription
- **Description:** Free users can upgrade to Premium via Razorpay. Premium unlocks unlimited AI summaries.
- **Plans:**

| Plan | Price | Billing | Features |
|---|---|---|---|
| Free | ₹0 | — | 3 AI summaries/week, all shelves, all vibes |
| Premium Monthly | ₹149/month | Monthly | Unlimited AI summaries, priority support |
| Premium Annual | ₹999/year | Annual | Unlimited AI summaries, priority support, 44% savings |

- **Flow:**
  1. User clicks "Upgrade to Premium" (triggered by paywall or settings)
  2. Razorpay Checkout modal opens (prefilled with name, email from profile)
  3. On `payment.captured` webhook → update `profiles.subscription_status = 'premium'`, `subscription_expires_at = NOW() + interval`
  4. On expiry → downgrade to free automatically via cron job
- **Business Rules:**
  - Subscription status checked server-side on every AI summary request
  - Razorpay webhook signature must be verified using `RAZORPAY_WEBHOOK_SECRET`
  - Failed payments → notify user via email, 3-day grace period before downgrade
- **Edge Cases:**
  - Payment captured but webhook delayed → show "Payment processing" state, poll `/api/subscription/status` every 5s for 60s
  - Refund requested → manual process; set `subscription_status = 'free'` immediately

---

#### FR-008: Book Metadata & Cover Image Strategy

### Description
Readmora fetches book metadata and cover images from a free, public API (Open Library). This ensures zero cost for book data while maintaining broad global coverage.

### Metadata Source
- **Primary Source:** Open Library Search API  
  https://openlibrary.org/search.json
- **Search Fields:**
  - Title
  - Author
  - ISBN (preferred match)

### Cover Image Source
- **Primary Source:** Open Library Covers API  
  https://covers.openlibrary.org/

- **Usage:**
  - ISBN-based: https://covers.openlibrary.org/b/isbn/{ISBN}-M.jpg
  - Cover ID-based: https://covers.openlibrary.org/b/id/{COVER_ID}-M.jpg

- **Supported Sizes:**
- `S` → Small (thumbnail)
- `M` → Medium (card view)
- `L` → Large (detail page)

### Fallback Strategy (Critical)
If a cover image is not available:

1. Attempt fetch via ISBN (Open Library)
2. Attempt fetch via Google Books API (Secondary Source)
3. Attempt fetch via Open Library Cover ID
4. Use stored `cover_url` (if previously cached)
5. Fallback to **default placeholder image**

### Placeholder Image
- A default book cover placeholder is used when no image is available
- Styled according to current "vibe theme"

### Business Rules
- Cover images are **not uploaded by default** — only referenced via URL
- Manual book entries may include a custom `cover_url`
- Cover must maintain **2:3 aspect ratio** across UI
- Broken images must auto-replace with placeholder (client-side fallback)

### Edge Cases
- Missing ISBN → fallback to title+author match
- Duplicate books → reuse existing metadata entry
- Slow API response → show skeleton loader
- Invalid image URL → fallback to placeholder

### User Experience Notes
- Book covers are treated as a **core visual element**
- UI should never show broken or empty image states
- Loading state should feel smooth and intentional

---

### 5.3 Admin / Back-office Requirements
- Internal dashboard (Supabase Studio sufficient for v1):
  - View all users, subscription status, AI usage per week
  - Manually override subscription status
  - View Gemini API usage by day
  - Feature flag management (Supabase `feature_flags` table)

### 5.4 Notification & Communication Requirements
- Transactional emails via [TBD — Resend recommended]:
  - Email verification (Supabase built-in)
  - Payment confirmation (Razorpay webhook → Resend)
  - Subscription expiry reminder (3 days before)
  - Weekly reading digest (Could Have — v2)

### 5.5 Reporting & Analytics Requirements
- Plausible or PostHog (privacy-first):
  - Onboarding funnel completion by step
  - Vibe theme distribution across user base
  - AI summary usage (free vs premium)
  - Shelf add events (which books are most added)

---

## 🏗️ SECTION 6 — SYSTEM ARCHITECTURE & TECHNICAL DESIGN

### 6.1 High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                  Client (Browser)                │
│  Next.js 14 App Router  |  Tailwind CSS          │
│  Supabase JS Client     |  Vibe Theme System      │
└─────────────────┬───────────────────────────────┘
                  │ HTTPS
┌─────────────────▼───────────────────────────────┐
│              Next.js API Routes                  │
│  /api/ai/summary  (rate-limit enforced)          │
│  /api/webhooks/razorpay                          │
│  /api/books/search                               │
│  /api/subscription/status                        │
└────────┬──────────────────┬─────────────────────┘
         │                  │
┌────────▼───────┐  ┌───────▼──────────────────┐
│  Supabase DB   │  │    External APIs          │
│  (Postgres)    │  │  Gemini (google ai sdk)   │
│  Supabase Auth │  │  Razorpay SDK             │
│  Supabase      │  │  Open Library / Google    │
│  Storage       │  │  Books API (book data)    │
└────────────────┘  └──────────────────────────┘
```

### 6.2 System Components

| Component | Responsibility |
|---|---|
| Next.js Frontend | UI rendering, routing, theme system, client-side CSV parsing |
| Next.js API Routes | AI summary rate-limiting, Razorpay webhook, book search proxy |
| Supabase Auth | JWT issuance, OAuth provider management, session refresh |
| Supabase DB (Postgres) | All persistent data, RLS enforcement |
| Supabase Storage | User avatar images |
| Gemini API | AI book summary generation |
| Razorpay | Payment processing, subscription management |
| Open Library / Google Books API | Book metadata (title, author, ISBN, cover) |

### 6.3 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 19, Tailwind CSS 4 |
| Auth | Supabase Auth (Google, Apple, Email) |
| Database | Supabase (Postgres 15) |
| Storage | Supabase Storage |
| AI | Google Gemini 1.5 Flash (free tier) |
| Payments | Razorpay |
| Email | Resend (transactional) |
| Book Data | Open Library API (free, no key needed) |
| Hosting | Vercel (Next.js optimised) |
| Analytics | PostHog (free tier) |
| CSV Parsing | PapaParse (client-side) |

### 6.4 Data Flow — AI Summary

```
User clicks "Get AI Summary"
        │
        ▼
Client sends POST /api/ai/summary { book_id }
        │
        ▼
API Route: authenticate user (validate JWT)
        │
        ▼
Check ai_summaries table: cached?
  ├── YES → return cached summary
  │         increment user's usage counter
  │
  └── NO  → check user's weekly usage (ai_usage table)
              ├── Free user ≥ 3 → return 429 + paywall flag
              └── Under limit → call Gemini API
                                store result in ai_summaries
                                increment usage counter
                                return summary to client
```

### 6.5 Key Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Rate limit enforcement | Server-side API route only | Client can be bypassed; RLS alone isn't enough for API calls |
| AI summary caching | Cached globally by `book_id` | Prevents redundant Gemini calls; same book = same summary |
| Theme system | CSS custom properties via `data-vibe` on `<html>` | No JS bundle cost; instant switch; SSR-safe |
| CSV parsing | PapaParse client-side | No server storage of raw PII (reading history) |
| Subscription status | `profiles.subscription_status` column | Simple; Razorpay webhook updates it; cron job expires it |

### 6.6 Build vs Buy vs Integrate

| Component | Decision | Reason |
|---|---|---|
| Auth | Integrate (Supabase Auth) | OAuth complexity is solved; not worth building |
| AI Summaries | Integrate (Gemini) | Free tier sufficient; quality high |
| Payments | Integrate (Razorpay) | India-first, UPI support, easy webhooks |
| Book Database | Integrate (Open Library) | Free, extensive, ISBN-based |
| Email | Integrate (Resend) | Simple API, generous free tier |

---

## 💾 SECTION 7 — DATA REQUIREMENTS

### 7.1 Supabase Schema & RLS Policies

#### Table: `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  genre_preferences TEXT[] DEFAULT '{}',
  vibe_preference TEXT DEFAULT 'wildflower',
  onboarding_complete BOOLEAN DEFAULT false,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium')),
  subscription_expires_at TIMESTAMPTZ,
  razorpay_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

#### Table: `books`
```sql
CREATE TABLE books (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  author           TEXT NOT NULL,
  isbn             TEXT UNIQUE,
  cover_url        TEXT,
  description      TEXT,
  published_year   INT,
  genres           TEXT[]   DEFAULT '{}',
  openlibrary_id   TEXT UNIQUE,
  cover_source     TEXT DEFAULT 'open_library',
  cover_id         TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Public read, no write from client (seeded + added via server)
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Books are publicly readable"
  ON books FOR SELECT
  USING (true);
```

---

#### Table: `shelf_entries`
```sql
CREATE TABLE shelf_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id),
  shelf TEXT NOT NULL CHECK (shelf IN ('want_to_read', 'currently_reading', 'finished', 'dnf')),
  rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
  notes TEXT,
  started_at DATE,
  finished_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

ALTER TABLE shelf_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own shelf entries"
  ON shelf_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

#### Table: `ai_summaries` (Global Cache)
```sql
CREATE TABLE ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL UNIQUE REFERENCES books(id),
  summary_markdown TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  model_version TEXT DEFAULT 'gemini-1.5-flash'
);

ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AI summaries are publicly readable"
  ON ai_summaries FOR SELECT
  USING (true);

-- Only service role can insert/update
CREATE POLICY "Service role manages summaries"
  ON ai_summaries FOR ALL
  USING (auth.role() = 'service_role');
```

---

#### Table: `ai_usage` (Rate Limiting)
```sql
CREATE TABLE ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL, -- ISO week start (Monday)
  usage_count SMALLINT DEFAULT 0,
  UNIQUE(user_id, week_start)
);

ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage"
  ON ai_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Only server-side (service role) can increment
CREATE POLICY "Service role manages usage"
  ON ai_usage FOR ALL
  USING (auth.role() = 'service_role');
```

**Rate Limit Logic (Server-side):**
```typescript
// /api/ai/summary/route.ts
const FREE_LIMIT = 3;
const weekStart = getISOWeekStart(new Date()); // Monday 00:00 UTC (ISO-8601)

const { data: usage } = await supabaseAdmin
  .from('ai_usage')
  .select('usage_count')
  .eq('user_id', userId)
  .eq('week_start', weekStart)
  .single();

if (!isPremium && (usage?.usage_count ?? 0) >= FREE_LIMIT) {
  return NextResponse.json(
    { error: 'RATE_LIMIT_EXCEEDED', upgradeRequired: true },
    { status: 429 }
  );
}

// ... call Gemini, cache result ...

// Upsert usage counter
await supabaseAdmin
  .from('ai_usage')
  .upsert({
    user_id: userId,
    week_start: weekStart,
    usage_count: (usage?.usage_count ?? 0) + 1
  }, { onConflict: 'user_id,week_start' });
```

---

#### Table: `vibes`
```sql
-- Lookup table for vibe metadata (seeded)
CREATE TABLE vibes (
  id TEXT PRIMARY KEY, -- e.g., 'winter_frost'
  display_name TEXT NOT NULL,
  color_bg TEXT NOT NULL,
  color_primary TEXT NOT NULL,
  color_secondary TEXT NOT NULL,
  color_accent TEXT NOT NULL,
  color_muted TEXT NOT NULL
);

-- Public readable
ALTER TABLE vibes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vibes are public" ON vibes FOR SELECT USING (true);
```

**Seed Data:**
```sql
INSERT INTO vibes VALUES
('winter_frost', 'Winter Frost', '#F8CCAA', '#525871', '#857C91', '#CD9FA0', '#F2C1A3'),
('sakura', 'Sakura', '#F2CF2A', '#443025', '#7F5836', '#EC9C9D', '#AA7F66'),
('botanical', 'Botanical', '#DEC59E', '#202808', '#33432B', '#C4866D', '#6A784D'),
('wildflower', 'Wildflower', '#E8ECF8', '#A2A6F2', '#B6B9F2', '#F28627', '#F2AE2E'),
('harvest', 'Harvest', '#F5EDD6', '#C64632', '#9DA33C', '#8E9B7B', '#F2C599');
```

---

#### Table: `subscriptions` (Audit Log)
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  razorpay_payment_id TEXT,
  razorpay_subscription_id TEXT,
  plan TEXT NOT NULL CHECK (plan IN ('monthly', 'annual')),
  amount_paise INT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own subscriptions"
  ON subscriptions FOR SELECT USING (auth.uid() = user_id);
```

### 7.2 Data Sources & Ownership
| Data | Source | Owner |
|---|---|---|
| User profiles | User input + Supabase Auth | User |
| Book metadata | Open Library API (seeded/cached) | Open Library |
| AI summaries | Gemini API | Readmora (generated) |
| Shelf entries | User input | User |
| Payment records | Razorpay webhooks | Readmora |

### 7.3 Data Retention
- User data: Retained until account deletion. On deletion, all `shelf_entries`, `ai_usage`, `profiles` rows are cascade-deleted.
- AI summaries: Retained indefinitely (global cache, not user-specific)
- Payment records: 7 years (legal/tax requirement)

### 7.4 Data Privacy Classification
| Table | Classification |
|---|---|
| `profiles` | PII (name, email, avatar) |
| `shelf_entries` | Personal (reading history) |
| `ai_usage` | Personal |
| `subscriptions` | Financial (PII-adjacent) |
| `books`, `vibes`, `ai_summaries` | Public |

---

## 🔌 SECTION 8 — API & INTEGRATION REQUIREMENTS

### 8.1 Internal API Routes

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/ai/summary` | POST | Required | Get AI book summary (rate-limited) |
| `/api/books/search` | GET | Optional | Search books via Open Library |
| `/api/subscription/status` | GET | Required | Check current subscription |
| `/api/webhooks/razorpay` | POST | Signature verify | Handle payment events |
| `/api/onboarding/complete` | POST | Required | Mark onboarding done |
| `/api/import/goodreads` | POST | Required | Process Goodreads CSV data |

### 8.2 External Integrations

| Vendor | Purpose | Auth Method |
|---|---|---|
| Supabase | Auth + DB + Storage | Anon key (client), Service role key (server) |
| Gemini API | AI book summaries | `GEMINI_API_KEY` env var (server only) |
| Razorpay | Payments | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` |
| Open Library | Book search & metadata | No auth (public API) |
| Resend | Transactional email | `RESEND_API_KEY` |

### 8.3 API Design Principles
- REST over Next.js API routes (no GraphQL in v1 — unnecessary complexity)
- All authenticated routes validate Supabase JWT via `createServerClient`
- API responses: `{ data, error }` envelope
- Versioning: URL-based (`/api/v1/...`) from day one

### 8.4 Razorpay Webhook Verification
```typescript
// /api/webhooks/razorpay/route.ts
import crypto from 'crypto';

const signature = req.headers.get('x-razorpay-signature');
const body = await req.text();
const expected = crypto
  .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
  .update(body)
  .digest('hex');

if (signature !== expected) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
}
```

### 8.5 Webhook Events to Handle

| Event | Action |
|---|---|
| `payment.captured` | Set `subscription_status = 'premium'`, set `subscription_expires_at` |
| `payment.failed` | Send failure email, keep status unchanged |
| `subscription.cancelled` | Set expiry, send notification |
| `subscription.charged` | Extend `subscription_expires_at` |

---

## 🚀 SECTION 9 — NON-FUNCTIONAL REQUIREMENTS

### 9.1 Performance
| Metric | Target |
|---|---|
| Home feed initial load (LCP) | < 2.5s on 4G |
| Shelf add action | < 500ms response |
| AI summary load | < 8s (fresh), < 1s (cached) |
| Search results | < 1s |
| Vibe theme switch | < 100ms (CSS only) |

### 9.2 Scalability
- Supabase free tier: 500MB DB, 1GB storage — sufficient for first 5,000 users
- Scale to Supabase Pro ($25/month) at ~3,000 MAU
- Gemini free tier: 15 RPM, 1M TPM — sufficient with caching for ~10,000 free users at 3/week
- Vercel handles auto-scaling for Next.js

### 9.3 Availability & Reliability
- Target uptime: 99.5% (Vercel + Supabase combined SLAs)
- RTO: < 1 hour (Vercel redeploy)
- RPO: < 24 hours (Supabase daily backups on Pro)

### 9.4 Maintainability
- TypeScript strict mode throughout
- ESLint + Prettier enforced in CI
- All API routes have error logging (console.error at minimum; Sentry in v1.1)
- Env vars documented in `.env.example`

### 9.5 Compatibility
- Browsers: Chrome 120+, Firefox 120+, Safari 17+, Edge 120+
- Mobile: iOS Safari 17+, Android Chrome 120+
- Minimum viewport: 320px width

### 9.6 Accessibility
- WCAG 2.1 AA minimum
- All vibe colour palettes must pass 4.5:1 contrast ratio for text
- Keyboard navigable onboarding flow
- Screen reader compatible (ARIA labels on icon-only buttons)

---

## 🔐 SECTION 10 — SECURITY & COMPLIANCE

### 10.1 Authentication & Authorization
- Supabase Auth handles session management (JWTs, refresh tokens)
- RLS enforces row-level data isolation — no user can read another's shelf or usage data
- Service role key NEVER exposed to client. Only used in Next.js API routes (server-side)
- `GEMINI_API_KEY` and `RAZORPAY_KEY_SECRET` are server-only env vars

### 10.2 Encryption
- All data in transit: TLS 1.3 (enforced by Vercel + Supabase)
- Data at rest: AES-256 (Supabase default)
- Avatars in Supabase Storage: private bucket with signed URLs

### 10.3 Threat Model
| Threat | Mitigation |
|---|---|
| AI rate limit bypass | Server-side check + service role DB write (client cannot bypass) |
| Razorpay webhook spoofing | HMAC signature verification on every webhook |
| Unauthorized shelf access | RLS policies — Supabase rejects queries without matching `auth.uid()` |
| API key exposure | Env vars server-only; no client-side Gemini calls |
| CSV injection | PapaParse sanitises input; no server execution of CSV data |

### 10.4 Audit Logging
- All payment events logged in `subscriptions` table with Razorpay IDs
- AI summary requests not individually logged (usage count only, for privacy)
- Auth events logged by Supabase Auth automatically

### 10.5 Compliance
- **GDPR:** Account deletion cascades all user data. "Delete My Account" feature required in v1.
- **IT Act (India):** Privacy policy and ToS required before launch.
- **Razorpay:** PCI-DSS compliance handled by Razorpay (we never store card data)

---

## 📖 SECTION 11 — USER STORIES & USE CASES

### 11.1 Happy Path Use Cases

| Story ID | Story | Acceptance Criteria | Priority | Feature |
|---|---|---|---|---|
| US-001 | As a new user, I want to sign up with Google so I can get started instantly | Given I click "Continue with Google", When I authorise, Then I land on Step 1 of onboarding | Must Have | FR-001 |
| US-002 | As a new user, I want to pick my reading vibes so the app feels like mine | Given I'm on Step 3, When I select 3 vibes, Then the app theme updates live as I select | Must Have | FR-006 |
| US-003 | As a reader, I want to add a book to "Currently Reading" so I can track my progress | Given I search for a book, When I click "Currently Reading", Then it appears on my shelf | Must Have | FR-003 |
| US-004 | As a free user, I want an AI summary of a book so I understand it better | Given I have < 3 summaries used this week, When I click "Get AI Summary", Then I see a formatted summary in < 8s | Must Have | FR-004 |
| US-005 | As a free user who hits the limit, I want to see a clear upgrade prompt | Given I've used 3 summaries this week, When I click "Get AI Summary", Then I see a paywall modal with upgrade options | Must Have | FR-004, FR-007 |
| US-006 | As a Goodreads user, I want to import my books so I don't start from scratch | Given I'm on Step 4, When I upload my CSV, Then my books appear on the correct shelves | Must Have | FR-005 |
| US-007 | As a Premium user, I want unlimited AI summaries so I can use the feature freely | Given I'm Premium, When I request a summary, Then no rate limit is applied | Must Have | FR-004, FR-007 |

### 11.2 Alternate / Edge Case Flows
- **US-008:** As a user who abandons onboarding on Step 2, when I return, I resume from Step 2 (not Step 1)
- **US-009:** As a user who tries a username already taken, I see an inline error with 3 suggestions appended with numbers

### 11.3 Error & Failure Scenarios
- **US-010:** As a user whose payment fails, I receive an email within 5 minutes and stay on Free tier
- **US-011:** As a user requesting a summary when Gemini is down, I see "Summary temporarily unavailable" — my usage counter is NOT decremented

---

## 🎨 SECTION 12 — UX / UI REQUIREMENTS

### 12.1 Design Principles
- **Vibe-first:** The colour theme should feel alive and personal, not just a skin
- **Calm productivity:** No dark patterns, no notification spam, no engagement manipulation
- **Mobile-first:** Most users will primarily use on phone
- **Typography-led:** Books are about words. Typography must be intentional and beautiful.

### 12.2 Key Screens & User Journeys

1. **Landing Page** → Sign-up CTA + vibe preview animation
2. **Onboarding Step 1:** Username + Avatar (clean, centred card)
3. **Onboarding Step 2:** Genre Chips (scrollable grid, 20 chips, ≥5 required)
4. **Onboarding Step 3:** Vibe Picker (5 large cards showing colour swatches + name, live preview of theme change as user hovers/taps)
5. **Onboarding Step 4:** Goodreads Import (drag-and-drop or file picker, skip button prominent)
6. **Home Feed:** Currently Reading prominent card + Want to Read shelf list + Discover section
7. **Book Detail Page:** Cover, metadata, shelf selector, AI Summary section (with usage counter badge for free users)
8. **Settings:** Vibe picker, account settings, subscription management, delete account

### 12.3 Responsive Breakpoints
| Breakpoint | Behaviour |
|---|---|
| < 640px (Mobile) | Single column, bottom nav bar |
| 640–1024px (Tablet) | Two-column shelf grid |
| > 1024px (Desktop) | Sidebar nav + three-column layout |

### 12.4 Accessibility Requirements
- All interactive elements have visible focus rings
- Colour vibe palettes validated for 4.5:1 contrast minimum on primary text
- Alt text on all book covers
- Onboarding steps announced via ARIA live regions

### 12.5 Design System
- Tailwind CSS 4 utility classes
- Custom CSS properties for vibe colours (`--color-bg`, `--color-primary`, `--color-secondary`, `--color-accent`, `--color-muted`)
- Font: [TBD — suggest: Lora (serif, headings) + Inter (sans, body)]
- All vibe-switchable components use `var(--color-*)` exclusively — no hardcoded hex in component CSS

---

## ✅ SECTION 13 — ACCEPTANCE CRITERIA & QA REQUIREMENTS

### 13.1 Product-Level Acceptance Criteria
- All 5 onboarding steps completable end-to-end in a single session
- AI summary rate limit enforced: impossible to get 4th summary in same week as free user (server-validated)
- Razorpay payment → subscription upgrade reflected in UI within 60 seconds
- All 5 vibe themes render without broken colours on Chrome, Firefox, Safari

### 13.2 Feature-Level Acceptance Criteria (linked to FR-IDs)

| FR-ID | Acceptance Criteria |
|---|---|
| FR-001 | Google/Apple/Email signup creates a `profiles` row; email auth requires verification |
| FR-002 | Username uniqueness checked in real-time; onboarding state persisted on refresh |
| FR-003 | Book can only exist on one shelf at a time; moving shelves updates existing row |
| FR-004 | Free user blocked at 3rd+1 request with 429; Gemini not called when cached; counter not decremented on API error |
| FR-005 | CSV with 1,000 rows imports within 30 seconds; malformed rows shown with count |
| FR-006 | Theme switches without page reload; persisted across login sessions |
| FR-007 | Webhook signature verified; failed verification returns 401; subscription expires automatically |

### 13.3 Testing Requirements

| Type | Target |
|---|---|
| Unit test coverage | ≥ 80% on API route logic (rate limiting, webhook verification) |
| Integration tests | Supabase RLS policies (each policy tested with correct/incorrect user context) |
| E2E tests (Playwright) | Full onboarding flow, AI summary (mocked Gemini), Razorpay (test mode) |
| Performance tests | p95 AI summary < 8s under 50 concurrent users |
| Security tests | Verify free user cannot bypass rate limit via any client manipulation |

---

## 🔗 SECTION 14 — DEPENDENCIES

### 14.1 Internal
- Supabase project provisioned with Auth, Storage, DB
- Vercel project linked to Git repo

### 14.2 External
- Razorpay account with test keys available (activation needed for production)
- Gemini API key (Google AI Studio — free tier)
- Resend account for transactional email
- Open Library API (no sign-up needed)

### 14.3 Blocking Dependencies
- Razorpay KYC/activation required before accepting real payments
- Gemini API key must be obtained and added to env vars before AI feature can be tested

---

## ⚠️ SECTION 15 — RISKS, ASSUMPTIONS & CONSTRAINTS

### 15.1 Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|
| Gemini API free tier exhausted | Medium | High | Global summary caching; monitor usage/day | Engineering |
| Razorpay KYC delay blocks payments | Low | High | Start KYC process immediately; soft launch without payments | PM |
| Goodreads changes CSV format | Low | Medium | Validate against current format; add format version detection | Engineering |
| Vibe colour contrast fails WCAG | Medium | Medium | Audit all 5 palettes before launch | Design |
| Supabase free tier DB size limit | Low | High | Monitor growth; upgrade to Pro at 300MB | Engineering |

### 15.2 Key Assumptions
- Gemini 1.5 Flash free tier (15 RPM) is sufficient for v1 launch with caching
- Razorpay supports monthly and annual subscription plans (it does)
- Open Library API covers 90%+ of books users will search for

### 15.3 Known Constraints
- Team size: Small (1-2 engineers)
- Budget: Minimal (free tiers for all services until revenue)
- Timeline: 8-week MVP target

### 15.4 Open Questions

| Question | Owner | Due Date | Decision |
|---|---|---|---|
| Final app name? | PM | Week 1 | [TBD] |
| Apple Sign-In requires Apple Developer account ($99/yr) — confirm budget | PM | Week 1 | [TBD] |
| Should "DNF" shelf be visible on profile in future public mode? | PM | Week 3 | [TBD] |
| Gemini safety filter behaviour for adult fiction? | Engineering | Week 2 | [TBD] |

---

## 🏁 SECTION 16 — COMPETITIVE ANALYSIS & USP

### 16.1 Competitive Landscape

| Competitor | Strengths | Gaps |
|---|---|---|
| Goodreads | Massive catalogue, community | Terrible UX, no AI, no personalisation |
| The StoryGraph | Better UX than Goodreads, mood tracking | No AI summaries, no visual theming |
| Literal.club | Beautiful UI | Niche audience, no AI, limited features |
| Readwise | Great for highlights/retention | Not a shelf tracker, expensive |

### 16.2 Differentiation Matrix

| Feature | Readmora | Goodreads | StoryGraph | Literal |
|---|---|---|---|---|
| AI Book Summaries | ✅ (Gemini) | ❌ | ❌ | ❌ |
| Colour Vibe Themes | ✅ (5 palettes) | ❌ | ❌ | Partial |
| Goodreads Import | ✅ | N/A | ✅ | ✅ |
| Free Tier AI | ✅ (3/week) | ❌ | ❌ | ❌ |
| Modern Stack (Next.js 14) | ✅ | ❌ | ❌ | ✅ |
| Razorpay (India-first) | ✅ | ❌ | ❌ | ❌ |

### 16.3 Unique Selling Points
1. **AI-native book summaries** — built-in, rate-limited for fairness, instant for Premium
2. **Vibe identity system** — 5 curated colour palettes that make reading feel personal and aesthetic; shareable identity
3. **India-first monetisation** — Razorpay + INR pricing makes premium accessible where USD-priced competitors are prohibitive

---

## 📅 SECTION 17 — TIMELINE, MILESTONES & RELEASE STRATEGY

### 17.1 High-Level Roadmap

| Phase | Scope | Timeline |
|---|---|---|
| Phase 0: Setup | Supabase project, Vercel setup, DB schema, RLS, env config | Week 1 |
| Phase 1: Auth + Onboarding | Supabase Auth, 5-step onboarding flow, vibe theme system | Week 2–3 |
| Phase 2: Core Features | Book search, shelf management, Goodreads import | Week 3–4 |
| Phase 3: AI Integration | Gemini summary, rate limiting, usage counter, paywall modal | Week 4–5 |
| Phase 4: Payments | Razorpay integration, webhook handler, subscription management | Week 5–6 |
| Phase 5: Polish + QA | E2E tests, accessibility audit, colour contrast validation, perf | Week 6–7 |
| Phase 6: Launch | Soft launch (beta), feedback loop, bug fixes, public launch | Week 8+ |

### 17.2 Key Milestones

| Milestone | Owner | Target Date | Status |
|---|---|---|---|
| Supabase schema + RLS complete | Engineering | Week 1 end | Not Started |
| Onboarding flow E2E working | Engineering + Design | Week 3 end | Not Started |
| AI summary with rate limit working | Engineering | Week 5 end | Not Started |
| Razorpay test payment working | Engineering | Week 6 end | Not Started |
| QA sign-off | QA | Week 7 end | Not Started |
| Public launch | PM | Week 8 | Not Started |

### 17.3 MVP Definition
The MVP is shippable when:
- Users can sign up, complete onboarding (incl. vibe + genre selection), and land on a home feed
- Users can search, add books to shelves, and move books between shelves
- Free users get 3 AI summaries/week; premium users get unlimited
- Razorpay premium subscription is purchasable and activates unlimited AI
- All 5 vibe themes work correctly
- Goodreads import works for standard exports

### 17.4 Release Strategy
- **Alpha (Week 6):** Internal team only. All flows tested.
- **Beta (Week 7):** 50 invited users. Focus: onboarding drop-off, AI summary quality, vibe theme satisfaction.
- **GA (Week 8+):** Public launch. Feature flags remain for Goodreads import (can disable if API issues).

**Feature Flags (Supabase `feature_flags` table):**
| Flag | Default | Purpose |
|---|---|---|
| `goodreads_import_enabled` | true | Can disable if CSV format issues |
| `ai_summary_enabled` | true | Emergency off if Gemini costs spike |
| `premium_payments_enabled` | false → true | Enable only after Razorpay KYC |

**Rollback Plan:** Vercel instant rollback to previous deployment. DB migrations are additive-only (no destructive changes without backup confirmation).

### 17.5 Go-To-Market
- **Channels:** Reddit (r/books, r/bookclub), Twitter/X bookish community (#Bookstagram), Product Hunt launch
- **Hook:** "What's your reading vibe?" — shareable vibe card with colour palette
- **India-first pricing:** ₹149/month makes premium accessible

---

## 📎 SECTION 18 — APPENDIX

### Glossary
| Term | Definition |
|---|---|
| Vibe | A named colour palette that themes the entire application UI |
| Shelf | A reading list category (Want to Read / Currently Reading / Finished / DNF) |
| AI Summary | A Gemini-generated book analysis (themes, style, audience fit) |
| Free Tier | 3 AI summaries per week; all other features unlimited |
| Premium | Paid subscription; unlimited AI summaries |
| RLS | Row Level Security — Supabase Postgres feature enforcing per-user data access |
| DNF | Did Not Finish — shelf for abandoned books |
| Week Reset | AI usage counter resets every Monday 00:00 UTC |
| Global Cache | AI summaries stored once per book, shared across all users |

### Reference Documents
- Supabase RLS Docs: https://supabase.com/docs/guides/database/postgres/row-level-security
- Gemini API Docs: https://ai.google.dev/gemini-api/docs
- Razorpay Subscription API: https://razorpay.com/docs/payments/subscriptions/
- Open Library API: https://openlibrary.org/developers/api
- Goodreads Export Format: https://help.goodreads.com/s/article/How-do-I-import-or-export-my-books

### Environment Variables Reference
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=         # Server only — never expose to client

# Gemini
GEMINI_API_KEY=                    # Server only

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=       # Safe to expose (public key)
RAZORPAY_KEY_SECRET=               # Server only
RAZORPAY_WEBHOOK_SECRET=           # Server only

# Email
RESEND_API_KEY=                    # Server only

# App
NEXT_PUBLIC_APP_URL=https://Readmora.app
```
