import { defineStore } from "pinia";
import {userInfoApi} from '@/api/admin'

export const useUserStore = defineStore({
    id:'user',
    state:()=>({
        userMenu:[],
        userPerm:[],
        userInfo:{},
        roleNames:[],
        menuData:{
            routers:[],
            permissions:[]
        },
        hasUserInfo: false // 新增标志位
    }),
    actions:{
        async getUserInfo(){

            // 如果已有用户信息，直接返回
            if (this.hasUserInfo) {
                return {
                    data: {
                        userInfo: this.userInfo,
                        roleNames: this.roleNames,
                        routers: this.userMenu,
                        permissions: this.userPerm
                    }
                }
            }
            

            // t_user_request：获取用户权限请求
            try{
            const res = await userInfoApi()
            this.userInfo = res.data.userInfo
            this.roleNames = res.data.roleNames
            this.menuData = {
                routers:res.data.routers,
                permissions:res.data.permissions
            }
            this.hasUserInfo = true // 设置标志位
            return res
        }catch(error){
            error = '访问用户信息失败'
            return Promise.reject(error)
        }
        },
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
        },
        removeUserAuth(){
            this.userMenu = []
            this.userPerm = []
        },
        setRemoveUserInfo(){
            this.userInfo = {},
            this.roleNames = []
            this.hasUserInfo = false
        },
        clearUserStore(){
            this.$reset()
        }
    }
})