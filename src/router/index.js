import {createRouter, createWebHistory} from 'vue-router'


// 路由规则
const routes = [
    //{path:"",component :}
]

// 创建路由对象

const router = createRouter({
    history:createWebHistory(), //采用 html5 路由模式
    routes
})

// 将路由对象暴露出去
export default router