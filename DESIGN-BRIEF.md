# Bestway LMS — Design Brief & Generation Prompts

Claude Design uchun tayyor promptlar. **0-blok** (Master Context) har safar prompt boshiga qo'yiladi,
keyin kerakli ekran prompti qo'shiladi. Bittada hammasini so'ramaymiz — ekranma-ekran sifatli chiqadi.

Brend token'lari `best-way-lc` landing loyihasidan olindi (D:\Tolibjon\Programming\best-way-lc) —
platforma va landing bir xil brend ko'rinishida bo'lishi uchun.

---

## 0. MASTER CONTEXT — har bir promptga qo'shiladi

```
You are designing a production-ready web LMS (learning management system) for
"Best Way" — a private education center in Uzbekistan. Output high-fidelity,
responsive HTML mockups.

## PRODUCT
Best Way teaches IELTS preparation, Mathematics, and Natural Sciences to students
aged 6+ through adults. Levels: Elementary (A1), Pre-Intermediate (A2),
Intermediate (B1), Upper-Intermediate (B2). Students currently attend in person;
this platform adds online lessons, homework and progress tracking.

Content hierarchy: Course -> Unit -> Lesson items.
Lesson item types differ per subject:
- English/IELTS units: Video lesson, Vocabulary, Test/Homework, Speaking practice
- Math/Science units: Video lesson, Test/Homework (NO vocabulary)
The design must handle a unit that has only some of these item types.

## USERS
1. Student (primary, 90% of usage) — teenagers and adults, mostly on ANDROID PHONES.
   Mobile experience is not an afterthought; design mobile first, then desktop.
2. Teacher — reviews homework, grades, sees their groups.
3. Admin — creates courses/units/lessons, manages students and groups.

## BRAND (use these exact values — they come from the existing Best Way website)

Logo: green wordmark "B" with green wings and an orange accent swoosh.
Feel: fresh, trustworthy, academic but friendly. Not corporate-cold, not childish.

CSS tokens (define these as :root variables and use them everywhere):
  --green:        #16a34a   /* primary actions, active nav */
  --green-dark:   #15803d   /* hover */
  --green-darker: #166534
  --green-light:  #22c55e
  --green-soft:   #bbf7d0
  --green-mid:    #dcfce7
  --green-pale:   #f0fdf4   /* tinted surfaces */
  --orange:       #ea8c3c   /* gamification: coins, streaks — from logo swoosh */
  --amber:        #f5b301   /* stars / scores */
  --ink:          #0f172a   /* headings, dark sidebar */
  --ink-2:        #1e293b
  --gray:         #64748b   /* secondary text */
  --gray-2:       #94a3b8
  --bg:           #f8fafc   /* page background */
  --line:         #e2e8f0   /* borders */
  --line-2:       #f1f5f9
  --white:        #ffffff
  --danger:       #ef4444
  --r-sm: 10px;  --r-md: 16px;  --r-lg: 22px;  --r-xl: 28px;
  --sh-sm: 0 2px 8px rgba(15,23,42,.06);
  --sh-md: 0 8px 24px rgba(15,23,42,.08);
  --sh-lg: 0 20px 48px rgba(15,23,42,.12);
  --sh-green: 0 16px 40px rgba(22,163,74,.28);

Typography: "Plus Jakarta Sans" (Google Fonts) for everything, weights 400/500/600/700/800.
Numbers in stat cards: 700-800 weight, large, tabular-nums.

## LANGUAGE RULES (important)
Interface language is UZBEK (Latin script). Keep English ONLY for learning-domain
terms students already use: Vocabulary, Speaking, Listening, Reading, Writing,
Unit, IELTS, Elementary/Intermediate, band score.

Use exactly these labels:
  Bosh sahifa | Darslar | Mashq | Baholar | Reyting | Qo'shimcha dars | Profil
  Tangalar (coins) | Ballar (scores) | Uyga vazifa (homework) | Davomat (attendance)
  Boshlash | Davom etish | Yakunlangan | Topshirish | Keyingi | Orqaga
Uzbek uses apostrophes: o', g' — render them correctly (o‘zbek tilida).

## MOCK CONTENT — use realistic data, never lorem ipsum
Student: Jasur Rahimov, Intermediate (B1), guruh "INT-3"
Teacher: Aziz Axtamov
Other students: Malika Yusupova, Sardor Karimov, Nilufar To'xtayeva, Bekzod Ergashev
Units: "Unit 5.2 — Present Perfect", "Unit 5.3 — Used to / Would",
       "Unit 6.1 — Conditionals", "Algebra 3.1 — Kvadrat tenglamalar"
Vocabulary examples: achieve — erishmoq | reluctant — istamaydigan |
       sustainable — barqaror | overcome — yengib o'tmoq
Dates in Uzbek: "5-fevral, seshanba", time "17:00"

## DESIGN PRINCIPLES
1. PROGRESS IS THE HERO. Every unit, lesson and course shows completion % via a
   ring or bar. A student should see "where am I" within one second.
2. One clear primary action per screen, in --green.
3. Cards on --bg with --sh-sm, radius --r-md/--r-lg. Generous whitespace.
   No heavy borders, no gradients except subtle green tints.
4. Icons: simple line icons (Lucide style), 1.75px stroke. No emoji as UI icons.
5. Touch targets minimum 44px. Text minimum 14px on mobile.
6. WCAG AA contrast. Never put white text on --green-light.

## OUTPUT FORMAT
- One self-contained HTML file per screen: inline <style>, CSS variables at :root,
  no external JS libraries, Google Fonts link allowed.
- Responsive: mobile 375px, tablet 768px, desktop 1280px+. Show real breakpoints.
- Include hover/focus/active/disabled states, plus empty and loading states where noted.
- Semantic HTML with aria labels — this becomes real Vue 3 code later, so keep the
  markup clean and componentizable (BEM-ish class names).
```

