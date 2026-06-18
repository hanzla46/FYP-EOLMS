# EOLMS Frontend UI/UX Revamp — Agent Plan & Instructions

**Project:** Enterprise Livestock Management System (EOLMS) **Stack:** React + Vite + Tailwind CSS (frontend only —
backend/controllers/routes/services are OUT OF SCOPE) **Goal:** Take the current functional-but-generic UI and turn it
into a distinctive, enterprise-grade product, without breaking any existing data flow, routing, or API contracts.

---

## 0. How to use this document

This file is written to be handed directly to a coding agent. Work through it **in the phase order given in Section
11**. Do not attempt the whole revamp in a single pass — each phase has a "Definition of Done" the agent should
self-check before moving to the next phase. Section 10 lists hard constraints that apply to every phase.

Everything in Sections 1–11 assumes the page or feature already exists in the codebase and is being restyled, not built
— this is a presentation-layer revamp only. Section 12 separately lists feature ideas that surfaced while reviewing the
screenshots; those are out of scope by default unless explicitly greenlit.

---

## 1. Audit — current state (from provided screenshots)

- **Top nav** mixes primary feature navigation (Animals/Inventory/Health/...) with account actions (Users, Register
  User, Logout) as undifferentiated text links. No visual separation of "what I do here" vs "account/admin stuff."
- **Tables are flat**: plain text rows, one badge style (green "Active" pill), no severity coding for things that
  clearly need it (e.g. "Anthrax suspected" diagnosis sits in the same visual weight as "Foot Rot").
- **Breeding modal** centers over a dimmed table, hiding context the user likely needs (e.g. which Dam they're recording
  for once scrolled). The "Gender Split" range slider is a nice idea but undermined by generic styling.
- **Status colors are inconsistent**: "Active" is green, "Pregnant" is purple, with no evident system tying them
  together.
- **Notifications duplicate** the same event multiple times in a few minutes — a backend cron bug, but it directly
  determines whether a redesigned notification UI (which will likely add grouping) actually looks clean in practice.
- **"Withdrawal" and "Docs" columns are mostly empty (`—`)** in the Health Records table — worth designing an empty/zero
  state for these rather than letting blank cells read as a bug.
- Everything uses Tailwind defaults (default blue, default gray, default shadows) — recognizable as "I added Tailwind"
  rather than a designed product.

---

## 2. Design direction (the design system, not just a palette)

### 2.1 Concept

This system manages literal, physical livestock records — ear tags, vet visits, withdrawal periods, breeding lifecycles.
The design should read like a **professional field ledger**, not a generic admin-template SaaS dashboard. The signature
element (see 2.4) is grounded directly in the subject matter rather than decorative.

### 2.2 Color tokens (6 named colors — light + dark mapping)

| Token                       | Light mode | Dark mode | Use                                                            |
| --------------------------- | ---------- | --------- | -------------------------------------------------------------- |
| `pasture` (primary/brand)   | `#1F4D3A`  | `#4CAE82` | primary buttons, active nav state, links, primary chart series |
| `wheat` (accent/pending)    | `#C8862B`  | `#E0A24A` | pending/pregnant/due-soon status, secondary emphasis           |
| `clay` (critical/danger)    | `#B23A2E`  | `#E2675A` | overdue vaccinations, critical diagnoses, destructive actions  |
| `mist` (app background)     | `#F2F4F1`  | `#11181B` | page background (cool sage-tinted neutral, not warm cream)     |
| `ink` (primary text)        | `#16241D`  | `#ECEFEA` | body/heading text                                              |
| `slate` (secondary/borders) | `#6B7770`  | `#9AA79E` | secondary text, table borders, dividers                        |

Cards/surfaces sit at pure white (`#FFFFFF`) in light mode and `#16201A` in dark mode, against the `mist` background —
gives separation without leaning on heavy drop shadows everywhere.

**Status badge mapping (use consistently across every page, not per-page ad hoc colors):**

- Active / Healthy / Calved / Completed → `pasture` tint
- Pending / Pregnant / Due soon / Awaiting → `wheat` tint
- Critical / Overdue / Suspected diagnosis / Failed → `clay` tint
- Sold / Inactive / Archived → `slate` tint

### 2.3 Typography

