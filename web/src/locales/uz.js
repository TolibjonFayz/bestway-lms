/* Every user-facing string in the app. Uzbek (Latin) with the ʻokina U+02BB
   for oʻ / gʻ and U+02BC for the ayn in Taʼlim — never a plain apostrophe.
   Learning-domain terms students already use stay in English. */

export default {
  brand: {
    name: 'Best Way',
    tagline: 'Taʼlim markazi',
  },

  nav: {
    home: 'Bosh sahifa',
    lessons: 'Darslar',
    practice: 'Mashq',
    marks: 'Baholar',
    rating: 'Reyting',
    extraLesson: 'Qoʻshimcha dars',
    profile: 'Profil',
  },

  gamification: {
    coins: 'Tangalar',
    points: 'Ballar',
    homework: 'Uyga vazifa',
    attendance: 'Davomat',
    streak: 'Streak (ketma-ket)',
    days: 'kun',
  },

  actions: {
    start: 'Boshlash',
    continue: 'Davom etish',
    finish: 'Yakunlangan',
    submit: 'Topshirish',
    next: 'Keyingi',
    back: 'Orqaga',
    save: 'Saqlash',
    cancel: 'Bekor qilish',
    details: 'Batafsil',
    delete: 'Oʻchirish',
    loading: 'Yuklanmoqda',
    close: 'Yopish',
    retry: 'Qaytadan urinish',
    viewLessons: 'Darslarni koʻrish',
  },

  status: {
    done: 'Yakunlangan',
    inProgress: 'Jarayonda',
    notStarted: 'Boshlanmagan',
    new: 'Yangi',
  },

  progress: {
    title: 'Jarayon',
    started: 'Boshlangan',
    inProgress: 'Davom etmoqda',
    done: 'Yakunlangan',
    segmented: 'Segmentli bar',
  },

  levels: {
    a1: 'Elementary (A1)',
    a2: 'Pre-Intermediate (A2)',
    b1: 'Intermediate (B1)',
    b2: 'Upper-Intermediate (B2)',
    current: 'joriy',
    languageLevel: 'Til darajasi',
  },

  form: {
    fullName: 'Toʻliq ism',
    fullNamePlaceholder: 'Jasur Rahimov',
    password: 'Parol',
    showPassword: 'Parolni koʻrsatish',
    hidePassword: 'Parolni yashirish',
    phone: 'Telefon raqami',
    phoneHelper: 'Doimiy +998 prefiksi',
    group: 'Guruh',
    search: 'Qidiruv',
    searchPlaceholder: 'Darslarni qidirish…',
    email: 'Elektron pochta',
    emailError: 'Toʻgʻri manzil kiriting',
    studentId: 'Talaba ID (oʻzgarmas)',
    rememberMe: 'Meni eslab qol',
    notifications: 'Bildirishnomalar',
  },

  empty: {
    noHomeworkTitle: 'Hozircha uyga vazifa yoʻq',
    noHomeworkText:
      'Barcha vazifalaringizni yakunladingiz. Yangi darslar qoʻshilishi bilan bu yerda koʻrinadi.',
  },

  toast: {
    submittedTitle: 'Vazifa topshirildi',
    submittedText: 'Uyga vazifangiz Aziz Axtamovga yuborildi.',
    deadlineTitle: 'Muddat yaqinlashmoqda',
    deadlineText: 'Topshirish muddati: 5-fevral, 17:00.',
    connectionTitle: 'Ulanishda xatolik',
    connectionText: 'Internet aloqasini tekshirib, qaytadan urining.',
    newLessonTitle: 'Yangi dars qoʻshildi',
    newLessonText: 'Unit 6.1 — Conditionals endi mavjud.',
  },

  a11y: {
    notifications: 'Bildirishnomalar',
    notificationsWithCount: '{n} ta yangi bildirishnoma',
  },

}
