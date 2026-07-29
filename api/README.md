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
| Student | `901005511` | Shahzod Umarov — endi yozilgan, progress yoʻq (empty state) |

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
| GET | `/api/dashboard` | access token, `student` roli | Oʻquvchi bosh sahifasi — bitta soʻrovda |
| GET | `/api/courses` | student | Yozilgan kurslar + umumiy jarayon |
| GET | `/api/courses/:id/units` | student | Unit yoʻl xaritasi + qulf holati |
| GET | `/api/units/:id` | student | Unit tafsiloti (qulflangan boʻlsa 403) |
| POST | `/api/progress/video` | student | `{ lessonItemId, percent, completed? }` — koʻrilgan foiz |
| GET | `/api/vocab/:unitId/words` | student | Unit soʻzlari + oʻzlashtirish darajasi |
| POST | `/api/vocab/answer` | student | `{ vocabWordId, correct }` — flashcard javobi |
| GET | `/api/tests/:lessonItemId` | student | Joriy urinishni davom ettiradi yoki oxirgi natijani koʻrsatadi |
| PUT | `/api/tests/:lessonItemId/answers` | student | `{ answers }` — qoralama javoblarni saqlaydi |
| POST | `/api/tests/:lessonItemId/submit` | student | `{ answers }` — baholaydi va yakunlaydi |
| POST | `/api/tests/:lessonItemId/retake` | student | Yangi (boʻsh) urinish boshlaydi |
| GET | `/api/marks` | student | `?month=YYYY-MM&page&limit` — oylik oʻrtacha, trend, haftalik grafik, davomat, baholangan ishlar roʻyxati |
| GET | `/api/rating` | student | `?scope=group\|branch\|all&period=week\|month\|all&page&limit` — reyting + oʻzining qatori |
| GET | `/api/profile` | student | Profil maʼlumotlari |
| GET | `/api/profile/achievements` | student | `?page&limit` — yutuqlar (earned/locked, real maʼlumotdan hisoblanadi) |
| PATCH | `/api/profile/notifications` | student | `{ enabled }` |
| POST | `/api/profile/password` | student | `{ currentPassword, newPassword }` — barcha sessiyalarni bekor qiladi |

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

## Tanga, ball va reyting

- **Tangalar** — endi haqiqiy hisob kitobi (`coin_awards` jadvali,
  `src/modules/gamification/coins.service.ts`). Video yakunlanganda 10 ta,
  lugʻat toʻliq yodlanganda 25 ta beriladi.
- **Ballar** — baholangan submission'lardagi ballar yigʻindisi
  (`dashboard/scoring.ts`); alohida jadval hali yoʻq.
- **Reyting** — faol oʻquvchilar orasida ballar boʻyicha oʻrin.
  Bali boʻlmagan oʻquvchi reytingda qatnashmaydi (`rank: null`).

### Tanga takroran berilmaydi

`coin_awards` da `(student_id, lesson_item_id, reason)` boʻyicha unique indeks
bor. `CoinsService.award()` shu indeksga tayanadi: bir vaqtda kelgan ikkita
soʻrov ham faqat bittasini yozadi, ikkinchisi `awarded: 0, isNew: false`
qaytaradi. Yaʼni bitta darsni ikki marta yakunlash ikki marta tanga bermaydi.

## Video va lugʻat

**Video.** `POST /api/progress/video` koʻrilgan foizni yozadi. Foiz faqat
**oʻsadi** — orqaga qaytarib koʻrish progressni kamaytirmaydi. `completed: true`
faqat serverda saqlangan foiz **90%** dan oshgan boʻlsa qabul qilinadi; aks
holda 400 qaytadi, shuning uchun klient soxta 100% yubora olmaydi.

Frontend progressni **10 soniyada koʻpi bilan bir marta** yuboradi, hamda
pauza va sahifadan chiqishda darhol bir marta
(`web/src/composables/useThrottledProgress.js`).

**Lugʻat.** Soʻz **3 marta** toʻgʻri javobdan keyin `yodlangan` boʻladi; har bir
notoʻgʻri javob bir daraja tushiradi (`vocab_word_progress.level`, 0–3).
Lugʻat elementi progressi = yodlangan soʻzlar ulushi.

