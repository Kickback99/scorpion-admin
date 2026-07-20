import { defineStore } from "pinia";
import logoImage from '@/assets/images/avatar-wz1.jpg'

export const useSettingStore = defineStore({
    id:'setting',
    state:()=>({
        refresh:false,
        menuTextColor:'rgba(19, 206, 102, 0.8)',
        // 项目logo
        logo:logoImage,
        // 项目标题
        title:'SCORPIONCODE',
        isManualTo403:false,
        /** 退出/401 时是否清空标签页（默认不清） */
        clearTabsOnLogout: false,
        /** 退出标记：登录后忽略 redirect，直接进首页 */
        logoutIntent: false,
    }),
    actions:{
        setMenuTextColor(data){
            this.menuTextColor = data
        },
        setLogoutIntent(val) {
            this.logoutIntent = val
        },
        /** 根据当前登录用户的菜单，移除不存在的标签页 */
        cleanupTabsByMenu() {
            const tabStore = useTabStore()
            const userStore = useUserStore()
            const menuPaths = flattenMenuPaths(userStore.userMenu)
            console.log('【cleanupTabsByMenu】menuPaths:', menuPaths)
            console.log('【cleanupTabsByMenu】tabList:', tabStore.tabList.map(t => t.path))
            // 公共路由不纳入清理
            const staticPaths = new Set(['/index', '/user/profile', '/user/rePassword', '/test'])
            // 模板路由不纳入清理
            const isTempRoute = (t) => t.path.startsWith('/temp')
            const toRemove = tabStore.tabList.filter(t =>
                !menuPaths.has(t.path) && !staticPaths.has(t.path) && !isTempRoute(t)
            )
            console.log('【cleanupTabsByMenu】toRemove:', toRemove.map(t => t.path))
            toRemove.forEach(t => tabStore.removeTab(t.path))
        },
    },
    persist: {
        key: 'setting-store',
        paths: ['clearTabsOnLogout', 'logoutIntent'],
    },
})

import { useTabStore } from '@/store/tabs'
import { useUserStore } from '@/store/user'
import { flattenMenuPaths } from '@/utils/RouteHandler'