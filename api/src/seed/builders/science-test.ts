import { question, SeedQuestion } from './question-types';

/* Hand-written, two units of ten. Physics and chemistry facts do not generate
   from templates the way arithmetic does. */

const STATES_OF_MATTER: SeedQuestion[] = [
  question('Suvning muzlash harorati necha gradus?', '0 °C', ['4 °C', '−10 °C', '100 °C']),
  question('Suvning qaynash harorati (normal bosimda) qancha?', '100 °C', ['90 °C', '120 °C', '75 °C']),
  question('Qattiq moddaning suyuqlikka aylanishi qanday ataladi?', 'Erish', ['Bugʻlanish', 'Kondensatsiya', 'Sublimatsiya']),
  question('Suyuqlikning gazga aylanishi qanday ataladi?', 'Bugʻlanish', ['Erish', 'Kristallanish', 'Muzlash']),
  question('Qaysi holatda modda oʻz shakli va hajmini saqlaydi?', 'Qattiq', ['Suyuq', 'Gaz', 'Plazma']),
  question('Qaysi holatda modda idish shaklini oladi, lekin hajmi oʻzgarmaydi?', 'Suyuq', ['Qattiq', 'Gaz', 'Hech qaysi']),
  question('Gaz holatidagi moddaning zarralari qanday joylashgan?', 'Bir-biridan uzoq va erkin harakatda', [
    'Zich va qatʼiy tartibda',
    'Zich, lekin siljiy oladi',
    'Umuman harakatlanmaydi',
  ]),
  question('Moddaning qattiq holatdan toʻgʻridan-toʻgʻri gazga oʻtishi nima deyiladi?', 'Sublimatsiya', [
    'Erish',
    'Kondensatsiya',
    'Bugʻlanish',
  ]),
  question('Harorat koʻtarilganda moddaning zarralari qanday harakatlanadi?', 'Tezroq', ['Sekinroq', 'Oʻzgarmaydi', 'Toʻxtaydi']),
  question('Muz suvda suzadi, chunki uning zichligi suvnikidan...', 'kichik', ['katta', 'teng', 'nolga teng']),
];

const FORCE_AND_MOTION: SeedQuestion[] = [
  question('Kuchning oʻlchov birligi qanday?', 'Nyuton (N)', ['Joul (J)', 'Vatt (Vt)', 'Paskal (Pa)']),
  question('Nyutonning birinchi qonuni nima haqida?', 'Inertsiya haqida', [
    'Tortishish kuchi haqida',
    'Energiya saqlanishi haqida',
    'Bosim haqida',
  ]),
  question('Tezlik qanday formula bilan topiladi?', 'v = s / t', ['v = s × t', 'v = t / s', 'v = m × a']),
  question('F = m × a formulasi Nyutonning nechanchi qonuni?', 'Ikkinchi', ['Birinchi', 'Uchinchi', 'Toʻrtinchi']),
  question('Massasi 5 kg boʻlgan jismga 10 N kuch taʼsir qilsa, tezlanish qancha?', '2 m/s²', ['0,5 m/s²', '50 m/s²', '15 m/s²']),
  question('Ishqalanish kuchi harakatga nisbatan qanday yoʻnalgan?', 'Qarama-qarshi', ['Bir xil', 'Perpendikulyar', 'Yoʻnalishi yoʻq']),
  question('Erkin tushish tezlanishi Yerda taxminan qancha?', '9,8 m/s²', ['1,6 m/s²', '19,6 m/s²', '3,7 m/s²']),
  question('Jismning tinch holatda qolishiga sabab boʻlgan xossa nima?', 'Inertsiya', ['Bosim', 'Quvvat', 'Impuls']),
  question('Nyutonning uchinchi qonuniga koʻra, har bir taʼsirga...', 'teng va qarama-qarshi aks taʼsir mavjud', [
    'kuchliroq aks taʼsir mavjud',
    'aks taʼsir yoʻq',
    'ikki barobar aks taʼsir mavjud',
  ]),
  question('Massasi 2 kg boʻlgan jismning Yerdagi ogʻirligi taxminan qancha?', '19,6 N', ['2 N', '9,8 N', '4 N']),
];

const SCIENCE_TESTS: SeedQuestion[][] = [STATES_OF_MATTER, FORCE_AND_MOTION];

export function buildScienceTest(unitIndex: number): SeedQuestion[] {
  return SCIENCE_TESTS[unitIndex] ?? SCIENCE_TESTS[0];
}
