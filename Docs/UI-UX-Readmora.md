# 📚 Readmora — Critical UI/UX Design Bible

### _Your reading life, with personality. Now with a face._

> Version 1.0 · April 2026 · Reesh (Founder)

---

## TABLE OF CONTENTS

1. [Design Philosophy](#1-design-philosophy)
2. [Typography System](#2-typography-system)
3. [Colour Vibe System](#3-colour-vibe-system)
4. [Icon Pack](#4-icon-pack)
5. [Spacing, Grid & Layout](#5-spacing-grid--layout)
6. [Component Library Strategy](#6-component-library-strategy)
7. [Animation & Motion System (GSAP)](#7-animation--motion-system-gsap)
8. [Page-by-Page Breakdown](#8-page-by-page-breakdown)
9. [Onboarding Flow](#9-onboarding-flow)
10. [Auth — Login & Signup](#10-auth--login--signup)
11. [Home Feed](#11-home-feed)
12. [Book Detail & AI Summary](#12-book-detail--ai-summary)
13. [Shelf View](#13-shelf-view)
14. [Search Experience](#14-search-experience)
15. [Settings & Vibe Switcher](#15-settings--vibe-switcher)
16. [Premium Upgrade / Paywall](#16-premium-upgrade--paywall)
17. [Goodreads Import Flow](#17-goodreads-import-flow)
18. [Micro-interactions & State Design](#18-micro-interactions--state-design)
19. [Easter Eggs & Personality Moments](#19-easter-eggs--personality-moments)
20. [Accessibility & WCAG](#20-accessibility--wcag)
21. [Responsive Strategy](#21-responsive-strategy)
22. [21st.dev Component Integrations](#22-21stdev-component-integrations)
23. [Design Tokens Reference](#23-design-tokens-reference)

---

## 1. Design Philosophy

Readmora isn't a tool. It's a _companion_. The design principle is **"warm intelligence"** — the UI should feel like a beautiful indie bookshop, not a SaaS dashboard. Every screen should pass this vibe-check:

> _"Does this feel like something a book-lover would screenshot and post on Instagram?"_

### Core Design Pillars

| Pillar                      | What It Means                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| **Warm & Tactile**          | Rounded corners, soft shadows, paper-like textures in bg. Nothing feels cold or corporate. |
| **Opinionated Aesthetic**   | We have a point of view. The vibe themes are bold, not safe.                               |
| **Delightfully Responsive** | Every tap, hover, and scroll has a micro-reaction. Reading it should feel alive.           |
| **Reader-First Hierarchy**  | Book covers are the stars. UI chrome recedes. Content leads.                               |
| **Smart Restraint**         | Animations serve the user, never the designer's ego. Respect `prefers-reduced-motion`.     |

### Aesthetic Reference Points

- The tactility of **Notion** meets the personality of **Spotify's playlist cards**
- The typographic confidence of **Are.na** meets the warmth of **Literal.club**
- The interactivity of **Linear** meets the softness of a well-loved paperback

---

## 2. Typography System

### Primary Font Stack

```css
--font-display: 'Playfair Display', Georgia, serif;
--font-body: 'DM Sans', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
--font-accent: 'Instrument Serif', Georgia, serif;
```

### Why These Fonts?

| Font                 | Role                              | Why It Works for Readmora                                                                                                    |
| -------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Playfair Display** | Headings, Hero text, Book titles  | High-contrast serif with editorial authority. Feels like a bookstore sign. The italic variant is _chef's kiss_ for quotes.   |
| **DM Sans**          | Body, UI labels, Buttons          | Geometric but humanist. Reads beautifully at small sizes. Pairs perfectly with serif headings — the contrast is intentional. |
| **Instrument Serif** | Pull quotes, Vibe names, Accents  | Elegant, editorial, modern. Use for the "personality" moments — AI summary headers, vibe cards.                              |
| **JetBrains Mono**   | ISBN display, API state, Metadata | For those subtle technical details that make power users feel seen.                                                          |

### Font Scale (Fluid Typescale)

```css
/* Use clamp() for fluid scaling — no media query needed */
--text-xs: 0.75rem; /* 12px — labels, badges */
--text-sm: 0.875rem; /* 14px — captions, metadata */
--text-base: 1rem; /* 16px — body copy */
--text-lg: 1.125rem; /* 18px — lead paragraphs */
--text-xl: clamp(1.25rem, 2vw, 1.5rem); /* section headers */
--text-2xl: clamp(1.5rem, 3vw, 2rem); /* page titles */
--text-3xl: clamp(2rem, 4vw, 3rem); /* hero headlines */
--text-display: clamp(3rem, 7vw, 5.5rem); /* landing hero */
```

### Typography Rules

- **Headings:** Playfair Display, weight 700. Tracking: -0.02em.
- **Body:** DM Sans, weight 400/500. Line-height: 1.6 for readability.
- **Italic moments:** Use Playfair Display italic for quotes, AI summary intros, and vibe descriptors. It elevates them instantly.
- **Never use system fonts for anything user-facing.** Load fonts via `next/font` with `display: swap`.
- **Max line length:** 65ch for reading content. AI summaries, book descriptions — enforce this.

### Google Fonts Import (Next.js)

```ts
// app/layout.tsx
import { Playfair_Display, DM_Sans, Instrument_Serif } from 'next/font/google';
import { JetBrains_Mono } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-accent',
  display: 'swap',
});
```

---

## 3. Colour Vibe System

The vibe system is Readmora's signature. Each theme must feel like a complete world, not just a colour swap. Here's the full token map + usage notes per vibe.

### CSS Token Architecture

```css
/* globals.css — base structure */
:root {
  --color-bg:        /* page background */;
  --color-surface:   /* card / panel surfaces */;
  --color-primary:   /* dominant brand colour */;
  --color-secondary: /* supporting / hover states */;
  --color-accent:    /* CTA buttons, badges, highlights */;
  --color-muted:     /* borders, placeholder text, dividers */;
  --color-text:      /* primary text */;
  --color-text-muted:/* secondary text */;
  --color-overlay:   /* modal backdrops */;
}

[data-vibe="wildflower"] { ... }
[data-vibe="botanical"]  { ... }
[data-vibe="sakura"]     { ... }
[data-vibe="harvest"]    { ... }
[data-vibe="winter-frost"] { ... }
```

### Vibe 1: Wildflower _(Default)_

**Personality:** Dreamy, airy, ethereal — the soft-focus Instagram of reading vibes.

```css
[data-vibe='wildflower'] {
  --color-bg: #e8ecf8; /* Frosted Pearl */
  --color-surface: #f4f6fc; /* slightly lighter panel */
  --color-primary: #a2a6f2; /* Periwinkle Dream */
  --color-secondary: #b6b9f2; /* Lilac Sky */
  --color-accent: #f28627; /* Tangerine Glow — the pop! */
  --color-muted: #f2ae2e; /* Golden Honey — warm borders */
  --color-text: #2d2a3e; /* Deep violet-dark */
  --color-text-muted: #7b7a96;
  --color-overlay: rgba(162, 166, 242, 0.15);
}
```

**Usage notes:** This is the default — should feel welcoming but not boring. The Tangerine accent on periwinkle is the magic combo. Use it on CTAs and hover states only. Overuse kills the contrast.

---

### Vibe 2: Botanical

**Personality:** Deep, grounded, forest-coded. For readers of Yrsa Daley-Ward and Robin Wall Kimmerer.

```css
[data-vibe='botanical'] {
  --color-bg: #dec59e; /* Brandy — warm parchment */
  --color-surface: #edd6b2; /* lighter parchment */
  --color-primary: #202808; /* Pine Tree — almost black-green */
  --color-secondary: #33432b; /* Kombu Green */
  --color-accent: #c4866d; /* Pale Copper — warm, rich */
  --color-muted: #6a784d; /* Dingley — sage borders */
  --color-text: #1a2108; /* very dark green */
  --color-text-muted: #5a6b40;
  --color-overlay: rgba(32, 40, 8, 0.15);
}
```

**Usage notes:** This is the richest, most editorial vibe. Text on Brandy background — check contrast carefully (WCAG AA minimum). Add a subtle paper texture overlay (opacity 0.04) on bg for tactility.

---

### Vibe 3: Sakura

**Personality:** Warm, Japanese-spring energy. Cosy tea-and-manga hours.

```css
[data-vibe='sakura'] {
  --color-bg: #f6d7dc; /* Soft Sakura Blush */
  --color-surface: #fadadd;
  --color-primary: #443025; /* Dark Chocolate */
  --color-secondary: #7f5836; /* Aloewood */
  --color-accent: #ec9c9d; /* Sakura — the namesake pop */
  --color-muted: #aa7f66; /* Milk Tea — soft borders */
  --color-text: #2e1a0e;
  --color-text-muted: #7a5540;
  --color-overlay: rgba(68, 48, 37, 0.12);
}
```

**Usage notes:** The Sakura accent is the jewel of this palette. Book cover hover glows, liked book badges, active shelf tabs — all Sakura. Dark Chocolate on Misty Rose background has excellent contrast.

---

### Vibe 4: Harvest

**Personality:** Late-October energy. Soup weather reading. Warm, spiced, cosy.

```css
[data-vibe='harvest'] {
  --color-bg: #f5edd6; /* Cream */
  --color-surface: #fdf6e8;
  --color-primary: #c64632; /* Tomato — bold, confident */
  --color-secondary: #c3a033; /* Pear gold */
  --color-accent: #9aa988; /* Sage — muted, earthy accent */
  --color-muted: #f2c599; /* Honey — warm dividers */
  --color-text: #2d1a0a;
  --color-text-muted: #8b5e3c;
  --color-overlay: rgba(198, 70, 50, 0.1);
}
```

**Usage notes:** Tomato red is a strong primary — use it with authority. Headers, active states, the AI summary "Generate" button in this vibe. Sage as accent keeps it from feeling too aggressive. This vibe needs slightly more visual breathing room (generous padding).

---

### Vibe 5: Winter Frost

**Personality:** Quiet, reflective, early-morning-with-a-book energy.

```css
[data-vibe='winter-frost'] {
  --color-bg: #e3e9f4; /* Cool Dawn — light slate blue */
  --color-surface: #f0f4fa;
  --color-primary: #4a5568; /* Slate — deep and calm */
  --color-secondary: #718096; /* Muted steel */
  --color-accent: #cd9fa0; /* Rosewood — dusty pink */
  --color-muted: #cbd5e0; /* Soft slate */
  --color-text: #1a202c;
  --color-text-muted: #4a5568;
  --color-overlay: rgba(74, 85, 104, 0.12);
}
```

**Usage notes:** True to its name, this vibe is cool and reflective. The Dawn background is a soft slate-blue, creating a quiet atmosphere for morning reading. Use the Rosewood accent for subtle pops of warmth against the cool canvas.

---

### Shared Dark Overlay Pattern

For all vibes, modal backdrops, and focused reading states:

```css
.modal-backdrop {
  background: var(--color-overlay);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
```

### Vibe Switching Implementation

```tsx
// lib/vibe.ts
export function applyVibe(vibe: string) {
  document.documentElement.setAttribute('data-vibe', vibe);
  localStorage.setItem('readmora-vibe', vibe);
}

// Use on mount in root layout
useEffect(() => {
  const savedVibe = localStorage.getItem('readmora-vibe') ?? 'wildflower';
  applyVibe(savedVibe);
}, []);
```

---

## 4. Icon Pack

### Primary: Lucide React

**Why:** Already in the stack, MIT licensed, beautifully consistent 24px grid, Feather-successor. 400+ icons covering every use case.

```bash
npm install lucide-react
```

**Key icons used in Readmora:**

| UI Element        | Lucide Icon                           |
| ----------------- | ------------------------------------- |
| Books / Shelf     | `BookOpen`, `Library`, `Bookmark`     |
| Currently Reading | `BookMarked`                          |
| Want to Read      | `BookPlus`                            |
| Finished          | `BookCheck`                           |
| DNF               | `BookX`                               |
| AI Summary        | `Sparkles`, `Bot`, `Brain`            |
| Search            | `Search`                              |
| Settings          | `Settings2`                           |
| Premium / Star    | `Crown`, `Star`, `Gem`                |
| Import            | `Upload`, `FileInput`                 |
| Vibe / Theme      | `Palette`, `Paintbrush`               |
| Rating stars      | `Star`, `StarHalf`                    |
| User              | `UserRound`                           |
| Navigation        | `ChevronRight`, `ArrowLeft`           |
| Toast / Alert     | `CheckCircle2`, `AlertCircle`, `Info` |
| Menu              | `Menu`, `X`                           |
| Close             | `X`                                   |

### Secondary: Phosphor Icons (for expressive moments)

Use for **marketing pages, vibe cards, and onboarding illustrations** — richer, more personality.

```bash
npm install @phosphor-icons/react
```

Phosphor has `Thin`, `Light`, `Regular`, `Bold`, `Fill`, `Duotone` variants. Use **Thin** for decorative, **Bold** for interactive.

### Emoji as Visual Anchors

Use strategically — not everywhere, just where they add warmth:

| Context                 | Emoji          |
| ----------------------- | -------------- |
| Currently Reading shelf | 📖             |
| Finished shelf          | ✅             |
| Want to Read            | 🔖             |
| DNF shelf               | 😬             |
| AI Summary              | ✨             |
| Premium                 | 👑             |
| Reading Streak (v2)     | 🔥             |
| Empty states            | 🫙 (empty jar) |

---

## 5. Spacing, Grid & Layout

### Spacing Scale (8pt grid)

```css
--space-1: 0.25rem; /* 4px */
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
```

### Border Radius Scale

```css
--radius-sm: 0.375rem; /* 6px — tags, badges */
--radius-md: 0.75rem; /* 12px — cards, inputs */
--radius-lg: 1rem; /* 16px — modals, panels */
--radius-xl: 1.5rem; /* 24px — vibe cards, large containers */
--radius-2xl: 2rem; /* 32px — hero sections */
--radius-full: 9999px; /* pills, avatars */
```

### Layout Grid

```css
/* Desktop: 12-column, max-width 1280px, 24px gutters */
/* Tablet: 8-column */
/* Mobile: 4-column, 16px gutters */

.container {
  width: min(1280px, 100% - 3rem);
  margin-inline: auto;
}

/* Main app layout */
.app-layout {
  display: grid;
  grid-template-columns: 240px 1fr; /* sidebar + content */
  grid-template-rows: auto 1fr; /* topbar + main */
  min-height: 100dvh;
}

/* Mobile: no sidebar, bottom nav */
@media (max-width: 768px) {
  .app-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto; /* topbar + content + bottom nav */
  }
}
```

### Shadow System

```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);
--shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.06);
--shadow-book: 4px 6px 24px rgba(0, 0, 0, 0.15); /* book cover 3D shadow */
```

---

## 6. Component Library Strategy

### Primary: shadcn/ui

Already in stack. All base primitives come from here:

- `Button`, `Input`, `Label`, `Checkbox`, `Select`, `Textarea`
- `Dialog`, `Sheet`, `Popover`, `Tooltip`, `DropdownMenu`
- `Progress`, `Skeleton`, `Badge`, `Avatar`
- `Toast` (via Sonner)

**Override everything** with Readmora tokens — never use shadcn defaults as-is. The design system is in the CSS variables; shadcn is just the accessible HTML scaffold.

### Animation Layer: GSAP (GreenSock)

```bash
npm install gsap
```

Used for:

- Page transitions (SplitText for hero headings on landing)
- Book card hover reveals
- Onboarding step transitions
- Vibe switcher animation (colour wave sweep)
- Scroll-triggered animations on shelves

### Community Components: 21st.dev

The following 21st.dev community components are greenlit for Readmora. See Section 22 for full integration details.

| Component                 | Where Used                            | 21st.dev Link                                                |
| ------------------------- | ------------------------------------- | ------------------------------------------------------------ |
| Animated Characters Login | Auth page                             | `/community/components/erikx/animated-characters-login-page` |
| Animated Tabs             | Shelf switcher (4 tabs)               | `/components/tabs`                                           |
| Bento Grid                | Home feed layout                      | `/components/bento-grid`                                     |
| Floating Dock             | Mobile bottom navigation              | `/components/dock`                                           |
| Spotlight Card            | Featured book card                    | `/components/card`                                           |
| Shimmer Button            | Premium CTA button                    | `/components/button`                                         |
| Animated Counter          | AI usage counter (3/3 remaining)      | `/components/counter`                                        |
| Text Shimmer              | AI generating state                   | `/components/text`                                           |
| Marquee                   | "Currently reading" ticker on profile | `/components/marquee`                                        |
| Magnetic Button           | Onboarding CTA                        | `/components/button`                                         |
| Ripple                    | Background effect on landing          | `/components/ripple`                                         |

### Other Libraries

```bash
npm install framer-motion         # Micro-interactions, layout animations
npm install sonner                # Toast notifications (warm, friendly)
npm install react-confetti         # 🎉 Onboarding completion, first book added
npm install @radix-ui/react-*     # All from shadcn install
npm install embla-carousel-react  # Book cover carousels
npm install react-spring          # Physics-based spring animations for shelf drag
```

---

## 7. Animation & Motion System (GSAP)

### Motion Principles

1. **Purposeful:** Every animation has a reason — communicate state, guide attention, reward interaction.
2. **Fast entry, graceful exit:** Things appear quickly (150-200ms), leave slowly (300-400ms).
3. **Spring over linear:** Use ease-out for UI animations. Spring for draggable elements.
4. **Respect prefers-reduced-motion:** Wrap all GSAP in a check.

```ts
// lib/motion.ts
import gsap from 'gsap';

export const DURATION = {
  micro: 0.15,
  fast: 0.25,
  normal: 0.4,
  slow: 0.7,
  page: 0.9,
};

export const EASE = {
  smooth: 'power2.out',
  bounce: 'back.out(1.4)',
  elastic: 'elastic.out(1, 0.4)',
  sharp: 'power3.inOut',
};

// Respect user preference
export function shouldAnimate(): boolean {
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
```

### Page Transition System

Use Next.js App Router with a layout-level `AnimatePresence`:

```tsx
// Each page: fade up + slight scale
const pageVariants = {
  initial: { opacity: 0, y: 16, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.2 } },
};
```

### GSAP ScrollTrigger — Shelf Reveal

```tsx
// components/shelf/ShelfRow.tsx
useEffect(() => {
  gsap.from('.book-card', {
    scrollTrigger: { trigger: '.shelf-row', start: 'top 80%' },
    y: 24,
    opacity: 0,
    stagger: 0.08,
    duration: 0.5,
    ease: 'power2.out',
  });
}, []);
```

### GSAP SplitText — Landing Hero

```tsx
// Landing page hero headline — letters animate in
import { SplitText } from 'gsap/SplitText';
gsap.registerPlugin(SplitText);

const split = new SplitText('.hero-headline', { type: 'chars' });
gsap.from(split.chars, {
  y: 80,
  opacity: 0,
  stagger: 0.03,
  duration: 0.7,
  ease: 'power3.out',
});
```

### Vibe Switch Animation

When the user picks a new vibe, sweep the colour across the screen like ink dissolving in water:

```tsx
function switchVibe(newVibe: string) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: var(--color-primary);
    transform-origin: center;
  `;
  document.body.appendChild(overlay);

  gsap
    .timeline()
    .fromTo(
      overlay,
      { scale: 0, borderRadius: '50%' },
      {
        scale: 3,
        borderRadius: '0%',
        duration: 0.5,
        ease: 'power3.in',
      }
    )
    .call(() => applyVibe(newVibe))
    .to(overlay, { opacity: 0, duration: 0.4, ease: 'power2.out' })
    .call(() => overlay.remove());
}
```

### Book Card 3D Hover (CSS + GSAP hybrid)

```tsx
// Book covers tilt toward cursor on hover
const card = useRef<HTMLDivElement>(null);

const handleMouseMove = (e: React.MouseEvent) => {
  const rect = card.current!.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
  const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;

  gsap.to(card.current, {
    rotateY: x,
    rotateX: y,
    scale: 1.04,
    duration: 0.3,
    ease: 'power2.out',
    transformPerspective: 600,
  });
};

const handleMouseLeave = () => {
  gsap.to(card.current, {
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    duration: 0.6,
    ease: 'elastic.out(1, 0.4)',
  });
};
```

---

## 8. Page-by-Page Breakdown

### Information Architecture

```
readmora.app/
├── / (Landing Page — public)
├── /login
├── /signup
├── /onboarding
│   ├── /step/1 (username + avatar)
│   ├── /step/2 (genres)
│   ├── /step/3 (vibes)
│   ├── /step/4 (goodreads import)
│   └── /step/5 (complete)
├── /home (authenticated, main feed)
├── /shelf
│   ├── /want-to-read
│   ├── /reading
│   ├── /finished
│   └── /dnf
├── /book/[id]
├── /search
├── /settings
│   ├── /profile
│   ├── /vibe
│   └── /subscription
└── /upgrade (premium paywall)
```

---

## 9. Onboarding Flow

The onboarding is Readmora's **first impression and biggest retention lever**. It must feel like a personality quiz, not a form.

### Step 1: Username + Avatar

**Layout:** Single-column, vertically centred. Large avatar circle (120px) with an animated dashed border that pulses on hover. Username input below.

**Avatar picker interaction:**

- Dashed border animates (dashoffset rotation via CSS) when empty
- On upload: `react-image-crop` modal → crop to square → upload to Supabase Storage
- If no upload: show generated letter avatar (initial + vibe colour background)

**Username validation UX:**

- Debounced 500ms → real-time availability check
- States: `idle` → `checking` (spinner) → `available` (green check + subtle bounce) → `taken` (red X + shake)
- On `available`: subtle confetti burst from the input (react-confetti, 0.5s, tiny particles)

**Copy:** "First, what should we call you?" — warm, personal, not "Enter username."

---

### Step 2: Genre Selection

**Layout:** Full-screen grid of genre chips. Each chip is a pill with an emoji + label.

**Genre chips:**

```tsx
const GENRES = [
  { id: 'fantasy', label: 'Fantasy', emoji: '🐉' },
  { id: 'romance', label: 'Romance', emoji: '🌹' },
  { id: 'thriller', label: 'Thriller', emoji: '🔪' },
  { id: 'sci-fi', label: 'Sci-Fi', emoji: '🚀' },
  { id: 'nonfiction', label: 'Non-Fiction', emoji: '🧠' },
  { id: 'selfhelp', label: 'Self-Help', emoji: '✨' },
  { id: 'history', label: 'History', emoji: '🏛️' },
  { id: 'mystery', label: 'Mystery', emoji: '🕵️' },
  { id: 'literary', label: 'Literary Fiction', emoji: '📜' },
  { id: 'horror', label: 'Horror', emoji: '👻' },
  { id: 'graphic', label: 'Graphic Novel', emoji: '🎨' },
  { id: 'poetry', label: 'Poetry', emoji: '🌊' },
  { id: 'biography', label: 'Biography', emoji: '👤' },
  { id: 'business', label: 'Business', emoji: '📊' },
  { id: 'philosophy', label: 'Philosophy', emoji: '🌀' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'travel', label: 'Travel', emoji: '🗺️' },
  { id: 'crime', label: 'Crime', emoji: '🚔' },
  { id: 'ya', label: 'Young Adult', emoji: '🌟' },
  { id: 'childrens', label: "Children's", emoji: '🧸' },
];
```

**Selection interaction:**

- Unselected: `var(--color-surface)` bg, `var(--color-muted)` border
- On hover: scale(1.04), border colour → `var(--color-primary)`
- On select: background fills with `var(--color-primary)`, text inverts, chip bounces (spring animation)
- On deselect: reverse with a satisfying "pop" using `back.out(2)` ease

**Counter:** Fixed bottom bar → "5 minimum — {n} selected" updates live. CTA is disabled and greyed until 5+ selected.

**Heading:** "What worlds do you live in?" — Playfair Display italic, large.

---

### Step 3: Vibe Selection

This is the **signature moment** of Readmora. Full-screen immersive.

**Layout:** 5 large vibe cards in a horizontal scroll (desktop) or 2-column grid (mobile). Each card is ~280x380px, full-bleed colour preview.

**Vibe card anatomy:**

```
┌─────────────────────────┐
│                         │
│   [colour gradient      │
│    preview area]        │
│                         │
│   [Aa  sample text]     │  ← live font preview
│                         │
│   ─────────────────     │
│   🌸 Sakura             │  ← vibe name (Playfair Display)
│   Warm. Cosy. Spring.   │  ← tagline (DM Sans)
│                         │
│   [Select this vibe]    │  ← CTA button
└─────────────────────────┘
```

**Vibe card interaction:**

- On hover: the card "breathes" — slight scale, shadow deepens, a subtle colour ripple animates inward from cursor position
- On select: the entire **app background** instantly previews to that vibe (CSS variable swap — instant, no reload)
- The selected card gets a checkmark badge that bounces in
- User sees their choice live — the UI around them transforms

**Copy:** "Pick your reading vibe" with subtext: _"This colours your entire Readmora experience. You can always change it later."_

**Vibe taglines:**
| Vibe | Tagline |
|---|---|
| Wildflower | Dreamy. Ethereal. Purple-coded. |
| Botanical | Earthy. Deep. Forest-floor energy. |
| Sakura | Warm. Cosy. Sakura-spring. |
| Harvest | Bold. Spiced. October forever. |
| Winter Frost | Quiet. Reflective. Early-morning reads. |

---

### Step 4: Goodreads Import (Optional)

**Layout:** Centred. Large dashed upload zone. Skip button clearly visible (not hidden or guilt-tripped).

**Upload zone:**

- On drag-over: border animates to solid, background lightens, a small "📥 Drop it!" tooltip appears
- On upload: CSV parse animation — a tiny progress bar fills, rows count up in real-time ("Importing 247 books...")
- On complete: summary card — "✅ 247 books imported · 12 on 'Want to Read' · 189 Finished · 46 Currently Reading"

**Edge case UX:** If CSV has unrecognised format, show a friendly error with a sample CSV download link. Never a raw error dump.

---

### Step 5: Completion

**Full-screen celebration moment:**

```
[Confetti burst — react-confetti, vibe-coloured]

    ✨ You're all set, {username}!

   Your reading adventure starts now.

   [Based on your genres: a 3-book carousel
    from Open Library — just for you]

        [Go to my shelf →]
```

- Confetti uses the active vibe's colours
- Book carousel auto-scrolls with Embla
- "Go to my shelf" uses the Magnetic Button from 21st.dev — it follows the cursor within a radius before you click

---

## 10. Auth — Login & Signup

### Design Decision: Use the Animated Characters Component

The 21st.dev Animated Characters Login Page is the **perfect choice** for Readmora's auth. Here's why and how to adapt it:

**Changes from stock component:**

| Original               | Readmora Version                            |
| ---------------------- | ------------------------------------------- |
| `primary` (blue)       | Maps to `var(--color-primary)` — vibe-aware |
| "YourBrand"            | "Readmora" + BookOpen icon                  |
| Static credential test | Supabase Auth integration                   |
| No OAuth               | Google OAuth button + Apple Sign-In button  |
| Characters are generic | Add a floating book between characters      |

**Integration adaptation:**

```tsx
// The 4 characters watch your cursor
// When you hover the password field → purple character covers eyes (built in)
// When you click "show password" → purple character peeks (built in ✅)
// When typing email → characters look at each other then at you (built in ✅)

// Readmora-specific additions:
// - Characters are reading tiny books when idle (CSS book prop added to each)
// - On successful login → characters wave tiny book props and confetti falls
// - On error → characters facepalm (GSAP shake + emoji pops from them)
```

**The two-column layout from the component is perfect:**

- Left: Characters + Readmora branding
- Right: Login form

**Add social login buttons below the main form:**

```tsx
// Google OAuth
<Button variant="outline" onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}>
  <GoogleIcon />
  Continue with Google
</Button>;

// Apple Sign-In (only shown on Safari/iOS)
{
  isAppleAvailable && (
    <Button variant="outline" className="apple-btn">
      <AppleIcon />
      Continue with Apple
    </Button>
  );
}
```

**Auth State — Loading:**

- Characters do a little "thinking" animation (pupils swirl slowly, or character bobs)
- Button shows "Signing in..." with a Shimmer effect (21st.dev TextShimmer)

**Auth State — Error:**

- Characters facepalm synchronously
- Error card slides in from below with a gentle bounce
- Shake animation on the input that failed

---

## 11. Home Feed

### Layout: Bento Grid

The home feed is a **bento grid layout** — not a list, not a boring card grid. Each section has a different visual weight.

```
┌─────────────────────────────────────────────────┐
│  📖 Currently Reading           [Continue →]    │  ← Full width, hero card
│  "The Night Circus" · Erin Morgenstern           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━░░░░  68%          │
└─────────────────────────────────────────────────┘

┌────────────────────┐  ┌──────────────────────────┐
│  📚 Want to Read   │  │  ✨ AI Summary Available  │
│  12 books waiting  │  │  "Tomorrow, and Tomorrow" │
│  [View shelf →]    │  │  [Get Summary →]          │
└────────────────────┘  └──────────────────────────┘

┌──────────────────────────────────────────────────┐
│  ✅ Recently Finished                             │
│  [Book] [Book] [Book] → scroll                   │
└──────────────────────────────────────────────────┘

┌─────────────┐  ┌─────────────┐  ┌───────────────┐
│  📊 Stats   │  │  🎯 Genre   │  │  👑 Go Premium│
│  28 books   │  │  Top: Sci-Fi│  │  3 AI left    │
│  this year  │  │  Fantasy    │  │  this week    │
└─────────────┘  └─────────────┘  └───────────────┘
```

### Currently Reading Card — Hero

This is the **most important card on the entire app**. It must feel alive:

- **Background:** Book cover image blurred (CSS `filter: blur(40px) saturate(1.4)`), tinted with vibe overlay
- **Book cover:** Displayed prominently, with the 3D hover tilt effect
- **Progress bar:** Custom animated progress bar using `var(--color-accent)`, fills with a shimmer sweep animation on mount
- **"Continue →" button:** Links to book detail. On hover, a small cursor-tracking highlight follows the button.

### Scroll Behaviour

- On scroll down: sidebar shrinks slightly (width 240→60px) — just icons remain
- Header fades to a blur-glass variant with reduced opacity
- "Currently Reading" hero card compresses into a sticky mini-bar at top

### Empty States

These must be warm and encouraging — never cold or guilty.

| State                | Empty State Copy                                       | Visual                      |
| -------------------- | ------------------------------------------------------ | --------------------------- |
| No books on shelf    | "Your shelves are waiting — add your first book 📚"    | Illustrated empty shelf SVG |
| No AI summaries used | "Curious about a book? Get an instant AI analysis. ✨" | Sparkle animation           |
| No genres selected   | "Let us know what you love — update your genres"       | Genre emoji cloud           |

---

## 12. Book Detail & AI Summary

### Layout

```
┌───────────────────────────────────────────┐
│  [← Back]                    [Add to shelf ▾] │
├───────────────────────────────────────────┤
│                                           │
│  [Cover    ]   BOOK TITLE                 │
│  [Image    ]   Author Name                │
│  [3D Tilt  ]   ★★★★☆  ·  Published 2019  │
│              [Fantasy] [Magic] [Literary] │
│                                           │
│              [📖 Reading] [🔖 Want] [✅ Done] [😬 DNF] │
│                                           │
└───────────────────────────────────────────┘

┌─────────────────────────────────┐  ┌──────────────────┐
│  About this book                │  │  Your Notes       │
│  [description — max 4 lines,    │  │  [textarea]       │
│   "Read more" expands]          │  │                   │
└─────────────────────────────────┘  │  Rating: ★★★★☆    │
                                     │  [Save]           │
                                     └──────────────────┘

┌─────────────────────────────────────────────────────┐
│  ✨ AI Book Summary                                  │
│                                                     │
│  [Gemini-powered analysis]                          │
│                                                     │
│  If not generated: [Generate Summary] button        │
│  If free limit hit: paywall soft prompt             │
└─────────────────────────────────────────────────────┘
```

### AI Summary Section — States

**State 1: Not yet generated**

```
╔═══════════════════════════════════════════╗
║  ✨ AI Book Summary                       ║
║                                           ║
║  Get an instant analysis of this book —  ║
║  themes, writing style, who'd love it.   ║
║                                           ║
║  [Generate Summary]    3 left this week  ║
╚═══════════════════════════════════════════╝
```

**State 2: Generating**

```
╔═══════════════════════════════════════════╗
║  ✨ AI Book Summary                       ║
║                                           ║
║  ░░░░░░░░░░░░░░░░░░░░  ← text shimmer    ║
║  ░░░░░░░░░                               ║
║                                           ║
║  "Analysing themes, style, and soul..."  ║
║  [TextShimmer component from 21st.dev]   ║
╚═══════════════════════════════════════════╝
```

Animation: The shimmer text cycles through rotating "thinking" phrases:

- _"Reading between the lines..."_
- _"Consulting the literary stars..."_
- _"Decoding the author's soul..."_
- _"Almost there, just finishing a chapter..."_

**State 3: Summary Ready**
The summary renders in markdown with Playfair Display headings for each section:

- 📖 Plot Overview (non-spoiler)
- 🔑 Core Themes
- ✍️ Writing Style & Tone
- 💙 Who Would Love This
- 💬 A Memorable Quote (in a styled blockquote with `--color-accent` left border)

**State 4: Rate Limit Hit (soft paywall)**

```
╔═══════════════════════════════════════════╗
║  ✨ You've used your 3 summaries this     ║
║  week. Resets Monday.                    ║
║                                           ║
║  [👑 Go Premium — Unlimited AI]          ║
║  or wait until Monday                    ║
╚═══════════════════════════════════════════╝
```

Never guilt-trip. Frame it as "you loved it so much you ran out." Soft upgrade, not a hard wall.

---

## 13. Shelf View

### Tab Design (Animated Tabs from 21st.dev)

4 tabs, horizontally scrollable on mobile. The active tab indicator animates between tabs (sliding pill, not jump-cut).

```
[📖 Reading (2)]  [🔖 Want to Read (12)]  [✅ Finished (47)]  [😬 DNF (3)]
```

### Book Grid

Default: **cover-first grid** — 3 columns desktop, 2 columns mobile. Each card shows:

- Book cover (dominant visual)
- Title (Playfair Display, 14px, 2-line max)
- Author (DM Sans, 12px, muted)
- Star rating (if on Finished shelf)
- Shelf action menu on hover/long-press

### Shelf Drag-to-Move

Books can be dragged between shelves using `react-spring` for physics:

- On drag start: card lifts (scale 1.05, shadow deepens)
- On drag: card follows cursor with inertia
- On drop to valid shelf: card springs into place, shelf counter updates with a +1 animated badge pop
- On drop to invalid target: card snaps back with a bounce

### Empty DNF Shelf

Special empty state — because DNF deserves acknowledgement:

> _"No abandoned books? Respect. (Or they're all still in progress...)"_

Illustration: A tiny bookmark sadly sticking out of a closed book.

---

## 14. Search Experience

### Search Bar Design

Full-width, sticky search at top of `/search` route. On focus:

- Expands slightly (height: 44px → 52px)
- Subtle glow ring appears (vibe-coloured box-shadow)
- Overlay dims the rest of the page slightly (backdrop)
- Recent searches appear below (stored in localStorage)

### Search Results Grid

Each result card:

```
┌─────────────────────────────────┐
│ [cover]  Title                  │
│          Author · Year          │
│          [+ Want to Read] [✨ Summary] │
└─────────────────────────────────┘
```

- Cover loads with a shimmer skeleton (Skeleton from shadcn)
- On hover: card rises with shadow, the two action buttons slide up from below (GSAP, `y: 8 → 0`)
- Books already on shelf show which shelf they're on instead of the add button

### No Results State

```
🔍  No books found for "{query}"

Try searching by:
• Full title
• Author's last name
• ISBN

[Search on Open Library directly →]
```

---

## 15. Settings & Vibe Switcher

### Settings Layout

Sidebar sub-navigation within `/settings`:

```
Profile
Vibe & Theme        ← star feature of this page
Subscription
Notifications
Import / Export
Account
```

### Vibe Switcher Page

This is almost as important as the onboarding vibe step. Full redesign from a typical settings page.

**Layout:** Each vibe shown as a mini live preview — a small card that literally shows the app UI _in that theme_, like a phone mockup preview.

```
┌──────────────────────────────────────────┐
│  🎨 Your Reading Vibe                   │
│  Change how Readmora looks and feels    │
│                                          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│  │ Wild │ │ Bota │ │ Saku │ │ Harv │ │ Wint │ │
│  │ flower│ │nical │ │  ra  │ │  est │ │Frost │ │
│  │ ✓    │ │      │ │      │ │      │ │      │ │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ │
│                                          │
│  [Preview changes live as you hover]    │
└──────────────────────────────────────────┘
```

Hovering a vibe card previews it live (CSS variable swap on hover, revert on mouseout). Clicking selects it permanently + triggers the ink-sweep animation.

---

## 16. Premium Upgrade / Paywall

### Soft Paywall Modal

Triggered when free user hits 3 AI summaries/week.

```
┌────────────────────────────────────────┐
│         👑 Readmora Premium            │
│                                        │
│   You've discovered your inner         │
│   book nerd. Now set it free.          │
│                                        │
│   ✅ Unlimited AI Book Summaries       │
│   ✅ All vibe themes                   │
│   ✅ Priority support                  │
│                                        │
│   ┌─────────────┐  ┌─────────────┐    │
│   │ ₹149/month  │  │  ₹999/year  │    │
│   │             │  │  Save 44%   │    │  ← default selected
│   └─────────────┘  └─────────────┘    │
│                                        │
│   [Upgrade Now — via Razorpay]        │  ← Shimmer button
│   [Maybe next week]                   │  ← dismisses, no guilt
└────────────────────────────────────────┘
```

**Animation on open:**

- Modal slides up from bottom (mobile) or scales in from centre (desktop)
- The 👑 crown emoji bounces and pulses
- Plan cards have a subtle shimmer gradient that sweeps every 3 seconds
- Annual plan is pre-selected with a "BEST VALUE" badge

### Post-Payment State

After Razorpay success:

- Full-screen celebration (confetti, vibe-coloured)
- "👑 You're Premium now!" heading with Playfair Display, large
- Characters from the login page could make a cameo here (Easter egg consideration — see Section 19)
- Instantly transitions to unlimited AI access (webhook → Supabase update)

---

## 17. Goodreads Import Flow

### Standalone Page + Drag Zone

```
┌────────────────────────────────────────┐
│  📥 Import from Goodreads              │
│                                        │
│  ┌────────────────────────────────┐    │
│  │                                │    │
│  │  Drag your goodreads_library   │    │
│  │  _export.csv here              │    │
│  │                                │    │
│  │  or [Browse files]             │    │
│  │                                │    │
│  └────────────────────────────────┘    │
│                                        │
│  [How to export from Goodreads →]     │
└────────────────────────────────────────┘
```

### Import Progress View

```
Parsing file...          ✅
Matching books...        ━━━━━━━━━━░░  82%
247 books found
  189 matched to database
  58 added as manual entries
  12 already on your shelf (skipped)

[Finish import →]
```

Progress bar fills with `var(--color-accent)`, with a subtle shimmer sweep.

---

## 18. Micro-interactions & State Design

### Hover States

| Element    | Hover Behaviour                                   |
| ---------- | ------------------------------------------------- |
| Book card  | 3D tilt + shadow deepen + action buttons slide up |
| Shelf tab  | Pill indicator slides (no jump)                   |
| Nav link   | Left-border appears with vibe-accent colour       |
| CTA button | Scale 1.02 + slight shadow shift                  |
| Genre chip | Scale 1.04 + border colour                        |
| Vibe card  | Live theme preview (CSS variable swap)            |
| Avatar     | Subtle ring appears in vibe accent colour         |

### Loading States

**Skeleton system:** All skeletons use a shimmer animation in the current vibe's surface colour:

```css
@keyframes shimmer {
  from {
    background-position: -200% center;
  }
  to {
    background-position: 200% center;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-surface) 25%,
    var(--color-muted) 50%,
    var(--color-surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

### Toast Notifications (Sonner)

```tsx
// Sonner configured with vibe-aware colours
<Toaster
  toastOptions={{
    style: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-muted)',
      color: 'var(--color-text)',
    },
  }}
  position="bottom-right"
/>;

// Usage examples:
toast.success('📚 Added to Want to Read!');
toast.error("Couldn't generate summary. Try again.");
toast.info('✨ Summary ready!');
toast('👑 Welcome to Premium!', { icon: '🎉', duration: 6000 });
```

### Form Validation UX

Never red-wall forms. Inline validation only, never on blur (only on submit attempt or after user has interacted with that field):

- Valid: green check icon fades in, no text needed
- Invalid: red border, small shake, inline message in `text-sm text-destructive`
- Required but empty on submit: border flashes once, focus jumps to first error

---

## 19. Easter Eggs & Personality Moments 🥚

These are the moments that make users post screenshots. Implement all of these.

### Easter Egg 1: The Konami Code Vibe 🎮

On the login/home page, entering the Konami Code (↑↑↓↓←→←→BA) triggers:

- All 5 vibes cycle rapidly in a rainbow sweep
- A hidden vibe called **"Midnight Library"** unlocks temporarily (near-black background, gold text, very moody)
- Toast: _"🌙 You found the Midnight Library. It only exists between 2am and 6am... but you're special."_

### Easter Egg 2: Book-Nerd Quiz on DNF Add

When moving a book to DNF, instead of a generic confirmation:

```
"Moving 'The Brothers Karamazov' to Did Not Finish...

Bold choice. Even Dostoyevsky's editor probably put it down once.

Was it:
○ Life happened
○ Not my vibe
○ The pacing was doing things to me
○ I lied to myself thinking I'd finish it

[It's okay, really →]"
```

The selected reason is stored (for v2 "why did I DNF" stats).

### Easter Egg 3: Reading Personality Badge

After finishing 5 books, a "Reading Personality" is auto-calculated from genres and unlocked silently. On next login:

```
✨ We figured you out.

You're a: "The Midnight Escapist" 🌙
(Fantasy + Thriller lover who finishes books at 2am)
```

Pop-up with confetti. Shareable as a card (screenshot-able design).

### Easter Egg 4: The Patient Zero Badge

First user to request an AI summary for any book gets a 🧬 "First Reader" badge on that book's summary page. Tiny, subtle — only discoverable by those who look.

### Easter Egg 5: The Mood Calendar (Hover)

In the stats section, hovering over a specific date in the reading calendar shows:

_"You were reading Romance novels this week. We don't know what was happening in your life, but we hope it helped."_

Each genre has a gentle, funny tooltip based on reading patterns.

### Easter Egg 6: Late Night Mode

If the user opens Readmora between 11pm–4am (local time):

- The logo subtly changes to a 🌙 moon variant
- Footer quietly says: _"Reading this late? We respect it."_
- The AI summary "thinking" phrases become more poetic:
  - _"Consulting the stars for this one..."_
  - _"The literary gods are awake with you..."_

### Easter Egg 7: 100 Books Hall of Fame 🏆

When a user marks their 100th book as Finished:

- Full confetti explosion
- A special `Hall of Fame` badge on their profile
- The home feed header changes for that session: _"You've read 100 books with us. That's... actually extraordinary."_

### Easter Egg 8: DNF Streak Commiseration

If a user DNFs 3 books in a row:

- Toast: _"Three in a row. Either your TBR list needs a rethink, or life is just being a lot right now. Both are valid."_
- A curated "Fresh Start" book recommendation appears (genre-based) with label "Maybe try this instead?"

### Easter Egg 9: Genre Rabbit Hole

If a user searches the same genre 5+ times in a session:

- AI assistant moment: A tiny floating suggestion appears: _"You keep searching Fantasy... want us to curate a Fantasy starter kit?"_
- Leads to a curated 10-book list (static, hand-picked by team).

### Easter Egg 10: The Characters Return (Post-Login)

When premium is unlocked, the 4 animated characters from the login page make a brief cameo on the upgrade success screen — they throw tiny book confetti and wave. GSAP-animated, plays once, never repeats.

---

## 20. Accessibility & WCAG

Readmora must be WCAG 2.1 AA compliant. The vibe system is the biggest accessibility risk — here's the audit checklist.

### Contrast Ratios (per vibe)

Each vibe's `--color-text` on `--color-bg` must hit **4.5:1 minimum** (AA for normal text), **3:1 for large text**.

| Vibe         | Text on Background     | Ratio Target   |
| ------------ | ---------------------- | -------------- |
| Wildflower   | `#2D2A3E` on `#E8ECF8` | ≥ 7:1 ✅       |
| Botanical    | `#1A2108` on `#DEC59E` | Must verify ⚠️ |
| Sakura       | `#2E1A0E` on `#F2CFCA` | ≥ 7:1 ✅       |
| Harvest      | `#2D1A0A` on `#F5EDD6` | ≥ 8:1 ✅       |
| Winter Frost | `#1A202C` on `#E3E9F4` | ≥ 10:1 ✅      |

Run every colour pair through [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) before ship.

### Focus Management

```css
/* Custom focus ring that respects vibe */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
  border-radius: var(--radius-sm);
}
```

Never remove `:focus-visible` outlines. Style them — don't hide them.

### Reduced Motion

```ts
// hooks/useReducedMotion.ts
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    mq.addEventListener('change', (e) => setReduced(e.matches));
  }, []);
  return reduced;
}

// In animation components:
const shouldAnimate = !useReducedMotion();
// All GSAP calls and framer-motion variants gate on this
```

### Screen Reader Support

- All book cover images: `alt="{title} by {author} — book cover"`
- AI summary section: `aria-live="polite"` on the summary container (announces when content loads)
- Shelf tabs: `role="tablist"`, `role="tab"`, `aria-selected`
- Progress bar: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Star rating: `aria-label="Rated 4 out of 5 stars"`

### Keyboard Navigation

- Full app navigable by keyboard
- Shelf drag-and-drop: keyboard alternative via dropdown "Move to..." menu
- Vibe switcher: arrow keys cycle through vibes, Enter selects
- Onboarding genre chips: Space to select/deselect, Tab to navigate

---

## 21. Responsive Strategy

### Breakpoints

```css
/* Mobile-first */
--bp-sm: 640px; /* large phones */
--bp-md: 768px; /* tablets */
--bp-lg: 1024px; /* small laptops */
--bp-xl: 1280px; /* desktop */
--bp-2xl: 1536px; /* large displays */
```

### Navigation Pattern

| Viewport            | Navigation                                       |
| ------------------- | ------------------------------------------------ |
| Desktop (≥1024px)   | Left sidebar (240px fixed)                       |
| Tablet (768–1023px) | Left sidebar collapsed (60px icon-only) + drawer |
| Mobile (<768px)     | Bottom navigation bar (5 items) + top header bar |

### Bottom Navigation (Mobile) — Floating Dock from 21st.dev

```tsx
// 5 items in floating dock
const mobileNav = [
  { icon: Home, label: 'Home', href: '/home' },
  { icon: Search, label: 'Search', href: '/search' },
  { icon: Library, label: 'Shelf', href: '/shelf' },
  { icon: Sparkles, label: 'AI', href: '/ai' },
  { icon: UserRound, label: 'Profile', href: '/settings' },
];
```

The floating dock from 21st.dev has a beautiful magnification effect on hover/touch that works perfectly here.

### Book Grid Responsive

| Viewport | Grid Columns | Card Size            |
| -------- | ------------ | -------------------- |
| Mobile   | 2 columns    | Cover-first, compact |
| Tablet   | 3 columns    | Standard             |
| Desktop  | 4–5 columns  | Full detail on hover |
| Wide     | 6 columns    | Cover grid mode      |

### Touch Gestures (Mobile)

- **Swipe right** on book card: Add to "Want to Read"
- **Swipe left** on book card: Move to next shelf or remove
- **Long press** on book card: Quick-action sheet (shadcn `Sheet` from bottom)
- **Pull to refresh** on shelf: Updates shelf data from Supabase

---

## 22. 21st.dev Component Integrations

Full integration map for every 21st.dev component used in Readmora.

### 1. Animated Characters Login Page

**Source:** `erikx/animated-characters-login-page`

Integration notes:

- Replace credentials check with `supabase.auth.signInWithPassword()`
- Replace `<form>` with individual event handlers (no HTML form in React artifacts)
- Add Google/Apple OAuth buttons below main form
- Map `primary` colour to `var(--color-primary)` from active vibe CSS variable
- The 4 characters should have tiny book props in their "idle" state (CSS addition)

### 2. Text Shimmer

**Source:** Use for AI "Generating summary..." state

```tsx
import { TextShimmer } from '@/components/ui/text-shimmer'; // from 21st.dev

// In AI summary generating state:
<TextShimmer duration={2.5}>{rotatingThinkingPhrase}</TextShimmer>;
```

### 3. Shimmer Button

**Source:** Use for Premium CTA button in paywall

```tsx
<ShimmerButton
  shimmerColor={vibeAccent}
  background={vibePrimary}
  className="w-full h-14 text-lg"
  onClick={openRazorpay}
>
  👑 Upgrade to Premium
</ShimmerButton>
```

### 4. Animated Tabs

**Source:** Use for the Shelf switcher (Want / Reading / Finished / DNF)

The sliding pill animation between tabs is exactly what the shelf switcher needs. The indicator must follow `var(--color-primary)`.

### 5. Marquee

**Source:** Use in the home feed for "Recently Finished" horizontal scroll

```tsx
<Marquee pauseOnHover speed={30}>
  {finishedBooks.map((book) => (
    <BookCoverMini key={book.id} book={book} />
  ))}
</Marquee>
```

### 6. Floating Dock

**Source:** Mobile bottom navigation

Apply as `position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%)` on mobile breakpoints. The magnification effect naturally draws attention to the active tab.

### 7. Bento Grid

**Source:** Home feed layout

Map each bento cell to a dashboard widget. The grid is fully responsive out of the box. Cells:

- Currently Reading (span-full)
- Quick Stats (span-1)
- Genre breakdown (span-1)
- Premium upsell (span-1, only for free users)
- Recently Finished (span-2)

### 8. Spotlight Card

**Source:** Featured book card component

Use for the "Recommended for you" section. The spotlight follows cursor movement within the card — pairs beautifully with book covers.

### 9. Animated Counter

**Source:** Use for AI summary usage counter

```tsx
// "3 of 3 used this week" → animated when count changes
<AnimatedCounter value={3 - usedCount} />
<span> summaries left this week</span>
```

### 10. Magnetic Button

**Source:** Onboarding CTAs ("Continue →", "Get Started")

The magnetic pull effect makes onboarding feel playful. Use on Step 5 completion CTA only — overuse kills the effect.

### 11. Ripple

**Source:** Landing page hero background

Subtle ripple effect behind the hero section on the landing page. Use `var(--color-primary)` as ripple colour. Sets the "alive" tone immediately.

---

## 23. Design Tokens Reference

Complete design token file for the project:

```css
/* tokens.css — import before globals.css */

:root {
  /* Fonts */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'DM Sans', system-ui, sans-serif;
  --font-accent: 'Instrument Serif', Georgia, serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-2xl: 2rem;
  --radius-full: 9999px;

  /* Animation durations */
  --dur-micro: 150ms;
  --dur-fast: 250ms;
  --dur-normal: 400ms;
  --dur-slow: 700ms;
  --dur-page: 900ms;

  /* Easing */
  --ease-smooth: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-sharp: cubic-bezier(0.76, 0, 0.24, 1);

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.06);
  --shadow-book: 4px 6px 24px rgba(0, 0, 0, 0.15);

  /* Z-Index scale */
  --z-base: 0;
  --z-raised: 10;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-toast: 500;
  --z-vibe-sweep: 9999;

  /* Component-specific */
  --sidebar-width: 240px;
  --sidebar-collapsed: 60px;
  --topbar-height: 64px;
  --bottom-nav-height: 80px;
  --book-card-width: 160px;
  --book-cover-aspect: 2/3;
}
```

---

## Quick Reference: Component → Technology Map

| UI Element            | Technology                | Source         |
| --------------------- | ------------------------- | -------------- |
| Auth page             | Animated Characters Login | 21st.dev/erikx |
| Book cards (3D hover) | GSAP rotateX/Y            | Custom         |
| Shelf tabs            | Animated Tabs             | 21st.dev       |
| Home feed grid        | Bento Grid                | 21st.dev       |
| Mobile nav            | Floating Dock             | 21st.dev       |
| AI generating state   | TextShimmer               | 21st.dev       |
| Premium CTA           | Shimmer Button            | 21st.dev       |
| Usage counter         | Animated Counter          | 21st.dev       |
| Onboarding CTA        | Magnetic Button           | 21st.dev       |
| Page transitions      | Framer Motion             | npm            |
| Scroll reveals        | GSAP ScrollTrigger        | npm            |
| Vibe switch           | GSAP + CSS vars           | Custom         |
| Hero text             | GSAP SplitText            | npm            |
| Carousels             | Embla Carousel            | npm            |
| Toasts                | Sonner                    | npm            |
| Confetti              | react-confetti            | npm            |
| Shelf drag            | react-spring              | npm            |
| CSV parse             | PapaParse                 | npm            |
| Base components       | shadcn/ui                 | shadcn         |
| Icons                 | Lucide React (primary)    | npm            |
| Accent icons          | Phosphor Icons            | npm            |

---

_UI/UX Bible v1.0 — Readmora, April 2026_
_Built for readers who give a damn about how their reading life looks._
