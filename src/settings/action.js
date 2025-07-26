
import { defineStore } from "pinia"
export const useActionStore = defineStore({
  id: 'load',
  state: () => ({
    // t_setting：收集图标时关闭搜索筛选
    iconEnabled:true
  }),
  actions: {
    setIconEnabled() {
      this.iconEnabled = !this.iconEnabled
    },
  }
})