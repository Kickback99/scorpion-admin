import { defineStore } from "pinia";

export const useIconStore = defineStore({
    id:'icon',
    state:()=>({
        localIcons:[],
        batchIcons:[],
        fullIcons:[],
        objectIcons:[]
    }),
    actions:{
        setLocalIcons(data){
            this.localIcons = data
        },
        setBatchIcons(data){
            this.batchIcons = data
        },
        setFullIcons(data){
            this.fullIcons = data
        },
        setObjectIcons(data){
            this.objectIcons = data
        },
        // 清除当前所有数据
        clearIconStore(){
            this.$reset()
        }
    }
})