- **Headings/UI labels:** IBM Plex Sans (Medium/SemiBold), tight tracking (`-0.01em`) on headings.
- **Body text:** IBM Plex Sans (Regular/Medium).
- **Data/ledger elements — animal tags, lot/batch codes, dosages, currency figures, dates in tables:** IBM Plex Mono.
  This is the detail that ties the whole "ledger" concept together — use it deliberately, not everywhere.
- Self-host via `@fontsource/ibm-plex-sans` and `@fontsource/ibm-plex-mono` (avoids FOUC and external font-loading
  flakiness).
- Type scale: `text-xs`(12) / `sm`(14) / `base`(16) / `lg`(18) / `xl`(20) / `2xl`(24) / `3xl`(30) / `4xl`(36) — mostly
  Tailwind defaults, just apply the mono override for ledger data.

### 2.4 Signature element — the `TagBadge`

Every place an animal ID currently appears as plain blue text (table rows, Dam/Sire columns in Breeding, the "Animal"
column in Health, notification messages, detail-page headers) gets replaced with one consistent component:

- Rounded-rectangle chip, ~26px tall, `radius-sm` (6px), monospace text with `tracking-wide`.
- A small filled circle (~6px) half-overlapping the left edge of the chip — a literal reference to an ear tag's
  punch-hole/stud. Implement as an absolutely positioned `::before` or small div.
- Background tint + circle color driven by species in list contexts (Cattle/Sheep/Goat get distinct tints) or by status
  in breeding-pipeline contexts.
- Still wraps the existing `<Link>` — navigation behavior must not change, only presentation.

This single component should appear dozens of times across the app and is the one "memorable" visual signature — keep
everything else around it disciplined and quiet.

### 2.5 Elevation & shape

- Default to flat, border-based separation (`1px solid` border token) for tables and cards — avoid the generic "every
  card has a drop shadow" admin-template look.
- Reserve `shadow-md`/`shadow-lg` only for things that float above content: dropdowns, drawers, modals, toasts,
  popovers.
- Border radius system: `6px` inputs/badges, `10px` cards/buttons, `16px` modals/drawers/panels.

### 2.6 Icons

- Use `lucide-react` for all generic UI icons (nav, actions, status). Verify exact icon names against the installed
  package version before using them — names occasionally change between versions.
- Lucide has no farm-animal-specific icons. Build 3–4 custom single-stroke line icons (cattle, goat, sheep,
  generic/other) matching lucide's visual language (24×24 viewBox, ~1.5–2px stroke, rounded caps) for species
  indicators.

---

## 3. Tailwind config additions (starting point — adjust to actual file structure)

```js
// tailwind.config.js (extend section)
extend: {
  colors: {
    pasture: { 100: '#E3EEE7', 400: '#4CAE82', 500: '#2C6B4F', 600: '#1F4D3A' },
    wheat:   { 100: '#F6E8D2', 400: '#E0A24A', 500: '#C8862B' },
    clay:    { 100: '#F5DEDB', 400: '#E2675A', 600: '#B23A2E' },
    mist:    { 50: '#F2F4F1', 900: '#11181B' },
    ink:     { 900: '#16241D', 100: '#ECEFEA' },
    slate2:  { 400: '#6B7770', 600: '#9AA79E' }, // namespaced to avoid clashing with Tailwind's built-in slate
  },
  fontFamily: {
    sans: ['"IBM Plex Sans"', 'sans-serif'],
    mono: ['"IBM Plex Mono"', 'monospace'],
  },
  borderRadius: { sm: '6px', md: '10px', lg: '16px' },
}
```

Set up `darkMode: 'class'` and a `ThemeProvider`/context (or extend the existing `AuthContext` pattern) that toggles a
`dark` class on `<html>` and persists the choice in `localStorage`.

---

## 4. Layout architecture

Replace the single top-nav-only layout with a sidebar + topbar shell. With 7+ primary sections plus admin items, a
sidebar scales better than a horizontal nav and reinforces the "control room" feel.

