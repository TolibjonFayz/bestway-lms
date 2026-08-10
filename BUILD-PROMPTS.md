# Best Way LMS — Claude Code uchun qurilish promptlari

## Qanday ishlatiladi

1. Design fayllarini `design/` papkaga tashla (`01-design-system.html`, `02-auth.html`, ...).
2. Claude Code'ni **shu papkada** och: `D:\Tolibjon\Claude\bestway-lms`.
   Shunda `CLAUDE.md` avtomatik yuklanadi — barcha qoidalar (stack, tokenlar, til, sifat
   mezonlari) har bir promptga o'z-o'zidan qo'shiladi. Shuning uchun promptlar qisqa.
3. **Har bir bosqichni alohida, yangi sessiyada ishga tushir.** Bittada hammasini so'rasang
   kontekst to'lib, sifat tushadi va dizayndan uzoqlashadi.
4. Bosqich tugagach natijani ko'r, tuzatish kerak bo'lsa **o'sha sessiyada** ayt
   (yangi sessiyada emas — kontekst yo'qoladi).
5. Keyingi bosqichga faqat oldingisi ishlaganiga ishonch hosil qilgach o't.

**Muhim:** har bosqich oxirida `git commit` qil. Biror bosqich buzilsa orqaga qaytish oson bo'ladi.

---

## 0-BOSQICH — Loyiha skeleti + UI kit

> Kirish fayli: `design/01-design-system.html`
> Bu eng muhim bosqich — qolgan hamma ekran shu komponentlardan quriladi. Shoshilma.

```
Read CLAUDE.md first, then read design/01-design-system.html completely.

Set up the project skeleton and build the base UI component kit from that design file.

1. Initialize a git repo at the project root with a sensible .gitignore
   (node_modules, dist, .env, *.local).

2. Scaffold web/ — Vue 3 + Vite + Pinia + Vue Router. No UI library.
   Structure:
     web/src/assets/tokens.css   — every :root token from CLAUDE.md, exactly
     web/src/assets/base.css     — reset, Plus Jakarta Sans, base typography scale
     web/src/components/base/    — the Bw* kit
     web/src/locales/uz.js       — all Uzbek UI strings
     web/src/router/, web/src/stores/, web/src/api/, web/src/composables/

3. Build every component shown in the design system file. At minimum:
     BwButton      — variants primary/secondary/ghost/danger, sizes sm/md/lg,
                     states default/hover/active/disabled/loading, optional icon slots
     BwInput       — text, password with eye toggle, error + helper text, focus ring
     BwPhoneInput  — fixed +998 prefix with flag, auto-formats to (90) 123-45-67
     BwSelect, BwCheckbox, BwRadio, BwSearchInput
     BwCard        — stat / lesson / list-row variants
     BwProgressBar, BwProgressRing (percentage in the center), BwStepIndicator
     BwBadge       — Yakunlangan / Jarayonda / Boshlanmagan / Yangi / level chips
     BwAvatar      — image with initials fallback
     BwEmptyState  — illustration slot + title + description + action
     BwToast       — success / warning / error / info, plus a useToast() composable
     BwSkeleton    — for loading states
   Match the design file's markup and CSS values exactly. Keep its class names.

4. Add a dev-only route /kitchen-sink that renders every component in every state,
   laid out like the design system page. This is how we verify fidelity.

5. Write web/README.md with the setup and run commands.

Do NOT build any screens, routes, API layer or backend yet — kit only.

When done: start the dev server with the preview tools, open /kitchen-sink,
screenshot it at 1280px and 375px, and compare against design/01-design-system.html.
Report any place where you could not match the design and why.
```

---

## 1-BOSQICH — Backend: DB + auth

> Kirish: `PLAN.md` (DB sxema qoralamasi). Dizayn fayli kerak emas.

```
Read CLAUDE.md and the DB schema draft in PLAN.md.

Build the api/ backend foundation. NestJS + Sequelize + PostgreSQL 16 (local, no Docker).

1. Scaffold api/ with config via @nestjs/config and a .env.example documenting every var.
   Database: bestway_lms on localhost:5432.

2. Models + migrations for the core schema. Refine the PLAN.md draft as needed, but keep
   these requirements:
     - users: phone (unique, stored as 9 digits without +998), password_hash, role
       (student|teacher|admin), full_name, avatar_url, level, group_id, active, timestamps
     - groups: name, teacher_id, schedule (JSONB), branch
     - courses: name, subject (ielts|math|science), description, cover_url, active
     - units: course_id, order_index, title, is_locked_by_default
     - lesson_items: unit_id, type (video|vocabulary|test|speaking), order_index, title
       — polymorphic payload lives in the type-specific tables below
     - videos, vocab_words, tests, questions, question_options, speaking_tasks
     - submissions: student_id, lesson_item_id, answers (JSONB), auto_score, manual_score,
       teacher_comment, graded_by, status, submitted_at
     - progress: student_id, lesson_item_id, percent, completed_at
     - attendance: student_id, group_id, date, status (kelgan|kelmagan|kechikkan|sababli)
   Remember: a unit's item types depend on the course subject — math units have no
   vocabulary or speaking. Enforce that in the service layer, not just the UI.

3. Auth module: phone + password login, bcrypt hashing, JWT access (15 min) +
   refresh (30 days) with refresh rotation, /auth/login, /auth/refresh, /auth/me,
   /auth/logout. JwtAuthGuard + RolesGuard with a @Roles() decorator.

4. Seed script (npm run seed) creating realistic data:
     - 1 admin, 2 teachers (one is Aziz Axtamov), ~20 students with Uzbek names
     - 3 courses: IELTS, Matematika, Tabiiy fanlar
     - IELTS: 6 units with video + vocabulary (30-40 words each) + test (10 questions)
     - Matematika: 4 units with video + test only
     - Groups, realistic progress and submissions spread over the last 2 months,
       so charts and rankings have real-looking data
   Passwords are all "bestway123" for development.

5. Global validation pipe, exception filter returning a consistent error shape,
   CORS for the Vite dev origin.

When done: run the migrations and seed against the local Postgres, then verify
/auth/login and /auth/me with actual requests and paste the real responses.
Do not report success without running them.
```

---

## 2-BOSQICH — Auth ekranlari (frontend + backend ulanadi)

> Kirish fayli: `design/02-auth.html`

```
Read CLAUDE.md, then read design/02-auth.html completely.

Build the authentication flow in web/, wired to the api/ auth endpoints from stage 1.

1. web/src/api/http.js — axios instance with the access token interceptor, automatic
   refresh on 401 with a single-flight queue (concurrent 401s must not fire N refreshes),
   and logout on refresh failure.

2. Pinia auth store: user, tokens, login/logout/refresh/fetchMe, persisted so a page
   reload keeps the session.

3. Screens, matching the design file exactly:
     /login/role      — role select (Oʻquvchi / Xodim)
     /login           — phone + password, validation, error state
     /onboarding      — first-login level confirmation, 3-step indicator
   Use BwPhoneInput, BwInput, BwButton from the kit — do not restyle them locally.

4. Router guards: unauthenticated → /login/role; authenticated hitting a login route →
   their role's home. Role-based redirect after login: student → /dashboard,
   teacher → /staff, admin → /admin. Create placeholder pages for those three routes
   (a heading only) — they get built in later stages.

5. Real error handling: wrong credentials shows the design's inline error
   ("Telefon raqam yoki parol notoʻgʻri"), network failure shows a toast.
   Never leave the button spinning forever.

When done: log in with a seeded student account in the browser preview, show the
redirect working, screenshot both the login screen and its error state at 375px
and 1280px, and confirm the token refresh path works.
```

---

## 3-BOSQICH — Oʻquvchi bosh sahifasi

> Kirish fayli: `design/03-student-home.html`

```
Read CLAUDE.md, then read design/03-student-home.html completely.

Build the student dashboard, both the app shell and the page.

1. App shell:
     - Desktop: fixed 260px left sidebar, --ink background, logo, nav with active pill
     - Mobile: bottom tab bar (5 items) + top app bar
     - The shell is a layout component reused by all student pages
   Nav items: Bosh sahifa, Darslar, Mashq, Baholar, Reyting, Qoʻshimcha dars.

2. Backend: a GET /dashboard endpoint for the logged-in student returning everything
   the page needs in one request — next lesson, coins, scores, rank, current unit with
   its item progress, weekly activity, announcements. One request, not six.

3. The page, matching the design: greeting header, announcement story strip,
   "Keyingi dars" card (the join button enables only within 10 minutes of start —
   implement the real time check), the 4 stat cards, "Davom etamiz" unit card,
   and the 7-day streak strip.

4. All three states are required: skeleton while loading, the empty state for a
   brand-new student with no lessons, and an error state with retry.

Dates and times render in Uzbek for Asia/Tashkent.

When done: verify in the preview at 375px and 1280px with a seeded student,
screenshot both, and also screenshot the empty state (temporarily point it at a
student with no data — do not fake it with hardcoded values).
```

---

## 4-BOSQICH — Darslar: kurslar, unitlar, unit detali

> Kirish fayli: `design/04-lessons.html`

```
Read CLAUDE.md, then read design/04-lessons.html completely.

Build the lesson browsing experience.

1. Backend: GET /courses (student's enrolled courses with overall progress),
   GET /courses/:id/units (units with per-item progress and lock state),
   GET /units/:id (full unit detail with its lesson items).
   Unit locking: a unit unlocks when the previous unit reaches 100%. Compute this
   server-side — never let the client decide what is unlocked.

2. Screens:
     /lessons            — course switcher tabs (IELTS / Matematika / Tabiiy fanlar),
                           course cards with cover, teacher, unit count, progress ring
     /lessons/:courseId  — the unit roadmap: vertical timeline with connected status
                           circles (completed / current / locked), item chips with
                           mini progress, unit percentage
     Unit detail         — desktop: 480px right drawer over the list;
                           mobile: full-screen page with a back arrow
                           Item cards: Vocabulary (expandable word preview),
                           Video (thumbnail + Koʻrilgan badge + duration),
                           Test (question count + score badge + Qayta topshirish),
                           Speaking (mic + Yozib yuborish)
                           Sticky bottom "Davom etish" button.

3. The math variant must render correctly with only Video + Test items — verify it
   with the seeded Matematika course, do not just assume it works.

4. Locked units are dimmed, not clickable, and show the tooltip
   "Oldingi unitni yakunlang".

When done: screenshot the IELTS unit drawer and the Matematika unit drawer side by
side to prove the variable item types render correctly, plus mobile at 375px.
```

---

## 5-BOSQICH — Dars ichi: video va vocabulary

> Kirish fayli: `design/05-video-vocab-test.html` (A va B ekranlari)

```
Read CLAUDE.md, then read the video player and vocabulary sections of
design/05-video-vocab-test.html completely.

Build the video lesson player and the vocabulary trainer. Skip the test screens —
they are the next stage.

1. Video player: custom controls (play/pause, timeline with buffered range, current
   time, speed, fullscreen), the unit item list for jumping between items, and the
   collapsible "Konspekt" section.
   Progress: report watched percentage to the backend, throttled to at most one call
   every 10 seconds and once on pause/unmount. "Darsni yakunlash" enables at 90%.
   Video source for now: a plain <video> element with an MP4 URL from the DB —
   we will decide on real hosting later, so keep the source behind a single
   resolveVideoUrl() helper that is easy to swap.

2. Vocabulary trainer: the flashcard flow with flip, "Bilaman" / "Bilmadim",
   the 12/39 progress bar, the full word list view with 3-level mastery dots,
   and the completion screen with the coins earned.
   Mastery logic: a word needs 3 correct answers to become "yodlangan"; a wrong
   answer drops it one level. Track this per student in the DB.
   Audio pronunciation: use the browser SpeechSynthesis API for now, behind a
   speak() composable so it can be replaced with real audio files later.

3. Backend: POST /progress/video, POST /vocab/answer, GET /vocab/:unitId/words,
   and the coin award on completion. Awards must be idempotent — completing the
   same item twice must not grant coins twice. Enforce that in the service.

When done: play through a real seeded video item and a full vocabulary session in
the preview. Screenshot the flashcard front, the flipped back, and the completion
screen. Confirm in the network panel that progress is throttled, not spamming.
```

---

## 6-BOSQICH — Test va natija

> Kirish fayli: `design/05-video-vocab-test.html` (C va D ekranlari)

```
Read CLAUDE.md, then read the test and result sections of
design/05-video-vocab-test.html completely.

Build the test / homework flow.

1. Test screen: question counter, countdown timer, exit confirm dialog, the question
   card with 4 lettered options, plus the fill-in-the-blank and matching question
   types shown in the design. Question navigator grid with answered/unanswered/current.

2. Answer state survives a page reload mid-test — persist progress so a student who
   loses connection does not lose their work.

3. Grading happens on the server. The client never receives the correct answers until
   the test is submitted — verify this by checking the network payload yourself.
   Auto-grade multiple choice and fill-in-blank; speaking and open answers go to the
   teacher queue with status "tekshirilmoqda".

4. Timer expiry auto-submits whatever is answered.

5. Result screen: the score ring, the +ball / +tanga chips, the per-question review
   with expandable explanations, "Qayta topshirish" and "Keyingi darsga".
   Retake policy: allowed, but only the highest score counts and retakes award no coins.

When done: take a full test in the preview, submit it, and screenshot the test screen,
a selected/correct/incorrect option state, and the result screen. Paste the network
response proving correct answers are not leaked before submission.
```

---

## 7-BOSQICH — Baholar, reyting, profil

> Kirish fayli: `design/06-marks-rating-profile.html`

```
Read CLAUDE.md, then read design/06-marks-rating-profile.html completely.

Build the three secondary student screens.

1. /baholar — month switcher, average card with the trend vs last month, the scores
   chart (pure SVG/CSS, no chart library), the graded items list grouped by week with
   colour-coded score chips, and the attendance mini-calendar with its 5 states
   and legend.

2. /reyting — tabs (Guruhim / Filial / Umumiy), period switcher (Bu hafta / Bu oy /
   Umumiy), the top-3 podium, ranked rows, and the current user's row pinned at the
   bottom highlighted with "Siz".
   Ranking is computed server-side and paginated. A student outside the loaded page
   must still see their own correct rank in the pinned row.

3. /profil — avatar with edit, achievement badges (earned vs locked), settings rows
   including the notifications toggle, password change, and logout in --danger.

Backend endpoints for each, all paginated where they return lists.

When done: screenshot all three at 375px and 1280px with seeded data, and show the
ranking pinned row working for a student ranked outside the first page.
```

---

## 8-BOSQICH — Oʻqituvchi va admin paneli

> Kirish fayli: `design/07-teacher-admin.html`
> Bu eng katta bosqich — ikkiga bo'lib qilsang ham bo'ladi (A+B, keyin C+D).

```
Read CLAUDE.md, then read design/07-teacher-admin.html completely.

Build the staff side. Desktop-first, but the homework review screen must work on mobile.

1. Teacher dashboard: today's schedule timeline, the stat cards, and the
   "Tekshirish kutilmoqda" table.

2. Homework review: split view with the submission list and the selected submission.
   Auto-graded questions shown as already marked; open answers get a 0-100 score input
   and a comment field. "Saqlash va keyingisi" moves to the next ungraded submission
   without a full page reload. Audio player with waveform placeholder for Speaking.

3. Admin course builder: three columns (courses / units with drag-reorder / unit editor).
   The unit editor adds lesson items with a type picker, reorderable item cards, the
   vocabulary word-pair table with CSV import, and the test question editor.
   The type picker must only offer Vocabulary and Speaking for IELTS courses.

4. Students & groups admin: the data table with filters, search, bulk select,
   pagination, status toggle, the "Oʻquvchi qoʻshish" modal, plus the table's empty
   state and loading skeleton.

Authorization: every staff endpoint is guarded by role. A teacher can only see and
grade submissions from their own groups — verify this with a real request using a
teacher token against another teacher's group, and show that it is rejected.

When done: screenshot the review split view and the course builder, and paste the
403 response proving cross-teacher access is blocked.
```

---

## 9-BOSQICH — Video darslarni YouTube'ga ko'chirish

> ⚠️ **Hozir production'da video darslar ishlamaydi.** Lokal generatsiya qilingan
> `web/public/media/*.mp4` fayllari `.gitignore`da — Vercel'ga deploy qilinmagan.
> Video so'ralganda SPA rewrite tufayli HTML qaytadi, video emas.
> Qaror: **YouTube unlisted** — bepul, cheksiz, ishonchli. Keyin kerak bo'lsa pullik
> xizmatga (Bunny/Cloudflare Stream) o'tish oson, chunki faqat URL o'zgaradi.

```
Read CLAUDE.md first.

Move video lessons from local files to YouTube. Right now videos are broken in
production: the seeded urls point at /media/lesson-*.mp4, those files are
gitignored, and Vercel's SPA rewrite returns index.html for them.

1. Backend — the videos table already has a url column. Widen what it accepts:
   - Store either a full YouTube URL or a bare YouTube video id.
   - Add a small helper that normalises whatever the admin pasted (youtube.com/watch?v=,
     youtu.be/, /embed/, or a bare id) into a canonical video id. Reject anything
     that isn't a recognisable YouTube reference with a clear Uzbek validation error.
   - Keep supporting a plain file URL too, so local dev videos still work — the
     player picks its mode from the stored value. Do not delete the local-file path.

2. Frontend — VideoPlayer.vue currently renders a <video> element. Make it render a
   YouTube iframe when the source is a YouTube id, and keep the <video> element for
   file URLs. Requirements for the YouTube mode:
   - Use the iframe player with the YouTube IFrame Player API so we can still track
     progress. Load the API script once, lazily, not on every player mount.
   - Keep our existing progress reporting working: report watched percentage,
     throttled to at most one call every 10 seconds and once on pause/unmount,
     exactly as it works today. "Darsni yakunlash" still enables at 90%.
   - Player params: modestbranding, rel=0 (no unrelated suggested videos at the end),
     playsinline. Keep the design's own surrounding chrome (unit title, konspekt,
     item rail) unchanged — only the inner player swaps.
   - Do not build custom play/pause/seek controls over the iframe; YouTube's own
     controls are fine and fighting them is not worth it. The design's custom control
     bar stays only for the file-based <video> path.

3. Admin — in the unit editor's video item form, the URL field should accept a pasted
   YouTube link, show a small thumbnail preview once a valid id is recognised, and
   explain in Uzbek that the video must be "Unlisted" (roʻyxatda koʻrsatilmagan) on
   YouTube so only students with the link can open it.

4. Seed — replace the generated local mp4 references with real public YouTube ids of
   genuine English-teaching videos so the seeded data is usable in production. Pick
   videos that actually exist and are embeddable; verify each one loads before
   committing. Keep the local-file seed path available behind a flag for offline dev.

5. Delete web/scripts/make-lesson-videos.mjs and its npm script if nothing else uses
   them, and drop the now-stale gitignore entry — but only after confirming the
   file-URL playback path still works for anyone who already has local media.

When done: deploy is not needed — verify locally in the preview with a real YouTube
lesson, show the progress calls firing in the network panel at the throttled rate,
and confirm "Darsni yakunlash" unlocks at 90%. Screenshot the player and the admin
URL field with its thumbnail preview.
```

---

## 10-BOSQICH — Oʻqituvchi sahifalari: Davomat va Guruhlarim

> Hozir bu ikkalasi `PlaceholderView` — nav'da koʻrinadi, bosilsa boʻsh.
> `attendance` jadvali allaqachon bor (5 holat: kelgan/kelmagan/kechikkan/sababli/dars yoʻq).

```
Read CLAUDE.md, then look at design/06-marks-rating-profile.html for the attendance
calendar pattern the student side already uses — the teacher's version should feel
like the same family, not a different app.

Build the two teacher pages that are currently PlaceholderView stubs.

1. /staff/groups — "Guruhlarim"
   - List of the groups this teacher owns: name, branch, level, student count,
     schedule (kun + vaqt), and average attendance for the current month.
   - Opening a group shows its student roster with each student's average score and
     attendance percentage, and links through to that student's submissions.
   - A teacher only ever sees their own groups — enforce server-side and verify with
     another teacher's token.

2. /staff/attendance — "Davomat"
   - Group picker, then a month grid: students down the side, days across the top,
     each cell one of the five states with the same colour language as the student's
     calendar (kelgan / kelmagan / kechikkan / sababli / dars yoʻq).
   - Clicking a cell cycles or opens a small picker to set the state. Changes save
     immediately with an optimistic update and a clear failure rollback.
   - Bulk action: mark a whole day's column at once ("Hammasi kelgan").
   - Only days that actually have a scheduled lesson for that group are editable —
     the rest render as "dars yoʻq" and are not clickable.
   - Month navigation, and a summary row showing each student's attendance percent.

3. Backend: endpoints for reading and writing attendance, guarded so a teacher can
   only touch their own groups' records. Writes must be idempotent per
   (student, date) — setting the same day twice must update, not duplicate.

When done: screenshot both pages at 1280px and the attendance grid at 768px, set a
few cells and show them persisting after a reload, and paste the 403 proving another
teacher cannot write to this group's attendance.
```

---

## 11-BOSQICH — Admin sahifalari: Bosh sahifa va Oʻqituvchilar

> Hozir ikkalasi ham `PlaceholderView`.

```
Read CLAUDE.md. Reuse the stat-card and data-table patterns already built in
web/src/views/staff/admin/ — do not invent a second visual language for admin.

Build the two admin pages that are currently PlaceholderView stubs.

1. /admin/home — admin dashboard
   - Stat cards: jami oʻquvchilar, faol guruhlar, oʻqituvchilar soni, oʻrtacha
     davomat, oʻrtacha ball, tekshirilmagan vazifalar.
   - A simple activity chart (pure SVG/CSS, no chart library — same approach as the
     student marks chart) showing submissions per week over the last 8 weeks.
   - "Diqqat talab qiladi" list: groups with attendance below 70%, students with no
     activity for 14+ days, units with no lesson items yet. Each row links to the
     relevant admin page.

2. /admin/teachers — teacher management
   - Data table: avatar+name, phone, groups they teach, student count, status toggle,
     actions menu. Same table shell as AdminStudentsView.
   - "Oʻqituvchi qoʻshish" modal: full name, phone, password, and optional group
     assignment. Phone uniqueness validated server-side with a clear Uzbek error.
   - Editing a teacher: change details, reassign groups, deactivate (never hard-delete
     — same soft-delete rule as students).
   - Reassigning a group to a different teacher must not orphan that group's existing
     submissions or attendance rows.
   - Empty state and loading skeleton, like the students table.

3. Backend: admin-only endpoints, paginated. Creating a teacher hashes the password
   with the same bcrypt settings as the seed and student creation paths — do not
   duplicate that logic, reuse it.

When done: screenshot both pages, create a teacher and log in as them to prove the
account works, and show the group reassignment leaving old submissions intact.
```

---

## 12-BOSQICH — Oʻquvchi sahifalari: Mashq va Qoʻshimcha dars

> Hozir ikkalasi ham `PlaceholderView`. Bu ikkisi eng kam aniqlangan qism —
> ustoz ular haqida hech narsa demagan, shuning uchun scope'ni kichik tuting.

```
Read CLAUDE.md.

Build the two student pages that are currently PlaceholderView stubs. Both should be
useful but small — the teacher has not specified these, so do not over-build.

1. /practice — "Mashq"
   Free practice that does not affect grades, drawing on content the student has
   already unlocked:
   - "Soʻzlarni takrorlash" — a vocabulary review session built from words the student
     has already studied, prioritising ones at the lowest mastery level. Reuse the
     existing FlashCard component and mastery logic; do not write a second trainer.
   - "Xatolar ustida ishlash" — re-attempt questions the student previously got wrong,
     pulled from their past submissions. No coins, no score impact — it is practice.
   - Empty state for a student with no history yet, pointing them at Darslar.

2. /extra-lesson — "Qoʻshimcha dars"
   A request flow, not a scheduling system:
   - The student picks a topic (a unit they struggled with, or free text), an optional
     preferred time, and submits a request.
   - Their existing requests are listed with status: yuborildi / koʻrib chiqilmoqda /
     tasdiqlandi / rad etildi, plus the teacher's reply if any.
   - The teacher sees incoming requests on their dashboard and can approve, reject
     with a note, or propose a time.
   - New table: extra_lesson_requests (student_id, unit_id nullable, topic text,
     preferred_time nullable, status, teacher_note, timestamps).

Keep both pages inside the existing student shell and component kit.

When done: screenshot both pages with real seeded data plus their empty states, and
show a request moving from yuborildi to tasdiqlandi from the teacher side.
```

---

## 13-BOSQICH — Zoom havolasini ulash (ENG OXIRGI)

> Texnik kontekst va nega Zoom Pro tanlangani: [LIVE-LESSON.md](LIVE-LESSON.md)
> ⚠️ **Oldindan kerak:** ustoz Zoom Pro obunasini ochgan va har guruh uchun takroriy
> uchrashuv (recurring meeting) havolasini olgan boʻlishi kerak.
> Ustoz aynan shuni **eng oxirida** qilishni soʻradi — obuna boshlanishi bilan
> oylik toʻlov keta boshlaydi, shuning uchun qolgan hamma narsa tayyor boʻlgach ulanadi.

```
Read CLAUDE.md and LIVE-LESSON.md.

Wire up live lessons via the teacher's own Zoom Pro account. We are NOT building
video conferencing — no SDK, no LiveKit, no embedded room. The LMS keeps the
schedule and hands off to Zoom at the right moment.

1. DB: add zoom_join_url (and optionally zoom_meeting_id) to the groups table.
   One recurring-meeting link per group — it does not change between lessons.
   Validate that what is pasted looks like a Zoom join URL.

2. Admin: a field on the group edit form to paste the Zoom link, with a short Uzbek
   hint explaining it should be a recurring meeting link from the teacher's Zoom
   account.

3. Student side: the dashboard's "Keyingi dars" card already renders a
   "Darsga qoʻshilish" button that currently does nothing. Make it real:
   - Disabled until 10 minutes before the scheduled start (the existing time check
     is already implemented — reuse it, do not rewrite it).
   - When enabled, opens the group's Zoom link in a new tab.
   - If the group has no link set, show "Dars havolasi hali qoʻshilmagan" instead of
     a dead button.

4. Teacher side: the same button on the staff dashboard for their upcoming lesson,
   so the teacher joins as host from the same place.

5. That is the whole feature. Do not add chat, attendance sync, or recording — the
   teacher marks attendance manually on the Davomat page built in stage 10, and Zoom
   handles everything inside the call.

When done: set a Zoom link on a seeded group, show the student's button enabling at
the right time and opening the link, and show the "havola qoʻshilmagan" state for a
group without one.
```
---

## Bosqichdan keyin: tuzatish promptlari

Agar natija dizayndan farq qilsa, **o'sha sessiyada** aniq ayt:

```
Compare the rendered <component> against design/0X-file.html again, element by element.
Fix these specific differences: <ro'yxat>.
Do not redesign anything else.
```

Katta o'zgarish kerak bo'lsa (noldan emas, mavjudini o'zgartirish):

```
Keep the current layout and component structure. Change only: <nima>.
```

---

## Eslatma — nima qilmaslik kerak

- ❌ Bitta promptda "hamma saytni yozib ber" demaslik — kontekst to'ladi, sifat tushadi.
- ❌ Dizayn fayllarini `design/` ga qo'ymasdan boshlamaslik — Claude Code taxmin qila boshlaydi.
- ❌ Bosqichni tekshirmasdan keyingisiga o'tmaslik — xato to'planib ketadi.
- ❌ "Ishladi" degan javobga screenshotsiz ishonmaslik.
