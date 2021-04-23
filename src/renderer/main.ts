import { createApp } from 'vue'

import ElementPlus from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css'
import './styles/index.scss'
import './permission'
import App from './App.vue'
import router from './router'
import { errorHandler } from './error'

import TitleBar from "./components/common/TitleBar.vue"

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
errorHandler(app)

// 全局引入 TitleBar 组件
app.component("TitleBar", TitleBar);

app.mount("#app")