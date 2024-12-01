import { defineStore } from "pinia";

export const useColorStore = defineStore({
    id:'color',
    state:()=>({
        menuBg:'red',
        menuTextColor:'rgba(19, 206, 102, 0.8)',
        menuActive:'yellow'
    }),
    actions:{
        setMenuTextColor(data){
            this.menuTextColor = data
        },
        setMenuBg(data){
            this.menuBg = data
        },
        setMenuActive(data){
            this.menuActive = data
        }
    },
    persist: true
})