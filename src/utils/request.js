//定制请求的实例

//导入axios  npm install axios
import axios from 'axios';
//定义一个变量,记录公共的前缀  ,  baseURL
const baseURL = '/api';
const instance = axios.create({baseURL,timeout:4000})
import { ElMessage } from 'element-plus'
import {useTokenStore} from '@/store/token'
import { useUserStore } from '@/store/user';
import router from '@/router';
import { clearRoute } from './remove';
import { clearUserInfo } from './remove';



//添加请求拦截器
instance.interceptors.request.use(
    config => {
        const tokenStore =  useTokenStore()
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
                // 处理token过期或者篡改
                const tokenStore = useTokenStore()
                const userStore = useUserStore()
                // 清空token
                tokenStore.removeToken()
                // 清空用户信息
                clearUserInfo()
                // 清空动态路由数据
                clearRoute(userStore.userMenu)    
                // 清空菜单
                userStore.userMenu = []
                // 清空用户名
                userStore.username = ''
                // 提示信息
                ElMessage.success(res.data.message)
                // 跳转到登录页
                router.replace('/login')

            }else ElMessage.error(res.data.message)

            return Promise.reject(res.data)
       }

        ElMessage.error(res.data.message || '业务失败')
        return Promise.reject(res.data)
    },
    err=>{
        alert('服务异常');
        console.log('请求异常执行...')
        return Promise.reject(err);//异步的状态转化成失败的状态
    }
)

export default instance;