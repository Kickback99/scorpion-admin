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
    }),
    actions:{
        setMenuTextColor(data){
            this.menuTextColor = data
        },
        /** 根据当前登录用户的菜单，移除不存在的标签页 */
        cleanupTabsByMenu() {
            const tabStore = useTabStore()
            const userStore = useUserStore()
            const menuPaths = flattenMenuPaths(userStore.userMenu)
            console.log('【cleanupTabsByMenu】menuPaths:', menuPaths)
            console.log('【cleanupTabsByMenu】tabList:', tabStore.tabList.map(t => t.path))
            const toRemove = tabStore.tabList.filter(t => !menuPaths.has(t.path) && t.path !== '/index')
            console.log('【cleanupTabsByMenu】toRemove:', toRemove.map(t => t.path))
            toRemove.forEach(t => tabStore.removeTab(t.path))
        },
    },
    persist: {
        key: 'setting-store',
        paths: ['clearTabsOnLogout'],
    },
})

import { useTabStore } from '@/store/tabs'
import { useUserStore } from '@/store/user'
import { flattenMenuPaths } from '@/utils/RouteHandler'