import { createApp } from 'vue'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/index.scss'
import './permission'
import App from './App.vue'
import router from './router'
import { errorHandler } from './error'

import { i18n } from './i18n'

const app = createApp(App)
const store = createPinia()
app.use(router)
// element-plus 2.x 的安装选项已不含 i18n，但保留原运行时行为
app.use(ElementPlus, { i18n: i18n.global.d } as any)
app.use(store)
app.use(i18n)
errorHandler(app)

app.mount('#app')
