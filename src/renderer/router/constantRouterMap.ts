export default [
    {path: '/:pathMatch(.*)*', component:()=> import("@renderer/views/404.vue")},
    { path: '/', name: '总览', component: () => import('@renderer/components/LandingPage.vue') }
]