---

## 1-PROMPT — Design system / style tile

```
[MASTER CONTEXT]

TASK: Design the foundation style sheet for Best Way LMS.

Produce one page showing:
1. Color palette swatches with token name + hex + usage note.
2. Type scale: display, h1, h2, h3, body-lg, body, caption — with px/weight/line-height.
3. Buttons: primary, secondary, ghost, danger — states: default, hover, active,
   disabled, loading. Sizes: sm/md/lg.
4. Form controls: text input, password input with eye toggle, phone input with
   +998 country prefix, select, checkbox, radio, search — with error and focus states.
5. Cards: stat card, lesson card, list-row card.
6. Progress: linear bar, circular ring (with % in center), segmented step indicator.
7. Badges/chips: "Yakunlangan" (green), "Jarayonda" (orange), "Boshlanmagan" (gray),
   "Yangi" (green tint), level chips (A1/B1).
8. Avatar with fallback initials, notification bell with unread dot.
9. Empty state pattern (illustration placeholder + title + description + action).
10. Toast/alert: success, warning, error, info.

This is the source of truth for all other screens — make the tokens exact.
```

---

## 2-PROMPT — Auth (Kirish)

```
[MASTER CONTEXT]

TASK: Design the authentication flow. Three screens in one HTML file, stacked
with a label above each.

SCREEN A — Role select ("Profilingizni tanlang")
Full-screen, centered, Best Way logo on top, generous whitespace.
Two large selectable cards, radio-style, one selected by default:
  - "O'quvchi" / "Darslar va uyga vazifalar" (book icon)
  - "Xodim" / "O'qituvchi va administrator uchun" (id-card icon)
Selected card: --green border, --green-pale background, filled radio on the right.
Primary button "Davom etish" below.

SCREEN B — Login
Big heading "O'quvchi", subtitle beneath. Then:
  - Phone input: fixed "+998" prefix with a small Uzbek flag, placeholder "90 123 45 67",
    auto-format as (90) 123-45-67
  - Password input with show/hide eye toggle
  - "Parolni unutdingizmi?" link, right aligned
  - Primary button "Kirish" with right arrow, disabled until both fields valid
  - "Orqaga" text link at the bottom
Show a second copy of this screen with a validation error state:
  wrong password, red border + message "Telefon raqam yoki parol noto'g'ri".

SCREEN C — Onboarding after first login
"Xush kelibsiz, Jasur!" + a 3-step progress indicator, asking to confirm
level (Elementary/Pre-Intermediate/Intermediate/Upper-Intermediate as selectable chips).

Left 45% of desktop layout: a soft --green-pale panel with the logo, a short
motivational line ("Bilim — eng yaxshi yo'l") and an abstract geometric pattern
inspired by the logo's wing shapes. On mobile this panel is hidden.
```

