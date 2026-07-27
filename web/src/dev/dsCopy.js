/* Labels for the dev-only /kitchen-sink page. These are documentation copy,
   not product UI, so they live outside locales/uz.js and never reach the
   production bundle. Same Uzbek orthography rules apply. */

export default {
  version: 'Uslublar tizimi v1.0',
  eyebrow: 'Foundation · Asos',
  title: 'Best Way LMS — dizayn asoslari',
  lead: 'Barcha ekranlar uchun yagona manba. Ranglar, tipografiya va komponentlar — aynan shu qiymatlarda ishlatiladi.',
  footer:
    'Best Way LMS · Uslublar tizimi · Barcha ekranlar shu tokenlardan foydalanadi',

  colors: 'Ranglar',
  colorsNote:
    'Asosiy rang tokenlari — token nomi, HEX qiymati va qayerda ishlatilishi.',
  groupGreen: 'Yashil · Green',
  groupAccent: 'Urgʻu · Accents',
  groupInk: 'Matn va yuza · Ink / gray / surface',
  groupSemantic: 'Semantik · Semantic',
  groupRadius: 'Radius va soya · Radius & shadow',

  typography: 'Tipografiya',
  typographyNote: 'Plus Jakarta Sans · oʻlcham / vazn / qator balandligi.',
  weights: 'Vaznlar',

  buttons: 'Tugmalar',
  /* Split around the inline --green token in the note. */
  buttonsNoteLead: '4 ta koʻrinish × 5 ta holat. Har bir ekranda bitta asosiy amal —',
  buttonsNoteTail: 'rangda.',
  sizes: 'Oʻlchamlar · Sizes',
  live: 'Jonli · Live (hover / bosing)',
  primaryNote: 'asosiy amal',
  secondaryNote: 'ikkilamchi',
  ghostNote: 'shaffof',
  dangerNote: 'xavfli amal',

  formControls: 'Forma elementlari',
  formControlsNote:
    'Balandlik 48px (min 44px teginish). Focus — yashil halqa, xato — qizil.',
  fieldDefault: 'Standart · fokuslang',
  fieldFocus: 'Focus holati',
  fieldFocusNote: 'Yashil halqa · rgba(22,163,74,.15)',
  fieldPasswordNote: 'Koʻz belgisi — koʻrsatish/yashirish',
  fieldSelectNote: 'Maxsus chevron belgisi',
  fieldSearchNote: 'Chap tomonda qidiruv belgisi',
  fieldDisabledNote: 'Disabled holati',
  fieldFocused: 'Fokusda',
  disabled: 'Disabled',
  phoneBriefNote: 'Brief varianti · (90) 123-45-67 + bayroq',

  cards: 'Kartalar',
  cardsNote: 'Statistika, dars va roʻyxat kartalari.',
  statCard: 'Stat card',
  lessonCard: 'Lesson card',
  listCard: 'List-row card · dars elementlari',

  progressSection: 'Jarayon',
  progressNote:
    'Jarayon — asosiy qahramon. Talaba «men qayerdaman»ni bir soniyada koʻradi.',
  linearBar: 'Linear bar',
  circularRing: 'Circular ring',
  stepIndicator: 'Segmented step indicator',

  badges: 'Nishonlar',
  badgesNote: 'Holat nishonlari va daraja chiplari.',
  statusGroup: 'Holat · Status',
  levelGroup: 'Daraja · Level chips',

  avatars: 'Avatar va bildirishnoma',
  avatarsNote: 'Bosh harflar bilan zaxira avatar; oʻqilmagan nuqtali qoʻngʻiroq.',
  fallback: 'Bosh harflar · Fallback',
  imageAndGroup: 'Rasm + guruh',
  bell: 'Bildirishnoma · Bell',
  dot: 'nuqta',
  count: 'son',
  image: 'rasm',
  groupName: 'guruh INT-3',

  emptyState: 'Boʻsh holat',

  toasts: 'Bildirishnomalar',
  toastsNote: 'Tizim xabarlari — muvaffaqiyat, ogohlantirish, xato, maʼlumot.',
  toastTrigger: 'Jonli toast chiqarish',

  skeletons: 'Yuklanish holati',
  skeletonsNote:
    'Dizayn faylida yoʻq — mavjud tokenlardan qurilgan. Ekran tuzilishini takrorlaydi.',
  skeletonStat: 'Stat card skeleti',
  skeletonList: 'Roʻyxat skeleti',

  /* Sample content used only to fill the specimens. */
  sample: {
    unitTitle: 'Unit 5.2 — Present Perfect',
    unitMeta: 'Grammar · 4 ta mashq · 12 daqiqa',
    videoLesson: 'Video dars',
    videoMeta: '8 daqiqa',
    vocabulary: 'Vocabulary',
    vocabularyMeta: '12 ta soʻz',
    testHomework: 'Test / Uyga vazifa',
    testMeta: '10 savol',
    groups: [
      'INT-3 · Intermediate (B1)',
      'INT-2 · Intermediate (B1)',
      'PRE-1 · Pre-Intermediate (A2)',
    ],
    displaySample: 'Best Way',
    h1Sample: 'Darslarim',
    h3Sample: 'Uyga vazifa',
    bodyLgSample: 'Bugun 2 ta darsni yakunlang va 40 tanga oling.',
    bodySample:
      'Present Perfect zamoni oʻtmishdagi harakatning hozirgi natijasini bildiradi. Darsni koʻrib, mashqlarni bajaring.',
    captionSample: 'Oxirgi yangilanish: 5-fevral, seshanba · 17:00',
    studentId: 'BW-2026-0413',
    unitCaption: 'Unit 5',
  },
}
