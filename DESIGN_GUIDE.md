# fabric-lens — Look & Feel Design Guide

> Version 0.2 — Living document. Iterate as the product matures.
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
- A base spacing unit (e.g., 4px) that all spacing derives from: 4, 8, 12, 16, 24, 32, 48, 64
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

**Three words:** Precise. Dense. Trustworthy.

fabric-lens is a governance intelligence tool for enterprise Fabric admins. These are people who manage hundreds of workspaces, make decisions based on data density, and need to trust what they see. The design should feel like an instrument panel — every element earns its space, nothing is decorative, and the visual language communicates authority.

**Aesthetic direction:** Industrial precision meets editorial clarity. Think Linear's data density, Vercel's typographic confidence, and Azure Portal's functional seriousness — but with a sharper visual identity that's unmistakably fabric-lens, not generic admin template.

**The one thing people should remember:** The health scoring visualization. A workspace grid where every cell pulses with a color-coded health grade — the instant "state of the tenant" that no other tool provides.

---

### Color System

#### Design Tokens (CSS Custom Properties)

All colors are defined as semantic tokens, not raw hex values. This enables theme switching and ensures every color usage has a reason.

**Implementation:** Define in `src/index.css` using `@theme` (Tailwind v4) so tokens are available as both CSS variables and Tailwind utilities (e.g., `bg-[var(--surface-primary)]` or via `@theme` integration).

```css
:root {
  /* ─── Surface Hierarchy ─── */
  --surface-root:        #FAFBFC;    /* Page background */
  --surface-primary:     #FFFFFF;    /* Cards, panels */
  --surface-secondary:   #F3F4F6;    /* Nested containers, table headers */
  --surface-tertiary:    #E8EAED;    /* Hover states, selected rows */
  --surface-inverse:     #111827;    /* Tooltips, dropdowns on light */

  /* ─── Border ─── */
  --border-default:      #E2E4E9;
  --border-strong:       #C9CCD1;
  --border-focus:        #3B6CE7;    /* Focus ring — the signature blue */

  /* ─── Text ─── */
  --text-primary:        #111827;    /* Headings, primary content */
  --text-secondary:      #4B5563;    /* Supporting text, descriptions */
  --text-tertiary:       #9CA3AF;    /* Placeholders, timestamps */
  --text-inverse:        #F9FAFB;    /* Text on dark surfaces */
  --text-link:           #3B6CE7;

  /* ─── Brand ─── */
  --brand-primary:       #3B6CE7;    /* Signature blue — actions, links, focus */
  --brand-primary-hover: #2F5AC4;
  --brand-primary-subtle:#EBF0FD;    /* Blue tint for selected states */

  /* ─── Semantic: Health Scores ─── */
  --health-a:            #059669;    /* Grade A — Emerald 600 */
  --health-a-bg:         #ECFDF5;
  --health-b:            #3B6CE7;    /* Grade B — Brand blue */
  --health-b-bg:         #EBF0FD;
  --health-c:            #D97706;    /* Grade C — Amber 600 */
  --health-c-bg:         #FFFBEB;
  --health-d:            #EA580C;    /* Grade D — Orange 600 */
  --health-d-bg:         #FFF7ED;
  --health-f:            #DC2626;    /* Grade F — Red 600 */
  --health-f-bg:         #FEF2F2;

  /* ─── Semantic: Status ─── */
  --status-active:       #059669;
  --status-active-bg:    #ECFDF5;
  --status-inactive:     #9CA3AF;
  --status-inactive-bg:  #F3F4F6;
  --status-warning:      #D97706;
  --status-warning-bg:   #FFFBEB;
  --status-error:        #DC2626;
  --status-error-bg:     #FEF2F2;

  /* ─── Semantic: Item Types ─── */
  --item-lakehouse:      #3B6CE7;    /* Blue */
  --item-notebook:       #7C3AED;    /* Violet */
  --item-pipeline:       #059669;    /* Emerald */
  --item-warehouse:      #0891B2;    /* Cyan */
  --item-report:         #D97706;    /* Amber */
  --item-semantic-model: #DB2777;    /* Pink */
  --item-dashboard:      #EA580C;    /* Orange */
  --item-default:        #6B7280;    /* Gray */

  /* ─── Radius ─── */
  --radius-sm:  4px;     /* Badges, small elements */
  --radius-md:  6px;     /* Buttons, inputs */
  --radius-lg:  8px;     /* Cards, panels */
  --radius-xl:  12px;    /* Modals, popovers */

  /* ─── Shadow ─── */
  --shadow-sm:   0 1px 2px rgba(0,0,0,0.05);
  --shadow-md:   0 2px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-lg:   0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);

  /* ─── Transitions ─── */
  --transition-fast:   120ms ease-out;
  --transition-normal: 200ms ease-out;
  --transition-slow:   300ms ease-out;
}
```

