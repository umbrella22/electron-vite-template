import { createApp } from 'vue'

import ElementPlus from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css'
import './styles/index.scss'
import './permission'
import App from './App.vue'
import router from './router'
import { errorHandler } from './error'



const app = createApp(App)
app.use(ElementPlus)
app.use(router)
errorHandler(app)

app.mount("#app")