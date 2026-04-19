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
        title:'蝎子博客管理',
        isManualTo403:false,
    }),
    actions:{
        setMenuTextColor(data){
            this.menuTextColor = data
        }
    }
})