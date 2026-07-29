import uz from '@/locales/uz'

/* The sidebar carries all six destinations; the phone's tab bar has room for
   five and swaps Reyting and Qoʻshimcha dars for Profil, exactly as
   design/03-student-home.html draws it. */
export const SIDEBAR_ITEMS = [
  { to: '/dashboard', label: uz.nav.home, icon: 'home' },
  { to: '/lessons', label: uz.nav.lessons, icon: 'books' },
  { to: '/practice', label: uz.nav.practice, icon: 'target' },
  { to: '/marks', label: uz.nav.marks, icon: 'bar-chart' },
  { to: '/rating', label: uz.nav.rating, icon: 'trophy' },
  { to: '/extra-lesson', label: uz.nav.extraLesson, icon: 'calendar-plus' },
]

export const TAB_BAR_ITEMS = [
  { to: '/dashboard', label: uz.nav.home, icon: 'home' },
  { to: '/lessons', label: uz.nav.lessons, icon: 'books' },
  { to: '/practice', label: uz.nav.practice, icon: 'target' },
  { to: '/marks', label: uz.nav.marks, icon: 'bar-chart' },
  { to: '/profile', label: uz.nav.profile, icon: 'user-circle' },
]
