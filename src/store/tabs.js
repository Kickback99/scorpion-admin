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
        const existing = this.tabList.find(item => item.path === tab.path)
        if (existing) {
          // 同一路径但 query 参数可能不同，更新 fullPath
          existing.fullPath = tab.fullPath
          return
        }
        this.tabList.push(tab)
    },
    removeTab(path) {
      const idx = this.tabList.findIndex(t => t.path === path)
      if (idx !== -1) this.tabList.splice(idx, 1)
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