```
┌─────────────┬──────────────────────────────────────────────┐
│ EOLMS        │  [breadcrumb/page title]   [search]  [bell:2] [avatar v] │
├─────────────┼──────────────────────────────────────────────┤
│ Dashboard    │                                                │
│ Animals      │   [Stat] [Stat] [Stat] [Stat]                 │
│ Inventory    │   ───────────────────────────                 │
│ Health       │   [   Production trend chart    ]             │
│ Vaccinations │   [   Finance summary chart      ]             │
│ Breeding     │   [ Upcoming events ]  [ Alerts feed ]         │
│ Production   │                                                │
│ Finance      │                                                │
│ ──────────── │                                                │
│ Users        │                                                │
└─────────────┴──────────────────────────────────────────────┘
```

_(This illustrates the AppShell pattern generically — apply it to whatever Dashboard content already exists; see 6.1.)_

- Sidebar: collapsible to icon-only rail on desktop; becomes an off-canvas drawer on mobile (hamburger trigger in
  topbar).
- Topbar: page title/breadcrumb on the left, global search, notification bell (dropdown quick-peek), and a single avatar
  dropdown menu replacing the current loose "Users / Register User / Logout" links (Profile, Manage Users, Register
  User, Settings, Logout all live there now).
- Active nav item gets a `pasture` left-border + tinted background, not just a color change on text.

---

## 5. Shared component library to build

Build these once as primitives, then have every page consume them — this is the single highest-leverage change since
most pages (Animals, Inventory, Health, Vaccinations, Breeding, Production, Finance, Users) currently hand-roll their
own table markup.

| Component                       | Notes                                                                                                             |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `Button`                        | variants: primary/secondary/ghost/destructive; sizes sm/md/lg; uses `class-variance-authority` for variant logic  |
| `Badge` / `StatusPill`          | semantic variants mapped to the 4-color status system in 2.2                                                      |
| `TagBadge`                      | the signature ear-tag component (2.4)                                                                             |
| `Input` / `Select` / `Textarea` | consistent focus ring (visible, `pasture`-colored), error state styling                                           |
| `DataTable`                     | sortable headers, pagination, loading skeleton, empty state, responsive card-fallback below `md` breakpoint       |
| `FilterBar`                     | search input + filter dropdowns + applied-filter chips, replacing the current scattered select/Filter-button rows |
| `Card`, `Tabs`, `Tooltip`       | standard primitives                                                                                               |
| `Drawer` / `Sheet`              | slide-in panel for forms (replaces centered modals — see 6.6)                                                     |
| `Dialog`                        | reserved for true confirmations only (delete, destructive actions)                                                |
| `Toast`                         | via `sonner` or `react-hot-toast`, wired to create/update/delete flows                                            |
| `StatCard` + chart wrapper      | for Dashboard/Finance/Production, built on `recharts`                                                             |

Suggested new dependencies: `lucide-react`, `recharts`, `framer-motion`, `sonner`, `clsx`, `tailwind-merge`,
`class-variance-authority`, `@fontsource/ibm-plex-sans`, `@fontsource/ibm-plex-mono`. Check `package.json` first to
avoid duplicate/conflicting installs.

---

## 6. Page-by-page specs

### 6.1 Dashboard

Already fully built — this is a **restyle only**. Take whatever KPI cards, charts, and feeds already exist on the page
and rebuild their presentation using the shared `StatCard` and chart-wrapper components from Section 5, applying the
token colors from Section 2. Don't add KPIs, charts, or sections that aren't already there.

### 6.2 Animals (list + detail)

- List: `DataTable` with species icon + `TagBadge` (not plain text/link) in the Tag column, `FilterBar` replacing the
  current 3-select-plus-button row, `StatusPill` for status, pagination footer, empty/loading states.
- Detail page (already built — `AnimalDetailPage.jsx`): restyle, don't restructure. Apply a profile header with
  photo/avatar circle (species icon fallback) and `TagBadge` to whatever fields already display, and restyle whatever
  sections/tabs already exist there — don't invent new tabs if the page doesn't already split content that way.

### 6.3 Health Records

- Diagnoses like "Anthrax suspected" need a `clay`-colored severity tag, not the same plain-text weight as routine
  entries like "Foot Rot."
- "Withdrawal" column: when `> 0`, show a small `wheat` countdown chip ("12 days remaining") rather than a bare number;
  when empty, show a deliberate dash/em-state, not a blank cell.

### 6.4 Vaccination Schedules

