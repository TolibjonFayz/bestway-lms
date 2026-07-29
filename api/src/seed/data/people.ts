import { StudentLevel } from '@/common/enums';

export interface SeedPerson {
  /** 9 digits, real Uzbek mobile operator prefixes. */
  phone: string;
  fullName: string;
}

export interface SeedStudent extends SeedPerson {
  level: StudentLevel;
  /** Index into SEED_GROUPS. */
  groupIndex: number;
  /* Just enrolled: no progress, no submissions. Keeps the dashboard's empty
     state reachable with real data instead of a mocked payload. */
  freshEnrolment?: boolean;
}

export const SEED_ADMIN: SeedPerson = {
  phone: '901112233',
  fullName: 'Dilshod Rahmonov',
};

/* Aziz Axtamov is the centre's own teacher — the design mockups name him as
   the person homework is submitted to. */
export const SEED_TEACHERS: SeedPerson[] = [
  { phone: '901234567', fullName: 'Aziz Axtamov' },
  { phone: '935558844', fullName: 'Nigora Yusupova' },
];

export interface SeedGroup {
  name: string;
  branch: string;
  /** Index into SEED_TEACHERS. */
  teacherIndex: number;
  schedule: { day: string; start: string; end: string }[];
}

export const SEED_GROUPS: SeedGroup[] = [
  {
    name: 'INT-3',
    branch: 'Chilonzor',
    teacherIndex: 0,
    schedule: [
      { day: 'dushanba', start: '17:00', end: '18:30' },
      { day: 'chorshanba', start: '17:00', end: '18:30' },
      { day: 'juma', start: '17:00', end: '18:30' },
    ],
  },
  {
    name: 'INT-2',
    branch: 'Chilonzor',
    teacherIndex: 0,
    schedule: [
      { day: 'seshanba', start: '15:00', end: '16:30' },
      { day: 'payshanba', start: '15:00', end: '16:30' },
    ],
  },
  {
    name: 'PRE-1',
    branch: 'Yunusobod',
    teacherIndex: 1,
    schedule: [
      { day: 'seshanba', start: '18:30', end: '20:00' },
      { day: 'shanba', start: '10:00', end: '11:30' },
    ],
  },
  {
    name: 'MATH-1',
    branch: 'Yunusobod',
    teacherIndex: 1,
    schedule: [
      { day: 'dushanba', start: '14:00', end: '15:30' },
      { day: 'payshanba', start: '14:00', end: '15:30' },
    ],
  },
];

export const SEED_STUDENTS: SeedStudent[] = [
  { phone: '901547812', fullName: 'Jasur Rahimov', level: StudentLevel.B1, groupIndex: 0 },
  { phone: '934471290', fullName: 'Malika Yoʻldosheva', level: StudentLevel.B1, groupIndex: 0 },
  { phone: '977820164', fullName: 'Sardor Karimov', level: StudentLevel.B1, groupIndex: 0 },
  { phone: '939014477', fullName: 'Nodira Tosheva', level: StudentLevel.B1, groupIndex: 0 },
  { phone: '946612380', fullName: 'Bekzod Aliyev', level: StudentLevel.B1, groupIndex: 0 },
  { phone: '998450127', fullName: 'Shahnoza Ismoilova', level: StudentLevel.B1, groupIndex: 0 },
  { phone: '912237845', fullName: 'Oybek Nazarov', level: StudentLevel.B1, groupIndex: 1 },
  { phone: '975531208', fullName: 'Zilola Qodirova', level: StudentLevel.B1, groupIndex: 1 },
  { phone: '933718024', fullName: 'Ulugʻbek Sattorov', level: StudentLevel.B1, groupIndex: 1 },
  { phone: '905562934', fullName: 'Kamola Ergasheva', level: StudentLevel.B1, groupIndex: 1 },
  { phone: '944180356', fullName: 'Doniyor Hasanov', level: StudentLevel.B1, groupIndex: 1 },
  { phone: '917734508', fullName: 'Sevinch Abdullayeva', level: StudentLevel.A2, groupIndex: 2 },
  { phone: '936625719', fullName: 'Islom Toshmatov', level: StudentLevel.A2, groupIndex: 2 },
  { phone: '971143862', fullName: 'Gulnoza Xolmatova', level: StudentLevel.A2, groupIndex: 2 },
  { phone: '902298415', fullName: 'Rustam Boboyev', level: StudentLevel.A2, groupIndex: 2 },
  { phone: '998317425', fullName: 'Dilnoza Saidova', level: StudentLevel.A2, groupIndex: 2 },
  { phone: '935840617', fullName: 'Aziza Mirzayeva', level: StudentLevel.A1, groupIndex: 3 },
  { phone: '946073281', fullName: 'Javohir Umarov', level: StudentLevel.A1, groupIndex: 3 },
  { phone: '911562047', fullName: 'Madina Rasulova', level: StudentLevel.A1, groupIndex: 3 },
  { phone: '977409513', fullName: 'Firdavs Xudoyberdiyev', level: StudentLevel.A1, groupIndex: 3 },
  {
    phone: '901005511',
    fullName: 'Shahzod Umarov',
    level: StudentLevel.A2,
    groupIndex: 2,
    freshEnrolment: true,
  },
];
