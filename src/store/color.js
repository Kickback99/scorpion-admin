import { defineStore } from "pinia";

export const useColorStore = defineStore({
    id:'color',
    state:()=>{
        return {
            // 黑暗模式颜色控制 
            isDark:false,
        }
    },
    getters: {
        
    },
    actions:{
        setDark(){
            this.isDark = !this.isDark;
        },
    },
    persist: true
})