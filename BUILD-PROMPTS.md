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

## 9-BOSQICH — Jonli dars MVP (ustozning asosiy talabi)

> Kirish fayli: `design/08-live-lesson.html`
> Texnik kontekst va nega LiveKit tanlangani: [LIVE-LESSON.md](LIVE-LESSON.md)
> **Oldindan kerak:** LiveKit Cloud'da bepul akkaunt (`livekit.io` → Build tier,
> karta talab qilinmaydi) va undan olingan `LIVEKIT_URL`, `LIVEKIT_API_KEY`,
> `LIVEKIT_API_SECRET`.

```
Read CLAUDE.md and LIVE-LESSON.md, then read design/08-live-lesson.html completely.

Build the live lesson MVP with LiveKit. The teacher broadcasts; students watch.
This is a broadcast, not a conference — do not build a Zoom-style equal grid.

1. Backend — session model and token endpoint:
   - New table lesson_sessions: group_id, teacher_id, scheduled_start, started_at,
     ended_at, status (scheduled|live|ended), livekit_room name.
   - POST /live/sessions/:groupId/start — teacher only, and only for their OWN group.
     Creates or resumes the session, marks it live.
   - POST /live/sessions/:id/end — teacher only, marks it ended.
   - GET  /live/sessions/:id/token — returns a LiveKit access token whose grants are
     derived from the caller's role, NEVER from the request body:
       teacher → canPublish: true, canPublishData: true, roomAdmin: true
       student → canPublish: false, canSubscribe: true, canPublishData: true
     A student must not be able to publish video or audio even by crafting the
     request. Verify this with a real request and show the decoded token grants.
   - GET /live/sessions/current — what the logged-in user can join right now
     (their group's live session, or the next scheduled one with its start time).
   - Students may only join a session belonging to their own group. A request for
     another group's session returns 403.

2. Env: LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET in api/.env.example
   with a comment saying where to get them. Never commit real values.
   Use the livekit-server-sdk package for token minting.

3. Frontend — use the livekit-client SDK, build our OWN UI from the design file.
   Do not use any prebuilt LiveKit UI components or embed an iframe.
   - /live/:sessionId student view: the four states from the design (waiting, live,
     reconnecting, ended). Video element for the teacher's track, participant count,
     connection quality indicator.
   - /staff/live/:groupId teacher view: the pre-flight screen (device pickers, camera
     and mic preview, level meter) then the live view with mic/camera/screen-share
     controls and "Darsni yakunlash".
   - Screen share: when the teacher shares, the shared track becomes the main stage
     and the camera moves to a small floating tile.
   - Wire up the dashboard "Keyingi dars" card and the teacher's "Darsni boshlash"
     card as the entry points, replacing the current inert button.

4. Robustness — this is the part that decides whether the teacher trusts it:
   - Automatic reconnection on network drop, with the amber banner from the design.
     Never show a full-screen blocker for a temporary drop.
   - Leaving the page (or closing the tab) disconnects cleanly — no ghost participants.
   - The teacher ending the lesson disconnects every student and routes them to the
     ended state.
   - Media permission denial (camera/mic blocked in the browser) shows a clear Uzbek
     explanation of how to allow it, not a raw browser error.
   - A student joining before the teacher starts sees the waiting state, and moves to
     live automatically when the teacher goes live — without a manual refresh.

Do NOT build in this stage: chat, raise-hand, moderation, attendance, recording.
They are stage 10. Keep this stage focused on a rock-solid one-way broadcast.

When done: run two browsers side by side — one logged in as teacher Aziz Axtamov,
one as a student in his group. Start the lesson, show the student receiving video,
share the screen, then end the lesson. Screenshot each step, and paste the decoded
student token proving canPublish is false.
```

---

## 10-BOSQICH — Jonli dars: interaktivlik va davomat

> Kirish fayli: `design/08-live-lesson.html` (chat, qo'l ko'tarish, moderatsiya qismlari)
> 9-bosqich to'liq ishlab, real darsda sinovdan o'tgach boshlanadi.

```
Read CLAUDE.md and LIVE-LESSON.md, then re-read design/08-live-lesson.html.

Add interactivity to the live lesson built in stage 9.

1. Chat — use LiveKit's data channel, not a separate WebSocket. Messages show sender
   name and time; the teacher's messages get the --green-pale treatment and "Ustoz"
   chip from the design. A student joining mid-lesson sees the recent history
   (persist messages server-side so this works).

2. Raise hand — student toggles it, the teacher sees a queue with a count badge.
   "Mikrofon berish" grants that student publish-audio rights for this session only;
   revoking takes it back. Rights are changed server-side via the LiveKit admin API —
   never by trusting a client message.

3. Teacher moderation: mute a student who was granted a mic, and remove a student
   from the lesson. A removed student sees a clear message, not a silent disconnect.

4. Automatic attendance — write to the existing attendance table when a student
   joins. Rules: present ("kelgan") if they were connected for at least 60% of the
   lesson duration; late ("kechikkan") if they joined more than 10 minutes after the
   start; absent ("kelmagan") if they never joined. Compute this when the teacher
   ends the lesson, and make it idempotent — re-running must not duplicate rows.
   The teacher can override any student's status afterwards from the staff panel.

5. Lesson reminder: a notification 10 minutes before the scheduled start, for both
   the students of that group and the teacher.

When done: run a lesson with two student browsers — one joining on time and staying,
one joining 15 minutes late. End the lesson and show the attendance rows that were
written, proving the late one was marked "kechikkan". Screenshot the chat and the
raise-hand queue.
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
