import { defineStore } from "pinia";

export const useUserStore = defineStore({
    id:'user',
    state:()=>({
        userMenu:[],
        userPerm:[]
    }),
    actions:{
        setUserMenu(menuData){
            this.userMenu = menuData
        },
        setUserPerm(menuData){
            this.userPerm = menuData
        }
    }
})