---

## 3-PROMPT — Student home (Bosh sahifa)

```
[MASTER CONTEXT]

TASK: Design the student dashboard. Deliver BOTH desktop (1280px) and mobile (375px).

NAVIGATION
Desktop: fixed left sidebar 260px, --ink background, Best Way logo at top,
nav items with line icons: Bosh sahifa, Darslar, Mashq, Baholar, Reyting,
Qo'shimcha dars. Active item = --green pill background. User block pinned at bottom.
Mobile: bottom tab bar with 5 items (Bosh sahifa, Darslar, Mashq, Baholar, Profil),
active tab in --green. Top app bar with greeting + bell + avatar.

CONTENT (top to bottom)
1. Header row: "Salom, Jasur 👋" + today's date, notification bell with unread dot,
   message icon, avatar with name "Jasur Rahimov" and level "Intermediate (B1)".
2. Announcement strip: horizontally scrollable circular/rounded story cards
   (5-6 items) for center announcements — e.g. "Yangi funksiyalar",
   "IELTS Mock ro'yxat", "Oylik natijalar". Unviewed = --green ring around the card.
3. "Keyingi dars" card: date "5-fevral, seshanba", time "17:00",
   subject "IELTS — Unit 5.2", teacher "Aziz Axtamov", and a "Darsga qo'shilish"
   primary button that is disabled until 10 minutes before start
   (show both enabled and disabled variants).
4. Stat row — 4 cards: Tangalar 978 (coin icon, --orange), Ballar 470 (star, --amber),
   Reyting o'rni "12-o'rin" (podium, --green), and a highlighted "Uyga vazifa"
   card in --green showing "Unit 5.2 — 62%" with a circular progress ring and arrow.
5. "Davom etamiz" section: the in-progress unit as a wide card with a thumbnail,
   unit title, item chips (Video, Vocabulary, Test) with per-item completion,
   and a "Davom etish" button.
6. Weekly activity: 7-day streak strip (Du Se Ch Pa Ju Sh Ya) with completed days
   filled --green, today outlined, plus "Bu hafta: 4/7 kun".
7. Empty-state variant of the whole dashboard for a brand-new student with no
   lessons yet — show it as a separate section at the bottom of the file.
```

---

## 4-PROMPT — Darslar (course + unit list + unit detail)

```
[MASTER CONTEXT]

TASK: Design the lessons browsing experience. Desktop and mobile.

SCREEN A — Course list
Page title "Darslar". A course switcher as tabs/segmented control:
"IELTS", "Matematika", "Tabiiy fanlar". Each course card shows a cover image
placeholder, title, teacher, total units, and an overall progress ring
(e.g. "24 ta unitdan 14 tasi").

SCREEN B — Unit list (inside a course)
Vertical timeline/roadmap of units. Each unit row shows:
  - a status circle on the left connected by a vertical line (like a learning path):
    completed = --green filled with check, current = --green ring pulsing,
    locked = gray with lock icon
  - unit number + title "Unit 5.2 — Present Perfect"
  - item chips with their own mini progress: Video 100%, Vocabulary 39 so'z 100%,
    Test 62%
  - overall unit % on the right
Show all three states (completed / current / locked) with realistic titles.
Locked units are visibly dimmed and show a tooltip "Oldingi unitni yakunlang".

SCREEN C — Unit detail
Desktop: opens as a right-side drawer 480px wide over the unit list.
Mobile: full-screen page with a back arrow.
Contents:
  - Header: "Unit 5.2 — Present Perfect", bookmark icon, close/back
  - Overall progress bar
  - Item cards, vertically stacked, each a distinct visual block:
      * Vocabulary — "39 ta so'z", star icon, progress bar 100%, expandable
        to reveal the word list preview, mountain-style illustrated background
      * Video dars — thumbnail with play button, "Ko'rilgan" badge, duration "12:40"
      * Test — "10 ta savol", score badge "62%", "Qayta topshirish" secondary action
      * Speaking — mic icon, "Yozib yuborish" (only for IELTS units)
  - Sticky bottom primary button "Davom etish"
Also show the Math variant of the drawer, which has only Video + Test.
```

