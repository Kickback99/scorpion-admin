import { defineStore } from "pinia";

export const useIconStore = defineStore({
    id:'icon',
    state:()=>({
        // 在线图标收集
        onlineIcons:[],
        // 批量收集
        batchIcons:[],
        // 批量收集(已使用)
        batchUsedIcons:[],
        // 单个图标收集
        singleIcons:[],
        // 自定义图标收集
        customIcons:[]
    }),
    actions:{
        setOnlineIcons(data){
            this.onlineIcons = data
        },
        setBatchIcons(data){
            this.batchIcons = data
        },
        setBatchUsedIcons(data){
            this.batchUsedIcons = data
        },
        setSingleIcons(data){
            this.singleIcons = data
        },
        setCustomIcons(data){
            this.customIcons = data
        },
        // 清除当前所有数据
        clearIconStore(){
            this.$reset()
        }
    }
})