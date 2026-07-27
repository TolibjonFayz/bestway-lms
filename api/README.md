# api — Best Way LMS backend

NestJS + Sequelize + PostgreSQL 16 (local, Docker yoʻq).

## Talablar

- Node 22, npm 11
- PostgreSQL 16 — lokal yoki hosted (Railway/Neon/Supabase)

## Sozlash

```bash
npm install --prefix api
```

`api/.env.example` dan `api/.env` yarating. JWT sirlarini generatsiya qilish:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

`JWT_ACCESS_SECRET` va `JWT_REFRESH_SECRET` **har xil** boʻlishi shart — aks holda
oʻgʻirlangan access token refresh sifatida ishlatilishi mumkin, shuning uchun
ilova bunday sozlamada umuman ishga tushmaydi.

### Baza ulanishi — ikki variant

**(a) Railway va boshqa hosted Postgres.** `.env` da faqat shu qatorni toʻldiring:

```
DATABASE_URL=postgresql://postgres:PAROL@HOST.proxy.rlwy.net:PORT/railway
```

⚠️ Railway'da ikkita oʻzgaruvchi bor. **`DATABASE_PUBLIC_URL`** ni oling —
u `*.proxy.rlwy.net` ga ishora qiladi. `DATABASE_URL` esa
`*.railway.internal` ga ishora qiladi va u faqat Railway ichida ishlaydi,
noutbukdan `ENOTFOUND` beradi.

TLS avtomatik yoqiladi (localhost'dan boshqa har qanday host uchun).
`db:create` kerak emas — Railway bazani (`railway`) oʻzi yaratib beradi.

**(b) Lokal PostgreSQL.** `DATABASE_URL` ni boʻsh qoldiring va `DB_*` larni
toʻldiring, keyin `npm run db:create` ni ishlating.

## Baza

```bash
npm run db:check  --prefix api   # ulanishni tekshiradi
npm run migrate   --prefix api
npm run seed      --prefix api
```

| Buyruq | Nima qiladi |
|---|---|
| `npm run db:check` | Ulanishni tekshiradi va xato sababini tushuntiradi |
| `npm run db:create` | `bestway_lms` bazasini yaratadi (faqat lokal uchun) |
| `npm run migrate` | Migratsiyalarni qoʻllaydi |
| `npm run migrate:undo` | Oxirgi migratsiyani qaytaradi |
| `npm run seed` | Bazani tozalab, test maʼlumotlarini yozadi |
| `npm run start:dev` | Dev server (watch) |
| `npm run build` | Production build |

`synchronize` doim `false`. Sxema faqat `api/migrations/` orqali oʻzgaradi —
auto-sync bu dasturchining boshqa loyihasida ustunlarni jimgina oʻchirib
yuborgan.

## Seed maʼlumotlari

Barcha hisoblar paroli: **`bestway123`** (`SEED_PASSWORD` orqali oʻzgartiriladi).

| Rol | Telefon | Ism |
|---|---|---|
| Admin | `901112233` | Dilshod Rahmonov |
| Teacher | `901234567` | Aziz Axtamov |
| Teacher | `935558844` | Nigora Yusupova |
| Student | `901547812` | Jasur Rahimov |

Jami: 1 admin, 2 oʻqituvchi, 20 oʻquvchi (biri `active: false`), 4 guruh,
3 kurs (IELTS 6 unit, Matematika 4 unit, Tabiiy fanlar 2 unit).
Progress, submission va davomat oxirgi 2 oyga taqsimlangan.

Seed determinstik (`src/seed/rng.ts`) — qayta ishga tushirilganda bir xil
natija beradi.

## Endpointlar

| Metod | Yoʻl | Guard | Nima qiladi |
|---|---|---|---|
| POST | `/api/auth/login` | public | `{ phone, password }` → token juftligi + user |
| POST | `/api/auth/refresh` | public | `{ refreshToken }` → yangi juftlik (rotation) |
| GET | `/api/auth/me` | access token | joriy foydalanuvchi |
| POST | `/api/auth/logout` | access token | `{ refreshToken? }` — bittasi yoki barcha sessiya |

Telefon **9 ta raqam**, `+998` siz: `901234567`.

Access token 15 daqiqa, refresh 30 kun. Har `/auth/refresh` da eski refresh
bekor qilinadi va yangisi beriladi. Bekor qilingan token qayta ishlatilsa, bu
oʻgʻirlik alomati sifatida qaraladi va foydalanuvchining **barcha** sessiyalari
bekor qilinadi.

## Xatolik formati

Har qanday xato bir xil koʻrinishda qaytadi:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Yuborilgan maʼlumotlar notoʻgʻri",
  "details": [{ "field": "phone", "message": "phone 9 ta raqamdan iborat boʻlishi kerak" }],
  "path": "/api/auth/login",
  "timestamp": "2026-07-27T12:00:00.000Z"
}
```

`details` faqat validatsiya xatolarida boʻladi.

## Struktura

```
api/
  migrations/             # sequelize-cli migratsiyalari (sxema manbasi)
  sequelize.config.js     # CLI uchun konfiguratsiya (.env dan oʻqiydi)
  src/
    common/               # enum'lar, guard'lar, decorator'lar, exception filter
    config/               # @nestjs/config konfiguratsiyasi
    database/models/      # sequelize-typescript modellari
    modules/auth/         # login / refresh / me / logout
    modules/users/        # foydalanuvchi qidiruvi va parol hash'lash
    modules/lessons/      # fan ↔ element turi qoidasi
    seed/                 # npm run seed
```

## Fan ↔ element turi qoidasi

Unit ichidagi element turlari kurs faniga bogʻliq:

| Fan | video | vocabulary | test | speaking |
|---|---|---|---|---|
| ielts | ✅ | ✅ | ✅ | ✅ |
| math | ✅ | ❌ | ✅ | ❌ |
| science | ✅ | ❌ | ✅ | ❌ |

Qoida `src/common/enums.ts` da (`ITEM_TYPES_BY_SUBJECT`) eʼlon qilingan va
`LessonItemsService` da majburlanadi. Baza buni oʻzi tekshira olmaydi
(`lesson_items → units → courses` uch jadval orqali), shuning uchun **barcha**
yozish yoʻllari shu servis orqali oʻtishi kerak. Seed ham shundan foydalanadi.
