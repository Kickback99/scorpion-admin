import {createRouter, createWebHistory} from 'vue-router'
import Layout from '@/views/Layout.vue'
import {useUserStore} from '@/store/user'
import {useTokenStore} from '@/store/token'
import { ElMessage } from 'element-plus'
// 引入进度条
import nprogress from 'nprogress'
// 引入进度条样式
import "nprogress/nprogress.css"
import { useSettingStore } from '@/setting'
import { clearRoute, clearUserInfo } from '@/utils/remove'
import { add404Routes } from '@/utils/404route'

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
        {path:'/user/info',component:() =>import('@/views/user/userInfo.vue')},
        {path:'/user/avatar',component:() =>import('@/views/user/userAvatar.vue')},
        {path:'/user/resetPassword',component:() =>import('@/views/user/userResetPassword.vue')},
        {path:'/test',component:() => import('@/views/Test.vue')}
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
const msgModules = import.meta.glob('../views/msg/**/*.vue')

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
        }else {
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

export const loadMenu = async(loadUserInfo = true) => {
    const userStore = useUserStore()
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
    // ================= 2. 权限校验阶段 =================
        // 情况1：前台用户拦截
        if (userStore.userInfo.type !== 0) {
            console.log('情况1拦截')
            return Promise.reject({ isFrontendUser: true, message: '你没有访问权限' });
        }


        // 情况2：无菜单权限拦截
        if (menuData.routers.length === 0) {
            console.log('情况2拦截')
        add404Routes(router); // 确保404路由存在
        return Promise.reject({ 
            noMenuPermission: true, 
            message: '该用户无菜单权限' 
        });
        }

            console.log('情况3拦截')
    // ================= 3. 路由处理阶段 =================
    // 3.1 清除旧路由

    // 3.2 处理新路由
    const asyncRoutes = routesHandler(menuData.routers);
    console.log('后端返回',menuData.routers)
    console.log('路由数据',asyncRoutes) 
    asyncRoutes.forEach(route => {
      router.addRoute(route);
    });

    // 3.3 更新Store中的菜单引用
    userStore.setUserMenu(menuData.routers);
    userStore.setUserPerm(menuData.permissions);

    // 3.4 确保404路由存在
    add404Routes(router);

    console.log('动态路由更新完成', {
      routes: router.getRoutes(),
      permissions: menuData.permissions
    });

    return true;
    } catch (error) {
        console.log('error,',error)
    // 情况4：请求失败（如网络错误或API错误）
    return Promise.reject(error);
    }

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

let count = 1;

const whiteList = ['/login','/register','/401']

router.beforeEach((to, from, next) => {
    nprogress.start()
    const settings =  useSettingStore()
    ++count;
    console.log(to)
    console.log('路由前置守卫执行')
    const userStore = useUserStore()
    const tokenStore = useTokenStore()
    console.log('userStore.userMenu.length',userStore.userMenu.length )

    if(to.path === '/404' && settings.isManualTo404){
        console.log('跳转到404 count次')
        settings.isManualTo404 = false
        console.log('settings.isManualTo404',settings.isManualTo404)
        return next()
    }


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
        if(to.path != '/login' && to.path != '/index' && !localStorage.getItem('originalRouteQuery')){
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

    // 已登录，无菜单 => 按需加载菜单
    loadMenu().then(
        ()=>{next({...to,replace:true})
    }).catch((error) =>
        {
            // 情况1：前台用户 -> 提示错误，并跳转login
            if (error.isFrontendUser && to.path !== '/login') {
                      ElMessage.error(error.message)
                      router.replace('/login')
                      tokenStore.removeToken()
                    //   clearUserInfo()
                      clearRoute(userStore.userMenu)
                      userStore.clearUserStore( )
                    //   userStore.removeUserAuth()
                      
            } 
            // 情况3：无菜单权限的后台用户 -> 跳转404
            else if (error.noMenuPermission) {
                if(to.path === '/index'){
                     next()
                }else {
                    settings.isManualTo404 = true;
                    next('/404');
                }
            }else {
                ElMessage.error(error|| '加载菜单失败');
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