# Best Way LMS — project rules

Read this fully before writing any code. These rules override your defaults.

## What this is

An online learning platform for **Best Way**, a private education center in Tashkent,
Uzbekistan. It teaches **IELTS preparation, Mathematics and Natural Sciences** to students
from age 6 through adults. Levels: Elementary (A1), Pre-Intermediate (A2),
Intermediate (B1), Upper-Intermediate (B2).

Students watch video lessons, drill vocabulary, submit homework and tests, and track
progress. Teachers grade submissions. Admins build courses and manage students.

Content hierarchy: **Course → Unit → Lesson items.**
Lesson item types vary **per subject** — this is a hard requirement, not an edge case:

| Subject | Video | Vocabulary | Test | Speaking |
|---|---|---|---|---|
| IELTS / English | yes | yes | yes | yes |
| Mathematics | yes | no | yes | no |
| Natural Sciences | yes | no | yes | no |

Never assume a unit has all four item types. Never hardcode "vocabulary" into a unit view.

## Stack — fixed, do not substitute

```
bestway-lms/
  design/     # source-of-truth HTML mockups — READ ONLY, never edit
  web/        # Vue 3 + Vite + Pinia + Vue Router
  api/        # NestJS + Sequelize + PostgreSQL 16
```

- **Frontend:** Vue 3 `<script setup>` SFCs, Vite, Pinia, Vue Router, plain CSS.
- **Backend:** NestJS, Sequelize (sequelize-typescript), PostgreSQL 16 (local, no Docker).
- **Auth:** JWT access (15 min) + refresh (30 days) tokens, phone + password.
- Environment: Windows, PowerShell, Node 22, npm 11. No Docker available.

### Do NOT install a UI component library

No Element Plus, no Vuetify, no Tailwind, no shadcn. The designs in `design/` are bespoke;
fighting a framework's styles costs more than writing the component. Build our own small
component kit from the design system file. This is a deliberate decision — do not revisit it.

Allowed dependencies beyond the stack above: `axios`, `date-fns`, `@vueuse/core`.
Anything else, ask first.

## Design fidelity — the most important rule

`design/*.html` files are the specification. The built app must be visually
indistinguishable from them.

1. **Read the design file before writing the component.** Extract the exact HTML structure,
   class names, CSS values. Do not approximate from the screenshot or from memory.
2. **Copy CSS values verbatim** — spacing, radii, shadows, font sizes, line heights,
   transition timings. If the design says `padding: 18px 22px`, write `18px 22px`,
   not `1rem 1.5rem`.
3. **Keep the design's class names** (they are BEM-ish by design). A `.lesson-card__title`
   in the mockup stays `.lesson-card__title` in the SFC.
