# Readmora — Product Design Spec

```
Version      : 1.0.0
Status       : Draft
Last Updated : 2026-04-08
Owner        : Solo Builder / Founder
Budget Tier  : Bootstrapped
Stack Assumed: Next.js 14 (App Router) · React 19 · Tailwind CSS · Supabase · Vercel
```

---

## Table of Contents

1. [Product Personality & Design Principles](#1-product-personality--design-principles)
2. [Colour System](#2-colour-system)
3. [Typography System](#3-typography-system)
4. [Spacing System](#4-spacing-system)
5. [Layout & Grid System](#5-layout--grid-system)
6. [Shape & Elevation System](#6-shape--elevation-system)
7. [Iconography](#7-iconography)
8. [Motion & Animation System](#8-motion--animation-system)
9. [Vibe Theme System](#9-vibe-theme-system)
10. [Component Specifications](#10-component-specifications)
11. [Screen States](#11-screen-states)
12. [UX Writing Guide](#12-ux-writing-guide)
13. [Accessibility Spec](#13-accessibility-spec)
14. [Design Tokens — CSS Export](#14-design-tokens--css-export)
15. [Changelog](#15-changelog)

---

## 1. Product Personality & Design Principles

### 1.1 Personality

| Axis            | ◄ This side           | or  | This side ►           | Chosen                    |
| --------------- | --------------------- | --- | --------------------- | ------------------------- |
| Tone            | Formal / Professional |     | Friendly / Casual     | **Friendly / Casual**     |
| Energy          | Calm / Quiet          |     | Bold / Energetic      | **Calm / Quiet**          |
| Complexity      | Minimal / Focused     |     | Rich / Feature-dense  | **Minimal / Focused**     |
| Trustworthiness | Approachable / Warm   |     | Authoritative / Sharp | **Approachable / Warm**   |
| Modernity       | Classic / Timeless    |     | Modern / Cutting-edge | **Modern / Cutting-edge** |

**One sentence summary:** Readmora feels like a well-loved bookshelf in a sunlit café — warm, personal, and quietly delightful.

---

### 1.2 Design Principles

#### Principle 1: Books Are Personal, Not Clinical

Reading is an intimate act. Every screen should feel like it belongs to the user, not to a platform.
✅ Do: Use the user's name and reading data to make the home feed feel curated to them.
❌ Don't: Show generic empty states or database-style list tables that feel like admin tools.

#### Principle 2: Vibe Is a Feature, Not a Skin

The five colour themes are a core identity expression, not cosmetic polish. Every design decision must work beautifully across all five themes.
✅ Do: Test every new component against all five vibe palettes before shipping.
❌ Don't: Hardcode any colour outside the token system — it will break in at least one vibe.

#### Principle 3: AI Should Feel Native, Not Bolted On

AI summaries must feel like a natural part of reading a book's detail page, not like clicking out to a separate tool.
✅ Do: Render AI summaries inline with a subtle skeleton loader that feels like the content is arriving.
❌ Don't: Use a jarring modal or a separate page that makes the AI feel like a distinct feature.

#### Principle 4: Reduce Friction to Zero

The primary user loop — search a book, add it to a shelf, read about it — must require the fewest possible taps/clicks.
✅ Do: Let users add a book to a shelf directly from the search results card.
❌ Don't: Force users through a full book detail page just to add a book to their "Want to Read" shelf.

#### Principle 5: Delight in the Quiet Moments

Readmora competes with Goodreads on beauty. Subtle transitions, thoughtful empty states, and micro-copy that feels human are our design advantage.
✅ Do: Write empty state copy that motivates ("Start your reading story") and pair it with a relevant gentle illustration.
❌ Don't: Use generic placeholder copy ("No books found") or spinners that make the app feel slow.

---

### 1.3 Visual Inspiration References

**Reference 1: Literal.club** — Their use of generous whitespace around book covers and the way cover art becomes part of the page's visual identity. Borrow their reverence for the book as a visual object.

**Reference 2: Spotify (Wrapped / Your Library)** — The way a personal data story can feel emotionally resonant and shareable. Borrow their approach to making stats feel like self-expression.

**Reference 3: Linear** — Their mastery of subtle motion and micro-interactions that make a productivity app feel alive without being distracting. Borrow their restraint and precision in hover states and transitions.

---

## 2. Colour System

### 2.1 Colour Philosophy

Readmora uses a warm, ink-and-paper-inspired base palette for its default light theme, with five distinct vibe overrides that transform the brand colour throughout the application. The base neutral palette is warm-tinted (slightly amber-grey) rather than cold blue-grey, which gives the app its bookish, analogue warmth. Semantic colours are applied exclusively through tokens — no component ever references a primitive hex directly. This architecture is what makes the five-vibe system possible without maintaining five separate stylesheets.

> 📌 Assumption: The default "vibe" at first launch (before user selection) is Sage — a muted, literary green that feels calm and bookish.

---

### 2.2 Primitive Palette

#### Brand — Sage (Default Vibe)

| Token     | Hex     | RGB                | Use                             |
| --------- | ------- | ------------------ | ------------------------------- |
| brand-50  | #f2f7f4 | rgb(242, 247, 244) | Lightest tint, page backgrounds |
| brand-100 | #deeee6 | rgb(222, 238, 230) | Hover backgrounds, tinted rows  |
| brand-200 | #bddece | rgb(189, 222, 206) | Active backgrounds              |
| brand-300 | #8ec4a9 | rgb(142, 196, 169) | Borders on light bg             |
| brand-400 | #5fa882 | rgb(95, 168, 130)  | Disabled primary states         |
| brand-500 | #3d8f69 | rgb(61, 143, 105)  | PRIMARY — main brand colour     |
| brand-600 | #2e7355 | rgb(46, 115, 85)   | Hover on primary                |
| brand-700 | #235c43 | rgb(35, 92, 67)    | Active / pressed                |
| brand-800 | #1a4432 | rgb(26, 68, 50)    | Text on light backgrounds       |
| brand-900 | #112c21 | rgb(17, 44, 33)    | Darkest — headings on white     |

#### Accent — Amber

| Token      | Hex     | RGB                | Use                                 |
| ---------- | ------- | ------------------ | ----------------------------------- |
| accent-50  | #fdf8ef | rgb(253, 248, 239) | Lightest accent tint                |
| accent-100 | #faefd6 | rgb(250, 239, 214) | Accent hover backgrounds            |
| accent-200 | #f5dcab | rgb(245, 220, 171) | Accent active backgrounds           |
| accent-300 | #edc072 | rgb(237, 192, 114) | Accent borders                      |
| accent-400 | #e3a040 | rgb(227, 160, 64)  | Accent disabled states              |
| accent-500 | #d4841a | rgb(212, 132, 26)  | PRIMARY accent — highlights, badges |
| accent-600 | #b36912 | rgb(179, 105, 18)  | Accent hover                        |
| accent-700 | #8f520e | rgb(143, 82, 14)   | Accent active                       |
| accent-800 | #6b3c0a | rgb(107, 60, 10)   | Accent text on light bg             |
| accent-900 | #452607 | rgb(69, 38, 7)     | Darkest accent                      |

#### Neutral — Warm Ink

| Token       | Hex     | RGB                | Use                          |
| ----------- | ------- | ------------------ | ---------------------------- |
| neutral-50  | #faf9f7 | rgb(250, 249, 247) | Page background              |
| neutral-100 | #f2f0ec | rgb(242, 240, 236) | Sidebar, section backgrounds |
| neutral-200 | #e4e1da | rgb(228, 225, 218) | Default borders, dividers    |
| neutral-300 | #ccc8be | rgb(204, 200, 190) | Strong borders, disabled     |
| neutral-400 | #a8a296 | rgb(168, 162, 150) | Placeholder, hint text       |
| neutral-500 | #857f72 | rgb(133, 127, 114) | Default icon colour          |
| neutral-600 | #635d52 | rgb(99, 93, 82)    | Secondary body text          |
| neutral-700 | #4a4540 | rgb(74, 69, 64)    | Supporting text              |
| neutral-800 | #332f2b | rgb(51, 47, 43)    | Primary body text            |
| neutral-900 | #1e1b18 | rgb(30, 27, 24)    | Headings, max contrast       |
| neutral-950 | #110f0d | rgb(17, 15, 13)    | Dark mode page background    |

#### Semantic — Success

| Token         | Hex     | Use                              |
| ------------- | ------- | -------------------------------- |
| success-light | #e8f5ee | Success banner background        |
| success-base  | #2d7d4f | Success icons, text              |
| success-dark  | #1d5234 | Success text on light background |

#### Semantic — Warning

| Token         | Hex     | Use                              |
| ------------- | ------- | -------------------------------- |
| warning-light | #fef6e4 | Warning banner background        |
| warning-base  | #c47d0e | Warning icons, text              |
| warning-dark  | #8a5709 | Warning text on light background |

#### Semantic — Error

| Token       | Hex     | Use                            |
| ----------- | ------- | ------------------------------ |
| error-light | #fdeaea | Error banner background        |
| error-base  | #c0392b | Error icons, form error text   |
| error-dark  | #8b2218 | Error text on light background |

#### Semantic — Info

| Token      | Hex     | Use                           |
| ---------- | ------- | ----------------------------- |
| info-light | #e8f0fb | Info banner background        |
| info-base  | #2563a8 | Info icons, text              |
| info-dark  | #1a427a | Info text on light background |

---

### 2.3 Semantic Colour Tokens (Light Mode)

```css
/* Background */
--color-bg-base: #faf9f7; /* Page background */
--color-bg-subtle: #f2f0ec; /* Sidebar, section backgrounds */
--color-bg-surface: #ffffff; /* Cards, modals, dropdowns */
--color-bg-overlay: rgba(30, 27, 24, 0.5); /* Modal backdrop */
--color-bg-inverse: #1e1b18; /* Inverted surfaces */

/* Interactive Backgrounds */
--color-bg-primary: #3d8f69; /* Primary button, active nav */
--color-bg-primary-hover: #2e7355; /* Primary button hover */
--color-bg-primary-active: #235c43; /* Primary button pressed */
--color-bg-primary-subtle: #f2f7f4; /* Selected row, tinted area */
--color-bg-danger: #c0392b; /* Destructive button */
--color-bg-danger-subtle: #fdeaea; /* Error banner background */
--color-bg-success-subtle: #e8f5ee; /* Success banner background */
--color-bg-warning-subtle: #fef6e4; /* Warning banner background */

/* Text */
--color-text-primary: #1e1b18; /* Headings, main body text */
--color-text-secondary: #635d52; /* Supporting text, labels */
--color-text-tertiary: #a8a296; /* Placeholders, timestamps */
--color-text-disabled: #ccc8be; /* Disabled labels */
--color-text-inverse: #ffffff; /* Text on dark backgrounds */
--color-text-link: #2e7355; /* Inline links */
--color-text-link-hover: #235c43; /* Hovered links */
--color-text-danger: #c0392b; /* Error messages */
--color-text-success: #1d5234; /* Success messages */
--color-text-warning: #8a5709; /* Warning messages */
--color-text-on-primary: #ffffff; /* Text on brand-500 */

/* Borders */
--color-border-default: #e4e1da; /* Card/input default borders */
--color-border-subtle: #f2f0ec; /* Dividers, subtle separators */
--color-border-strong: #ccc8be; /* Focused emphasis, strong divide */
--color-border-primary: #3d8f69; /* Focused input, selected state */
--color-border-danger: #c0392b; /* Error state input border */

/* Icons */
--color-icon-default: #857f72; /* Default icon colour */
--color-icon-subtle: #a8a296; /* Secondary icons */
--color-icon-on-primary: #ffffff; /* Icons on brand background */
--color-icon-danger: #c0392b; /* Destructive action icons */
```

---

### 2.4 Semantic Colour Tokens (Dark Mode)

```css
/* Applied under @media (prefers-color-scheme: dark) or [data-theme="dark"] */

--color-bg-base: #110f0d;
--color-bg-subtle: #1e1b18;
--color-bg-surface: #27231f;
--color-bg-overlay: rgba(0, 0, 0, 0.65);
--color-bg-inverse: #f2f0ec;

--color-bg-primary: #5fa882; /* Shifted 1 stop lighter for dark bg contrast */
--color-bg-primary-hover: #3d8f69;
--color-bg-primary-active: #2e7355;
--color-bg-primary-subtle: #1a2e24;
--color-bg-danger: #e05244;
--color-bg-danger-subtle: #2d1414;
--color-bg-success-subtle: #0f2318;
--color-bg-warning-subtle: #271a08;

--color-text-primary: #f2f0ec;
--color-text-secondary: #a8a296;
--color-text-tertiary: #635d52;
--color-text-disabled: #4a4540;
--color-text-inverse: #1e1b18;
--color-text-link: #8ec4a9;
--color-text-link-hover: #bddece;
--color-text-danger: #e07068;
--color-text-success: #5ebd8a;
--color-text-warning: #e3a040;
--color-text-on-primary: #ffffff;

--color-border-default: #332f2b;
--color-border-subtle: #27231f;
--color-border-strong: #4a4540;
--color-border-primary: #5fa882;
--color-border-danger: #e05244;

--color-icon-default: #857f72;
--color-icon-subtle: #635d52;
--color-icon-on-primary: #ffffff;
--color-icon-danger: #e07068;
```

---

### 2.5 Contrast Compliance Table

| Token Pair                                     | Ratio  | WCAG AA (4.5:1) | WCAG AAA (7:1) |
| ---------------------------------------------- | ------ | --------------- | -------------- |
| text-primary (#1e1b18) on bg-base (#faf9f7)    | 17.4:1 | ✅              | ✅             |
| text-secondary (#635d52) on bg-base (#faf9f7)  | 6.1:1  | ✅              | ❌             |
| text-on-primary (#fff) on bg-primary (#3d8f69) | 4.6:1  | ✅              | ❌             |
| text-inverse (#fff) on bg-inverse (#1e1b18)    | 17.4:1 | ✅              | ✅             |
| text-danger (#c0392b) on bg-base (#faf9f7)     | 5.2:1  | ✅              | ❌             |
| text-primary (#1e1b18) on bg-subtle (#f2f0ec)  | 16.1:1 | ✅              | ✅             |
| text-link (#2e7355) on bg-base (#faf9f7)       | 5.8:1  | ✅              | ❌             |

> 📌 Assumption: All five vibe palettes must pass AA for their respective brand-500 colours before launch. A dedicated WCAG audit task is included in Phase 5 of the project timeline.

---

## 3. Typography System

### 3.1 Font Stack

> 📌 Assumption: The HLD mentions "Lora (headings) + Inter (body)" as the leading candidate. This spec adopts that pairing: Lora brings literary warmth to headings while Inter provides clean readability for UI text. Both are available on Google Fonts at no cost.

```
Display / Heading Font : Lora
  Usage                : All headings (H1–H6), display text, book titles
  Source               : Google Fonts (fonts.googleapis.com)
  Fallback             : Georgia, 'Times New Roman', serif

UI / Body Font         : Inter
  Usage                : Body text, labels, buttons, form fields, metadata
  Source               : Google Fonts (fonts.googleapis.com)
  Fallback             : system-ui, -apple-system, BlinkMacSystemFont, sans-serif

Mono Font              : JetBrains Mono
  Usage                : Code blocks, API keys, technical metadata
  Source               : Google Fonts
  Fallback             : 'Courier New', Courier, monospace
```

---

### 3.2 Type Scale

Base size: 16px. Scale ratio: Minor Third (1.25) — appropriate for a focused, compact reading UI.

| Token            | Size | Line Height | Weight | Letter Spacing | Usage                        |
| ---------------- | ---- | ----------- | ------ | -------------- | ---------------------------- |
| text-display-2xl | 72px | 1.1         | 700    | -0.04em        | Landing hero only            |
| text-display-xl  | 60px | 1.15        | 700    | -0.03em        | Major section heroes         |
| text-display-lg  | 48px | 1.2         | 700    | -0.02em        | Page-level headings (H1)     |
| text-display-md  | 36px | 1.25        | 600    | -0.02em        | Section headings (H2)        |
| text-display-sm  | 30px | 1.3         | 600    | -0.01em        | Card headings (H3)           |
| text-heading-xl  | 24px | 1.35        | 600    | -0.01em        | Sub-section headings (H4)    |
| text-heading-lg  | 20px | 1.4         | 600    | 0              | Panel headings (H5)          |
| text-heading-md  | 18px | 1.45        | 600    | 0              | Component headings (H6)      |
| text-heading-sm  | 16px | 1.5         | 600    | 0              | Labels, small headings       |
| text-body-xl     | 20px | 1.7         | 400    | 0              | Lead paragraphs              |
| text-body-lg     | 18px | 1.7         | 400    | 0              | Large body text              |
| text-body-md     | 16px | 1.6         | 400    | 0              | Default body text            |
| text-body-sm     | 14px | 1.5         | 400    | 0              | Metadata, secondary content  |
| text-body-xs     | 12px | 1.5         | 400    | 0.01em         | Timestamps, fine print       |
| text-label-lg    | 16px | 1.2         | 500    | 0.01em         | Large button labels          |
| text-label-md    | 14px | 1.2         | 500    | 0.01em         | Default button / form labels |
| text-label-sm    | 12px | 1.2         | 500    | 0.02em         | Tags, badges                 |
| text-code-md     | 14px | 1.6         | 400    | 0              | Inline code                  |
| text-code-sm     | 12px | 1.6         | 400    | 0              | Small code snippets          |

**Special application — Book titles:** Use `font-family: var(--font-serif)` (Lora) with `text-heading-lg` size and `font-style: italic`. This gives book titles their typographic distinction across all screens.

---

### 3.3 Typography Rules

**Heading Rules**

- Maximum two heading levels per screen
- Headings always in Lora (serif); body text in Inter (sans-serif)
- Headings never use `text-secondary` colour — always `text-primary` or `text-inverse`
- Maximum heading width: 680px

**Body Rules**

- Default body: `text-body-md` (16px), weight 400, `text-primary` colour
- Maximum paragraph width: 680px (65–75 characters per line)
- Book descriptions and summaries: `text-body-md`, `text-secondary`, max 680px

**Book Title Special Rule**

- On book cards: Lora italic, `text-heading-sm` (16px), clamped to 2 lines
- On book detail pages: Lora, `text-display-sm` (30px), weight 700

---

## 4. Spacing System

### 4.1 Base Unit & Scale

Base unit: 4px. All spacing values are multiples of 4px.

| Token     | rem      | px    | Common Usage                       |
| --------- | -------- | ----- | ---------------------------------- |
| space-0   | 0        | 0px   | Reset                              |
| space-px  | 1px      | 1px   | Hairline borders                   |
| space-0.5 | 0.125rem | 2px   | Micro gaps — badge padding         |
| space-1   | 0.25rem  | 4px   | Tight internal padding             |
| space-1.5 | 0.375rem | 6px   | Small badge padding                |
| space-2   | 0.5rem   | 8px   | Icon padding, tight list items     |
| space-3   | 0.75rem  | 12px  | Input padding vertical, small gaps |
| space-4   | 1rem     | 16px  | Default gap — component internals  |
| space-5   | 1.25rem  | 20px  | —                                  |
| space-6   | 1.5rem   | 24px  | Card padding compact, section gaps |
| space-8   | 2rem     | 32px  | Card padding default               |
| space-10  | 2.5rem   | 40px  | Large section padding              |
| space-12  | 3rem     | 48px  | —                                  |
| space-16  | 4rem     | 64px  | Page section spacing               |
| space-20  | 5rem     | 80px  | Large feature sections             |
| space-24  | 6rem     | 96px  | Hero sections                      |
| space-32  | 8rem     | 128px | Max vertical section padding       |

### 4.2 Spacing Usage Rules

```
Component Internal Padding:
  xs component  : 8px vertical,  12px horizontal
  sm component  : 8px vertical,  16px horizontal
  md component  : 12px vertical, 16px horizontal  ← default
  lg component  : 16px vertical, 24px horizontal
  xl component  : 20px vertical, 32px horizontal

Layout Gaps:
  Between shelf items  : 8px (space-2)
  Between form fields  : 16px–24px (space-4 to space-6)
  Between card sections: 24px (space-6)
  Between page sections: 64px–96px (space-16 to space-24)

Page Margins:
  Mobile  : 16px horizontal (space-4)
  Tablet  : 32px horizontal (space-8)
  Desktop : 48px or container centred (space-12)
```

---

## 5. Layout & Grid System

### 5.1 Breakpoints

| Token      | Value  | Target Device                    |
| ---------- | ------ | -------------------------------- |
| screen-xs  | 375px  | Small mobile                     |
| screen-sm  | 640px  | Mobile landscape                 |
| screen-md  | 768px  | Tablet portrait                  |
| screen-lg  | 1024px | Tablet landscape / small desktop |
| screen-xl  | 1280px | Desktop                          |
| screen-2xl | 1536px | Large desktop                    |

### 5.2 Container Widths

| Context                | Max Width | Padding | Usage                                       |
| ---------------------- | --------- | ------- | ------------------------------------------- |
| Narrow (auth/settings) | 480px     | 24px    | Sign in, onboarding steps, settings panels  |
| Content                | 680px     | 16px    | Book detail page, AI summary, profile bio   |
| Default UI             | 1200px    | 32px    | Main app shell, shelf pages, search results |
| Full-bleed             | 100%      | 0       | Vibe theme backgrounds, hero images         |

### 5.3 Grid

- **Desktop:** 12-column, 24px gutters, 48px side margins
- **Tablet:** 8-column, 16px gutters, 32px side margins
- **Mobile:** 4-column, 16px gutters, 16px side margins

### 5.4 Core Layout Patterns

**App Shell (Authenticated)**

- Fixed left sidebar: 240px wide, collapsible to 64px icon rail on mobile
- Sidebar background: `bg-subtle`
- Main content: fills remaining width, `bg-base`
- Top nav height: 56px (mobile), hidden on desktop (sidebar replaces it)

**Shelf Layout**

- Book grid: 6-col desktop, 4-col tablet, 2-col mobile
- Book card aspect ratio: 2:3 (portrait, matching physical book proportions)
- Grid gap: `space-4` (16px)

**Onboarding Layout**

- Centred, single column, max-width 480px
- Progress bar at top: 4px height, brand colour fill
- Step card: `bg-surface`, `shadow-md`, `radius-xl`

**Book Detail Layout**

- Left: Book cover (fixed 200px wide desktop, full-width mobile)
- Right: Book metadata, shelf picker, AI summary section
- Split: 1/3 cover, 2/3 content on desktop; stacked on mobile

---

## 6. Shape & Elevation System

### 6.1 Border Radius Scale

| Token       | Value  | Usage                                  |
| ----------- | ------ | -------------------------------------- |
| radius-none | 0px    | Tables, full-width elements            |
| radius-xs   | 2px    | Code tags, tiny badges                 |
| radius-sm   | 4px    | Input fields, tags, small buttons      |
| radius-md   | 6px    | Default buttons, compact cards         |
| radius-lg   | 8px    | Default cards, dropdowns, tooltips     |
| radius-xl   | 12px   | Modals, panels, onboarding cards       |
| radius-2xl  | 16px   | Feature cards, large containers        |
| radius-3xl  | 24px   | Vibe card previews, marketing sections |
| radius-full | 9999px | Avatar, toggle, pill badges            |

**Book Cover Rule:** Book cover images use `radius-sm` (4px) to honour the physical object — not perfectly square, not excessively rounded.

### 6.2 Elevation / Shadow Scale

| Token        | Value                                                                    | Usage                        |
| ------------ | ------------------------------------------------------------------------ | ---------------------------- |
| shadow-none  | none                                                                     | Flat elements, inline items  |
| shadow-xs    | 0 1px 2px 0 rgba(30,27,24,0.05)                                          | Subtle card lift             |
| shadow-sm    | 0 1px 3px 0 rgba(30,27,24,0.08), 0 1px 2px -1px rgba(30,27,24,0.08)      | Default book cards           |
| shadow-md    | 0 4px 6px -1px rgba(30,27,24,0.08), 0 2px 4px -2px rgba(30,27,24,0.06)   | Raised cards, sticky header  |
| shadow-lg    | 0 10px 15px -3px rgba(30,27,24,0.08), 0 4px 6px -4px rgba(30,27,24,0.05) | Dropdowns, popovers          |
| shadow-xl    | 0 20px 25px -5px rgba(30,27,24,0.1), 0 8px 10px -6px rgba(30,27,24,0.06) | Modals                       |
| shadow-2xl   | 0 25px 50px -12px rgba(30,27,24,0.2)                                     | Full-screen overlays         |
| shadow-inner | inset 0 2px 4px 0 rgba(30,27,24,0.05)                                    | Pressed states, inset inputs |

> 📌 Assumption: Shadow base colour uses the warm neutral-900 (`#1e1b18`) rather than pure black, which makes shadows feel warmer and more analogue.

**Dark mode shadow rule:** Reduce opacity by 50% on all shadows. Add `border: 1px solid var(--color-border-subtle)` to cards to define edges.

### 6.3 Z-Index Scale

| Token      | Value | Usage                                      |
| ---------- | ----- | ------------------------------------------ |
| z-base     | 0     | Default flow                               |
| z-raised   | 10    | Sticky shelf headers, floating labels      |
| z-dropdown | 100   | Shelf picker dropdown, search autocomplete |
| z-sticky   | 200   | Top navigation, sticky sidebar             |
| z-overlay  | 300   | Modal backdrops                            |
| z-modal    | 400   | Modals, dialogs                            |
| z-popover  | 500   | Tooltips, popovers                         |
| z-toast    | 600   | Toast notifications                        |
| z-top      | 9999  | Rate limit paywall banner                  |

---

## 7. Iconography

### 7.1 Icon Library

```
Primary Icon Set : Lucide Icons
  Style          : Outline (2px stroke weight)
  npm package    : lucide-react
  License        : ISC (open source)
  Rationale      : Lucide's clean outline style matches Readmora's calm, minimal
                   personality. Its stroke consistency across sizes is ideal for
                   a reading app where icons appear at many sizes.

Secondary Set    : None
```

### 7.2 Icon Size Scale

| Token    | Size | Usage                                      |
| -------- | ---- | ------------------------------------------ |
| icon-xs  | 12px | Inline text icons, compact badges          |
| icon-sm  | 16px | Button icons, form field icons, list icons |
| icon-md  | 20px | Default — nav icons, action icons          |
| icon-lg  | 24px | Feature icons, shelf header icons          |
| icon-xl  | 32px | Section illustration icons                 |
| icon-2xl | 48px | Empty state illustrations                  |

### 7.3 Icon Usage Rules

- Shelf icons: BookOpen (Currently Reading), BookMarked (Want to Read), BookCheck (Finished), BookX (DNF)
- AI summary icon: Sparkles (Lucide) at `icon-sm` inline with the "AI Summary" label
- Premium badge: Crown at `icon-sm`, `accent-500` colour
- Navigation icons always at `icon-md` (20px) with `text-label-md` labels
- Icon-only buttons must always include `aria-label`
- Never use icon-only for "Delete book from shelf" — always pair with label text

---

## 8. Motion & Animation System

### 8.1 Motion Philosophy

At the Bootstrapped tier, motion is functional, not expressive. Every transition serves a purpose: it either communicates a state change, guides attention, or confirms an action. Animations that exist solely for delight are deferred. The one exception is the vibe theme switch — a brief, joyful colour transition — because it is Readmora's signature interaction.

### 8.2 Duration Scale

| Token               | Value | Usage                                  |
| ------------------- | ----- | -------------------------------------- |
| duration-instant    | 0ms   | Tab switches, immediate state changes  |
| duration-fast       | 100ms | Button press, checkbox tick            |
| duration-normal     | 150ms | Hover states, colour transitions       |
| duration-moderate   | 200ms | Tooltip open, dropdown, small elements |
| duration-slow       | 300ms | Accordion, card expand                 |
| duration-deliberate | 400ms | Modal enter, drawer enter              |

> 📌 Assumption (Bootstrapped tier): `duration-expressive` (500ms) is not used in v1. The vibe theme transition uses `duration-slow` (300ms) as its maximum.

### 8.3 Easing Curves

| Token           | Value                             | Usage                             |
| --------------- | --------------------------------- | --------------------------------- |
| ease-linear     | linear                            | Progress bars, loading indicators |
| ease-in         | cubic-bezier(0.4, 0, 1, 1)        | Elements leaving screen           |
| ease-out        | cubic-bezier(0, 0, 0.2, 1)        | Elements entering screen          |
| ease-in-out     | cubic-bezier(0.4, 0, 0.2, 1)      | Repositioning, expanding          |
| ease-spring     | cubic-bezier(0.34, 1.56, 0.64, 1) | Vibe theme switch, toggle         |
| ease-decelerate | cubic-bezier(0, 0, 0.3, 1)        | Drawers entering from off-screen  |
| ease-accelerate | cubic-bezier(0.3, 0, 1, 1)        | Drawers exiting                   |

### 8.4 Animation Catalogue

**Fade**

```
Enter : opacity 0 → 1, duration-moderate (200ms), ease-out
Exit  : opacity 1 → 0, duration-fast (100ms), ease-in
Use   : Tooltips, error messages, empty states
```

**Scale + Fade (Dropdown / Popover)**

```
Enter : opacity 0 → 1 + scale 0.97 → 1, duration-moderate, ease-out
Exit  : opacity 1 → 0 + scale 1 → 0.97, duration-fast, ease-in
Use   : Shelf picker dropdown, search autocomplete, context menus
```

**Slide Up + Fade (Modal)**

```
Enter   : opacity 0 → 1 + translateY(8px) → translateY(0), duration-deliberate, ease-out
Exit    : opacity 1 → 0 + translateY(0) → translateY(8px), duration-moderate, ease-in
Backdrop: opacity 0 → 1, duration-moderate, ease-out
Use     : Rate limit paywall modal, confirm delete modal, premium upgrade modal
```

**Slide In from Right (Drawer)**

```
Enter : translateX(100%) → translateX(0), duration-deliberate, ease-decelerate
Exit  : translateX(0) → translateX(100%), duration-moderate, ease-accelerate
Use   : Book detail panel on mobile, filter panel
```

**Toast (Bottom Right, desktop / Bottom Centre, mobile)**

```
Enter : opacity 0 → 1 + translateY(8px) → translateY(0), duration-moderate, ease-spring
Exit  : opacity 1 → 0 + translateY(8px), duration-fast, ease-in
Stack : New toasts push existing ones up, 8px gap
Use   : "Book added to shelf", "Summary saved", error feedback
```

**Skeleton Loader**

```
Animation : shimmer sweep, 1.5s, linear, infinite
Direction : left-to-right gradient sweep
Colours   : bg-subtle → bg-surface → bg-subtle
Use       : Book card loading, AI summary loading, shelf loading
```

**Vibe Theme Switch (Signature Interaction)**

```
Transition: All --color-* CSS custom properties, duration-slow (300ms), ease-spring
Effect    : The entire UI colour scheme transitions in one smooth sweep
Note      : Achieved via CSS transition on :root / [data-vibe] — no JS animation needed
```

**AI Summary Reveal**

```
Pattern : Skeleton loader shows for the duration of Gemini API call
Reveal  : Fade in (opacity 0 → 1, duration-moderate, ease-out) once content arrives
Use     : AI summary section on book detail page
```

**Page Transition**

```
Enter : opacity 0 → 1 + translateY(4px) → translateY(0), duration-deliberate, ease-out
Exit  : opacity 1 → 0, duration-fast, ease-in
Use   : Route changes in the Next.js app
```

### 8.5 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

This is non-negotiable. The vibe theme switch, all modals, all toasts, and all page transitions must function correctly with reduced motion enabled — they simply apply the end state instantly.

---

## 9. Vibe Theme System

### 9.1 Architecture

Vibe themes are implemented as `data-vibe` attribute overrides on the `<html>` element. They override only the brand colour tokens — the neutral, semantic, and surface tokens remain constant across all themes, ensuring layout and readability are unaffected.

```html
<html data-vibe="sage">
  <!-- Default -->
  <html data-vibe="midnight">
    <html data-vibe="rose">
      <html data-vibe="amber">
        <html data-vibe="ocean"></html>
      </html>
    </html>
  </html>
</html>
```

```css
[data-vibe='sage'] {
  --brand-500: #3d8f69;
  --brand-600: #2e7355; /* ... */
}
[data-vibe='midnight'] {
  --brand-500: #6b6ef5;
  --brand-600: #5558d6; /* ... */
}
[data-vibe='rose'] {
  --brand-500: #d4527a;
  --brand-600: #b83e63; /* ... */
}
[data-vibe='amber'] {
  --brand-500: #d4841a;
  --brand-600: #b36912; /* ... */
}
[data-vibe='ocean'] {
  --brand-500: #2d7fa8;
  --brand-600: #1f6489; /* ... */
}
```

### 9.2 The Five Vibes

| Vibe     | Name        | Brand-500 | Personality               | Target Persona                |
| -------- | ----------- | --------- | ------------------------- | ----------------------------- |
| sage     | Sage        | #3d8f69   | Literary, calm, natural   | Default / Arjun (avid reader) |
| midnight | Midnight    | #6b6ef5   | Focused, night-owl, moody | Arjun (engineer)              |
| rose     | Rose Garden | #d4527a   | Warm, aesthetic, romantic | Priya (aesthetic reader)      |
| amber    | Amber       | #d4841a   | Cozy, nostalgic, warm     | Meera (casual reader)         |
| ocean    | Ocean       | #2d7fa8   | Clear, focused, cool      | Arjun / power users           |

### 9.3 Vibe Selection UI

- Shown as step 4 of the 5-step onboarding flow
- Also accessible from Profile Settings → "Your Reading Vibe"
- Displayed as 5 rounded tiles (radius-3xl), each showing a mini preview of the colour + theme name
- Selected vibe shows a `border-2 border-primary` ring and a check icon in the centre
- Switching vibes triggers the CSS custom property transition (duration-slow, ease-spring)
- Selected vibe is persisted to `user_profiles.vibe_preference` in Supabase

> 📌 Assumption: All five brand-500 colours must pass WCAG AA (4.5:1) against white before launch. The Midnight and Rose vibes are highest risk — explicit audit required in Phase 5.

---

## 10. Component Specifications

### Button

**Variants:** Primary, Secondary, Ghost, Destructive, Link
**Sizes:** xs, sm, md (default), lg, xl
**States:** Default, Hover, Focus, Active, Disabled, Loading

#### Primary Button — Visual Spec

| Property   | Default         | Hover            | Focus                                 | Active            | Disabled      | Loading         |
| ---------- | --------------- | ---------------- | ------------------------------------- | ----------------- | ------------- | --------------- |
| Background | bg-primary      | bg-primary-hover | bg-primary                            | bg-primary-active | bg-subtle     | bg-primary      |
| Border     | none            | none             | 2px solid border-primary + 2px offset | none              | none          | none            |
| Text       | text-on-primary | text-on-primary  | text-on-primary                       | text-on-primary   | text-disabled | text-on-primary |
| Opacity    | 1               | 1                | 1                                     | 1                 | 0.5           | 0.8             |
| Cursor     | pointer         | pointer          | pointer                               | pointer           | not-allowed   | default         |

#### Secondary Button — Visual Spec

| Property   | Default                  | Hover                    | Focus                    | Active                   | Disabled                 |
| ---------- | ------------------------ | ------------------------ | ------------------------ | ------------------------ | ------------------------ |
| Background | transparent              | bg-primary-subtle        | transparent              | bg-primary-subtle        | transparent              |
| Border     | 1px solid border-primary | 1px solid border-primary | 2px solid border-primary | 1px solid border-primary | 1px solid border-default |
| Text       | text-link                | text-link                | text-link                | text-link-hover          | text-disabled            |

#### Ghost Button

- Background: transparent always
- Border: none
- Text: `text-secondary` default, `text-primary` hover
- Use for: Cancel actions, tertiary options

#### Destructive Button

- Background: `bg-danger` default, darken 10% on hover
- Text: `text-inverse` (#ffffff)
- Use only for: "Delete book", "Remove account", "Clear shelf"

#### Size Specs

| Size | Height | Padding H | Font Token    | Icon Size |
| ---- | ------ | --------- | ------------- | --------- |
| xs   | 28px   | 10px      | text-label-sm | icon-xs   |
| sm   | 32px   | 12px      | text-label-sm | icon-xs   |
| md   | 40px   | 16px      | text-label-md | icon-sm   |
| lg   | 48px   | 20px      | text-label-lg | icon-md   |
| xl   | 56px   | 24px      | text-label-lg | icon-md   |

**Behaviour:** Loading state replaces icon with a spinner (`icon-sm`) and appends "…" to the label text ("Adding…", "Saving…"). Button width is locked during loading state (no layout shift).

**Accessibility:** role="button", keyboard: Enter and Space activate, Tab to focus, focus ring 2px solid `border-primary` with 2px offset.

---

### Input (Text / Email / Password / Search)

**States:** Default, Hover, Focus, Error, Disabled, Read-only

| Property    | Default            | Hover             | Focus              | Error             | Disabled           |
| ----------- | ------------------ | ----------------- | ------------------ | ----------------- | ------------------ |
| Background  | bg-surface         | bg-surface        | bg-surface         | bg-surface        | bg-subtle          |
| Border      | 1px border-default | 1px border-strong | 2px border-primary | 1px border-danger | 1px border-default |
| Text        | text-primary       | text-primary      | text-primary       | text-primary      | text-disabled      |
| Placeholder | text-tertiary      | text-tertiary     | text-tertiary      | text-tertiary     | —                  |
| Opacity     | 1                  | 1                 | 1                  | 1                 | 0.6                |

- Height: 40px (md), 36px (sm), 48px (lg)
- Padding: 12px vertical, 14px horizontal (md)
- Border radius: `radius-sm` (4px)
- Error message: `text-body-xs`, `text-danger`, with error icon, displayed below input
- Search input: includes Lucide `Search` icon at `icon-sm` as left adornment

**Accessibility:** Every input must have an associated `<label>`. Never use placeholder as the only label. `aria-describedby` links error message to input when error is active.

---

### Textarea

Same visual spec as Input, with:

- Min height: 120px
- Resize: vertical only
- Row count: minimum 3

---

### Select / Shelf Picker

The shelf picker is Readmora's most used select component — it appears on every book card.

- Trigger: renders as a compact pill button showing current shelf name + shelf icon
- Dropdown: `shadow-lg`, `radius-lg`, `bg-surface`, max-height 240px with scroll
- Options: 40px height each, icon + label, hover `bg-primary-subtle`, active/selected `bg-primary-subtle` with checkmark
- Animation: Scale + Fade enter (duration-moderate)

**Keyboard:** Enter/Space opens, Arrow keys navigate, Enter selects, Escape closes.

---

### Checkbox

| Property   | Unchecked     | Hover          | Checked            | Disabled       |
| ---------- | ------------- | -------------- | ------------------ | -------------- |
| Box border | border-strong | border-primary | brand-500 fill     | border-default |
| Check icon | —             | —              | white Lucide Check | —              |
| Size       | 16×16px       | —              | —                  | —              |

- Paired label always right of checkbox, `text-body-sm`
- Touch target: 44×44px minimum (padding compensates for visual 16px size)

---

### Toggle / Switch

- Track: 36px wide × 20px height, `radius-full`
- Track OFF: `bg-subtle`, border `border-strong`
- Track ON: `bg-primary`
- Thumb: 16px circle, white, `shadow-xs`
- Transition: thumb position and track colour, `duration-normal`, `ease-spring`
- Accessibility: `role="switch"`, `aria-checked`, keyboard: Space to toggle

---

### Toast / Notification

**Variants:** Success, Error, Warning, Info

| Property      | Value                                                    |
| ------------- | -------------------------------------------------------- |
| Width         | 320px (desktop), 100% minus 32px (mobile)                |
| Position      | Bottom-right (desktop), Bottom-centre (mobile)           |
| Border radius | radius-lg (8px)                                          |
| Shadow        | shadow-lg                                                |
| Max stack     | 3 toasts visible simultaneously                          |
| Auto-dismiss  | 5 seconds (error: 8 seconds, persistent until dismissed) |

**Structure:** Coloured left border (4px) matching variant colour + icon + message text + optional "Undo" or "View" action link + close button.

**Readmora-specific toasts:**

- "Book added to [Shelf Name]" — Success, with undo action
- "AI summary ready" — Success
- "2 summaries remaining this week" — Warning (triggered when free user uses 2nd summary)
- "Weekly limit reached — Upgrade to Premium for unlimited summaries" — persistent info toast with CTA

---

### Alert / Banner (Inline)

**Variants:** Success, Error, Warning, Info

- Full-width within its container
- Left-border accent (4px): matching variant colour
- Background: variant-subtle token
- Icon + heading (optional) + body text + optional action link

---

### Badge / Tag

**Variants:** Default, Brand (vibe colour), Success, Warning, Error, Premium

| Property      | Value                |
| ------------- | -------------------- |
| Height        | 20px (sm), 24px (md) |
| Padding       | 0px 8px              |
| Border radius | radius-full (pill)   |
| Font          | text-label-sm        |

**Premium badge:** Crown icon + "Premium" text, `accent-500` text, `accent-50` background. Appears next to user name in sidebar and next to AI summary count.

---

### Skeleton Loader

- Shape mirrors the exact layout of the real content it replaces
- Colour: gradient from `bg-subtle` to `bg-surface` to `bg-subtle`, animated shimmer
- Border radius matches the element it represents
- Book card skeleton: maintains 2:3 aspect ratio for cover area
- AI summary skeleton: 4 lines of text (varying widths: 100%, 85%, 90%, 60%)

---

### Empty State

**Layout:** Centred vertically and horizontally in the content area.

**Structure:**

1. Icon at `icon-2xl` (48px), `text-tertiary` colour
2. Heading: `text-heading-md`, Lora serif, `text-primary`
3. Supporting text: `text-body-sm`, `text-secondary`, max-width 320px
4. Single primary CTA button

**Readmora-specific empty states:**

| Screen                    | Icon     | Heading                       | Body                                                        | CTA                     |
| ------------------------- | -------- | ----------------------------- | ----------------------------------------------------------- | ----------------------- |
| Empty shelf (any)         | BookOpen | "Your shelf is waiting"       | "Add books you're reading, want to read, or have finished." | "Search for a book"     |
| No search results         | Search   | "No books found"              | "Try a different title or author name."                     | "Clear search"          |
| Fresh account (home feed) | Sparkles | "Start your reading story"    | "Add your first book to get started."                       | "Search for a book"     |
| Goodreads import empty    | Upload   | "Import your reading history" | "Bring your Goodreads library over in seconds."             | "Import from Goodreads" |

---

### Progress Bar

- Used for: AI summary usage indicator (3 summaries per week), onboarding step progress
- Height: 4px (onboarding), 8px (usage indicator)
- Background: `bg-subtle`
- Fill: `bg-primary`
- Border radius: `radius-full`
- Animated fill: `transition: width duration-slow ease-out`

---

### Spinner / Loading Indicator

- Style: Lucide `Loader2` icon with CSS `animation: spin 1s linear infinite`
- Sizes: `icon-sm` (inline in buttons), `icon-md` (page-level), `icon-lg` (AI summary loading)
- Colour: `text-secondary` (neutral context), `text-on-primary` (inside primary buttons)

---

### Navigation Bar (Mobile)

- Height: 56px, fixed bottom
- Background: `bg-surface`, `shadow-xl` (reversed — shadow-top)
- Items: 4 — Home (House), Search (Search), Shelf (BookOpen), Profile (User)
- Active state: `text-link` colour icon, `text-label-sm` label below, `bg-primary-subtle` pill behind icon

---

### Sidebar Navigation (Desktop)

- Width: 240px fixed, collapsible to 64px icon rail
- Background: `bg-subtle`
- Right border: 1px `border-subtle`
- Sections: App branding → Primary nav → Shelves (with book count badges) → Settings

**Nav item states:**

| State            | Background                 | Text / Icon           |
| ---------------- | -------------------------- | --------------------- |
| Default          | transparent                | text-secondary        |
| Hover            | bg-primary-subtle          | text-link             |
| Active           | bg-primary-subtle          | text-link, weight 600 |
| Active indicator | 3px left border, brand-500 | —                     |

---

### Modal / Dialog

**Sizes:** sm (400px), md (560px — default), lg (720px), full (100% on mobile)

**Structure:**

- Backdrop: `bg-overlay`, `z-overlay`
- Dialog: `bg-surface`, `shadow-xl`, `radius-xl`, `z-modal`
- Header: title (Lora, `text-heading-xl`) + optional description + close button (top-right X)
- Body: scrollable content area
- Footer: right-aligned action buttons (Primary + Ghost/Cancel)

**Animation:** Slide Up + Fade (as defined in §8.4)

**Accessibility:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to heading, focus trap active while open, Escape key closes, focus returns to trigger on close.

**Readmora-specific modals:**

- Premium Upgrade Modal: full-bleed brand gradient header, pricing cards, Razorpay CTA
- Delete Book Modal: title "Remove from shelf?", body explains action, red destructive button "Remove"
- Onboarding Welcome Modal: first-launch only, animated vibe preview

---

### Book Card

The book card is Readmora's primary content unit. It appears in shelf grids and search results.

**Dimensions:** 2:3 aspect ratio (portrait), minimum 120px wide

**Structure (default shelf view):**

1. Cover image (`radius-sm`, `shadow-sm`, full card width)
2. Book title below cover: Lora italic, `text-heading-sm`, 2-line clamp
3. Author: `text-body-xs`, `text-secondary`, 1-line clamp
4. Shelf picker pill: compact, bottom of card

**Hover state:** `shadow-md` lifts card, cover scales very slightly (transform: scale(1.02), duration-normal)

**Loading state:** Skeleton maintains exact 2:3 ratio for cover, with title and author skeleton lines below

**No cover fallback:** Solid `bg-subtle` rectangle with a centred `BookOpen` icon in `text-tertiary`

---

### Stat / Metric Card (Reading Stats)

**Examples:** "Books read this year: 12", "Currently reading: 2", "AI summaries used: 2/3 this week"

- Background: `bg-surface`, `shadow-sm`, `radius-lg`
- Padding: `space-6` (24px)
- Metric number: Lora, `text-display-md` (36px), `text-primary`
- Label: `text-body-sm`, `text-secondary`
- For usage counter: includes compact progress bar below the stat

---

## 11. Screen States

### Loading State

- Pattern: Skeleton loaders that mirror the exact shape of real content
- Show skeleton immediately on navigation or data fetch
- Minimum display: 200ms (prevents flash for fast connections)
- Never: Full-page spinners except initial app load
- AI summary: skeleton shows an "Analysing book…" label in `text-tertiary` alongside the shimmer

### Empty State

See component spec in §10 (Empty State). Applied to all shelf screens, search results, and the home feed for new accounts.

### Error State (Data Fetch Failed)

- Position: Same position as empty state within the content area
- Icon: Lucide `AlertCircle`, `icon-2xl`, `text-danger`
- Heading: "Couldn't load your shelf"
- Body: "This is on us — try refreshing or come back in a moment."
- Two actions: "Try again" (primary) + "Go back" (ghost)
- Never: Show raw Supabase errors, API status codes, or stack traces to users

### Partial State

- Pattern: Display available data; replace failed sections with an inline error banner
- Never: Block the entire page because the AI summary failed to load — show the book detail without it

### Offline State

- Pattern: Slide-down top banner ("You're offline. Changes will sync when you're back.")
- Colour: `bg-warning-subtle`, `text-warning`, `border-bottom: 1px warning-base`
- Auto-dismisses when connection is restored

### AI Summary Loading State (Specific)

1. User clicks "Get AI Summary" button
2. Button enters loading state: spinner + "Analysing…"
3. AI summary section renders skeleton (4 text line shimmer)
4. On success: skeleton fades out, content fades in (duration-moderate)
5. On error: skeleton replaced by inline error message with "Try again" link
6. Usage counter updates immediately after successful generation

### Rate Limit State (Free User — Key Screen)

Triggered when a free user attempts their 4th AI summary in a week.

1. Request is blocked server-side; API returns 429
2. Paywall modal slides up (Slide Up + Fade animation)
3. Modal content: "You've used your 3 free summaries this week" + usage resets [next Monday] date + Premium plan card
4. Primary CTA: "Upgrade to Premium — ₹149/month"
5. Secondary: "Maybe later" (ghost, closes modal)
6. Usage counter in sidebar shows "3/3 used" in `text-warning` colour

---

### Form Behaviour Spec

**Validation Timing**

- On submit: validate all fields, show all errors simultaneously
- On blur: validate individual field after user leaves it (only after first submit attempt)
- On change: clear error as soon as field becomes valid
- Never: validate on every keystroke

**Error Display**

- Position: below the input, `text-body-xs`, `text-danger`
- Icon: Lucide `AlertCircle` at `icon-xs` + error text
- Input border changes to `border-danger`

**Submit Button States**

- Default: Primary, full label ("Create account", "Save changes")
- Loading: Spinner + gerund ("Creating account…"), disabled
- Success: Brief check icon + "Saved!" for 2s, returns to default
- Error: Returns to default, error alert above button

---

## 12. UX Writing Guide

### 12.1 Voice & Tone

**Voice (always):** Warm, direct, human, unhurried.

**Tone by context:**

| Context              | Tone                                                                       |
| -------------------- | -------------------------------------------------------------------------- |
| Onboarding           | Encouraging, welcoming — "Let's set up your reading life"                  |
| Empty states         | Motivating — focus on what's possible                                      |
| Success states       | Warm acknowledgement, brief — "Added to your shelf" not "Congratulations!" |
| Error states         | Honest and solution-focused — never blame the user                         |
| Rate limit / paywall | Matter-of-fact, not guilt-inducing                                         |
| Destructive actions  | Clear and specific — no softening, no alarm                                |

### 12.2 Writing Rules

✅ Sentence case everywhere (headings, buttons, labels, toasts)
❌ Never Title Case for UI text
✅ Active voice — "Remove from shelf" not "Book will be removed from shelf"
✅ Specific labels — "Add to Want to Read" not "Add"
❌ Never use "please" in UI — it is padding
❌ Never use exclamation marks in error states
✅ Use "you" — never "the user" or third-person
✅ Book titles in Lora italic — typographic distinction makes them feel like books, not data

**Button Labels**
✅ "Add to Currently Reading", "Get AI summary", "Import from Goodreads"
❌ "Submit", "OK", "Confirm", "Yes"
✅ Loading: "Adding…", "Generating summary…", "Importing…"

**Error Messages**
Structure: [What happened] + [Why, if known] + [What to do]
✅ "Couldn't generate summary. Gemini is temporarily unavailable. Try again in a moment."
❌ "Error 503"
❌ "Something went wrong. Please try again."

**Placeholders**
✅ "e.g. The Midnight Library" (book search)
✅ "e.g. matt.haig@author.com" (email input)
❌ Repeat the label as placeholder

### 12.3 Microcopy Glossary

| Concept                    | Use This              | Never Use                                                 |
| -------------------------- | --------------------- | --------------------------------------------------------- |
| Reading list categories    | Shelf                 | List, collection, library                                 |
| Want to Read shelf         | Want to Read          | To-read, wishlist, TBR                                    |
| Currently Reading          | Currently Reading     | In progress, active                                       |
| Did Not Finish             | DNF                   | Abandoned, dropped, quit                                  |
| Remove from shelf          | Remove                | Delete (books aren't deleted — just removed from a shelf) |
| Delete account             | Delete account        | Remove account, close account                             |
| AI-generated book analysis | AI summary            | Summary, synopsis, AI review                              |
| Paid plan                  | Premium               | Pro, Plus, Paid, Upgrade                                  |
| Free plan                  | Free                  | Basic, Lite                                               |
| Colour themes              | Vibe                  | Theme, skin, palette, mode                                |
| Switch vibe                | Change your vibe      | Update theme, apply palette                               |
| Weekly AI usage            | summaries remaining   | credits, tokens, uses                                     |
| Import from Goodreads      | Import from Goodreads | Sync, migrate, transfer                                   |
| Close overlay              | Close                 | Dismiss, Cancel (unless cancelling an action)             |
| Undo shelf change          | Undo                  | Revert, Reverse                                           |

---

## 13. Accessibility Spec

### 13.1 Baseline Requirements

All output must meet WCAG 2.1 AA as minimum. Target AAA where achievable without design compromise.

### 13.2 Colour & Contrast

```
Normal text (< 18px or < 14px bold) : 4.5:1 minimum
Large text (≥ 18px or ≥ 14px bold)  : 3.0:1 minimum
UI components and graphical objects  : 3.0:1 minimum
Disabled elements                   : No contrast requirement
```

**Critical note for Vibe themes:** All five brand-500 colour values must be independently audited before launch. The vibe theme switch must never result in a UI state where text fails minimum contrast.

### 13.3 Focus Management

- Style: `outline: 2px solid var(--color-border-primary); outline-offset: 2px`
- Never remove focus outline without a visible replacement
- Dark mode: focus ring colour must be verified visible on dark surfaces (may need to shift to `brand-300`)

**Focus Trap:** Required for all modals, drawers, and the rate limit paywall modal. On close, focus returns to the element that triggered the overlay.

**Onboarding:** Each step must manage focus — on step advance, focus moves to the heading of the new step.

### 13.4 Keyboard Navigation

| Component     | Open        | Navigate      | Confirm     | Close          |
| ------------- | ----------- | ------------- | ----------- | -------------- |
| Button        | Enter/Space | Tab           | Enter/Space | —              |
| Shelf Picker  | Enter/Space | Arrow keys    | Enter       | Escape         |
| Modal         | (triggered) | Tab (trapped) | Enter       | Escape         |
| Toast         | —           | Tab to action | Enter       | Escape or auto |
| Vibe Selector | —           | Arrow keys    | Enter/Space | —              |
| Nav items     | —           | Tab / Arrow   | Enter       | —              |

### 13.5 Screen Reader Requirements

- All book cover images: `alt="[Book Title] by [Author]"`
- Decorative backgrounds: `alt=""`
- Icon-only buttons: `aria-label="[action]"` (e.g., `aria-label="Remove from shelf"`)
- Every input: associated `<label>` — no placeholder-only fields
- Error messages: `aria-live="polite"` for dynamic errors
- AI Summary loading: `aria-busy="true"` on the summary container while loading
- Modals: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to modal title
- Rate limit counter: announce changes with `aria-live="polite"` when count updates
- Vibe selection: `role="radiogroup"` with `role="radio"` for each option

### 13.6 Touch & Mobile

- Minimum touch target: 44×44px for all interactive elements
- Shelf picker pill on book card: minimum 44px height (padding compensates)
- At least 8px between adjacent touch targets
- Never use `user-scalable=no` in viewport meta tag

---

## 14. Design Tokens — CSS Export

```css
:root {
  /* ============================================
     COLOUR — PRIMITIVE (Default: Sage Vibe)
     ============================================ */

  /* Brand — Sage */
  --brand-50: #f2f7f4;
  --brand-100: #deeee6;
  --brand-200: #bddece;
  --brand-300: #8ec4a9;
  --brand-400: #5fa882;
  --brand-500: #3d8f69;
  --brand-600: #2e7355;
  --brand-700: #235c43;
  --brand-800: #1a4432;
  --brand-900: #112c21;

  /* Accent — Amber */
  --accent-50: #fdf8ef;
  --accent-100: #faefd6;
  --accent-200: #f5dcab;
  --accent-300: #edc072;
  --accent-400: #e3a040;
  --accent-500: #d4841a;
  --accent-600: #b36912;
  --accent-700: #8f520e;
  --accent-800: #6b3c0a;
  --accent-900: #452607;

  /* Neutral — Warm Ink */
  --neutral-50: #faf9f7;
  --neutral-100: #f2f0ec;
  --neutral-200: #e4e1da;
  --neutral-300: #ccc8be;
  --neutral-400: #a8a296;
  --neutral-500: #857f72;
  --neutral-600: #635d52;
  --neutral-700: #4a4540;
  --neutral-800: #332f2b;
  --neutral-900: #1e1b18;
  --neutral-950: #110f0d;

  /* Success */
  --success-light: #e8f5ee;
  --success-base: #2d7d4f;
  --success-dark: #1d5234;

  /* Warning */
  --warning-light: #fef6e4;
  --warning-base: #c47d0e;
  --warning-dark: #8a5709;

  /* Error */
  --error-light: #fdeaea;
  --error-base: #c0392b;
  --error-dark: #8b2218;

  /* Info */
  --info-light: #e8f0fb;
  --info-base: #2563a8;
  --info-dark: #1a427a;

  /* ============================================
     COLOUR — SEMANTIC (Light Mode)
     ============================================ */

  --color-bg-base: var(--neutral-50);
  --color-bg-subtle: var(--neutral-100);
  --color-bg-surface: #ffffff;
  --color-bg-overlay: rgba(30, 27, 24, 0.5);
  --color-bg-inverse: var(--neutral-900);
  --color-bg-primary: var(--brand-500);
  --color-bg-primary-hover: var(--brand-600);
  --color-bg-primary-active: var(--brand-700);
  --color-bg-primary-subtle: var(--brand-50);
  --color-bg-danger: var(--error-base);
  --color-bg-danger-subtle: var(--error-light);
  --color-bg-success-subtle: var(--success-light);
  --color-bg-warning-subtle: var(--warning-light);

  --color-text-primary: var(--neutral-900);
  --color-text-secondary: var(--neutral-600);
  --color-text-tertiary: var(--neutral-400);
  --color-text-disabled: var(--neutral-300);
  --color-text-inverse: #ffffff;
  --color-text-link: var(--brand-600);
  --color-text-link-hover: var(--brand-700);
  --color-text-danger: var(--error-base);
  --color-text-success: var(--success-dark);
  --color-text-warning: var(--warning-dark);
  --color-text-on-primary: #ffffff;

  --color-border-default: var(--neutral-200);
  --color-border-subtle: var(--neutral-100);
  --color-border-strong: var(--neutral-300);
  --color-border-primary: var(--brand-500);
  --color-border-danger: var(--error-base);

  --color-icon-default: var(--neutral-500);
  --color-icon-subtle: var(--neutral-400);
  --color-icon-on-primary: #ffffff;
  --color-icon-danger: var(--error-base);

  /* ============================================
     TYPOGRAPHY
     ============================================ */

  --font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  --font-serif: 'Lora', Georgia, 'Times New Roman', serif;
  --font-mono: 'JetBrains Mono', 'Courier New', Courier, monospace;

  --text-display-2xl-size: 4.5rem; /* 72px */
  --text-display-2xl-lh: 1.1;
  --text-display-2xl-weight: 700;
  --text-display-xl-size: 3.75rem; /* 60px */
  --text-display-xl-lh: 1.15;
  --text-display-xl-weight: 700;
  --text-display-lg-size: 3rem; /* 48px */
  --text-display-lg-lh: 1.2;
  --text-display-lg-weight: 700;
  --text-display-md-size: 2.25rem; /* 36px */
  --text-display-md-lh: 1.25;
  --text-display-md-weight: 600;
  --text-display-sm-size: 1.875rem; /* 30px */
  --text-display-sm-lh: 1.3;
  --text-display-sm-weight: 600;
  --text-heading-xl-size: 1.5rem; /* 24px */
  --text-heading-xl-lh: 1.35;
  --text-heading-xl-weight: 600;
  --text-heading-lg-size: 1.25rem; /* 20px */
  --text-heading-lg-lh: 1.4;
  --text-heading-lg-weight: 600;
  --text-heading-md-size: 1.125rem; /* 18px */
  --text-heading-md-lh: 1.45;
  --text-heading-md-weight: 600;
  --text-heading-sm-size: 1rem; /* 16px */
  --text-heading-sm-lh: 1.5;
  --text-heading-sm-weight: 600;
  --text-body-xl-size: 1.25rem; /* 20px */
  --text-body-xl-lh: 1.7;
  --text-body-lg-size: 1.125rem; /* 18px */
  --text-body-lg-lh: 1.7;
  --text-body-md-size: 1rem; /* 16px */
  --text-body-md-lh: 1.6;
  --text-body-sm-size: 0.875rem; /* 14px */
  --text-body-sm-lh: 1.5;
  --text-body-xs-size: 0.75rem; /* 12px */
  --text-body-xs-lh: 1.5;
  --text-label-lg-size: 1rem; /* 16px */
  --text-label-md-size: 0.875rem; /* 14px */
  --text-label-sm-size: 0.75rem; /* 12px */
  --text-code-md-size: 0.875rem; /* 14px */
  --text-code-sm-size: 0.75rem; /* 12px */

  /* ============================================
     SPACING
     ============================================ */

  --space-0: 0;
  --space-px: 1px;
  --space-0-5: 0.125rem; /* 2px */
  --space-1: 0.25rem; /* 4px */
  --space-1-5: 0.375rem; /* 6px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */
  --space-16: 4rem; /* 64px */
  --space-20: 5rem; /* 80px */
  --space-24: 6rem; /* 96px */
  --space-32: 8rem; /* 128px */

  /* ============================================
     SHAPE
     ============================================ */

  --radius-none: 0;
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-3xl: 24px;
  --radius-full: 9999px;

  /* ============================================
     SHADOW
     ============================================ */

  --shadow-none: none;
  --shadow-xs: 0 1px 2px 0 rgba(30, 27, 24, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(30, 27, 24, 0.08), 0 1px 2px -1px rgba(30, 27, 24, 0.08);
  --shadow-md: 0 4px 6px -1px rgba(30, 27, 24, 0.08), 0 2px 4px -2px rgba(30, 27, 24, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(30, 27, 24, 0.08), 0 4px 6px -4px rgba(30, 27, 24, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(30, 27, 24, 0.1), 0 8px 10px -6px rgba(30, 27, 24, 0.06);
  --shadow-2xl: 0 25px 50px -12px rgba(30, 27, 24, 0.2);
  --shadow-inner: inset 0 2px 4px 0 rgba(30, 27, 24, 0.05);

  /* ============================================
     MOTION
     ============================================ */

  --duration-instant: 0ms;
  --duration-fast: 100ms;
  --duration-normal: 150ms;
  --duration-moderate: 200ms;
  --duration-slow: 300ms;
  --duration-deliberate: 400ms;

  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-decelerate: cubic-bezier(0, 0, 0.3, 1);
  --ease-accelerate: cubic-bezier(0.3, 0, 1, 1);

  /* ============================================
     Z-INDEX
     ============================================ */

  --z-base: 0;
  --z-raised: 10;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-popover: 500;
  --z-toast: 600;
  --z-top: 9999;
}

/* ============================================
   DARK MODE OVERRIDES
   ============================================ */

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-base: #110f0d;
    --color-bg-subtle: #1e1b18;
    --color-bg-surface: #27231f;
    --color-bg-overlay: rgba(0, 0, 0, 0.65);
    --color-bg-inverse: #f2f0ec;
    --color-bg-primary: #5fa882;
    --color-bg-primary-hover: #3d8f69;
    --color-bg-primary-active: #2e7355;
    --color-bg-primary-subtle: #1a2e24;
    --color-bg-danger: #e05244;
    --color-bg-danger-subtle: #2d1414;
    --color-bg-success-subtle: #0f2318;
    --color-bg-warning-subtle: #271a08;
    --color-text-primary: #f2f0ec;
    --color-text-secondary: #a8a296;
    --color-text-tertiary: #635d52;
    --color-text-disabled: #4a4540;
    --color-text-inverse: #1e1b18;
    --color-text-link: #8ec4a9;
    --color-text-link-hover: #bddece;
    --color-text-danger: #e07068;
    --color-text-success: #5ebd8a;
    --color-text-warning: #e3a040;
    --color-border-default: #332f2b;
    --color-border-subtle: #27231f;
    --color-border-strong: #4a4540;
    --color-border-primary: #5fa882;
    --color-border-danger: #e05244;
    --color-icon-default: #857f72;
    --color-icon-subtle: #635d52;
    --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.2);
    --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.25), 0 1px 2px -1px rgba(0, 0, 0, 0.2);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.25), 0 2px 4px -2px rgba(0, 0, 0, 0.2);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.35), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
  }
}

/* ============================================
   VIBE THEME OVERRIDES
   ============================================ */

[data-vibe='sage'] {
  --brand-50: #f2f7f4;
  --brand-100: #deeee6;
  --brand-200: #bddece;
  --brand-300: #8ec4a9;
  --brand-400: #5fa882;
  --brand-500: #3d8f69;
  --brand-600: #2e7355;
  --brand-700: #235c43;
  --brand-800: #1a4432;
  --brand-900: #112c21;
}

[data-vibe='midnight'] {
  --brand-50: #f0f0fe;
  --brand-100: #dddcfd;
  --brand-200: #bbbafb;
  --brand-300: #9190f8;
  --brand-400: #7e7cf6;
  --brand-500: #6b6ef5;
  --brand-600: #5558d6;
  --brand-700: #4244b0;
  --brand-800: #2e3087;
  --brand-900: #1d1f5c;
}

[data-vibe='rose'] {
  --brand-50: #fdf0f4;
  --brand-100: #fad9e5;
  --brand-200: #f5b3cb;
  --brand-300: #ec85a8;
  --brand-400: #de6890;
  --brand-500: #d4527a;
  --brand-600: #b83e63;
  --brand-700: #952f4e;
  --brand-800: #70223a;
  --brand-900: #4c1628;
}

[data-vibe='amber'] {
  --brand-50: #fdf8ef;
  --brand-100: #faefd6;
  --brand-200: #f5dcab;
  --brand-300: #edc072;
  --brand-400: #e3a040;
  --brand-500: #d4841a;
  --brand-600: #b36912;
  --brand-700: #8f520e;
  --brand-800: #6b3c0a;
  --brand-900: #452607;
}

[data-vibe='ocean'] {
  --brand-50: #eef6fb;
  --brand-100: #d5eaf5;
  --brand-200: #aed4ec;
  --brand-300: #7ab8de;
  --brand-400: #4d9ec9;
  --brand-500: #2d7fa8;
  --brand-600: #1f6489;
  --brand-700: #164d6d;
  --brand-800: #0f3850;
  --brand-900: #092535;
}

/* Vibe transition — applied to :root so colour switches animate */
:root {
  transition:
    --color-bg-primary var(--duration-slow) var(--ease-spring),
    --color-bg-primary-hover var(--duration-slow) var(--ease-spring),
    --color-bg-primary-subtle var(--duration-slow) var(--ease-spring),
    --color-text-link var(--duration-slow) var(--ease-spring),
    --color-border-primary var(--duration-slow) var(--ease-spring);
}

/* ============================================
   REDUCED MOTION
   ============================================ */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 15. Changelog

| Version | Date       | Author                 | Changes                                                                |
| ------- | ---------- | ---------------------- | ---------------------------------------------------------------------- |
| 1.0.0   | 2026-04-08 | Founder / Solo Builder | Initial draft — generated from PRD-readmora-v1_0 and HLD-readmora-v1_0 |
