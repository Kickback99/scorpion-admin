
import { useIconStore } from "@/store/icon"
import { defineStore } from "pinia"
export const useConfigSetStore = defineStore({
  id: 'config',
  state: () => ({
    // t_setting：收集图标时关闭搜索筛选
    iconEnabled:true,
    // 菜单默认是否折叠
    isCollapse:false,
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