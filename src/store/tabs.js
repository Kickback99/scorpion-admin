// stores/load.js

import { defineStore } from "pinia"
export const useTabStore = defineStore({
  id: 'tabs',
  state: () => ({
    tabList:[]
  }),
  getters:{
    getTabs:(state) => state.tabList
  },
  actions: {
    addTabs(tab){
        if(this.tabList.some(item => item.path === tab.path)) return
        this.tabList.push(tab)
    },
    clearTabs(){
      this.$reset()
       localStorage.removeItem('tabs'); 
    }
  },
    persist: true,  // 开启当前仓库的持久化
	/* persist: {
		key: 'wzCount', //修改localStorage的key，默认用仓库唯一标识做为key
		paths:['count'] //存储的是哪些数据，默认存储整个state数据
	} */
})