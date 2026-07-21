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
        /** 根据已注册路由移除不存在的标签页（由 router/index.js 传入路径集合） */
        cleanupTabsByMenu(routePaths) {
            const tabStore = useTabStore()
            console.log('【cleanupTabsByMenu】routePaths:', routePaths)
            console.log('【cleanupTabsByMenu】tabList:', tabStore.tabList.map(t => t.path))
            const toRemove = tabStore.tabList.filter(t => !routePaths.has(t.path))
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