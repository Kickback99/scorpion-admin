import router from "@/router"
import { useTokenStore } from "@/store/token"

export const clearRoute = (res) => {
    res.forEach(item => {
        router.removeRoute(item.name)
        if(item.children && item.children.length > 0) {
            clearRoute(item.children)
        }
    })
    const tokenStore = useTokenStore()
    // 删除用户信息
    tokenStore.removeUserInfo()
    // 删除404路由
    router.removeRoute('NotFound')
    router.removeRoute('404')
}