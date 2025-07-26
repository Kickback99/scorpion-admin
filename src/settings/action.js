
import { useIconStore } from "@/store/icon"
import { defineStore } from "pinia"
export const useActionStore = defineStore({
  id: 'action',
  state: () => ({
    // t_setting：收集图标时关闭搜索筛选
    iconEnabled:true
  }),
  actions: {
    executeInit(){
      if(!this.iconEnabled){
        const iconsStore = useIconStore()
        iconsStore.resetIconConditions()
      }
    },
    setIconEnabled() {
      this.iconEnabled = !this.iconEnabled
      this.executeInit()
    },
  }
})