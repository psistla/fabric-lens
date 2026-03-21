# fabric-lens — Look & Feel Design Guide

> Version 0.3 — Living document. Iterate as the product matures.
>
> **Status Key:** ✅ Implemented | 🔄 Partially done | 🎯 Planned

---

## Part 1: Analysis — The Seven Pillars of Cohesive Design

What makes a web app feel *designed* rather than *assembled*? It's not any single layer — it's the alignment across seven distinct dimensions. When all seven reinforce the same identity, the result feels inevitable. When even one is misaligned, the whole thing feels off. Here's the framework:

### 1. Visual Identity (What it looks like at a glance)

This is the surface layer — color, typography, iconography, spacing. It's what screenshots capture. Most developers stop here and think they've "designed" the app. But visual identity alone is decoration. It becomes *design* only when it encodes meaning.

**What makes it cohesive:**
- A dominant color + sharp accent creates hierarchy (not 5 equally-weighted colors)
- Typography has exactly two weights of opinion: a display voice and a body voice
- Spacing follows a mathematical scale, not arbitrary pixel values
- Every visual choice can answer "why this, not that?"

**What breaks it:**
- Colors that don't map to meaning (blue badge on one page, blue badge meaning something different on another)
- Typography that shifts between pages (one page uses 14px body, another uses 16px)
- Inconsistent border-radius, shadow depth, or spacing between components that should be siblings

### 2. Information Architecture (What the user sees when)

This is the skeleton — how content is organized, what's shown vs. hidden, what's one click away vs. three. It determines whether the app feels simple or overwhelming regardless of how pretty it is.

**What makes it cohesive:**
- Progressive disclosure: summary → detail → raw data, consistently applied
- Every page answers one primary question (Dashboard: "Is my tenant healthy?", Workspaces: "What do I have?", Capacity: "What am I spending?")
- Navigation depth is predictable (list → detail → sub-detail, never list → modal → redirect → detail)
- Data density matches the user's intent at each level

**What breaks it:**
- A dashboard that shows 40 metrics with no hierarchy
- Drill-down patterns that change between modules (click on one page, hover on another, expand on a third)
- Search that works in one section but not another

### 3. Interaction Design (How things respond to input)

This is the nervous system — hover states, click feedback, transitions, loading patterns. It's what makes the app feel alive or dead.

**What makes it cohesive:**
- Every clickable element has a visible hover state
- Transitions have consistent duration and easing (not 200ms ease-in on one component, 400ms linear on another)
- Loading states are predictable: skeletons in the same shape as the content they replace
- Destructive actions always confirm; safe actions never do

**What breaks it:**
- Buttons that don't visually respond to hover or press
- Jarring page transitions mixed with smooth component animations
- Some tables sort on click, others don't, with no visual differentiation
- Inconsistent feedback: sometimes a toast, sometimes inline, sometimes nothing

### 4. Behavioral Patterns (How the system acts without being asked)

This is the intelligence layer — defaults, auto-refresh, caching, graceful degradation. It's what separates a tool from a product.

**What makes it cohesive:**
- Smart defaults: dark mode follows OS preference, last-viewed workspace remembered
- Data freshness is transparent: "Last refreshed 3 min ago" with a manual refresh option
- Errors are specific and actionable: "Fabric Admin role required for security audit" not "Error 403"
- The app works progressively: non-admin users see everything except admin features, rather than hitting a wall

**What breaks it:**
- State that resets on every page navigation
- Silent failures where data just doesn't load and nothing indicates why
- Features that are technically present but broken for the user's permission level, with no explanation
- No memory of user preferences between sessions

### 5. Emotional Tone (How the app makes people feel)

This is the personality layer — copy, empty states, success moments, error messages. It determines whether people *want* to use the app or merely *have* to.

**What makes it cohesive:**
- A consistent voice: professional but not corporate, precise but not cold
- Empty states feel like invitations, not dead ends ("No workspaces found" vs. "Connect to your Fabric tenant to see workspaces here")
- Health scores feel motivating, not punitive (grade improvement suggestions, not just red marks)
- The app celebrates good governance: green scores feel earned, not default

