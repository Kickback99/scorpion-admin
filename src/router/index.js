import {createRouter, createWebHistory} from 'vue-router'
import {userInfoApi} from '@/api/admin'
import Layout from '@/views/Layout.vue'
import {useUserStore} from '@/store/user'
import {useTokenStore} from '@/store/token'
import { ElMessage } from 'element-plus'
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
    { path:'/',redirect:'/index',meta:{
        hidden:true
    },
    component:Layout,
    children:[
        {path:'/index',component:() => import('@/views/home/index.vue'),
            meta:{
               title:'首页'     
        }},
    ]}
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

const sysModules = import.meta.glob('../views/system/**/*.vue')
const conModules = import.meta.glob('../views/content/**/*.vue')

// 处理前端需要的路由规则格式
function routesHandler(router,parentType=null){
    return router.map(route => {
        // 处理顶层路由：为顶层路由设置type属性
        if(route.path === '/system'){
            route.component = Layout
            route.name = 'system'
            route.type = 'system'
        }else if(route.path === '/content' ){
            route.component = Layout
            route.name = 'content'
            route.type = 'content'
        }else {
        // 如果是子路由，继承父路由的type属性
            route.type = parentType
            // 根据父路由的type来决定使用哪个模块导入
            const modules = parentType === 'system'?sysModules:conModules;

            // 处理二级子菜单：为这些孩子构建新的属性(parentPath，level)便于menu来添加父级路径
            if(route.children != null && route.component == 'ParentView'){
                let parent = route.path
                route.children.map(item => {
                    item.parentPath = parent
                    item.level = true
                })
            }
            // 子路由
            if(modules){
                route.name = route.path
                const compName = route.component
                const path = `../views/${compName}.vue`
                console.log('到底加载的是哪个组件--------')
                console.log(modules[path])
                route.component = modules[path]
            }
        }
        
        //comment：历史代码
        /* else {
            route.name = route.path
            const compName = route.component
            const path = `../views/${compName}.vue`
            route.component = modules[path]
            console.log(modules[path])
            // route.component = () => import(`@/views/system/${compName}.vue`)
        } */

        // 处理children
        if(route.children && route.children.length > 0){
            route.children = routesHandler(route.children,route.type)
        }
        return route
    })
}

const loadMenu = async(to,next) => {
    const userStore = useUserStore()
    console.log('请求菜单')
    const res = await userInfoApi()
    //保存菜单，避免路由鉴权重复执行
    userStore.setUserMenu(res.data.routers)
    // 把用户按钮权限存进store
    userStore.setUserPerm(res.data.permissions)
    const asyncRoutes = routesHandler(res.data.routers)

    /* console.log('后端返回',res.data.routers)
    
    console.log('路由数据',asyncRoutes) */

    // 添加路由
    asyncRoutes.forEach(r => {
        router.addRoute(r)
    })

    router.addRoute( {path:'/:pathMatch(.*)*',name:'NotFound',redirect:'/404'})
    router.addRoute( {path:'/404',name:'404',component:()=>import('@/views/404/index.vue')})

    console.log(router.getRoutes())

    
  

    next({...to,replace:true})
}

// 处理pinia菜单名字，便于用户注销时：删除动态路由操作，注意：名字要和 routesHandler方法设置的名字保持一致，否则删除失败
function menusNameHandler(menus){
    return menus.map(route => {

        if(route.path === '/system'){
            route.name = 'system'
        }else if(route.path === '/content'){
            route.name = 'content'
        }else {
            route.name = route.path
        }

        //comment：历史代码
       /*  if(route.component === 'Layout'){
            route.name = 'system'
        }else {
            route.name = route.path
        } */

        // 处理children
        if(route.children && route.children.length > 0){
            route.children = menusNameHandler(route.children)
        }
        return route
    })
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

    console.log(to)
    console.log('路由前置守卫执行')
    const userStore = useUserStore()

    const tokenStore = useTokenStore()

    // 已登录不能输入登录地址回到登录页
    if(to.path === '/login' && tokenStore.token) {
        console.log('已登录不能输入登录地址回到登录页')
        ElMessage.warning('请先退出登录')
        return next(from.fullPath);
    }

    // 白名单放行
    if(whiteList.includes(to.path)){
        console.log('白名单放行')
      return next();
    }

    // 如果没有token跳转到登录页
    if(!tokenStore.token && to.path != '/login') {
        ElMessage.error('如果没有token跳转到登录页')
        if(to.path != '/login' && !localStorage.getItem('originalRouteQuery')){
            // 保存原始路由的查询参数到本地存储
            const path = to.path
            const query =  to.query
            localStorage.setItem('originalRouteQuery', JSON.stringify({path,query}));
        }
        console.log('最终的',localStorage.getItem('originalRouteQuery'))
        // 重定向到登录页面
        return next('/login');
    }



    // 已登录，有菜单
    if(userStore.userMenu && userStore.userMenu.length > 0){
        //放行
        console.log('已登录，有菜单')
        return next()
    }

    // 已登录，无菜单 => 加载菜单
    loadMenu(to,next)
});

// 将路由对象暴露出去
export default router