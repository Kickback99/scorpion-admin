import { defineStore } from "pinia";
import { lightMenuThemes,darkMenuThemes } from '@/assets/common/variable'

export const useColorStore = defineStore({
    id:'color',
    state:()=>{
        const initTheme = lightMenuThemes[0] || {}   
        return {
            menuBg:initTheme.bg,
            menuTextColor:initTheme.textColor,
            menuActive:initTheme.active,
            logoTitleColor:initTheme.title,
            isDark:false,
            storageDarkColors:{
                menuBg:'',
                menuTextColor:'',
                menuActive:'',
                logoTitleColor:'',
                colorModel:''
            },
            storageLightColors:{
                menuBg:'',
                menuTextColor:'',
                menuActive:'',
                logoTitleColor:'',
                colorModel:''
            },
        }
    },
    getters: {
        themes: (state) => state.isDark ? [...darkMenuThemes] : [...lightMenuThemes],
    },
    actions:{
        setDark(){
            this.isDark = !this.isDark;
        },
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
        storageColors(colorModel){
            if(this.isDark){
                this.storageDarkColors.menuBg = this.menuBg
                this.storageDarkColors.menuTextColor =  this.menuTextColor
                this.storageDarkColors.menuActive = this.menuActive
                this.storageDarkColors.logoTitleColor = this.logoTitleColor
                this.storageDarkColors.colorModel = colorModel
            }else {
                this.storageLightColors.menuBg = this.menuBg
                this.storageLightColors.menuTextColor =  this.menuTextColor
                this.storageLightColors.menuActive = this.menuActive
                this.storageLightColors.logoTitleColor = this.logoTitleColor
                this.storageLightColors.colorModel = colorModel
            }
        },
        addThemes(data){
            this.themes.push(data)
        },
        resetThemes(){
            this.themes = [...lightMenuThemes]
            this.logoTextColor = 'rgba(255,255,255,1)'
        }
        
    },
    persist: true
})