**What breaks it:**
- Mixing casual and formal copy ("Hey!" on one page, "An error has occurred" on another)
- Empty states with no guidance
- Error messages that blame the user
- No positive reinforcement — everything is either neutral or negative

### 6. Spatial Rhythm (How elements breathe on the page)

This is the invisible structure — whitespace, alignment grids, content width, visual weight distribution. It's what makes a page feel calm or claustrophobic, balanced or lopsided.

**What makes it cohesive:**
- A base spacing unit (4px) that all spacing derives from: 4, 8, 12, 16, 24, 32, 48, 64
- Content areas have consistent max-width (data tables stretch, text blocks don't)
- Cards and sections have uniform internal padding
- Visual weight distributes evenly — no page feels top-heavy or left-heavy

**What breaks it:**
- Arbitrary spacing that varies between similar components
- Some cards have 16px padding, siblings have 24px, with no reason for the difference
- Tables that are wider than their container on some screens
- Sidebar and content area that don't feel like they belong to the same page

### 7. Brand Resonance (How the app connects to its purpose)

This is the soul — does the visual language *feel* like what it does? A governance tool should feel authoritative and trustworthy. A creative tool should feel expressive. A developer tool should feel precise.

**What makes it cohesive:**
- The aesthetic matches the domain: fabric-lens is a governance/intelligence tool, so it should feel precise, data-dense, trustworthy — not playful or decorative
- Visual metaphors are consistent: "lens" suggests clarity, focus, transparency — which maps to clean sight lines, high contrast, and sharp typography
- The palette evokes the Microsoft Fabric ecosystem without copying it — adjacent, not derivative

**What breaks it:**
- A governance dashboard that looks like a consumer social app
- Design language that fights the content (rounded, soft, pastel for a security audit tool)
- No visual connection to the problem domain

---

## Part 2: fabric-lens Design Specifications

### Design Philosophy

**Three principles:** Minimal but not empty. Data-dense but cognitively calm. Calm, confident visual language.

fabric-lens is a governance intelligence tool for enterprise Fabric admins. These are people who manage hundreds of workspaces, make decisions based on data density, and need to trust what they see. The design should feel like an instrument panel — every element earns its space, nothing is decorative, and the visual language communicates authority through restraint.

**Aesthetic direction:** Industrial precision meets editorial clarity. Think Linear's data density, Vercel's typographic confidence, and Azure Portal's functional seriousness — but with a sharper visual identity that's unmistakably fabric-lens, not generic admin template.

**The one thing people should remember:** The health scoring visualization. A workspace grid where every cell pulses with a color-coded health grade — the instant "state of the tenant" that no other tool provides.

---

### Color System ✅

#### Design Tokens (CSS Custom Properties)

All colors use the `--m-*` prefix. Tokens are defined in `src/index.css` and available as CSS variables. Use `bg-[var(--m-bg)]`, `text-[var(--m-text)]`, etc. in Tailwind classes.

```css
:root {
  /* ─── FONTS ─────────────────────────────────────────────── */
  --m-font-primary: 'Manrope Variable', system-ui, -apple-system, sans-serif;
  --m-font-code:    'JetBrains Mono Variable', 'Fira Code', 'Consolas', monospace;

  /* ─── NEUTRAL PALETTE ────────────────────────────────────── */
  --m-neutral-0:   #FFFFFF;
  --m-neutral-50:  #F8F9FA;
  --m-neutral-100: #F1F3F5;
  --m-neutral-200: #E9ECEF;
  --m-neutral-300: #DEE2E6;
  --m-neutral-400: #ADB5BD;
  --m-neutral-500: #868E96;
  --m-neutral-600: #495057;
  --m-neutral-700: #343A40;
  --m-neutral-800: #212529;
  --m-neutral-900: #16191D;
  --m-neutral-950: #0D0F12;

  /* ─── PRIMARY PALETTE (Deep Indigo) ─────────────────────── */
  --m-primary-50:  #EEF2FF;   --m-primary-600: #4F46E5;  /* ← brand primary */
  --m-primary-100: #E0E7FF;   --m-primary-700: #4338CA;  /* ← hover */
  --m-primary-200: #C7D2FE;   --m-primary-800: #3730A3;
  --m-primary-300: #A5B4FC;   --m-primary-900: #312E81;
  --m-primary-400: #818CF8;   /* ← dark mode primary */
  --m-primary-500: #6366F1;

  /* ─── ACCENT PALETTE (Warm Amber) ───────────────────────── */
  --m-accent-50:  #FFFBEB;   --m-accent-500: #F59E0B;  /* decorative only */
  --m-accent-100: #FEF3C7;   --m-accent-600: #D97706;  /* decorative only */
  --m-accent-200: #FDE68A;   --m-accent-700: #B45309;  /* ← text-safe (5.02:1) */
  --m-accent-300: #FCD34D;   --m-accent-800: #92400E;
  --m-accent-400: #FBBF24;   --m-accent-900: #78350F;  /* ← AAA on #FBBF24 bg */

  /* ─── SEMANTIC COLORS ────────────────────────────────────── */
  --m-success:      #15803D;   --m-success-bg:   #F0FDF4;   --m-success-text: #14532D;
  --m-warning:      #EA580C;   --m-warning-bg:   #FFF7ED;   --m-warning-text: #9A3412;
  --m-error:        #DC2626;   --m-error-bg:     #FEF2F2;   --m-error-text:   #991B1B;
  --m-info:         #2563EB;   --m-info-bg:      #EFF6FF;   --m-info-text:    #1E40AF;

  /* ─── SEMANTIC ALIASES ─────────────────────────────────── */
  --m-bg:             var(--m-neutral-0);      /* page background */
  --m-surface:        var(--m-neutral-50);     /* cards, panels */
  --m-surface-hover:  var(--m-neutral-100);    /* hover tint */
  --m-border:         var(--m-neutral-200);
  --m-border-subtle:  var(--m-neutral-100);
  --m-text:           var(--m-neutral-800);    /* primary text */
  --m-text-secondary: var(--m-neutral-600);    /* supporting text */
  --m-text-tertiary:  var(--m-neutral-500);    /* placeholders, timestamps */
  --m-primary:        var(--m-primary-600);    /* #4F46E5 */
  --m-primary-hover:  var(--m-primary-700);    /* #4338CA */
  --m-primary-subtle: var(--m-primary-50);     /* #EEF2FF */
  --m-accent:         var(--m-accent-700);     /* #B45309 — text-safe */
  --m-accent-subtle:  var(--m-accent-50);      /* #FFFBEB */
}
```

#### Fabric-Lens Extensions ✅

```css
:root {
  /* ─── Health Grades ─────────────────────────────────────── */
  --health-a: #15803D; --health-a-bg: #F0FDF4;  /* Emerald — success */
  --health-b: #4F46E5; --health-b-bg: #EEF2FF;  /* Indigo  — primary */
  --health-c: #B45309; --health-c-bg: #FFFBEB;  /* Amber   — accent  */
  --health-d: #EA580C; --health-d-bg: #FFF7ED;  /* Orange  — warning */
  --health-f: #DC2626; --health-f-bg: #FEF2F2;  /* Red     — error   */

  /* ─── Item Types ─────────────────────────────────────────── */
  --item-lakehouse:      #4F46E5;  /* Indigo  */
  --item-notebook:       #7C3AED;  /* Violet  */
  --item-pipeline:       #15803D;  /* Green   */
  --item-warehouse:      #0891B2;  /* Cyan    */
  --item-report:         #B45309;  /* Amber   */
  --item-semantic-model: #DB2777;  /* Pink    */
  --item-dashboard:      #EA580C;  /* Orange  */
  --item-default:        #495057;  /* Gray    */

  /* ─── Roles ──────────────────────────────────────────────── */
  --role-admin:       #DC2626;  /* Error red    */
  --role-member:      #4F46E5;  /* Indigo       */
  --role-contributor: #15803D;  /* Success green */
  --role-viewer:      #495057;  /* Neutral-600  */
}
```

**Spacing:** 4px base unit. Tailwind classes map 1:1:

| Design intent | Tailwind class | Value |
|---------------|---------------|-------|
| Tight (badges) | `p-1` | 4px |
| Compact (cells) | `p-2` | 8px |
| Default (inner) | `p-3` | 12px |
| Standard (cards) | `p-4` / `p-5` | 16px / 20px |
| Spacious (sections) | `p-6` | 24px |
| Section gaps | `gap-5` | 20px |
| Major sections | `gap-8` | 32px |

#### Dark Mode ✅

Not a simple inversion. Dark mode shifts surfaces to near-black with neutral undertones.

```css
.dark {
  --m-bg:             var(--m-neutral-950);  /* #0D0F12 */
  --m-surface:        var(--m-neutral-900);  /* #16191D */
  --m-surface-hover:  var(--m-neutral-800);  /* #212529 */
  --m-border:         var(--m-neutral-700);  /* #343A40 */
  --m-text:           var(--m-neutral-200);  /* #E9ECEF */
  --m-text-secondary: var(--m-neutral-400);  /* #ADB5BD */
  --m-text-tertiary:  var(--m-neutral-500);  /* #868E96 */
  --m-primary:        var(--m-primary-400);  /* #818CF8 — lighter for dark bg */
  --m-primary-hover:  var(--m-primary-300);  /* #A5B4FC */
  --m-primary-subtle: var(--m-primary-900);  /* #312E81 */
  --m-accent:         var(--m-accent-400);   /* #FBBF24 */
  --m-accent-subtle:  var(--m-accent-900);   /* #78350F */

  /* Health grade backgrounds — dark-tinted variants */
  --health-a-bg: #052E16;
  --health-b-bg: #1E1B4B;
  --health-c-bg: #451A03;
  --health-d-bg: #431407;
  --health-f-bg: #450A0A;

  color-scheme: dark;
}
```

**Activation:** Add `.dark` class to `<html>` or `<body>` for global toggle. Toggle lives in the Header — preference stored in `uiStore` (Zustand).

---

### Typography ✅

**Font pairing:** Manrope (interface) + JetBrains Mono (code/technical).

**Installation (self-hosted variable fonts, no CDN):**
```bash
npm install @fontsource-variable/manrope @fontsource-variable/jetbrains-mono
```

**Setup in `src/index.css`:**
```css
@import '@fontsource-variable/manrope';
@import '@fontsource-variable/jetbrains-mono';

@theme {
  --font-sans: var(--m-font-primary);
  --font-mono: var(--m-font-code);
}
```

**Type scale:**

| Role | Size | Weight | Letter-spacing | Usage |
|------|------|--------|----------------|-------|
| Display | 30–48px (3xl–5xl) | 700 | -0.03em | Hero / page hero |
| Page title | 24px (2xl) | 600 | -0.02em | `<h1>` per page |
| Section heading | 20px (xl) | 600 | -0.015em | Panel headings |
| Card title | 15px (base) | 500 | -0.005em | Card / widget headers |
| Body | 15px (base) | 400 | 0 | Default text |
| Secondary | 13px (sm) | 400 | 0 | Supporting, descriptions |
| Label / overline | 11px (xs) | 600 | 0.04em | Table headers, badge text |
| Mono | 13px (sm) | 400/500 | 0 | IDs, URLs, code |

**Type rules:**
- Headings: always negative letter-spacing (-0.015em to -0.035em), weight 600–700
- Labels/overlines: 11px, uppercase, 0.04em tracking, weight 600 — used for table headers, badge text, category labels
- Body: 15px/1.6, `text-[var(--m-text)]`
- Secondary: 13–15px, `text-[var(--m-text-secondary)]`
- Tertiary/placeholder: `text-[var(--m-text-tertiary)]` — only for text ≥14px (neutral-500 fails AA below 14px)
- Monospace for all GUIDs, workspace IDs, API endpoints, OneLake URLs: `font-mono`

---

### Iconography ✅

**Library:** Lucide React — consistent 20px default, 1.5px stroke width.

**Rules:**
- Navigation icons: 20px, `text-[var(--m-text-tertiary)]` default, `text-[var(--m-primary)]` when active
- Inline icons: 16px, same color as adjacent text
- Status icons: 16px, colored to match semantic status (`--m-success`, `--m-error`, etc.)
- Never mix filled and outlined icons on the same surface
- Health grade badges use text (A, B, C, D, F) not icons — the letter is the icon

---

### Component Patterns ✅

#### Cards ✅
- Border: `border border-[var(--m-border)]`
- Background: `bg-[var(--m-bg)]`
- Radius: `rounded-xl` (12px — `--m-radius-lg`)
- Padding: `p-4` (16px) or `p-5` (20px)
- Shadow: `shadow-[var(--m-shadow-sm)]` at rest
- Never use raw Tailwind color classes on card surfaces

#### Data Tables ✅
- Container: `rounded-xl border border-[var(--m-border)]`
- Header row: `bg-[var(--m-surface)] text-[var(--m-text-secondary)]`
- Header cells: `text-[11px] font-semibold uppercase tracking-[0.04em]`
- Body rows: `bg-[var(--m-bg)]`, `divide-y divide-[var(--m-border)]`
- Hover: `hover:bg-[var(--m-surface-hover)]`
- Cell padding: `px-4 py-2.5` (body), `px-4 py-2` (header)
- Sort icons: `text-[var(--m-text-tertiary)]` inactive, `text-[var(--m-primary)]` active
- Loading skeletons: `m-skeleton h-4 w-3/4` (uses `.m-skeleton` shimmer class)
- Monospace for IDs and technical strings

#### Badges / Tags ✅
- **Pill style (standard):** `rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide`
- Item type badges: colored background + matching text (see `ItemTypeBadge.tsx`)
- State badges: semantic color background + text (see `StateBadge.tsx`)
- Health grade badges: `rounded-full`, letter-only content, health token colors
- Role chips: pill style, filter-toggle behavior, `ring-1` when active

#### Buttons ✅
- **Primary:** `rounded-lg bg-[var(--m-primary)] px-4 py-2 font-semibold text-white hover:bg-[var(--m-primary-hover)]`
- **Secondary:** `rounded-lg border border-[var(--m-border)] bg-[var(--m-bg)] font-semibold text-[var(--m-text-secondary)]`
- **Ghost:** no border, no background, `text-[var(--m-text-secondary)] hover:text-[var(--m-text)]`
- All buttons: `font-semibold` (600 weight), `rounded-lg` (8px), minimum 44×44px touch target
- Disabled: `opacity-50 cursor-not-allowed`
- Scan / primary action buttons: `text-xs font-semibold` for toolbar-context buttons

#### Sidebar ✅
- Width: 240px (hidden on mobile — bottom nav replaces it)
- Background: `bg-[var(--m-bg)]` with right border `border-[var(--m-border)]`
- Nav items: `rounded-lg`, full-width, `h-9`
- Active: `bg-[var(--m-primary-subtle)] text-[var(--m-primary)]`
- Hover: `bg-[var(--m-surface-hover)]`

#### Skeleton Loading ✅
- Use `.m-skeleton` class for all loading placeholders — never `animate-pulse bg-...`
- The `.m-skeleton` class provides a shimmer gradient animation defined in `index.css`
- Match skeleton dimensions to the content they replace (e.g. `h-4 w-48` for a title)

#### Toast Notifications ✅
- Position: bottom-right
- Max width: `max-w-[420px]` (`--m-toast-max-w`)
- Radius: `rounded-xl` (`--m-toast-radius`)
- Z-index: `z-[var(--m-z-toast)]` (500)
- Colors: semantic `--m-success/warning/error/info` with `-bg` and `-text` variants
- Auto-dismiss: 5000ms (`--m-toast-duration`)
- Slide-in animation: `animate-toast-in`

#### Alerts / Banners ✅
- `rounded-xl border border-[var(--m-warning)] bg-[var(--m-warning-bg)] px-4 py-3`
- Text: `text-[var(--m-warning-text)]` (not the icon color — body text uses `-text` variant)
- Icon: `text-[var(--m-warning)]`
- Always pair icon + text (color is never the sole indicator)

---

### Motion & Interaction ✅

#### Principles
1. **Functional, not decorative:** Every animation communicates state
2. **Fast defaults:** 120ms hover/press, 200ms content transitions, 300ms layout shifts
3. **Ease-out entering, ease-in exiting:** `--m-transition-enter: 250ms ease-out`, `--m-transition-exit: 150ms ease-in`
4. **No bounce, no overshoot:** Governance tools feel confident, not playful
5. **Always include `prefers-reduced-motion`** override (defined globally in `index.css`)

#### Specific Patterns
- **Table row hover:** `hover:bg-[var(--m-surface-hover)]` transition 120ms ✅
- **Button hover:** background shifts via `hover:bg-[var(--m-primary-hover)]` 120ms ✅
- **Skeleton shimmer:** `.m-skeleton` class, 1.8s ease-in-out infinite ✅
- **Toast:** Slide in from right via `animate-toast-in`, auto-dismiss 5s ✅
- **Sort indicator:** Active sort shows primary-colored arrow ✅
- **Card hover (clickable):** Shadow deepens, optional translate-y: -1px 🎯
- **Health score ring:** On first render, animate from 0 to target, 600ms ease-out 🎯
- **Page transitions:** Content fade-in with 10px upward slide, 200ms, staggered 🎯

#### What NOT to animate
- Data table content changes (rows appearing/disappearing: instant)
- Navigation between pages (no page-level slide transitions — perceived speed)
- Badge colors (status changes are instant)

---

### Layout & Spatial Composition ✅

```
┌─────────────────────────────────────────────────────┐
│  Header (56px / h-14)                                │
│  [Logo]              [Breadcrumb]     [Theme] [User] │
├──────────┬──────────────────────────────────────────┤
│          │                                           │
│ Sidebar  │  Content Area                             │
│ 240px    │  max-width: 1440px                        │
│          │  padding: p-6 (24px)                      │
│          │                                           │
│ [nav]    │  ┌─────────────────────────────────────┐  │
│ [nav]    │  │ Page Title + Actions bar            │  │
│ [nav]    │  ├─────────────────────────────────────┤  │
│ [nav]    │  │                                     │  │
│ [nav]    │  │ Page Content                        │  │
│          │  │ (cards, tables, charts)              │  │
│          │  │                                     │  │
│          │  └─────────────────────────────────────┘  │
│          │                                           │
└──────────┴──────────────────────────────────────────┘

Mobile (<768px): Bottom nav replaces sidebar
```

**Grid:**
- Stat cards: 4-column on desktop (1280px+), 2 on tablet, 1 on mobile
- Charts: 2-column on desktop, stacked on tablet
- Gap between grid items: `gap-4` (16px) or `gap-5` (20px)
- Content sections separated by `space-y-6` (24px)

**Responsive breakpoints (Tailwind):**
- `lg:` (≥1024px): Full layout, sidebar visible, 4-col stat grid
- `sm:` (≥640px): 2-col stat grid, tables scroll horizontally
- Default (<640px): Bottom navigation, single column, stacked

---

### Emotional Tone & Copy ✅

#### Voice
Professional. Precise. Quietly confident. Never sarcastic, never corporate-stuffy, never exclamatory.

#### Patterns

| Situation | Do | Don't |
|-----------|-----|-------|
| Empty state | "No workspaces found. Sign in to see your Fabric tenant." | "Oops! Nothing here!" |
| Error | "Unable to load workspace data. Check your network connection and try again." | "Something went wrong." |
| Permission denied | "Security audit requires Fabric Admin role. Contact your tenant admin for access." | "Error 403: Forbidden" |
| Health score fail | "Description missing — add a description to improve discoverability." | "FAIL: No description" |
| Health score pass | "Git integration configured" (with check icon) | "PASS" |
| Loading | `.m-skeleton` placeholders matching content shape | "Loading..." spinner |
| Success | Brief toast: "Exported 47 workspaces to CSV" | "Success! Your file has been downloaded successfully!" |
| Refresh | "Updated 2 min ago" with refresh icon button | "Click here to refresh data" |

#### Health Score Framing
Health scores should feel like **opportunities**, not report cards. Each failed check includes a one-line suggestion:

> **C+ (68/100)**
> 3 checks need attention:
> - Add a workspace description to improve discoverability
> - Assign this workspace to a domain for better governance
> - Configure a workspace identity (service principal) for automation

---

### Visual Signature — The Health Grid ✅

The *one thing* people will screenshot and share: the tenant health grid on the Dashboard page.

Every workspace rendered as a small tile in a dense grid, color-coded by health grade. Hovering reveals the workspace name and score. Clicking navigates to detail. Sorted best → worst. From a distance, it looks like a heat map of your tenant's governance posture.

```
┌──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐
│A │A │B │A │C │B │A │D │A │B │
├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤
│C │A │F │B │A │B │C │A │B │A │
├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤
│B │B │A │A │D │C │A │B │A │C │
└──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘
```

**Spec:**
- Each cell: `rounded-lg` (8px), health grade color background, white/light letter centered
- Hover: `scale(1.15)` with tooltip showing workspace name and score
- Click: navigate to workspace detail page
- Grid: CSS Grid with `auto-fill`, `minmax(36px, 1fr)`
- Transition: scale on hover at 120ms ease-out
- Sort order: best score first (A → F), so governance issues cluster to the right

**Implementation:** `src/components/dashboard/HealthGrid.tsx`

---

### Anti-Patterns — NEVER ✅

These rules are non-negotiable. Violations break the design system's integrity:

| Rule | Reason |
|------|--------|
| NEVER use Inter, Roboto, Arial, or system-ui as the visible font | Manrope is the brand font |
| NEVER use `neutral-500` (#868E96) as text color for text < 14px | 3.32:1 fails WCAG AA |
| NEVER use `accent-500` (#F59E0B) or `accent-600` (#D97706) as text on white | Both fail AA; use `accent-700` (#B45309) instead |
| NEVER use rounded corners > 16px (except pills/`rounded-full`) | Violates spatial rhythm |
| NEVER use looping decorative animations | Governance tools feel confident, not playful |
| NEVER use color as the sole state indicator | Always pair with icon or text label |
| NEVER hardcode hex values in components | All colors through `--m-*` tokens or constants.ts |
| NEVER use `animate-pulse bg-...` for skeletons | Use `.m-skeleton` class instead |
| NEVER use `rounded-md` (6px) for cards | Cards use `rounded-xl` (12px) |
| NEVER use `rounded-md` for buttons | Buttons use `rounded-lg` (8px) |

---

### Chart Color Sequence ✅

From `CHART_COLORS` in `src/utils/constants.ts`. Always use in order:

```
#4F46E5  indigo-600  (primary)
#B45309  amber-700   (accent, text-safe)
#818CF8  indigo-400  (primary light)
#FBBF24  amber-400   (accent vivid)
#868E96  neutral-500 (muted)
#6366F1  indigo-500
#D97706  amber-600
#15803D  green-700
#0891B2  cyan-600
#7C3AED  violet-600
#DB2777  pink-600
#EA580C  orange-600
```

Role color map (from `ROLE_COLORS` in constants.ts):

| Role | Color | Token |
|------|-------|-------|
| Admin | #DC2626 | `--m-error` |
| Member | #4F46E5 | `--m-primary` |
| Contributor | #15803D | `--m-success` |
| Viewer | #495057 | `--m-neutral-600` |

---

### Design Checklist

Before shipping any page, verify:

- [ ] All colors use `--m-*` semantic tokens (no arbitrary hex in components)
- [ ] Typography uses the defined type scale (no arbitrary sizes)
- [ ] Spacing uses Tailwind's 4px-based scale
- [ ] Every interactive element has visible hover + focus states (`:focus-visible` ring auto-applied globally)
- [ ] Touch targets ≥ 44×44px on all interactive elements
- [ ] Loading states use `.m-skeleton` class matching content shape
- [ ] Empty states have clear guidance text
- [ ] Error/warning states use icon + text (color never sole indicator)
- [ ] Dark mode tested — no invisible text, no lost borders, no broken shadows
- [ ] Tables use `text-[11px] font-semibold uppercase tracking-[0.04em]` headers
- [ ] Badges use pill style: `rounded-full text-[11px] font-semibold uppercase tracking-wide`
- [ ] Cards use `rounded-xl border border-[var(--m-border)]`
- [ ] Tables are horizontally scrollable on narrow viewports
- [ ] Health scores use the correct semantic colors (A=emerald, B=indigo, C=amber, D=orange, F=red)
- [ ] Monospace applied to all IDs, URLs, and technical strings
- [ ] No orphaned headings (every heading has content below it)
- [ ] Page answers one primary question clearly
- [ ] Toasts are brief and specific (include counts/names, not generic "Success!")
- [ ] `prefers-reduced-motion` respected (global override in `index.css`)
