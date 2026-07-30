import uz from '@/locales/uz'

/* Only Bosh sahifa is a real, built page for the teacher this round —
   the rest are flagged in the build summary and resolve to a placeholder so
   the nav never dead-ends (same pattern as the student shell). */
export const TEACHER_NAV_ITEMS = [
  { to: '/staff', label: uz.staffNav.home, icon: 'home' },
  { to: '/staff/groups', label: uz.staffNav.groups, icon: 'users' },
  { to: '/staff/tasks', label: uz.staffNav.tasks, icon: 'clipboard-check' },
  { to: '/staff/attendance', label: uz.staffNav.attendance, icon: 'calendar' },
  { to: '/staff/students', label: uz.staffNav.students, icon: 'user-circle' },
]

/* Kurslar and Oʻquvchilar are the two built admin surfaces; Bosh sahifa,
   Oʻqituvchilar and Sozlamalar are placeholders for now. */
export const ADMIN_NAV_ITEMS = [
  { to: '/admin/home', label: uz.staffNav.home, icon: 'home' },
  { to: '/admin/courses', label: uz.staffNav.courses, icon: 'books' },
  { to: '/admin/students', label: uz.staffNav.students, icon: 'user-circle' },
  { to: '/admin/teachers', label: uz.staffNav.teachers, icon: 'id-card' },
  { to: '/admin/settings', label: uz.staffNav.settings, icon: 'settings' },
]