**Spacing:** Use Tailwind's built-in 4px-based scale directly — no custom CSS variables needed. Tailwind classes map 1:1 to the design intent:

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

Not a simple inversion. Dark mode uses a blue-tinted dark base (not pure black) for depth and warmth.

```css
.dark {
  --surface-root:        #0B1120;    /* Deep navy, not pure black */
  --surface-primary:     #111827;    /* Cards */
  --surface-secondary:   #1A2332;    /* Nested containers */
  --surface-tertiary:    #243044;    /* Hover, selected */
  --surface-inverse:     #F9FAFB;

  --border-default:      #1E293B;
  --border-strong:       #334155;
  --border-focus:        #5B8DEF;    /* Lighter blue for visibility */

  --text-primary:        #F1F5F9;
  --text-secondary:      #94A3B8;
  --text-tertiary:       #64748B;
  --text-inverse:        #111827;
  --text-link:           #5B8DEF;

  --brand-primary:       #5B8DEF;    /* Lighter for dark bg contrast */
  --brand-primary-hover: #7BA4F7;
  --brand-primary-subtle:#1E2A4A;

  /* Health + status colors stay the same — they're already vivid enough */
  /* Backgrounds shift to dark-tinted versions */
  --health-a-bg:         #062E1E;
  --health-b-bg:         #1E2A4A;
  --health-c-bg:         #2E2206;
  --health-d-bg:         #2E1A06;
  --health-f-bg:         #2E0A0A;

  --status-active-bg:    #062E1E;
  --status-inactive-bg:  #1A2332;
  --status-warning-bg:   #2E2206;
  --status-error-bg:     #2E0A0A;

  --shadow-sm:   0 1px 2px rgba(0,0,0,0.3);
  --shadow-md:   0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2);
  --shadow-lg:   0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.2);
}
```

**Why blue-tinted dark, not gray?** Gray-black feels cold and lifeless. The blue undertone creates depth, subtly connects to the brand blue, and makes the data visualization colors pop with more vibrancy. Linear, Vercel, and Raycast all use this pattern.

**Current state:** The app already uses Tailwind's `slate` palette for dark mode (`bg-slate-900`, `bg-slate-950`), which is blue-tinted by design. The semantic tokens above provide a formalized layer on top.

---

### Typography

**Font pairing:** One family, two weights of opinion. This keeps the system tight while allowing hierarchy.

| Role | Font | Weight | Size | Line Height | Letter Spacing |
|------|------|--------|------|-------------|----------------|
| **Display** (page titles) | Geist Sans | 600 (semibold) | 24px / 1.5rem | 1.2 | -0.02em |
| **Heading** (section titles) | Geist Sans | 600 | 18px / 1.125rem | 1.3 | -0.01em |
| **Subheading** (card titles) | Geist Sans | 500 (medium) | 15px / 0.9375rem | 1.4 | -0.005em |
| **Body** (default text) | Geist Sans | 400 (regular) | 14px / 0.875rem | 1.5 | 0 |
| **Small** (captions, timestamps) | Geist Sans | 400 | 12px / 0.75rem | 1.5 | 0.01em |
| **Mono** (IDs, endpoints, code) | Geist Mono | 400 | 13px / 0.8125rem | 1.5 | 0 |

**Why Geist?** Created by Vercel — it's optimized for interfaces, has tight letter-spacing that works at data-dense sizes, includes a monospace companion for technical content, and isn't overused in the Fabric community (unlike Inter/Segoe). It signals "modern developer tooling."

