import { createRouter, createWebHistory } from 'vue-router'

/* No product screens exist yet — the component kit ships first. The only route
   is the fidelity harness, and it is stripped from production builds. */
const routes = import.meta.env.DEV
  ? [
      { path: '/', redirect: '/kitchen-sink' },
      {
        path: '/kitchen-sink',
        name: 'kitchen-sink',
        component: () => import('@/dev/KitchenSink.vue'),
      },
    ]
  : []

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
