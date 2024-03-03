import { createRouter, createWebHashHistory } from "vue-router";
import routerMap from './constant-router-map'

export default createRouter({
    history: createWebHashHistory(),
    routes: routerMap
})