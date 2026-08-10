# Bestway LMS — Reja (v0.1, qoralama)

> Namuna: Inter Nation platformasi (login.inter-nation.uz, web-student.inter-nation.uz)
> Holat: 8 ta kod bosqichi tugadi, deploy qilindi va **ustozga ko'rsatildi — ma'qullandi** (2026-07-30).
> Jonli: https://bestway-lms.vercel.app · API: https://bestway-lms-production.up.railway.app/api
> ✅ **Jonli dars masalasi hal bo'ldi (2026-08-10): Zoom Pro, eng oxirgi bosqichda.**
> Batafsil va qaror tarixi: [LIVE-LESSON.md](LIVE-LESSON.md).
> **Keyingi ustuvor vazifa — 9-bosqich: video darslarni YouTube'ga ko'chirish**
> (hozir production'da video butunlay ishlamaydi).
> Dizayn promptlari: [DESIGN-BRIEF.md](DESIGN-BRIEF.md) — Claude Design uchun 8 ta bosqichli prompt.
> Kod yozish promptlari: [BUILD-PROMPTS.md](BUILD-PROMPTS.md) — Claude Code uchun 11 ta bosqich.
> Loyiha qoidalari: [CLAUDE.md](CLAUDE.md) — Claude Code avtomatik o'qiydi (stack, tokenlar, DoD).

## Maqsad

Bestway o'quv markazi uchun onlayn dars platformasi: o'quvchilar video darslarni ko'radi,
vocabulary yodlaydi, test/uyga vazifa bajaradi; ustoz/admin darslarni joylaydi va nazorat qiladi.

## Brend va kontent (landing'dan aniqlangan)

Manba: `D:\Tolibjon\Programming\best-way-lc` (avval qilingan Bestway landing).

- **Ranglar:** yashil asosiy `#16a34a` (dark `#15803d`, light `#22c55e`, pale `#f0fdf4`),
  logodagi apelsin `#ea8c3c` — gamifikatsiya (tanga/streak) uchun. Ink `#0f172a`, bg `#f8fafc`.
- **Radius/soya:** `--r-sm/md/lg/xl` = 10/16/22/28px, `--sh-sm/md/lg` landing bilan bir xil.
- **Shrift:** Plus Jakarta Sans (landing CSS'da shu deklaratsiya qilingan).
  ⚠️ Landing'ning `index.html` da xato bor — Montserrat+Poppins yuklanadi, lekin CSS
  Plus Jakarta Sans + Fraunces so'raydi, ya'ni shriftlar fallback'ga tushib qolgan.
- **Kurslar (faqat ingliz tili emas!):** IELTS Tayyorlovi, Matematika Tayyorlovi, Tabiiy Fanlar.
  → Unit ichidagi element turlari fanga qarab farq qiladi: IELTS'da Vocabulary/Speaking bor,
  matematikada yo'q. DB va UI shuni hisobga olishi kerak.
- **Darajalar:** Elementary (A1), Pre-Intermediate (A2), Intermediate (B1), Upper-Intermediate (B2).
- **Interfeys tili:** o'zbekcha, o'quv atamalari inglizcha qoladi (Vocabulary, Unit, IELTS, Speaking).

## Rollar

| Rol | Nima qiladi |
|---|---|
| **Student** | Darslarni ko'radi, vocabulary yodlaydi, test/homework topshiradi, baholarini ko'radi |
| **Teacher** | O'z guruhlarini ko'radi, homework tekshiradi, baho qo'yadi |
| **Admin** | Kurs/unit/dars yaratadi, o'quvchi va guruhlarni boshqaradi, statistika ko'radi |

## Bosqichlar

### 0-bosqich — Dizayn (hozir shu bosqichdamiz)
- [x] Brend token'larini landing'dan chiqarish
- [x] [DESIGN-BRIEF.md](DESIGN-BRIEF.md) — Claude Design promptlari
- [ ] 1-prompt: design system / style tile
- [ ] 2-prompt: auth ekranlari
- [ ] 3-prompt: student dashboard
- [ ] 4-prompt: darslar + unit detail
- [ ] 5-prompt: video / vocabulary / test
- [ ] 6-prompt: baholar / reyting / profil
- [ ] 7-prompt: teacher / admin panel

### 1-bosqich — MVP (kod)

Batafsil promptlar: [BUILD-PROMPTS.md](BUILD-PROMPTS.md). Har bosqich alohida sessiyada.

- [x] 0: loyiha skeleti + UI kit (`web/`, tokenlar, Bw* komponentlar, /kitchen-sink)
- [x] 1: backend DB + auth (`api/`, migratsiyalar, seed)
- [x] 2: auth ekranlari (frontend + backend ulanadi)
- [x] 3: o'quvchi bosh sahifasi + app shell
- [x] 4: darslar (kurslar, unit roadmap, unit detali)
- [x] 5: video pleyer + vocabulary trainer
- [x] 6: test + natija
- [x] 7: baholar, reyting, profil
- [x] 8: o'qituvchi + admin paneli

✅ **MVP tugadi, deploy qilindi, ustozga ko'rsatildi va ma'qullandi (2026-07-30).**

### 1.5-bosqich — Qolgan ishlar (2026-08-10 da tekshiruvdan keyin aniqlangan)

Tekshiruv natijasi: MVP ishlayapti, lekin ikkita bo'shliq bor edi —
video production'da buzuq va 9 ta sahifa bo'sh (`PlaceholderView`).

- [ ] **9: video darslarni YouTube'ga ko'chirish** ⚠️ ENG MUHIM — hozir production'da
      video butunlay ishlamaydi (`web/public/media/*.mp4` gitignore'da, Vercel'ga
      chiqmagan, SPA rewrite HTML qaytaradi). Qaror: YouTube unlisted (bepul, cheksiz)
- [ ] 10: o'qituvchi sahifalari — Davomat, Guruhlarim (hozir bo'sh)
- [ ] 11: admin sahifalari — Bosh sahifa, O'qituvchilar (hozir bo'sh)
- [ ] 12: o'quvchi sahifalari — Mashq, Qo'shimcha dars (hozir bo'sh)
- [ ] **13: Zoom havolasini ulash** — ENG OXIRGI ([LIVE-LESSON.md](LIVE-LESSON.md))

Zoom haqida: uzoq muhokamadan keyin **Zoom Pro** tanlandi (~$13-17/oy, ustoz boshiga,
FIKS). Video konferensiya qurilmaydi — LMS faqat dars jadvalini yuritadi va Zoom
havolasiga yo'naltiradi. Ustoz roziligini berdi va **"oxiriga qo'shsak maylimi"** dedi,
shuning uchun 13-bosqich — obuna boshlanishi bilan oylik to'lov ketadi.

Asosiy funksional talablar:
- [ ] Auth: telefon (+998) + parol, JWT, rol asosida yo'naltirish
- [ ] Kurs strukturasi: Kurs → Unit (masalan 8.4) → Dars elementlari
- [ ] Dars elementlari: Video dars, Vocabulary, Test/Homework
- [ ] Video pleyer + "ko'rildi" (watched) progress
- [ ] Vocabulary: so'z ro'yxati (EN–UZ), yodlash mashqi, progress %
- [ ] Test: savollar (variantli), avtomatik baholash, natija %
- [ ] Student dashboard: yaqin dars, joriy homework, progress
- [ ] Marks sahifasi: baholar tarixi
- [ ] Admin panel: o'quvchilar CRUD, guruhlar, kurs/unit/dars CRUD
- [ ] Guruhga dars jadvali (upcoming lesson)

### 2-bosqich — Gamifikatsiya
- [ ] Coins (vazifa bajarganда beriladi)
- [ ] Scores va Ranking (guruh/filial bo'yicha)
- [ ] Oylik o'rtacha ko'rsatkich (July average kabi)
- [ ] Streak / davomat belgilari

### 3-bosqich — Qo'shimchalar
- [ ] Coin do'koni (merch, kitoblar — admin qo'shadi)
- [ ] Battle rejimlari (Sprint battle, Smart battle)
- [ ] Stories/banner bloki (e'lonlar)
- [ ] Bildirishnomalar, support chat
- [ ] Library (qo'shimcha materiallar)

## Stack (taklif)

- **Frontend:** Vue 3 + Vite + Element Plus + Pinia (ERP Climavent'dagi tajriba qayta ishlatiladi)
- **Backend:** NestJS + Sequelize + PostgreSQL
- **Auth:** JWT (access + refresh), telefon + parol
- **Video hosting:** hal qilinmagan — YouTube unlisted / Vimeo / o'z serveri (savol №1)
- **Deploy:** VPS (keyin aniqlashtiriladi)

## DB sxema qoralamasi (asosiy jadvallar)

- `users` (id, phone, password_hash, role, full_name, avatar, group_id, active)
- `groups` (id, name, teacher_id, schedule)
- `courses` (id, name, description) — masalan IELTS, General English
- `units` (id, course_id, order, title) — masalan "Unit 8.4"
- `lesson_items` (id, unit_id, type: video|vocabulary|test, order, payload)
- `videos` (id, lesson_item_id, url, duration)
- `vocab_words` (id, lesson_item_id, word_en, word_uz, example)
- `tests` / `questions` / `options`
- `submissions` (id, student_id, lesson_item_id, score, answers, submitted_at)
- `progress` (student_id, lesson_item_id, percent, watched)
- `marks` (id, student_id, teacher_id, value, comment, date)
- 2-bosqich: `coin_transactions`, `score_events`, `rankings`

## Ochiq savollar (ustozga)

1. Videolar qayerda saqlanadi / himoya darajasi qanchalik muhim?
2. Onlayn dars = jonli (Zoom link) mi yoki yozilgan video mi? Ikkalasimi?
3. Nechta o'quvchi va filial mo'ljallanyapti?
4. To'lov tizimi kerakmi (Payme/Click) yoki admin qo'lda faollashtiradimi?
5. Dizayn: Inter Nation'ga o'xshash bo'lsa bo'ladimi yoki Bestway brendi (ranglar/logo) bormi?
6. Til: interfeys faqat o'zbekchami yoki EN/RU ham kerakmi?