Already built — restyle the existing list with `DataTable`/`FilterBar`/`StatusPill`/`TagBadge`. (A calendar view would
be a new feature, not a restyle — see Section 12 if you want to scope that in separately.)

### 6.5 Breeding

- Status badges (Bred/Pregnant/Calved/Failed) move onto the shared `StatusPill` system (no more standalone purple) —
  restyling an existing status, not adding a new one.
- Convert the existing "Record Calving" modal into a right-side `Drawer` instead of a centered overlay — same form, same
  fields, just a different presentation container that keeps the underlying table visible/scrollable for context.
- Restyle the existing Gender Split range slider in `pasture`/`wheat` track colors instead of default gray. (Pairing it
  with editable number inputs is a small interaction change, not pure restyle — see Section 12 if you want it.)

### 6.6 Production

Chart-first layout (yield trend over time via `recharts`) above the existing log table.

### 6.7 Finance

Income vs. expense breakdown chart + summary stat cards above the existing ledger/table view.

### 6.8 Inventory (list + detail)

Low-stock items get a `clay`/`wheat` indicator directly in the list (don't make the user open detail to discover they're
out of stock).

### 6.9 Users / Register User

Folded into the avatar dropdown menu flow (4.0) rather than sitting as loose top-nav links; table gets the same
`DataTable` treatment.

### 6.10 Notifications / Alerts

- Restyle existing notification cards with severity coding (Info → `slate`, Warning → `wheat`, Critical → `clay`) and an
  icon per category (calving, vaccination, low stock, finance).
- Restyle the existing `NotificationBell.jsx` dropdown to match.
- (Grouping near-duplicate events and a bulk "mark all read" action are new behavior, not restyle — see Section 12 if
  those don't already exist and you want to add them. The duplicates visible in your screenshot look like a backend cron
  bug, not something the UI alone can clean up.)

### 6.11 Login / Register

Branded split-screen: left panel with a quiet pasture-green textured/pattern panel, right panel with the form —
replacing what's presumably a default centered card right now.

---

## 7. Interaction, copy, and state design

- **Empty states** explain what's missing and what to do next, in the interface's voice — e.g. "No health records yet —
  log the first vet visit," not "No data."
- **Errors** state what happened and how to fix it, never apologize, never stay vague.
- **Toasts** use the same verb as the action that triggered them: a "Save" button produces a "Saved" toast, not
  "Success!" — keep the vocabulary consistent across the whole app so users learn it once.
- **Loading states** are skeletons shaped like the real content (table-row skeletons, card skeletons), not generic
  spinners.
- **Motion** (via `framer-motion`) is used sparingly and deliberately: drawer slide-in, list item enter/exit, page
  transitions. Respect `prefers-reduced-motion`. Resist adding motion everywhere — restraint is part of the design, not
  a missing feature.

---

## 8. Accessibility requirements (non-negotiable, check every page)

- Visible keyboard focus ring on every interactive element (use the `pasture` token).
- All status communicated by color must also carry a text label — never color alone.
- Drawers/modals trap focus while open and restore focus to the trigger element on close.
- Table headers use proper `<th scope="col">` markup.
- Form inputs have associated `<label>` elements, not placeholder-only labeling.
- Toasts/live alerts use `aria-live` regions.
- Respect `prefers-reduced-motion` for all `framer-motion` animations.
- Target: Lighthouse accessibility score ≥ 90 on every redesigned page.

---

## 9. Responsive strategy

- Sidebar → off-canvas drawer below `md`.
- Tables → stacked card list below `md` (each "row" becomes a compact card: `TagBadge` + 2–3 key fields + chevron to
  detail) rather than horizontal scroll — this app is realistically used by farm staff on phones in the field, not just
  admins at a desk.
- `FilterBar` collapses into a filter sheet on mobile.
- Forms/drawers become full-screen sheets on mobile instead of small centered modals.
- Test at 375px, 768px, and 1280px+ breakpoints minimum.

---

## 10. Constraints / guardrails for the agent

1. **Do not modify backend code** — controllers, routes, `services/alertService.js`, `services/notificationCron.js`, or
   any API contract. This is a frontend-only presentation-layer revamp.