**Installation:**
```bash
npm install @fontsource-variable/geist-sans @fontsource-variable/geist-mono
```

**Setup in `src/index.css`:**
```css
@import '@fontsource-variable/geist-sans';
@import '@fontsource-variable/geist-mono';
```

**Tailwind v4 usage** (in `src/index.css` `@theme` block):
```css
@theme {
  --font-sans: 'Geist Sans Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --font-mono: 'Geist Mono Variable', ui-monospace, 'Cascadia Code', 'Fira Code', monospace;
}
```

**Fallback stack:** `'Geist Sans Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`

**Type rules:**
- Page titles: one per page, always `Display`
- Never bold body text for emphasis — use `text-secondary` for de-emphasis instead, or `Subheading` weight for emphasis
- Monospace for all GUIDs, workspace IDs, API endpoints, OneLake URLs
- Numbers in tables: tabular-nums (monospace digits for alignment)

**Current state:** 🔄 The app uses system fonts via Tailwind defaults. Geist is a planned upgrade — current system fonts (which include Segoe UI on Windows) are functional but lack the typographic identity that Geist provides.

---

### Iconography ✅

**Library:** Lucide React (consistent 24px stroke icons, 1.5px stroke width)

**Rules:**
- Navigation icons: 20px, `text-tertiary` default, `text-primary` when active
- Inline icons: 16px, same color as adjacent text
- Status icons: 16px, colored to match semantic status (CheckCircle = active green, XCircle = error red)
- Never mix filled and outlined icons on the same surface
- Health grade badges use text (A, B, C, D, F) not icons — the letter is the icon

---

### Component Patterns

#### Cards ✅
- Background: `bg-white dark:bg-slate-900` (maps to `--surface-primary`)
- Border: `border border-slate-200 dark:border-slate-800`
- Radius: `rounded-lg` (8px)
- Padding: `p-5` (20px)
- Shadow: `shadow-sm` at rest, `shadow-md` on hover (only if clickable)
- No shadow in dark mode — use border only (shadows are invisible on dark)

#### Data Tables ✅
- Header row: `bg-slate-50 dark:bg-slate-900/50`, `text-slate-500`, medium weight
- Body rows: white background, alternate row striping OFF (too noisy for dense data)
- Hover: `hover:bg-slate-50 dark:hover:bg-slate-900/50`
- Selected: brand-subtle background with left border accent
- Cell padding: `py-3 px-4`
- Sortable column headers: subtle up/down chevron, colored when active sort
- Monospace for IDs and numeric columns: `font-variant-numeric: tabular-nums`

#### Badges / Tags ✅
- Radius: `rounded` (4px)
- Padding: `px-2 py-0.5`
- Font: 12px, weight 500
- Item type badges: colored background with matching text (see ItemTypeBadge.tsx)
- Status badges: semantic color background with matching text
- Health grade badges: circular (28px), `rounded-full`, centered letter, colored background

#### Buttons ✅
- Primary: `bg-blue-600 text-white rounded-md`
- Secondary: `border border-slate-200 text-slate-700` (transparent background)
- Ghost: no border, no background, `text-slate-500`, hover shows `bg-slate-100`
- All buttons: `h-9` (36px), `px-4`, medium weight
- Hover: shift background 1 shade darker, `transition-colors duration-150`
- Disabled: `opacity-50 cursor-not-allowed`

#### Sidebar ✅
- Width: 240px (hidden below `md` breakpoint, mobile uses bottom nav)
- Background: `bg-white dark:bg-slate-900` with right border
- Nav items: `h-9`, `rounded-md`, full-width
- Active item: `bg-blue-50 dark:bg-blue-950/40` with `border-l-2 border-blue-600` and blue text
- Hover: `bg-slate-100 dark:bg-slate-800`

---

### Motion & Interaction

#### Principles
1. **Functional, not decorative:** Every animation communicates state (loading, transitioning, completing)
2. **Fast defaults:** 120ms for hover/press, 200ms for content transitions, 300ms for layout shifts
3. **Ease-out only:** All transitions use ease-out (content decelerates into place — feels natural)
4. **No bounce, no overshoot:** Governance tools feel confident, not playful