**Video manbasi.** Hosting hali hal qilinmagan. Seed `web/public/media` dagi
lokal MP4 fayllarga ishora qiladi (`npm run media --prefix web` bilan
generatsiya qilinadi, git'ga kirmaydi). Frontend har qanday URL'ni
`resolveVideoUrl()` orqali oʻtkazadi — hosting aniqlanganda faqat shu funksiya
oʻzgaradi.

## Test

Uchta savol turi bitta `questions`/`question_options` jadval juftida yashaydi
(`questions.type`: `multiple_choice` | `fill_blank` | `matching`).
`multiple_choice` va `fill_blank` bir xil variantlar roʻyxatidan foydalanadi —
farqi faqat klient qanday koʻrsatishida (radio vs. matn maydoni) va baholashda
(variant id vs. yozilgan matnni solishtirish). `matching` xuddi shu qatorlarni
juftlik sifatida ishlatadi: `text` — chap termin, `match_text` — toʻgʻri
oʻng termin. Baholashda qisman ball beriladi (toʻgʻri juftliklar ulushi).

**Maxfiylik.** `GET /api/tests/:id` hech qachon `isCorrect` yoki `matchText`
ni qaytarmaydi — toʻgʻri javoblar faqat `submit` dan keyin, natija sifatida
koʻrinadi. Moslashtirish savolida oʻng ustun chap ustundan mustaqil
aralashtiriladi (`tests/shuffle.ts`, urinish id + savol id bilan
seedlanadi) — aks holda ustunlar bir xil tartibda kelsa, pozitsiyaning oʻzi
javobni fosh qilardi.

**Qoralama va vaqt.** Har bir urinish `submissions` jadvalida `status: draft`
qatori — sahifani yangilash yoki aloqa uzilishi javoblarni yoʻqotmaydi.
Vaqt chegarasi qatorning `created_at` vaqtidan hisoblanadi (klient emas,
server), shuning uchun sahifani qayta ochganda ham qolgan vaqt toʻgʻri
koʻrsatiladi va muddati oʻtgan urinish darhol avtomatik topshiriladi.

**Qayta topshirish.** Cheklovsiz. Faqat **eng yuqori ball** hisoblanadi —
`dashboard/scoring.ts`dagi `totalPoints()` va reyting SQL'i har bir element
boʻyicha maksimal ballni oladi, retake'lar ikki marta qoʻshilmaydi. Tanga esa
faqat **birinchi** urinish oʻtgan (`passScore`dan yuqori) boʻlsa beriladi;
keyingi urinishlar hech qachon tanga bermaydi, hatto oldingisidan yaxshi
natija koʻrsatsa ham.

## Baholar, reyting, profil

**Baholar.** `GET /api/marks` bir oy uchun: oʻrtacha ball, oʻtgan oyga nisbatan
farq, oy ichidagi haftalarga boʻlingan grafik nuqtalari va davomat kalendari
— barchasi shu oyning `submissions`/`attendance` qatorlaridan hisoblanadi,
saqlab qoʻyilmaydi. Kelajakdagi haftalar (joriy oyni koʻrayotganda) grafikda
umuman koʻrinmaydi — "Joriy" degan literal matnni ham server yubormaydi,
faqat `isCurrent: true`; label matnini klient `uz.js`dan oladi.

**Reyting.** `GET /api/rating` tanlangan `scope` (guruh/filial/markaz) va
`period` (hafta/oy/umumiy) boʻyicha butun havzani bitta soʻrovda hisoblab,
JS tomonida sahifalaydi. `me` maydoni — soʻrovchi talabaning oʻz qatori —
har doim toʻgʻri hisoblanadi, u yuklangan sahifada boʻlmasa ham (`items`da
ham qaytarilishi mumkin, ikkalasi bir xil holatni ifodalaydi, bu xato emas).
Ball hisobi testdagi bilan bir xil qoidaga amal qiladi: har element boʻyicha
eng yuqori ball, retake'lar qoʻshilmaydi.

**Profil.** Yutuqlar (`GET /api/profile/achievements`) alohida jadvalda
saqlanmaydi — har soʻrovda `progress`/`submissions`/`vocab_word_progress`
maʼlumotidan jonli hisoblanadi (`profile/achievements.ts` — statik katalog,
`profile.service.ts` — hisoblash). Bildirishnoma tugmasi `users.notifications_enabled`
ustunini yozadi. Parolni oʻzgartirish joriy parolni tekshiradi va
muvaffaqiyatli boʻlsa **barcha** sessiyalarni bekor qiladi (`AuthService.revokeAllSessions`)
— hozir ochiq boʻlgan access token oʻz muddati (15 daqiqa) tugagunicha
ishlayveradi, lekin qayta refresh qila olmaydi. Avatar yuklash hali yoʻq —
tugma bosilganda "hozircha mavjud emas" degan xabar chiqadi, video hostingi
kabi keyinroq hal qilinadigan masala.

## Unit qulfi

Unit oldingi unit **100%** ga yetganda ochiladi. Qoida faqat serverda —
`src/modules/lessons/unit-progress.ts` dagi `resolveUnitStates()` da. Klientga
allaqachon hisoblangan `locked` va `status` yuboriladi, u hech qachon oʻzi
qaror qilmaydi. Qulflangan unitning tafsilotini soʻrash **403** qaytaradi
(`Oldingi unitni yakunlang`), shuning uchun UI ni chetlab oʻtib boʻlmaydi.

Kursga yozilmagan oʻquvchi ham **403** oladi (`Siz bu kursga yozilmagansiz`).

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
