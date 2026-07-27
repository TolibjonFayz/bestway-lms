# web — Best Way LMS frontend

Vue 3 + Vite + Pinia + Vue Router. No UI component library: the `Bw*` kit in
`src/components/base/` is built by hand from `design/01-design-system.html`.

## Talablar

- Node 22, npm 11 (Windows / PowerShell)

## Oʻrnatish

```bash
npm install --prefix web
```

## Ishga tushirish

```bash
npm run dev --prefix web
```

Dev server: <http://localhost:5190>. `/` avtomatik `/kitchen-sink` ga yoʻnaltiradi.

| Buyruq | Nima qiladi |
|---|---|
| `npm run dev --prefix web` | Dev server (HMR) |
| `npm run build --prefix web` | Production build → `web/dist/` |
| `npm run preview --prefix web` | Build qilingan versiyani koʻrish |

Claude Code ichida dev serverni `preview_start` bilan, `bestway-lms-web`
konfiguratsiyasi orqali ishga tushiring (`.claude/launch.json`) — `npm run dev`
ni Bash orqali ishlatmang.

## /kitchen-sink

Dev-only sahifa. Kitning har bir komponentini har bir holatda, dizayn tizimi
sahifasining tartibida koʻrsatadi — fidelity shu yerda tekshiriladi.
Production build'da bu route umuman qoʻshilmaydi (`src/router/index.js`).

Sahifani dizayn bilan solishtirish: `design/01-design-system.html` faylini
brauzerda ochib, yonma-yon qoʻying.

## Struktura

```
web/src/
  assets/tokens.css       # :root tokenlar — CLAUDE.md dagi qiymatlar + dizayndagi qoʻshimchalar
  assets/base.css         # reset, Plus Jakarta Sans, tipografiya shkalasi
  components/base/        # Bw* komponent kiti
  composables/            # useToast, usePhoneFormat
  locales/uz.js           # barcha oʻzbekcha UI matnlari
  router/                 # Vue Router
  stores/                 # Pinia store'lar (hozircha boʻsh)
  api/                    # axios modullari (hozircha boʻsh)
  dev/                    # faqat dev: /kitchen-sink sahifasi + dsCopy.js
```

`dev/` production build'ga umuman kirmaydi — shuning uchun uning matnlari
`uz.js` da emas, `dev/dsCopy.js` da turadi.

## Qoidalar

- Komponentda hech qachon raw hex/rgb rang yoki raw soya yozilmaydi — faqat
  token. Kerakli tus yoʻq boʻlsa, avval `tokens.css` ga qoʻshiladi.
- Barcha UI matnlari `src/locales/uz.js` orqali oʻtadi.
- Har bir komponent `<script setup>` + `<style scoped>`.
- Toʻliq qoidalar: [`../CLAUDE.md`](../CLAUDE.md).

## Kit komponentlari

| Komponent | Asosiy props |
|---|---|
| `BwButton` | `variant` primary/secondary/ghost/danger · `size` sm/md/lg · `disabled` · `loading` · `#leading` / `#trailing` slotlar |
| `BwInput` | `type` text/password/email/tel/number · `label` · `helper` · `error` · `disabled` |
| `BwPhoneInput` | `format` spaced/parens · `flag` · `v-model` = 9 ta raqam |
| `BwSelect` | `options` (string yoki `{value,label}`) · `placeholder` · `error` |
| `BwSearchInput` | `placeholder` · `@search` |
| `BwCheckbox` / `BwRadio` | `v-model` (radio uchun `name` majburiy) |
| `BwCard` | `variant` plain/stat/lesson/list/section |
| `BwStatCard` | `icon` · `tone` · `value` · `unit` · `label` · `delta` |
| `BwLessonCard` | `title` · `meta` · `status` · `level` · `progress` · `@action` |
| `BwListRow` | `icon` · `tone` · `title` · `meta` · `chevron` · `#trailing` |
| `BwProgressBar` | `value` 0–100 · `label` · `size` md/sm |
| `BwProgressRing` | `value` · `size` · `strokeWidth` · `caption` · `checkWhenComplete` |
| `BwStepIndicator` | `variant` circles/segments · `total` · `current` |
| `BwBadge` | `variant` done/progress/todo/new/level·level-active/level-current/level-solid · `size` md/sm/xs |
| `BwAvatar` / `BwAvatarGroup` | `name` · `src` · `size` · `tone` · guruh uchun `items` + `max` |
| `BwNotificationBell` | `count` yoki `dot` |
| `BwEmptyState` | `title` · `description` · `actionLabel` · `#illustration` |
| `BwToast` + `useToast()` | `success/warning/error/info(title, { description, duration })` |
| `BwSkeleton` | `variant` line/block/circle · `width` · `height` · `lines` |
| `BwIcon` | dizayndagi SVG toʻplami · `name` · `size` · `strokeWidth` |
| `BwIconTile` | ikonka ostidagi rangli kvadrat · `size` · `radius` · `tone` |

`BwToastHost` `App.vue` da bir marta joylashtirilgan — sahifalarda takrorlanmaydi.