#### Specific Patterns
- **Table row hover:** Background color transition 120ms ✅
- **Card hover (if clickable):** Shadow deepens 120ms, translate-y: -1px 🎯
- **Loading skeletons:** Pulse animation (opacity 0.4 → 0.7 → 0.4), 1.5s ease-in-out, infinite 🔄
- **Toast notifications:** Slide in from top-right, auto-dismiss after 5s ✅
- **Health score ring:** On first render, circular progress animates from 0 to target, 600ms ease-out 🎯
- **Sort indicator:** Rotate 180° on direction change, 200ms 🎯
- **Page transitions:** Content fade-in with 10px upward slide, 200ms ease-out, staggered 50ms 🎯

#### What NOT to animate
- Data table content changes (rows appearing/disappearing should be instant)
- Navigation between pages (no page-level slide transitions — they slow perceived speed)
- Badge colors (status changes are instant — animation would imply uncertainty)

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
- Stat cards: 4-column grid on desktop (1280px+), 2 on tablet, 1 on mobile
- Charts: 2-column grid on desktop, stacked on tablet
- Gap between grid items: `gap-5` (20px)
- Content sections (stat row, chart row, issues panel): separated by `gap-8` (32px)
- Cards never touch each other — always separated by gap

**Responsive breakpoints (Tailwind):**
- `lg:` (≥1024px): Full layout, sidebar visible, 4-col stat grid
- `md:` (≥768px): Sidebar visible, 2-col stat grid, tables scroll horizontally
- Default (<768px): Bottom navigation, single column, stacked everything

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
| Loading | Skeleton placeholders (no text) | "Loading..." spinner |
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

### Visual Signature — The Health Grid 🎯

> **Status:** Planned feature — not yet implemented. This is the #1 visual differentiator.

The *one thing* people will screenshot and share: the tenant health grid on the Dashboard page.

Every workspace rendered as a small tile in a dense grid, color-coded by health grade. Hovering reveals the workspace name and score. Clicking navigates to detail. From a distance, it looks like a heat map of your tenant's governance posture.

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
- Each cell: 32x32px, `rounded` (4px), health grade color background, white letter centered
- Hover: `scale(1.15)` with tooltip showing workspace name and score
- Click: navigate to workspace detail page
- Grid: CSS Grid with `auto-fill`, `minmax(32px, 1fr)`, auto-sizes to viewport width
- Transition: scale on hover at 120ms ease-out

This becomes the hero visual in README screenshots, LinkedIn posts, and conference slides.

**Implementation:** `src/components/dashboard/HealthGrid.tsx`

---

### Migration Path

The design system is adopted incrementally. Priority order:

| Phase | What | Impact |
|-------|------|--------|
| 1 | CSS design tokens in `index.css` | Foundation for all components |
| 2 | Geist font installation | Typographic identity |
| 3 | Migrate components to use tokens | Consistent surfaces, borders, text |
| 4 | Health Grid on Dashboard | Visual signature |
| 5 | Motion & interaction polish | Perceived quality |
| 6 | Full audit against checklist | Cohesion |

Each phase ships independently. No big-bang rewrite.

---

### Design Checklist

Before shipping any page, verify:

- [ ] All colors use semantic tokens or Tailwind slate palette (no arbitrary hex)
- [ ] Typography uses only the defined type scale (no arbitrary sizes)
- [ ] Spacing uses Tailwind's 4px-based scale (`p-1` through `p-16`)
- [ ] Every interactive element has visible hover + focus states
- [ ] Loading states use skeletons matching content shape
- [ ] Empty states have clear guidance text
- [ ] Error states are specific and actionable
- [ ] Dark mode tested — no invisible text, no lost borders, no broken shadows
- [ ] Tables are horizontally scrollable on narrow viewports
- [ ] Health scores use the correct semantic colors (A=emerald, B=blue, C=amber, D=orange, F=red)
- [ ] Monospace applied to all IDs, URLs, and technical strings
- [ ] No orphaned headings (every heading has content below it)
- [ ] Page answers one primary question clearly
- [ ] Toasts are brief and specific (include counts/names, not generic "Success!")
