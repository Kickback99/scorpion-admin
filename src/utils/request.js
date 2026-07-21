//定制请求的实例

//导入axios  npm install axios
import axios from 'axios';
//定义一个变量,记录公共的前缀  ,  baseURL
//t_env：axios_baseURL
const baseURL = import.meta.env.VITE_API;
const instance = axios.create({baseURL,timeout:4000})
import {useTokenStore} from '@/store/token'
import { useUserStore } from '@/store/user';
import router from '@/router';
import { clearRoute } from './remove';
import { clearUserInfo } from './remove';
import { useTabStore } from '@/store/tabs';
import { useUserConfigStore } from '@/store/userConfig'
import { useUiStore } from '@/store/ui'
import { useSettingStore } from '@/setting'
import { applyTheme } from '@/assets/common/theme'
import msg from '@/components/msg'



//添加请求拦截器
instance.interceptors.request.use(
    config => {
        const tokenStore =  useTokenStore()
        // 请求发出时保存浏览器地址栏路径，401 响应中用于 redirect
        config._currentPath = window.location.href.replace(window.location.origin, '')
        if(tokenStore.token){
            config.headers.authorization = tokenStore.token
        }

        return config
    },

    err => Premise.reject(err)
)

//添加响应拦截器
instance.interceptors.response.use(
    res=>{
        if(res.data.code === 0 || res.data.code === 200){
            console.log('哈哈')
            return res.data
        }
        

       //匹配状态码为40开头的正则 
       let regex = /^40[0-9]$/

       if(regex.test(res.data.code)) {

            if(res.data.code === 401){
                console.log('响应拦截器执行...')
                // 请求时已保存的路径（避免 401 到达前路由已被篡改）
                console.log(res.config)
                const currentPath = res.config._currentPath || router.currentRoute.value.fullPath
                // 处理token过期或者篡改
                const tokenStore = useTokenStore()
                const userStore = useUserStore()
                const tabStore = useTabStore()
                // 清空token
                tokenStore.removeToken()
                // 清空用户信息
                // clearUserInfo()
                // 清空动态路由数据
                clearRoute(userStore.userMenu)    
                // 清空用户信息和菜单
                userStore.clearUserStore()
                // 未开启保留标签时清空
                const settingStore = useSettingStore()
                if (!settingStore.keepTabs) {
                  tabStore.clearTabs()
                }
                // 暂存主题到 uiStore（登录页读取用），再清除用户配置
                const userConfigStore = useUserConfigStore()
                const uiStore = useUiStore()
                uiStore.setLastTheme(userConfigStore.theme)
                userConfigStore.clearUserConfig()
                document.documentElement.classList.remove('dark')
                applyTheme('default', false)
                // 清空菜单
                // userStore.removeUserAuth()
                // 清空用户名
                // userStore.username = ''
                // 提示信息
                msg.error(res.data.message)
                // 清除主动退出标记，携带当前页面路径以便重登后恢复
                settingStore.setLogoutIntent(false)
                router.replace({ path: '/login', query: { redirect: currentPath } })

            }else msg.error(res.data.message)

            // return Promise.reject(res.data.message)
            // 关键：返回pending的Promise，阻止错误开始向上传递的后续执行
             return new Promise(() => {})
       }

        msg.error(res.data.message || '业务失败')
        return Promise.reject(res.data.message)
    },
    err=>{
        alert('服务异常');
        console.log('请求异常执行...')
        return Promise.reject(err);//异步的状态转化成失败的状态
    }
)

export default instance;