import { createRouter, createWebHashHistory } from "vue-router";
import routerMap from './constantRouterMap'

export default createRouter({
    history: createWebHashHistory(),
    routes: routerMap
})