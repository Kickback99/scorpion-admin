import {createRouter, createWebHistory} from 'vue-router'
import {userInfoService} from '@/api/user'
import Layout from '@/views/system/Layout.vue'
import {useUserStore} from '@/store/user'
//路由器对象--跳转路径
/* import { useRouter } from 'vue-router'
const router = useRouter()

//路由对象--获取路由参数
import { useRoute } from 'vue-router'
const route = useRoute() */
// 路由规则
const routes = [
    //{path:"",component :}
    {path:'/login',component:() => import('@/views/Login.vue')},
    { path:'/',redirect:'/system'}
/*     {
    path:'/',
    component:() => import('@/views/Layout.vue'),
    children:[
        {path:'/article/category',component:() =>import('@/views/article/ArticleCategory.vue')},
        {path:'/article/manage',component:() =>import('@/views/article/ArticleManage.vue')},
        {path:'/user/info',component:() =>import('@/views/user/userInfo.vue')},
        {path:'/user/avatar',component:() =>import('@/views/user/userAvatar.vue')},
        {path:'/user/resetPassword',component:() =>import('@/views/user/userResetPassword.vue')},
    ]} */
]

function routesHandler(router){
    return router.map(route => {
        if(route.component === 'Layout'){
            route.component = Layout
        }else {
            const compName = route.component
            // 帮我把这段代码，使用import.meta.glob的方式实现动态懒加载
            route.component = () => import(`@/views/system/${compName}.vue`)
        }

        // 处理children
        if(route.children && route.children.length > 0){
            route.children = routesHandler(route.children)
        }
        return route
    })
}

const loadMenu = async(to,next) => {
    const userStore = useUserStore()
    const res = await userInfoService()
    const asyncRoutes = routesHandler(res.data.routers)

    console.log('路由数据',asyncRoutes)

    // 添加路由
    asyncRoutes.forEach(r => {
        console.log('路由',r)
        router.addRoute(r)
    })
   
    
    //保存菜单，避免路由鉴权重复执行
    userStore.setUserMenu(res.data.routers)

    next({...to,replace:true})
}

// 创建路由对象

const router = createRouter({
    history:createWebHistory(), //采用 html5 路由模式
    routes
})

const getToken = () => {
    return localStorage.getItem('token')
}

const whiteList = ['/login','/register','/404','/401']
router.beforeEach((to, from, next) => {

    const userStore = useUserStore()

    // 白名单放行
    if(whiteList.includes(to.path)){
      return next();
    }

    // 验证有无token

    if(!getToken()) {
        console.log('无token')
        return next('/login')
    }

    // 已登录，有菜单
    if(userStore.userMenu && userStore.userMenu.length > 0){
        //放行
        console.log(123)
        return next()
    }

    // 已登录，无菜单 => 加载菜单
    loadMenu(to,next)
});

// 将路由对象暴露出去
export default router