---

## 5-PROMPT — Dars ichi (video, vocabulary, test)

```
[MASTER CONTEXT]

TASK: Design the three lesson-consumption screens. Each mobile + desktop.

SCREEN A — Video lesson player
16:9 player with custom controls (play, timeline with buffered state, time,
speed 1x, fullscreen, captions). Below: unit title, teacher, a "Darsni yakunlash"
primary button that activates only after 90% watched (show both states).
Right column on desktop (below on mobile): the unit's item list for quick jumping,
with the current item highlighted. Add a "Konspekt" collapsible section with the
lesson's key points as text.

SCREEN B — Vocabulary trainer
A flashcard experience, mobile-first:
  - Progress: "12 / 39" with a thin linear bar at the top
  - A large card showing the English word "achieve", pronunciation "/əˈtʃiːv/",
    a speaker button, and an example sentence
  - Tap/flip reveals the Uzbek meaning "erishmoq"
  - Two response buttons: "Bilmadim" (ghost/gray) and "Bilaman" (--green)
  - Show the flipped state as a second card
Also design:
  - A word-list view: table/list of all 39 words with EN, UZ, and a mastery dot
    (3 levels: yangi / o'rganilmoqda / yodlangan)
  - The completion screen: "Ajoyib!", words learned count, +25 tanga earned
    with a coin animation placeholder, "Davom etish" button

SCREEN C — Test / Uyga vazifa
  - Header: unit name, question counter "Savol 4 / 10", a countdown timer "08:24",
    and a "Chiqish" link that opens a confirm dialog
  - Question card with the question text and 4 answer options as large selectable
    rows (A/B/C/D letter badges). Show: unselected, selected, correct (green),
    incorrect (red with the correct one highlighted).
  - Include one fill-in-the-blank question type and one matching/drag question type.
  - Bottom bar: "Orqaga" ghost + "Keyingi" primary; on the last question "Topshirish".
  - Question navigator: a grid of numbers 1-10 showing answered/unanswered/current.
SCREEN D — Result
Big circular score ring "8/10 — 80%", "+40 ball, +30 tanga" chips, a per-question
review list with correct/incorrect marks and the explanation text expandable,
and two buttons: "Qayta topshirish" secondary, "Keyingi darsga" primary.
```

---

## 6-PROMPT — Baholar, Reyting, Profil

```
[MASTER CONTEXT]

TASK: Design three secondary student screens in one file. Desktop + mobile.

SCREEN A — Baholar (marks)
  - Month switcher (‹ Fevral 2026 ›) and an average summary card:
    "O'rtacha: 87%" with a trend indicator "+4% o'tgan oyga nisbatan".
  - A line/area chart of scores over the month (pure CSS/SVG, --green).
  - A list of graded items grouped by week: date, unit name, type badge
    (Test / Uyga vazifa / Speaking), score chip color-coded
    (>=85 green, 60-84 amber, <60 red), and teacher comment where present.
  - Attendance (Davomat) mini calendar for the month: each day a small square,
    5 states — kelgan (green), kelmagan (red), kechikkan (amber),
    sababli (blue), dars yo'q (gray). Include the legend.

SCREEN B — Reyting (leaderboard)
  - Tabs: "Guruhim", "Filial", "Umumiy".
  - Top-3 podium with avatars, crown on first place, scores.
  - Ranked list rows 4-20: position, avatar, name, level chip, ball.
  - The current user's row is pinned/sticky at the bottom, highlighted --green-pale
    with "Siz" label — e.g. 12-o'rin.
  - Period switcher: "Bu hafta / Bu oy / Umumiy".

SCREEN C — Profil
  - Header with avatar (with edit overlay), name, level, group "INT-3", join date.
  - Achievement badges grid (earned in color, locked in gray with a lock):
    e.g. "7 kunlik streak", "Birinchi 100%", "50 so'z yodlandi".
  - Settings list rows: shaxsiy ma'lumotlar, parolni o'zgartirish, bildirishnomalar
    (with a toggle), til, yordam, chiqish (in --danger).
```

