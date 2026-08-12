import uz from '@/locales/uz'

/* `exact` marks a destination whose path is a prefix of its siblings — /staff
   matches /staff/groups, so without it the home item stays lit on every
   sub-page and two items look active at once. */
export const TEACHER_NAV_ITEMS = [
  { to: '/staff', label: uz.staffNav.home, icon: 'home', exact: true },
  { to: '/staff/groups', label: uz.staffNav.groups, icon: 'users' },
  { to: '/staff/tasks', label: uz.staffNav.tasks, icon: 'clipboard-check' },
  { to: '/staff/attendance', label: uz.staffNav.attendance, icon: 'calendar' },
  { to: '/staff/students', label: uz.staffNav.students, icon: 'user-circle' },
]

export const ADMIN_NAV_ITEMS = [
  { to: '/admin/home', label: uz.staffNav.home, icon: 'home' },
  { to: '/admin/courses', label: uz.staffNav.courses, icon: 'books' },
  { to: '/admin/students', label: uz.staffNav.students, icon: 'user-circle' },
  { to: '/admin/teachers', label: uz.staffNav.teachers, icon: 'id-card' },
  { to: '/admin/settings', label: uz.staffNav.settings, icon: 'settings' },
]
