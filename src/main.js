import './assets/style/index.scss'

import { createApp } from 'vue'
import App from './App.vue'
// 导入路由
import router from './router'
// 导入pinia
import {createPinia} from 'pinia'
// 导入持久化插件
import persist from 'pinia-plugin-persistedstate'

// 导入tailwindcss
import './assets/style/tailwind.css'

// element 暗黑模式样式
import 'element-plus/theme-chalk/dark/css-vars.css'


// 集成md编辑器
import VMdEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';

// highlightjs
import hljs from 'highlight.js';

VMdEditor.use(githubTheme, {
  Hljs: hljs,
});

// 完整导入
/* import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs' */


const app = createApp(App)
app.use(VMdEditor)
app.use(router)
const pinia = createPinia() //创建Pinia实例
app.use(pinia.use(persist)) //安装pinia插件
/* app.use(ElementPlus,{
    locale:zhCn
}) */

//导入字体图标
// import "./assets/Iconfont/demo/iconfont.css"
// import "./assets/Iconfont/demo/iconfont.js"

// 动态导入iconfont目录下的所有字体图标
const modules = import.meta.glob('./assets/iconfont/**/*.{js,css}');

for (const path in modules) {
  console.log('嘎嘎')
  console.log(modules)
  modules[path]();
}

// 引入svg脚本
import 'virtual:svg-icons-register'

// 全局注册@iconify/vue图标库
import {
    IconifyOffline,
    IconifyOnline,
    IconFont
  } from "./components/MyIcon";
  app.component("IconifyOffline", IconifyOffline);
  app.component("IconifyOnline", IconifyOnline);
  app.component("IconFont", IconFont);

// 使用自定义指定来控制按钮权限的移除
// import {directiveList} from '@/directives'

// directiveList(app)

// 使用全局属性注入来控制按钮权限的禁用

import { hasPermissions } from '@/utils/permissions'

app.config.globalProperties.$hasPerm =  hasPermissions

app.mount('#app')
