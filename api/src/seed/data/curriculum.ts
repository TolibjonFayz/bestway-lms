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

/* Lessons are hosted on YouTube as unlisted videos (LIVE-LESSON.md decided the
   hosting question). Until the centre records its own material, the seed points
   at real, long-standing lessons from BBC Learning English, Khan Academy and
   Math Antics so a demo has something genuine to play — the admin replaces each
   URL from the unit editor once Best Way's own recordings exist.

   Two units deliberately have no video: that is the state a half-built unit is
   really in, and it exercises the "havola hali qoʻshilmagan" path.

   Durations are approximate. The player reads the true length from YouTube; the
   stored number only labels the item in lists. */
const youtube = (id: string) => `https://www.youtube.com/watch?v=${id}`;

/** A unit whose video has not been chosen yet. */
const NO_VIDEO = '';

const IELTS_UNITS: SeedUnit[] = [
  {
    title: 'Unit 1.1 — Education and Learning',
    videoTitle: 'Video dars: Present Perfect — just, already va yet',
    videoUrl: youtube('8_nhtAwI0dA'),
    videoDurationSeconds: 380,
    konspekt: [
      'just — hozirgina tugagan ish: I have just finished my homework',
      'already — kutilganidan oldin bajarilgan ish, tasdiq gaplarda',
      'yet — hali bajarilmagan ish, inkor va soʻroq gaplarda',
      'Uchalasi ham Present Perfect (have/has + V3) bilan ishlatiladi',
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
    videoTitle: "Video dars: 'I've done' yoki 'I did'?",
    videoUrl: youtube('VY5nh_-1phQ'),
    videoDurationSeconds: 200,
    konspekt: [
      'Past Simple aniq oʻtgan vaqtni bildiradi: I worked there in 2019',
      'Present Perfect vaqtni aytmaydi, natijani bildiradi: I have worked there',
      'Ish tajribasini sanashda since (nuqta) va for (muddat) farqlanadi',
      'yesterday, last year kabi soʻzlar bilan faqat Past Simple ishlatiladi',
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
    videoTitle: 'Video dars: Present Perfect — ever va never',
    videoUrl: youtube('o-GWYDA4IQY'),
    videoDurationSeconds: 380,
    konspekt: [
      'ever — soʻroq gaplarda: Have you ever seen a glacier?',
      'never — inkor maʼno, lekin not bilan birga ishlatilmaydi',
      'Tajriba haqida gapirganda Present Perfect tanlanadi',
      'Javobda aniq vaqt aytilsa, Past Simple ga oʻtiladi',
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
    videoTitle: 'Video dars: Texnologiya mavzusidagi leksika (6 Minute English)',
    videoUrl: youtube('GVfJi0dpwB0'),
    videoDurationSeconds: 1800,
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
    videoTitle: 'Video dars: Present Perfect Simple yoki Continuous?',
    videoUrl: youtube('pvoqkQHb3lo'),
    videoDurationSeconds: 200,
    konspekt: [
      'Simple natijani bildiradi: I have run five kilometres',
      'Continuous jarayonni bildiradi: I have been running',
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
    /* Left empty on purpose: the centre records this one itself. */
    videoTitle: 'Video dars: Sayohat haqida hikoya qilish',
    videoUrl: NO_VIDEO,
    videoDurationSeconds: 0,
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
    videoTitle: 'Video dars: Amallar tartibi va qavslar (Khan Academy)',
    videoUrl: youtube('3Po3nfITsok'),
    videoDurationSeconds: 480,
    testTitle: 'Test: Butun sonlar',
  },
  {
    title: 'Unit 2 — Kasrlar va foizlar',
    videoTitle: 'Video dars: Kasrlarni qoʻshish va ayirish (Math Antics)',
    videoUrl: youtube('5juto2ze8Lg'),
    videoDurationSeconds: 660,
    testTitle: 'Test: Kasrlar va foizlar',
  },
  {
    title: 'Unit 3 — Algebraik ifodalar',
    videoTitle: 'Video dars: Oʻxshash hadlarni ixchamlash',
    videoUrl: youtube('EKFuLxjBlCA'),
    videoDurationSeconds: 540,
    testTitle: 'Test: Algebraik ifodalar',
  },
  {
    title: 'Unit 4 — Chiziqli tenglamalar',
    videoTitle: 'Video dars: Bir qadamli tenglamalarni yechish',
    videoUrl: youtube('twN823nsPmA'),
    videoDurationSeconds: 600,
    testTitle: 'Test: Chiziqli tenglamalar',
  },
];

const SCIENCE_UNITS: SeedUnit[] = [
  {
    title: 'Unit 1 — Moddaning holatlari',
    videoTitle: 'Video dars: Qattiq, suyuq va gaz holati',
    videoUrl: youtube('F0pG79qCE9c'),
    videoDurationSeconds: 480,
    testTitle: 'Test: Moddaning holatlari',
  },
  {
    title: 'Unit 2 — Kuch va harakat',
    /* Left empty on purpose: the centre records this one itself. */
    videoTitle: 'Video dars: Nyuton qonunlari bilan tanishuv',
    videoUrl: NO_VIDEO,
    videoDurationSeconds: 0,
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
