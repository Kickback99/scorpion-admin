import { defineStore } from "pinia";

export const useSettingStore = defineStore({
    id:'setting',
    state:()=>({
        refresh:false
    }),
})