2. **Do not change any frontend `services/*.js` API-calling logic, request payloads, or response handling** — only the
   components/pages consuming that data may change.
3. **Preserve every existing route path** — no breaking deep links or bookmarks.
4. Work in a dedicated branch per phase (e.g. `revamp/phase-1-shell`), commit incrementally, and don't squash/rewrite
   shared history.
5. After each page migration, do a quick functional smoke test (filters still call the right endpoint, forms still
   submit, navigation still resolves) — visual change should never silently break a wired-up feature.
6. Don't introduce a new pattern (component, color, spacing value) without first checking whether an equivalent already
   exists in Section 5/2 — the goal is fewer one-off styles, not more.
7. If a page already has data visualization (charts) or a table implementation working, restyle within that existing
   library/structure first. Only introduce `recharts` or the new `DataTable` primitive where nothing equivalent already
   exists for that page.

---

## 11. Execution roadmap (work in this order)

**Phase 0 — Setup, no visual changes** Add Tailwind tokens (Section 3), install new dependencies, set up
`ThemeProvider`/dark mode, self-host fonts. _Done when:_ app builds and runs unchanged visually, with new tokens/deps
available.

**Phase 1 — Core shell + primitives** Build the `AppShell` (sidebar + topbar, Section 4) and the base component library
(Section 5). Apply the full shell + primitives to **one pilot page only — Animals** — get it production-quality first.
_Done when:_ Animals page fully matches the new design language and is used as the reference implementation.

**Phase 2 — Shared data patterns** Build `DataTable` and `FilterBar`, migrate every other list page onto them one at a
time (Health, Vaccinations, Inventory, Finance, Production, Users, Breeding). _Done when:_ every list page uses the same
table/filter primitives — no page hand-rolls its own table markup anymore.

**Phase 3 — Remaining page redesigns** Dashboard, Animal Detail, Breeding drawer conversion, Notifications restyle,
Login/Register split-screen. _Done when:_ every page in Section 6 has been addressed.

**Phase 4 — Motion, copy, states** Apply Section 7 across the app: empty states, error copy, toasts, loading skeletons,
deliberate motion.

**Phase 5 — Accessibility & responsive QA** Run the Section 8 checklist and the Section 9 breakpoints on every page.

**Phase 6 — Polish + (optional) internal style guide** Screenshot every page light + dark, hunt down inconsistency
drift, remove dead/duplicated Tailwind classes from the old implementation. Optional but recommended for an FYP
demo/viva: add a lightweight internal `/styleguide` route rendering all component variants — cheap to build, useful to
show evaluators the system is actually systematic.

---

## 12. Optional feature additions (explicitly NOT part of the core revamp)

These surfaced while reviewing the screenshots but are new functionality, not visual restyling. Default is to skip all
of them — only build one if you've separately decided to scope it in:

- **Breeding pipeline view** — Bred → Confirmed Pregnant → Due Soon → Calved as a kanban-style alternate to the list.
- **Vaccination calendar view** — calendar-grid alternate to the list.
- **Health Records per-animal timeline** — alternate view to the flat table.
- **Notification grouping + bulk "mark all read"** — only relevant if this doesn't already exist; check the codebase
  before building.
- **Gender Split dual number inputs** alongside the existing slider in the Breeding drawer.
- **Internal `/styleguide` route** (mentioned in Phase 6) — a new page rendering all component variants, useful for an
  FYP demo but not part of the revamp itself.

If any of these turn out to already exist in parts of the codebase the screenshots didn't cover, treat them as restyle
targets like everything in Section 6 — not as new builds.

## 13. Final acceptance checklist

- [ ] All pages use the `AppShell` layout from Phase 1.
- [ ] No raw default Tailwind colors (e.g. `bg-blue-600`) remain outside the token system in Section 2/3.
- [ ] Every list page shares the `DataTable`/`FilterBar` primitives.
- [ ] Every animal ID in the app renders via `TagBadge`, not plain text/links.
- [ ] All interactive elements are keyboard-reachable with a visible focus state.
- [ ] All pages are responsive at 375px / 768px / 1280px+.
- [ ] No backend file, service logic, or API contract was modified.
- [ ] No new pages, routes, or features were added beyond what's listed in Section 12.
- [ ] Dark mode works and persists across reload.
