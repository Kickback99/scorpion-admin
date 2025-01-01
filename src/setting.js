import { defineStore } from "pinia";

export const useSettingStore = defineStore({
    id:'setting',
    state:()=>({
        refresh:false,
        menuTextColor:'rgba(19, 206, 102, 0.8)',
        // 项目logo
        logo:'/src/assets/images/avatar-wz1.jpg',
        // 项目标题
        title:'蝎子博客管理',
        // 菜单默认是否折叠
        isCollapse:false
        
    }),
    actions:{
        setMenuTextColor(data){
            this.menuTextColor = data
        }
    }
})