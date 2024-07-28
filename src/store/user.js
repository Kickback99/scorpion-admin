import { defineStore } from "pinia";

export const useUserStore = defineStore({
    id:'user',
    state(){
        return { userMenu:[] }
    },
    actions:{
        setUserMenu(menuData){
            this.userMenu = menuData
        }
    }
})