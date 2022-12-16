import { createApp } from 'vue'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css'
import './styles/index.scss'
import './permission'
import App from './App.vue'
import router from './router'
import { errorHandler } from './error'
import { i18n } from "./i18n"


const app = createApp(App)
const store = createPinia()
app.use(ElementPlus)
app.use(router)
app.use(store)
app.use(i18n)
errorHandler(app)

app.mount("#app")
