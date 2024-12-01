import { defineStore } from "pinia";
import { menuThemeArr } from '@/assets/common/variable'

export const useColorStore = defineStore({
    id:'color',
    state:()=>({
        menuBg:'red',
        menuTextColor:'rgba(19, 206, 102, 0.8)',
        menuActive:'yellow',
        themes:[...menuThemeArr],
        storageColors:{
            menuBg:'',
            menuTextColor:'',
            menuActive:'',
        },
    }),
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
        }
        
    },
    persist: true
})