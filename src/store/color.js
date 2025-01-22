import { defineStore } from "pinia";
import { menuThemeArr } from '@/assets/common/variable'

export const useColorStore = defineStore({
    id:'color',
    state:()=>{
        const initTheme = menuThemeArr[0] || {}   
        return {
            menuBg:initTheme.bg,
            menuTextColor:initTheme.textColor,
            menuActive:initTheme.active,
            logoTitleColor:'rgba(255,255,255,1)',
            themes:[...menuThemeArr],
            storageColors:{
                menuBg:'',
                menuTextColor:'',
                menuActive:'',
            },
        }
    },
    actions:{
        setMenuBg(data){
            this.menuBg = data
        },
        setMenuTextColor(data){
            this.menuTextColor = data
        },
        setMenuActive(data){
            this.menuActive = data
        },
        setLogoTitleColor(data){
            this.logoTitleColor = data
        },
        storageColors(){
            this.storageColors.menuBg = this.menuBg
            this.storageColors.menuTextColor =  this.menuTextColor
            this.storageColors.menuActive = this.menuActive
        },
        addThemes(data){
            this.themes.push(data)
        },
        resetThemes(){
            this.themes = [...menuThemeArr]
            this.logoTextColor = 'rgba(255,255,255,1)'
        }
        
    },
    persist: true
})