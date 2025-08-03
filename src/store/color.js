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
            // 黑暗模式颜色控制 
            isDark:false,
            // 黑暗模式初始化的开关
            darkStarted:true,
            customDarkThemes:[...darkMenuThemes],
            customLightThemes:[...lightMenuThemes],
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
        themes: (state) => state.isDark ? [...state.customDarkThemes] : [...state.customLightThemes],
    },
    actions:{
        setDark(){
            this.isDark = !this.isDark;
        },
        setDarkStarted(){
            this.darkStarted = !this.darkStarted
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
        setStorageDarkColors(colorModel){
                this.storageDarkColors.menuBg = this.menuBg
                this.storageDarkColors.menuTextColor =  this.menuTextColor
                this.storageDarkColors.menuActive = this.menuActive
                this.storageDarkColors.logoTitleColor = this.logoTitleColor
                this.storageDarkColors.colorModel = colorModel

        },
        setStorageLightColors(colorModel){
                this.storageLightColors.menuBg = this.menuBg
                this.storageLightColors.menuTextColor =  this.menuTextColor
                this.storageLightColors.menuActive = this.menuActive
                this.storageLightColors.logoTitleColor = this.logoTitleColor
                this.storageLightColors.colorModel = colorModel
        },        
        addThemes(data){
            // this.themes.push(data)
            if (this.isDark) {
                this.customDarkThemes.push(data);
            } else {
                this.customLightThemes.push(data);
            }
        },
        resetThemes(){
            // this.themes = [...lightMenuThemes]
       
            if (this.isDark) {
                this.customDarkThemes = [...darkMenuThemes];
            }else {
                this.customLightThemes = [...lightMenuThemes]; 
            }
        }
        
    },
    persist: true
})