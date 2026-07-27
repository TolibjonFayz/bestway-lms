import { CourseSubject } from '@/common/enums';

export interface SeedUnit {
  title: string;
  videoTitle: string;
  videoUrl: string;
  videoDurationSeconds: number;
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

/* Placeholder video ids — where the centre actually hosts video is still an
   open question (YouTube unlisted vs Vimeo vs own server, see PLAN.md). */
const video = (id: string) => `https://www.youtube.com/watch?v=${id}`;

const IELTS_UNITS: SeedUnit[] = [
  {
    title: 'Unit 1.1 — Education and Learning',
    videoTitle: 'Video dars: Present Simple va oʻqish haqida gapirish',
    videoUrl: video('bw-ielts-1-1'),
    videoDurationSeconds: 512,
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
    videoUrl: video('bw-ielts-1-2'),
    videoDurationSeconds: 634,
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
    videoUrl: video('bw-ielts-2-1'),
    videoDurationSeconds: 727,
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
    videoUrl: video('bw-ielts-2-2'),
    videoDurationSeconds: 588,
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
    videoUrl: video('bw-ielts-3-1'),
    videoDurationSeconds: 671,
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
    videoUrl: video('bw-ielts-3-2'),
    videoDurationSeconds: 745,
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
    videoUrl: video('bw-math-1'),
    videoDurationSeconds: 498,
    testTitle: 'Test: Butun sonlar',
  },
  {
    title: 'Unit 2 — Kasrlar va foizlar',
    videoTitle: 'Video dars: Oddiy kasrlarni qoʻshish va ayirish',
    videoUrl: video('bw-math-2'),
    videoDurationSeconds: 623,
    testTitle: 'Test: Kasrlar va foizlar',
  },
  {
    title: 'Unit 3 — Algebraik ifodalar',
    videoTitle: 'Video dars: Oʻxshash hadlarni ixchamlash',
    videoUrl: video('bw-math-3'),
    videoDurationSeconds: 556,
    testTitle: 'Test: Algebraik ifodalar',
  },
  {
    title: 'Unit 4 — Chiziqli tenglamalar',
    videoTitle: 'Video dars: Bir nomaʼlumli tenglamalarni yechish',
    videoUrl: video('bw-math-4'),
    videoDurationSeconds: 702,
    testTitle: 'Test: Chiziqli tenglamalar',
  },
];

const SCIENCE_UNITS: SeedUnit[] = [
  {
    title: 'Unit 1 — Moddaning holatlari',
    videoTitle: 'Video dars: Qattiq, suyuq va gaz holati',
    videoUrl: video('bw-sci-1'),
    videoDurationSeconds: 531,
    testTitle: 'Test: Moddaning holatlari',
  },
  {
    title: 'Unit 2 — Kuch va harakat',
    videoTitle: 'Video dars: Nyuton qonunlari bilan tanishuv',
    videoUrl: video('bw-sci-2'),
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
