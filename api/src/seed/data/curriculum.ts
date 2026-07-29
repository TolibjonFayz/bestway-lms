import { CourseSubject } from '@/common/enums';

export interface SeedUnit {
  title: string;
  videoTitle: string;
  videoUrl: string;
  videoDurationSeconds: number;
  /** Plain-text summary bullets shown under the player. */
  konspekt?: string[];
  /** IELTS only — the other subjects get no vocabulary and no speaking. */
  vocabularyTitle?: string;
  speakingTitle?: string;
  speakingPrompt?: string;
  speakingPart?: number;
  testTitle: string;
}

export interface SeedCourse {
  name: string;
  subject: CourseSubject;
  description: string;
  units: SeedUnit[];
}

/* Where the centre hosts video is still an open question (PLAN.md). Until it
   is settled the seed points at clips served from web/public/media, generated
   by `npm run media --prefix web`, so the player is exercised against a real,
   seekable file on our own origin rather than a third party that can vanish.
   The frontend routes every URL through resolveVideoUrl(), the single place to
   change when hosting lands.

   One clip per duration, so the seconds stored here match the file exactly. */
const video = (durationSeconds: number) => `/media/lesson-${durationSeconds}.mp4`;

const IELTS_UNITS: SeedUnit[] = [
  {
    title: 'Unit 1.1 — Education and Learning',
    videoTitle: 'Video dars: Present Simple va oʻqish haqida gapirish',
    videoUrl: video(512),
    videoDurationSeconds: 512,
    konspekt: [
      'Present Simple: doimiy odat va umumiy haqiqatlarni ifodalaydi',
      'Uchinchi shaxs birlikda feʼlga -s/-es qoʻshiladi',
      'always, usually, often, never soʻzlari bilan qoʻllaniladi',
      'Savol va inkorda do/does yordamchi feʼli ishlatiladi',
    ],
    vocabularyTitle: 'Vocabulary: Education',
    speakingTitle: 'Speaking Part 1: Studies',
    speakingPrompt:
      'Talk about your studies. What subject do you enjoy most and why? Speak for one to two minutes.',
    speakingPart: 1,
    testTitle: 'Test: Unit 1.1',
  },
  {
    title: 'Unit 1.2 — Work and Careers',
    videoTitle: 'Video dars: Ish va kasb haqida suhbat',
    videoUrl: video(634),
    videoDurationSeconds: 634,
    konspekt: [
      'Kasb haqida gapirganda Present Simple va Present Perfect aralashadi',
      'I have been working here for two years — davomiylik uchun for',
      'Ish tajribasini sanashda since (nuqta) va for (muddat) farqlanadi',
      'Rasmiy suhbatda qisqartmalardan kamroq foydalaniladi',
    ],
    vocabularyTitle: 'Vocabulary: Work',
    speakingTitle: 'Speaking Part 2: Your ideal job',
    speakingPrompt:
      'Describe a job you would like to do. Say what it is, what skills it needs and why it appeals to you.',
    speakingPart: 2,
    testTitle: 'Test: Unit 1.2',
  },
  {
    title: 'Unit 2.1 — Environment and Climate',
    videoTitle: 'Video dars: Atrof-muhit mavzusidagi leksika',
    videoUrl: video(727),
    videoDurationSeconds: 727,
    konspekt: [
      'Atrof-muhit mavzusida passiv nisbat koʻp uchraydi',
      'Trees are being cut down — hozirgi davomli passiv shakli',
      'Muammo va yechim tuzilmasi: muammo → sabab → yechim',
      'Statistik maʼlumot berishda according to iborasi ishlatiladi',
    ],
    vocabularyTitle: 'Vocabulary: Environment',
    speakingTitle: 'Speaking Part 3: Climate change',
    speakingPrompt:
      'How can ordinary people reduce their impact on the environment? Give reasons and examples.',
    speakingPart: 3,
    testTitle: 'Test: Unit 2.1',
  },
  {
    title: 'Unit 2.2 — Technology and Media',
    videoTitle: 'Video dars: Texnologiya haqida yozma vazifa',
    videoUrl: video(588),
    videoDurationSeconds: 588,
    konspekt: [
      'Texnologiya mavzusida Present Perfect natijani bildiradi',
      'Technology has changed the way we learn — natija muhim',
      'Taqqoslashda more/less + sifat + than qolipi ishlatiladi',
      'Yozma vazifada fikringizni misol bilan mustahkamlang',
    ],
    vocabularyTitle: 'Vocabulary: Technology',
    speakingTitle: 'Speaking Part 2: A useful device',
    speakingPrompt:
      'Describe a piece of technology you use every day. Explain what it does and how it helps you.',
    speakingPart: 2,
    testTitle: 'Test: Unit 2.2',
  },
  {
    title: 'Unit 3.1 — Health and Lifestyle',
    videoTitle: 'Video dars: Sogʻliq mavzusida Part 2 javobi',
    videoUrl: video(671),
    videoDurationSeconds: 671,
    konspekt: [
      'Sogʻliq haqida gapirganda should maslahat ifodalaydi',
      'You should sleep at least seven hours — tavsiya shakli',
      'Chastota ravishlari feʼldan oldin, to be dan keyin keladi',
      'Part 2 javobida kirish → asosiy qism → xulosa tuzilmasi',
    ],
    vocabularyTitle: 'Vocabulary: Health',
    speakingTitle: 'Speaking Part 1: Daily routine',
    speakingPrompt:
      'What do you do to stay healthy? Talk about your diet, sleep and exercise.',
    speakingPart: 1,
    testTitle: 'Test: Unit 3.1',
  },
  {
    title: 'Unit 3.2 — Travel and Culture',
    videoTitle: 'Video dars: Sayohat haqida hikoya qilish',
    videoUrl: video(745),
    videoDurationSeconds: 745,
    konspekt: [
      'Sayohat hikoyasida Past Simple asosiy zamon boʻladi',
      'Fon voqealarni tasvirlash uchun Past Continuous ishlatiladi',
      'Ketma-ketlik uchun first, then, after that, finally',
      'Taassurot bildirishda it was absolutely + kuchli sifat',
    ],
    vocabularyTitle: 'Vocabulary: Travel',
    speakingTitle: 'Speaking Part 2: A memorable trip',
    speakingPrompt:
      'Describe a journey you remember well. Say where you went, who you were with and why it stayed with you.',
    speakingPart: 2,
    testTitle: 'Test: Unit 3.2',
  },
];

