import { defineStore } from "pinia";

export const useSettingStore = defineStore({
    id:'setting',
    state:()=>({
        refresh:false,
        menuTextColor:'rgba(19, 206, 102, 0.8)'
    }),
    actions:{
        setMenuTextColor(data){
            this.menuTextColor = data
        }
    }
})