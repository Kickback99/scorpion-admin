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
        async getUserInfo(forceRefreshMenu = false){

            // 如果已有用户信息，直接返回
            /* if (this.hasUserInfo) {
                return {
                    data: {
                        userInfo: this.userInfo,
                        roleNames: this.roleNames,
                        routers: this.userMenu,
                        permissions: this.userPerm
                    }
                }
            } */

            // 已有基础信息且不强制刷新 → 仅返回菜单数据
            if (this.hasUserInfo && !forceRefreshMenu) {
                console.log('只刷新菜单。。。')
                return {data: this.menuData}
            }
            
            if(forceRefreshMenu == false){
                console.log('全量请求')
                    // 否则全量请求
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
                    return Promise.reject(error)
                }
            }else {
                // 仅获取用户信息
                console.log('仅获取用户信息')
                const res = await userInfoApi()
                this.userInfo = res.data.userInfo
                this.roleNames = res.data.roleNames
                return res.data.userInfo
            }
      
        },
        // 仅刷新菜单数据
        async refreshMenuOnly() {
            const res = await userInfoApi();
            return res.data;
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
        // 清除当前用户所有数据
        clearUserStore(){
            this.$reset()
        }
    }
})