const MATH_UNITS: SeedUnit[] = [
  {
    title: 'Unit 1 — Butun sonlar va amallar tartibi',
    videoTitle: 'Video dars: Amallar tartibi va qavslar',
    videoUrl: video(498),
    videoDurationSeconds: 498,
    testTitle: 'Test: Butun sonlar',
  },
  {
    title: 'Unit 2 — Kasrlar va foizlar',
    videoTitle: 'Video dars: Oddiy kasrlarni qoʻshish va ayirish',
    videoUrl: video(623),
    videoDurationSeconds: 623,
    testTitle: 'Test: Kasrlar va foizlar',
  },
  {
    title: 'Unit 3 — Algebraik ifodalar',
    videoTitle: 'Video dars: Oʻxshash hadlarni ixchamlash',
    videoUrl: video(556),
    videoDurationSeconds: 556,
    testTitle: 'Test: Algebraik ifodalar',
  },
  {
    title: 'Unit 4 — Chiziqli tenglamalar',
    videoTitle: 'Video dars: Bir nomaʼlumli tenglamalarni yechish',
    videoUrl: video(702),
    videoDurationSeconds: 702,
    testTitle: 'Test: Chiziqli tenglamalar',
  },
];

const SCIENCE_UNITS: SeedUnit[] = [
  {
    title: 'Unit 1 — Moddaning holatlari',
    videoTitle: 'Video dars: Qattiq, suyuq va gaz holati',
    videoUrl: video(531),
    videoDurationSeconds: 531,
    testTitle: 'Test: Moddaning holatlari',
  },
  {
    title: 'Unit 2 — Kuch va harakat',
    videoTitle: 'Video dars: Nyuton qonunlari bilan tanishuv',
    videoUrl: video(604),
    videoDurationSeconds: 604,
    testTitle: 'Test: Kuch va harakat',
  },
];

export const SEED_COURSES: SeedCourse[] = [
  {
    name: 'IELTS Tayyorlovi',
    subject: CourseSubject.Ielts,
    description:
      'Intermediate (B1) darajasidagi oʻquvchilar uchun IELTS tayyorlov kursi: leksika, grammatika, speaking va yozma vazifalar.',
    units: IELTS_UNITS,
  },
  {
    name: 'Matematika Tayyorlovi',
    subject: CourseSubject.Math,
    description:
      'Maktab dasturi asosidagi matematika kursi: sonlar, kasrlar, algebraik ifodalar va tenglamalar.',
    units: MATH_UNITS,
  },
  {
    name: 'Tabiiy Fanlar',
    subject: CourseSubject.Science,
    description:
      'Fizika va kimyo asoslari: moddaning holatlari, kuch va harakat mavzulari.',
    units: SCIENCE_UNITS,
  },
];
