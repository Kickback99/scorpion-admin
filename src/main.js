import './assets/main.scss'

import { createApp } from 'vue'
import App from './App.vue'
// 导入路由
import router from './router'
// 导入pinia
import {createPinia} from 'pinia'
// 导入持久化插件
import persist from 'pinia-plugin-persistedstate'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'


const app = createApp(App)
app.use(router)
const pinia = createPinia() //创建Pinia实例
app.use(pinia.use(persist)) //安装pinia插件
app.use(ElementPlus,{
    locale:zhCn
})
app.mount('#app')