4. **Never invent UI** that is not in the design. If a state is missing (e.g. an error case
   the mockup doesn't show), build it from the design system primitives and flag it in
   your summary — do not improvise a new visual language.
5. When a design detail is genuinely ambiguous, ask. Do not guess and move on.

## Design tokens

All tokens live in `web/src/assets/tokens.css` as `:root` variables, taken from the
existing Best Way website so the platform matches the marketing site.

```css
--green:#16a34a; --green-dark:#15803d; --green-darker:#166534; --green-light:#22c55e;
--green-soft:#bbf7d0; --green-mid:#dcfce7; --green-pale:#f0fdf4;
--orange:#ea8c3c;   /* gamification: coins, streaks */
--amber:#f5b301;    /* scores, stars */
--ink:#0f172a; --ink-2:#1e293b; --gray:#64748b; --gray-2:#94a3b8;
--bg:#f8fafc; --line:#e2e8f0; --line-2:#f1f5f9; --white:#ffffff; --danger:#ef4444;
--r-sm:10px; --r-md:16px; --r-lg:22px; --r-xl:28px;
--sh-sm:0 2px 8px rgba(15,23,42,.06);
--sh-md:0 8px 24px rgba(15,23,42,.08);
--sh-lg:0 20px 48px rgba(15,23,42,.12);
--sh-green:0 16px 40px rgba(22,163,74,.28);
```

Font: **Plus Jakarta Sans** (Google Fonts), weights 400/500/600/700/800.

**Never write a raw hex/rgb color or a raw shadow in a component.** Always the token.
If you need a shade that has no token, add it to `tokens.css` first.

## Interface language

UI copy is **Uzbek (Latin script)**. Keep English only for learning-domain terms students
already use: Vocabulary, Speaking, Listening, Reading, Writing, Unit, IELTS,
Elementary/Intermediate, band score.

Canonical labels — use exactly these:

```
Bosh sahifa · Darslar · Mashq · Baholar · Reyting · Qo'shimcha dars · Profil
Tangalar · Ballar · Uyga vazifa · Davomat
Boshlash · Davom etish · Yakunlangan · Topshirish · Keyingi · Orqaga · Saqlash · Bekor qilish
```

Uzbek uses the ʻokina: **oʻ** and **gʻ** (U+02BB), not `'` or `‘`. Write `Qoʻshimcha`, `oʻquvchi`.
All user-facing strings go through `web/src/locales/uz.js` — no hardcoded strings in templates.
Dates render in Uzbek: `5-fevral, seshanba`.

## Code conventions

### Vue
- `<script setup>` only. Composition API. No Options API, no mixins.
- Component files: `PascalCase.vue`. Base kit components prefixed `Bw` (`BwButton.vue`).
- Order in SFC: `<script setup>`, `<template>`, `<style scoped>`.
- `<style scoped>` in every component. No global CSS except `tokens.css` and `base.css`.
- Props typed with `defineProps` + validators. Emits declared with `defineEmits`.
- No business logic in components — it goes in a Pinia store or a composable.
- Composables in `web/src/composables/`, named `useThing.js`.
- API calls only through `web/src/api/*.js` modules. Components never call `axios` directly.

### NestJS
- One module per domain (`auth`, `users`, `courses`, `units`, `lessons`, `submissions`,
  `progress`, `gamification`).
- Controller → Service → Model. Controllers stay thin: validation and delegation only.
- DTOs with `class-validator` on every endpoint that takes a body or query.
- **`synchronize: false` always.** Use Sequelize migrations in `api/migrations/`.
  Auto-sync has silently dropped columns on this developer's other project — never enable it.
- Every list endpoint is paginated (`page`, `limit`, default limit 20) and returns
  `{ items, total, page, limit }`.
- Guards for auth + roles. Never trust a role from the request body.

### General
- No `console.log` in committed code. Use NestJS `Logger` on the backend.
- No commented-out code, no `TODO` without a clear owner note, no dead files.
- No `any` in TypeScript. Type the actual shape.
- Comments explain **why**, not what. Match the density of surrounding code.
- Keep files under ~300 lines. Split when a component grows past that.

## Definition of done — every screen

A screen is not finished until all of these exist:

1. **Loading state** — skeleton matching the real layout, not a spinner, not a blank page.
2. **Empty state** — the design system's empty pattern with real Uzbek copy.
3. **Error state** — a retry affordance, and a human message, never a raw error dump.
4. **Async actions disable and show pending** while in flight; double-submit is impossible.
5. **Responsive** at 375px / 768px / 1280px, verified in the browser preview.
6. **Keyboard accessible** — visible focus rings, logical tab order, Escape closes overlays,
   touch targets ≥44px.
7. **No layout shift** when data loads.

## Data rules

- Money/scores/counts: integers in the DB, never floats.
- All timestamps UTC in the DB, formatted for Asia/Tashkent (UTC+5) in the UI.
- Soft-delete users (`active` flag), never hard-delete student records.
- Seed data must be realistic Uzbek names and real unit titles — never `test1`, `foo`, lorem.

## Verification — required before you report done

Do not tell the user something works until you have seen it work.

1. Start the dev servers with the preview tools (never `npm run dev` in Bash).
2. Load the screen, check the console and network panels for errors.
3. Compare against the matching `design/*.html` file side by side.
4. Screenshot the result at mobile and desktop widths and show it in your summary.

If something does not work, say so plainly with the actual output. Never claim a
screen is complete when you have not rendered it.

## Scope discipline

Build exactly what the current prompt asks for. Do not scaffold future features
"while you're in there". If you notice something worth doing later, list it at the end
of your summary instead of building it.
