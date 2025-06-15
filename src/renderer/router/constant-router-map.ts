import { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@renderer/views/404.vue'),
  },
  {
    path: '/',
    name: '总览',
    component: () => import('@renderer/views/landing-page/LandingPage.vue'),
  },
]

export default routes
