# Best Way LMS — Deploy qilish (Railway + Vercel)

Backend → **Railway** (baza allaqachon shu yerda), Frontend → **Vercel**.
Ikkalasi ham GitHub repo'ga ulanadi — `git push` qilganingda avtomatik qayta deploy bo'ladi.

Repo: `https://github.com/TolibjonFayz/bestway-lms`

---

## 1. Backend — Railway

### 1.1. Servis yaratish

1. [railway.app](https://railway.app) ga kir, bazangiz bor loyihani och
   (Postgres'ni ko'rasan — DB_HOST'da ko'rgan `sakura.proxy.rlwy.net` shu yerda).
2. **+ New** → **GitHub Repo** → `TolibjonFayz/bestway-lms` ni tanla.
3. Servis yaratilgach, **Settings** ga kir:
   - **Root Directory** → `api`
   - **Build/Deploy** — `railway.json` allaqachon repo'da bor, Railway uni avtomatik topadi
     (build: `npm run build`, start: `npm run migrate && npm run start:prod`).

### 1.2. Environment o'zgaruvchilari

Servisning **Variables** bo'limiga kirib, quyidagilarni qo'sh:

```
NODE_ENV=production
API_PREFIX=api
PORT=3000
```

> `PORT`ni Railway o'zi avtomatik beradi — bu qatorni qo'shmasang ham bo'ladi,
> backend `process.env.PORT`ni o'zi o'qiydi.

**Baza** — mahalliy `.env` dagi qiymatlarni shu yerga ko'chir (real parolni
`api/.env` faylingdan ko'chirasan, u gitga tushmagan):

```
DB_HOST=sakura.proxy.rlwy.net
DB_PORT=38761
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=<api/.env dagi haqiqiy parol>
```

> Ixtiyoriy, tavsiya etiladi: agar backend servisi bazaning **o'zi bilan bir
> Railway loyihasida** bo'lsa, yuqoridagi 5 tasi o'rniga bitta
> `DATABASE_URL=${{Postgres.DATABASE_URL}}` reference qo'yish mumkin — Railway
> ichki tarmoq orqali ulanadi, tashqi proxy kerak bo'lmaydi va tezroq ishlaydi.
> Bu — Railway "Variables" bo'limida `+ New Variable` → `Add Reference`.

**JWT sirlar** — devdagi qiymatlarni ishlatma, ishlab chiqarish uchun yangisini yasa:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Buni ikki marta ishga tushirib, ikkita **har xil** qiymat ol:

```
JWT_ACCESS_SECRET=<1-natija>
JWT_REFRESH_SECRET=<2-natija>
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d
BCRYPT_ROUNDS=12
```

**CORS** — hozircha vaqtinchalik localhost qoldir, 2-qadamda Vercel domenini bilib
olgach shu yerga qaytib to'g'rilaymiz:

```
CORS_ORIGINS=http://localhost:5190
```

### 1.3. Deploy va tekshirish

1. **Deploy** tugmasini bos (yoki Variables saqlagach avtomatik boshlanadi).
2. Loglarni kuzat — `npm run migrate` muvaffaqiyatli o'tishi, keyin
   `API listening on ...` yozuvi chiqishi kerak.
3. Railway senga ochiq domen beradi (**Settings → Networking → Generate Domain**),
   masalan `bestway-lms-api-production.up.railway.app`.
4. Tekshir:
   ```bash
   curl https://<domeningiz>.up.railway.app/api/auth/me
   ```
   `401 Unauthorized` chiqsa — server ishlayapti (token yo'qligi uchun shunday javob kutiladi).

---

## 2. Frontend — Vercel

1. [vercel.com](https://vercel.com) → **Add New → Project** → `TolibjonFayz/bestway-lms` ni import qil.
2. **Root Directory** → `web` ni tanla (Vercel Vite'ni avtomatik aniqlaydi).
3. **Environment Variables** ga qo'sh:
   ```
   VITE_API_URL=https://<1-qadamdagi Railway domeningiz>/api
   ```
4. **Deploy** bos. `web/vercel.json` allaqachon repo'da — SPA sahifalarini
   yangilaganda (masalan `/dashboard`ni refresh qilganda) 404 bo'lmasligi
   uchun rewrite qoidasi shu faylda.
5. Deploy tugagach, Vercel senga domen beradi, masalan
   `bestway-lms.vercel.app`.

---

## 3. CORS'ni yopish

1. Railway'ga qayt → backend servis → **Variables**.
2. `CORS_ORIGINS` ni yangila:
   ```
   CORS_ORIGINS=https://bestway-lms.vercel.app
   ```
3. Saqlaganda Railway servisni avtomatik qayta ishga tushiradi (qayta build kerak emas).

---

## 4. Yakuniy tekshirish

Vercel domeningizni brauzerda och (`https://bestway-lms.vercel.app`):

1. "Profilingizni tanlang" ekrani chiqishi kerak.
2. Seed qilingan hisob bilan kir — masalan student **90 154 78 12** / `bestway123`
   (yoki `api/src/seed/data/people.ts` dagi boshqa raqam).
3. Bosh sahifa, Darslar, Test, Baholar, Reyting — barchasini bosib ko'r.
4. Xodim sifatida ham tekshir: o'qituvchi **90 123 45 67** / `bestway123`.

Agar login qilishda "Network Error" chiqsa — birinchi navbatda `CORS_ORIGINS`
Vercel domeningiz bilan **aynan** mos kelayotganini tekshir (https:// bilan,
oxirida slash'siz).

---

## Ustozga yuborish uchun

Faqat Vercel linkini yubor — u backend/API haqida bilishi shart emas:

```
https://bestway-lms.vercel.app
```

Demo uchun ustozga student hisobini bering (masalan yuqoridagi 90 154 78 12),
xohlasa xodim hisobini ham (90 123 45 67) — parol ikkalasida ham `bestway123`.

---

## Keyingi safar yangilash

Kod'ga o'zgartirish kiritib, shunchaki push qilsang bo'ldi — ikkalasi ham
qayta deploy bo'ladi:

```bash
git add -A
git commit -m "..."
git push
```

Faqat migratsiya qo'shsang, Railway `npm run migrate`ni har deployda o'zi
ishga tushiradi (`railway.json`da yozilgan) — qo'lda hech narsa qilish shart emas.
