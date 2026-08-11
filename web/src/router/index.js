import { createRouter, createWebHistory } from 'vue-router'
import PlaceholderView from '@/views/PlaceholderView.vue'
import { useAuthStore } from '@/stores/auth'
import uz from '@/locales/uz'

/** Route segment → key in uz.nav, for the not-yet-built student pages. */
const NAV_TITLE_KEY = {
  lessons: 'lessons',
  practice: 'practice',
  'extra-lesson': 'extraLesson',
}

const routes = [
  { path: '/', redirect: '/login/role' },

  {
    path: '/login/role',
    name: 'login-role',
    component: () => import('@/views/auth/RoleSelectView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: () => import('@/views/auth/OnboardingView.vue'),
    meta: { requiresAuth: true, roles: ['student'] },
  },

  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/student/DashboardView.vue'),
    meta: { requiresAuth: true, roles: ['student'] },
  },

  {
    path: '/lessons',
    name: 'lessons',
    component: () => import('@/views/student/lessons/CoursesView.vue'),
    meta: { requiresAuth: true, roles: ['student'] },
  },
  {
    /* The unit id is optional: with it the roadmap shows the drawer on desktop
       and the full-screen detail on a phone, so back and forward both work. */
    path: '/lessons/:courseId/units/:unitId?',
    name: 'course-roadmap-unit',
    component: () => import('@/views/student/lessons/CourseRoadmapView.vue'),
    meta: { requiresAuth: true, roles: ['student'] },
  },
  {
    path: '/lessons/:courseId/units/:unitId/video',
    name: 'video-lesson',
    component: () => import('@/views/student/learn/VideoLessonView.vue'),
    meta: { requiresAuth: true, roles: ['student'] },
  },
  {
    path: '/lessons/:courseId/units/:unitId/vocabulary',
    name: 'vocabulary-trainer',
    component: () => import('@/views/student/learn/VocabularyTrainerView.vue'),
    meta: { requiresAuth: true, roles: ['student'] },
  },
  {
    path: '/lessons/:courseId/units/:unitId/test',
    name: 'test-runner',
    component: () => import('@/views/student/learn/TestView.vue'),
    meta: { requiresAuth: true, roles: ['student'] },
  },
  {
    path: '/lessons/:courseId',
    name: 'course-roadmap',
    component: () => import('@/views/student/lessons/CourseRoadmapView.vue'),
    meta: { requiresAuth: true, roles: ['student'] },
  },

  {
    path: '/marks',
    name: 'marks',
    component: () => import('@/views/student/marks/MarksView.vue'),
    meta: { requiresAuth: true, roles: ['student'] },
  },
  {
    path: '/rating',
    name: 'rating',
    component: () => import('@/views/student/rating/RatingView.vue'),
    meta: { requiresAuth: true, roles: ['student'] },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/student/profile/ProfileView.vue'),
    meta: { requiresAuth: true, roles: ['student'] },
  },

  /* Student destinations the shell links to. Later stages build them; until
     then they resolve so the nav never dead-ends. */
  ...['practice', 'extra-lesson'].map((segment) => ({
    path: `/${segment}`,
    name: segment,
    component: PlaceholderView,
    props: { title: uz.nav[NAV_TITLE_KEY[segment]] },
    meta: { requiresAuth: true, roles: ['student'] },
  })),

  /* Staff: teacher. */
  {
    path: '/staff',
    name: 'staff',
    component: () => import('@/views/staff/teacher/TeacherDashboardView.vue'),
    meta: { requiresAuth: true, roles: ['teacher'] },
  },
  {
    path: '/staff/review',
    name: 'staff-review',
    component: () => import('@/views/staff/teacher/HomeworkReviewView.vue'),
    meta: { requiresAuth: true, roles: ['teacher'] },
  },
  {
    path: '/staff/groups',
    name: 'staff-groups',
    component: () => import('@/views/staff/teacher/TeacherGroupsView.vue'),
    meta: { requiresAuth: true, roles: ['teacher'] },
  },
  {
    path: '/staff/attendance',
    name: 'staff-attendance',
    component: () => import('@/views/staff/teacher/AttendanceRegisterView.vue'),
    meta: { requiresAuth: true, roles: ['teacher'] },
  },
  /* Nav destinations not built this round — flagged in the build summary. */
  ...['tasks', 'students'].map((segment) => ({
    path: `/staff/${segment}`,
    name: `staff-${segment}`,
    component: PlaceholderView,
    props: { title: uz.staffNav[segment] },
    meta: { requiresAuth: true, roles: ['teacher'] },
  })),

  /* Staff: admin. */
  {
    path: '/admin',
    redirect: '/admin/courses',
  },
  {
    path: '/admin/courses',
    name: 'admin-courses',
    component: () => import('@/views/staff/admin/AdminCourseBuilderView.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/students',
    name: 'admin-students',
    component: () => import('@/views/staff/admin/AdminStudentsView.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  /* Nav destinations not built this round — flagged in the build summary. */
  ...['home', 'teachers', 'settings'].map((segment) => ({
    path: `/admin/${segment}`,
    name: `admin-${segment}`,
    component: PlaceholderView,
    props: { title: uz.staffNav[segment === 'home' ? 'home' : segment] },
    meta: { requiresAuth: true, roles: ['admin'] },
  })),

  { path: '/:pathMatch(.*)*', redirect: '/' },
]

if (import.meta.env.DEV) {
  routes.splice(routes.length - 1, 0, {
    path: '/kitchen-sink',
    name: 'kitchen-sink',
    component: () => import('@/dev/KitchenSink.vue'),
  })
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  /* Safe inside the guard: Pinia is installed before the router in main.js. */
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { path: '/login/role' }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { path: auth.homeRoute }
  }

  /* A signed-in user who lands on someone else's home goes to their own,
     rather than seeing an empty screen or a 403. */
  if (to.meta.roles && auth.user && !to.meta.roles.includes(auth.user.role)) {
    return { path: auth.homeRoute }
  }

  return true
})

export default router