---

## 7-PROMPT — O'qituvchi / Admin panel

```
[MASTER CONTEXT]

TASK: Design the staff side. Desktop-first (staff work on laptops), but the
homework review screen must also work on mobile.

SCREEN A — Teacher dashboard
Sidebar nav: Bosh sahifa, Guruhlarim, Vazifalar, Davomat, O'quvchilar.
Content: today's schedule as a timeline (3 lessons with group, time, room),
stat cards (Tekshirilmagan vazifalar 14, Bugungi darslar 3, O'quvchilar 62,
O'rtacha davomat 91%), and a "Tekshirish kutilmoqda" table.

SCREEN B — Homework review
Split view: left = submission list (student avatar, name, unit, submitted time,
status chip). Right = the selected submission with the student's answers,
auto-graded questions marked automatically, open-ended answers needing manual
grading with a score input (0-100), a comment textarea, and
"Saqlash va keyingisi" primary button. Include an audio player row for
Speaking submissions with a waveform placeholder.

SCREEN C — Admin course builder
Three-column layout: Courses list | Units list (drag-to-reorder handles) |
Unit editor. The unit editor lets you add lesson items with a type picker
(Video, Vocabulary, Test, Speaking), each item as a reorderable card with
inline edit. Include the "Vocabulary" editor: a table of word pairs with
add-row, import from CSV, and delete. Include the "Test" editor: question list
with the answer options and a correct-answer radio.

SCREEN D — Students & groups admin
Data table: avatar+name, phone, group, level, o'rtacha ball, davomat %, status
toggle, actions menu. With filters (guruh, daraja, holat), search, bulk select,
pagination, and an "O'quvchi qo'shish" modal form.
Include the table's empty state and loading skeleton.
```

---

## 8-PROMPT — Jonli dars (to'liq video konferensiya, Zoom kabi)

> Bu ustozning eng muhim talabi. Texnik kontekst: [LIVE-LESSON.md](LIVE-LESSON.md)
> Natijani `design/08-live-lesson.html` deb saqla.

