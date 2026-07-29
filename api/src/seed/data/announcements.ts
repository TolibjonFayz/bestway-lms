/* The story strip on the student dashboard. `icon` names a glyph in the
   frontend kit; `daysAgo` drives the unread ring until per-student read
   tracking arrives with the full announcements feature. */
export interface SeedAnnouncement {
  title: string;
  icon: string;
  tone: 'green' | 'orange' | 'sky' | 'muted';
  body: string;
  daysAgo: number;
}

export const SEED_ANNOUNCEMENTS: SeedAnnouncement[] = [
  {
    title: 'Yangi funksiyalar',
    icon: 'star-outline',
    tone: 'green',
    body: 'Platformaga vocabulary mashqlari va haftalik faollik hisobi qoʻshildi.',
    daysAgo: 1,
  },
  {
    title: 'IELTS Mock roʻyxat',
    icon: 'file-check',
    tone: 'orange',
    body: 'Fevral oyidagi IELTS mock imtihoniga yozilish ochiq. Joylar cheklangan.',
    daysAgo: 2,
  },
  {
    title: 'Oylik natijalar',
    icon: 'bar-chart-3',
    tone: 'sky',
    body: 'Yanvar oyi boʻyicha guruh reytingi eʼlon qilindi.',
    daysAgo: 4,
  },
  {
    title: 'Bayram jadvali',
    icon: 'sparkles',
    tone: 'muted',
    body: 'Bayram kunlarida darslar jadvali oʻzgaradi — batafsil maʼlumot guruhda.',
    daysAgo: 21,
  },
  {
    title: 'Speaking Club',
    icon: 'align-left',
    tone: 'muted',
    body: 'Har shanba kuni 15:00 da Speaking Club oʻtkaziladi.',
    daysAgo: 30,
  },
  {
    title: 'Yangi kurslar',
    icon: 'books',
    tone: 'muted',
    body: 'Tabiiy fanlar yoʻnalishi boʻyicha yangi guruhlar ochilmoqda.',
    daysAgo: 45,
  },
];
