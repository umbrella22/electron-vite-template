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
  {
    path: '/Print',
    name: '打印',
    component: () => import('@renderer/views/Print.vue'),
  },
  {
    path: '/Browser',
    name: '浏览器',
    component: () => import('@renderer/views/Browser.vue'),
  },
]

export default routes
