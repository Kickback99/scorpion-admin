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
        /** 退出/401 时是否保留标签页（默认保留） */
        keepTabs: true,
        /** 退出标记：登录后忽略 redirect，直接进仪表盘 */
        logoutIntent: false,
        /** 标签模式：'neutral'=中性色 | 'ui'=跟随 ui-mode | 'theme'=主题色 */
        tagMode: 'neutral',
        /** 菜单主题色：true=跟随主题侧边栏风格，false=中性色背景+普通文字（激活项主色） */
        menuThemeColor: false,
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
        paths: ['keepTabs', 'logoutIntent', 'tagMode', 'menuThemeColor'],
    },
})

import { useTabStore } from '@/store/tabs'