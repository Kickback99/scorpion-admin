import {createRouter, createWebHistory} from 'vue-router'
import { nextTick } from 'vue'
import Layout from '@/views/Layout.vue'
import {useUserStore} from '@/store/user'
import {useTokenStore} from '@/store/token'
// 引入进度条
import nprogress from 'nprogress'
// 引入进度条样式
import "nprogress/nprogress.css"
import { useSettingStore } from '@/setting'
import { clearRoute, clearUserInfo } from '@/utils/remove'
import { add403Routes } from '@/utils/403route'
import { add404Routes } from '@/utils/404route'
import { useWebSocket } from '@/server/useWebSocket'
import { useConfigStore } from '@/store/config'
import { useUserConfigStore } from '@/store/userConfig'
//路由器对象--跳转路径
/* import { useRouter } from 'vue-router'
const router = useRouter()

//路由对象--获取路由参数
import { useRoute } from 'vue-router'
const route = useRoute() */
import msg from '@/components/msg'



// 路由规则
export const routes = [
    //{path:"",component :}
    {path:'/login',component:() => import('@/views/Login.vue')},
    { path:'/',redirect:'/index',name:'parentNode',meta:{
        hidden:true
    },
    component:Layout,
    children:[
        {path:'/index',component:() => import('@/views/home/index.vue'),
            meta:{
               title:'首页'     
        }},
        {path:'/user/profile',component:() =>import('@/views/user/UserProfile.vue'),meta:{
            title:'个人资料'
        }},
        {path:'/user/rePassword',component:() =>import('@/views/user/UserRePassword.vue'),meta:{
            title:'重置密码'
        }},
        {path:'/test',component:() => import('@/views/Test.vue')}
    ]},
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
    /* {path:'/:pathMatch(.*)*',name:'NotFound',redirect:'/404'},
    {path:'/404',name:'404',component:()=>import('@/views/error/404.vue')} */
]

const sysModules = import.meta.glob('../views/system/**/*.vue')
const conModules = import.meta.glob('../views/content/**/*.vue')
const msgModules = import.meta.glob('../views/msg/**/*.vue')
const monitorModules = import.meta.glob("../views/monitor/**/*.vue")
const resourceModules = import.meta.glob('../views/resource/**/*.vue')
const configModules = import.meta.glob('../views/config/*.vue')
const taskModules = import.meta.glob('../views/task/*.vue')

