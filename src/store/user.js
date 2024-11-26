import { defineStore } from "pinia";

export const useUserStore = defineStore({
    id:'user',
    state:()=>({
        userMenu:[],
        userPerm:[],
        userInfo:{},
        roleNames:[]
    }),
    actions:{
        setUserMenu(menuData){
            this.userMenu = menuData
        },
        setUserPerm(menuData){
            this.userPerm = menuData
        },
        setUserInfo(userInfo){
            this.userInfo = userInfo
        },
        setRoleNames(roleNames){
            this.roleNames = roleNames
        }
    }
})