```
[MASTER CONTEXT]

TASK: Design the live lesson experience — a real multi-party video conference,
Zoom-style. Everyone — the teacher and up to 12 students — has their own camera
and microphone, self-controlled, on at all times unless they turn it off themselves.
The teacher additionally has host controls (mute anyone, remove anyone, end for all).

This IS a gallery grid of participant tiles, not a single hero stage. Design it like
a real classroom video call: every face matters, but the active speaker should stand
out so a 12-person grid doesn't feel chaotic.

SCREEN A — Live lesson view, shared by everyone but teacher sees extra controls
(design mobile 375px AND desktop 1280px)
  - Gallery grid of participant tiles. Each tile: video (or an avatar + initials on
    a --green-pale tinted background when camera is off), name label bottom-left,
    a small mic icon (crossed-out when muted) bottom-right, --r-md rounded corners,
    on a dark (--ink) backdrop.
  - Grid layout rules: up to 13 tiles (12 students + teacher). When someone is
    speaking, their tile gets a --green glowing border and grows slightly relative
    to the others (active-speaker emphasis), everyone else stays same-size and
    smaller. On mobile, show a horizontally scrollable strip of small tiles plus
    one large focused tile.
  - Teacher's tile always has a small "Ustoz" chip, distinguishing it in the grid.
  - A red "JONLI" pill with a pulsing dot, top-left, plus elapsed time "24:15" and
    participant count "13/13" with a people icon.
  - Connection quality indicator per tile: a tiny 3-bar icon that turns amber/red
    when that participant's connection is degraded (not just your own).
  - Bottom control bar, available to EVERYONE:
      camera toggle (on by default, --green when on, gray when off),
      mic toggle (on by default, --green when on, --danger crossed-out when off),
      "Ishtirokchilar" (opens the participant list), "Chat", fullscreen,
      and "Chiqish" in --danger.
  - Chat and Ishtirokchilar open as a right rail on desktop, bottom sheet on mobile:
      * Chat: message rows with avatar, name, time, text; teacher's messages get a
        --green-pale background and "Ustoz" chip; input with send button at bottom.
      * Ishtirokchilar: scrollable list, teacher pinned at top with "Ustoz" chip and
        a small crown/host icon, students below each with mic-state icon.
  - States to include, each as a separate labelled block:
      1. Waiting — "Dars hali boshlanmadi", scheduled time, teacher name, countdown,
         note that it starts automatically when the teacher joins.
      2. Live — the main gallery grid design above.
      3. Reconnecting — a non-blocking amber banner "Ulanish tiklanmoqda…" over your
         own frozen tile only, NOT a full-screen blocker — everyone else keeps working.
      4. Ended — "Dars yakunlandi", duration, "Darslarga qaytish" button.

SCREEN B — Teacher-only additions (desktop 1280px primary, must work at 768px)
  - Screen-share: when the teacher shares, the shared screen becomes a large hero
    area and the participant grid collapses to a slim strip along the bottom or side
    (small tiles), matching how Zoom reflows during a share.
  - Extra control bar items visible only to the teacher: "Ekranni ulashish" (turns
    --green when active), "Hammani ovozsiz qilish", and "Darsni yakunlash" in --danger
    (ends the session for everyone, with a confirm dialog).
  - Per-participant host actions: hovering/tapping a student's tile or their row in
    "Ishtirokchilar" reveals two icon actions — mute (mic-off icon) and remove
    (person-x icon, opens a confirm dialog "Chiqarib yuborilsinmi?").
  - A pre-flight screen shown BEFORE going live: camera and mic preview, device
    picker dropdowns (kamera, mikrofon, dinamik), a mic level meter, the group name
    and expected student count, and a big "Darsni boshlash" primary button.

SCREEN C — Lesson entry points
  - The dashboard "Keyingi dars" card in three states: too early (button disabled
    with "16:50 da faollashadi"), live now (button --green, pulsing, "Darsga qo'shilish"),
    and in progress with a "JONLI" indicator and live participant count.
  - A teacher-side card on the staff dashboard: "Darsni boshlash" for the upcoming
    slot, showing group, time, and how many students are already waiting in the
    lobby/waiting state.

Accessibility: every control has a visible label or a tooltip, the control bar and
per-participant host actions are keyboard reachable, and the live/recording/mute
indicators are not colour-only (use icons, not just red/green dots).
```

---

## Tartib bo'yicha maslahat

1. **1-prompt** (design system) birinchi — chiqqan token va komponentlarni saqlab qo'yamiz.
2. **2 → 3 → 4 → 5** — student oqimi, eng muhimi. MVP shu.
3. **6** — ikkilamchi student ekranlari.
4. **7** — admin/teacher, oxirida.
5. **8** — jonli dars (ustoz talabi bo'yicha eng muhim funksiya, [LIVE-LESSON.md](LIVE-LESSON.md)).

Har bir natijani `design/` papkasiga saqlaymiz, keyin Vue komponentlarga o'giramiz.
Agar biror ekran yoqmasa: "keep the layout, change X" deb qayta so'ra — noldan
qayta generatsiya qilishdan ko'ra tez.