// 处理前端需要的路由规则格式
function routesHandler(router,parentType=null){
    return router.map(route => {
        // 处理顶层路由：为顶层路由设置type属性
        if(route.component === 'Layout'){
              route.component = Layout
              const newStr =  route.path.substring(1)
              route.name = newStr
              route.type = newStr
            //   route.redirect = `${route.path}/${route.children[0].path}` //这样处理会报错
              if(route.children && route.children.length > 0){
                  route.redirect = `${route.path}/${route.children[0].path}`
              }
        }else if(route.component === 'list'){
            // 标记为需要添加到 parentNode 的配置管理路由
            route._addToParentNode = true
            const newStr =  route.path.substring(1)
            route.name = newStr
            route.type = newStr
            // 根据父路由的type来决定使用哪个模块导入
            let modules;
            switch(route.type){
                case 'config':
                    modules = configModules
                    break
                case 'task':
                    modules = taskModules
                    break
                default:
                    modules = null
            }
            
            if(modules){
                const compName = route.component
                // 注意：这里 component 字段存储的是相对路径，如 'config/sysConfig/list'
                const path = `../views/${route.name}/${compName}.vue`
                console.log('加载配置管理组件:', path)
                route.component = modules[path]
            }}else {
        // 如果是子路由，继承父路由的type属性
            route.type = parentType
            // 根据父路由的type来决定使用哪个模块导入
            // const modules = parentType === 'system'?sysModules:conModules;
            let modules;
            switch(parentType){
                case 'system':
                    modules = sysModules
                    break
                case 'content':
                    modules = conModules
                    break
                case 'msg':
                    modules = msgModules
                    break
                case 'monitor':
                    modules = monitorModules
                    break
                case 'resource':
                    modules = resourceModules
                    break
            }



            // 处理二级子菜单：为这些孩子构建新的属性(parentPath，level)便于menu来添加父级路径
            if(route.children != null && route.component == 'ParentView'){
                let parent = route.path
                route.redirect = route.children[0].path
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

export const loadMenu = async(loadUserInfo = true,to,from,next) => {
    const userStore = useUserStore()
    const configStore = useConfigStore()
    const userConfigStore = useUserConfigStore();  // 新增
    console.log('请求菜单')

    /* if(loadUserInfo){
        userStore.setUserInfo(res.data.userInfo)
        userStore.setRoleNames(res.data.roleNames)
    } */
   
    try {
        // ================= 1. 数据获取阶段 =================
        let menuData
        if(loadUserInfo){
            // 场景1：完整获取用户信息+菜单
            const res = await userStore.getUserInfo();
            menuData = {
                    routers: res.data.routers,
                    permissions: res.data.permissions
            };
        } else {
            // 场景2：仅刷新菜单(修改菜单后调用)
            const res = await userStore.refreshMenuOnly();
            menuData = {
                routers: res.routers,
                permissions: res.permissions
            };
        }

    // ================= 1.5 加载系统配置 =================
    // 确保系统配置已加载（用于路由守卫中的菜单折叠等判断）

    // ================= 1.6 加载用户配置 =================
    await userConfigStore.fetchUserConfig();
    // applyTheme 由 App.vue watch(route) 在路由跳转后触发（避免登录页闪现用户主题）

    await configStore.loadConfig()

    // ================= 2. 权限校验阶段 =================
        // 情况1：前台用户拦截
        /* if (userStore.userInfo.type !== 0) {
            console.log('情况1拦截')
            return Promise.reject({ isFrontendUser: true, message: '你没有访问权限' });
        } */


        // 情况2：无菜单权限拦截
        if (menuData.routers.length === 0 ) {
            console.log('情况2拦截')
        add403Routes(router); // 确保403路由存在
        return Promise.reject({ 
            noMenuPermission: true, 
            message: '该用户无菜单权限' 
        });
        }

    // ================= 3. 路由处理阶段 =================
    // 3.1 清除旧路由
    // 3.1 移除现有的404路由，确保动态路由优先匹配
    // remove404Routes()
        

    // 3.2 处理新路由
    const asyncRoutes = routesHandler(menuData.routers);
    console.log('后端返回',menuData.routers)
    console.log('路由数据',asyncRoutes) 
    asyncRoutes.forEach(route => {
        if (route._addToParentNode) {
            // 配置管理类菜单添加到 parentNode 下
            router.addRoute('parentNode', route);
            console.log(`添加配置管理路由到 parentNode: ${route.path}`);
        } else {
            // Layout 顶层路由正常添加
            router.addRoute(route);
            console.log(`添加普通路由: ${route.path}`);
        }
    });

  

    // 3.3 更新Store中的菜单引用
    userStore.setUserMenu(menuData.routers);
    userStore.setUserPerm(menuData.permissions);

    // 3.4 确保403路由存在
    add404Routes(router)
    add403Routes(router);

    console.log('动态路由更新完成', {
      routes: router.getRoutes(),
      permissions: menuData.permissions
    });
    
    
    // 用户菜单权限不足校验
    if(!hasRouteByPath(to.path)){
        if(from.path != '/login'){
            return next('/404')
        }
        console.log('router.getRoutes()',router.getRoutes())
        console.log('用户菜单权限不足')
        return Promise.reject({ 
            noMenuAccess: true, 
            message: '该用户无菜单权限' 
        });
    }
   console.log('router.getRoutes()',router.getRoutes())
   console.log('用户菜单权限充足')
    return true;
    } catch (error) {
        console.log('error,',error)
    // 情况4：请求失败（如网络错误或API错误）
    return Promise.reject(error);
    }

}


// 移除404路由的函数
/* function remove404Routes() {
    if (router.hasRoute('NotFound')) {
        router.removeRoute('NotFound')
    }
    if (router.hasRoute('404')) {
        router.removeRoute('404')
    }
} */

const hasRouteByPath = (path) => {
    return router.getRoutes().some(route => route.path === path)
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
    //t_env：router
    history:createWebHistory(import.meta.env.VITE_ROUTER_URL), //采用 html5 路由模式
    routes
})

const getToken = () => {
    return localStorage.getItem('token')
}

let count = 1;

function addDynamicRoutes(routerData){
    routerData.forEach(r => {
        //router.addRoute('/',r) //错误写法
        router.addRoute('parentNode',r) //此处必须填写的父路由名字(name)
    })
}

const modules = import.meta.glob('../views/temp/*.vue')

const routerData = Object.entries(modules).map(([filePath, component]) => {
    // 提取文件名（不含扩展名）
    const fileName = filePath.split('/').pop().replace('.vue', '')
    
    return {
        path: `/${fileName.toLowerCase()}`, // 路径，如：/temp1
        name: fileName, // 路由名称，如：temp1
        component: component, // 组件
        meta: { title: `${fileName}页面` } // 可选的元信息
    }
})

addDynamicRoutes(routerData)

const whiteList = ['/login','/register','/401']

router.beforeEach((to, from, next) => {
    nprogress.start()
    const settings =  useSettingStore()
    ++count;
    console.log('路由前置守卫执行')
    console.log(from)
    console.log(to.path)
    console.log(to.fullPath)
    const userStore = useUserStore()
    const tokenStore = useTokenStore()
    console.log('userStore.userMenu.length',userStore.userMenu.length )

    if(to.path === '/403' && settings.isManualTo403){
        console.log('跳转到403 count次')
        settings.isManualTo403 = false
        console.log('settings.isManualTo403',settings.isManualTo403)
        return next()
    }


    // 已登录不能输入登录地址回到登录页
    if(to.path === '/login' && tokenStore.token) {
        console.log('已登录不能输入登录地址回到登录页')
        msg.warning('请先退出登录')
        return next(from.fullPath);
    }

    // 白名单放行
    if(whiteList.includes(to.path)){
        console.log('白名单放行')
      return next();
    }

    // 如果没有token跳转到登录页
    if(!tokenStore.token && to.path != '/login') {
        msg.error('如果没有token跳转到登录页')
    // 重定向到登录页面，使用原始路径避免重复编码
    return next({
        path: '/login',
        query: {
            redirect: to.path + (to.query && Object.keys(to.query).length ? `?${new URLSearchParams(to.query).toString()}` : '')
        }
    });
    }

    // 已登录，有菜单
    if(userStore.userMenu && userStore.userMenu.length > 0){
        //放行
        console.log('已登录，有菜单')
        return next()
    }

    // 已登录，无菜单 => 按需加载菜单
    loadMenu(true,to,from,next).then(
        ()=>{
            next({...to,replace:true})
            // 路由跳转后，下一帧清理不在菜单中的标签页
            nextTick(() => {
                const settingStore = useSettingStore()
                settingStore.cleanupTabsByMenu()
            })
    }).catch((error) =>
        {
            // 情况1：前台用户 -> 提示错误，并跳转login
            /* if (error.isFrontendUser && to.path !== '/login') {
                      msg.error(error.message)
                      router.replace('/login')
                      tokenStore.removeToken()
                    //   clearUserInfo()
                      clearRoute(userStore.userMenu)
                      userStore.clearUserStore( )
                      const { closeWebSocket } = useWebSocket()
                      closeWebSocket()
                    //   userStore.removeUserAuth()
                      
            }  */
            // 情况3：无菜单权限的后台用户 -> 跳转403
            if (error.noMenuPermission) {
                if(hasRouteByPath(to.path)){
                    next()
                }else {
                    console.log('拦截2')
                settings.isManualTo403 = true;
                next('/403');
                }
            }else if(error.noMenuAccess){
                console.log('拦截1')
                settings.isManualTo403 = true;
                next('/403');   
            }else {
                msg.error(error|| '加载菜单失败');
                next(false); // 阻止导航
            }
                 
        }
    )

        //t_handle：处理前后台用户的逻辑
        // 后台用户，没有菜单，跳到首页
        // 前台用户，跳到404
    /* if(to.path === '/index'){
        console.log('放首页')
        return next()
    } */
});

router.afterEach((to, from) => {
    nprogress.done()
})

// 将路由对象暴露出去
export default router