// stores/userConfig.js
import { defineStore } from "pinia";
import { getUserConfigApi, updateUserConfigValueApi } from "@/api/userConfig";
import { useUserStore } from "./user";

export const useUserConfigStore = defineStore({
  id: 'userConfig',
  
  state: () => ({
    // 用户配置数据
    collapse_enabled: false,
    dark_enabled: false,
    // 以后新增配置项在这里添加 ↓
    // theme: 'light',
    // language: 'zh-CN',
    
    // 缓存控制标志
    hasLoadedConfig: false,
  }),
  
  actions: {
    /**
     * 获取用户配置
     * @param {boolean} forceRefresh - 是否强制刷新（默认false）
     */
    async fetchUserConfig(forceRefresh = false) {
      const userStore = useUserStore();
      const userId = userStore.userInfo?.id;
      
      if (!userId) {
        console.warn('【userConfig】用户未登录，无法获取配置');
        return null;
      }
      
      // 如果已有配置且不强制刷新，直接返回缓存
      if (this.hasLoadedConfig && !forceRefresh) {
        // scorpioncode('【userConfig】使用缓存配置');
        return this.getUserConfig();
      }
      
      try {
        // scorpioncode('【userConfig】请求后端获取配置');
        const res = await getUserConfigApi(userId);
        
        if (res.code === 200 && res.data) {
          // 批量覆盖 state
          Object.assign(this.$state, res.data);
          this.hasLoadedConfig = true;
          
          // scorpioncode('【userConfig】配置加载完成', this.getUserConfig());
          return this.getUserConfig();
        }
        
        return null;
      } catch (error) {
        console.error('【userConfig】加载配置失败', error);
        return null;
      }
    },
    
    /**
     * 获取当前用户配置对象
     */
    getUserConfig() {
      const { hasLoadedConfig, ...config } = this.$state;
      return config;
    },
    
    /**
     * 更新单个配置项
     * @param {string} key - 配置键
     * @param {any} value - 新值
     */
    async updateConfig(key, value) {
      const userStore = useUserStore();
      const userId = userStore.userInfo?.id;

      // scorpioncode(`==================== value的值为：${value} ====================`)
      // scorpioncode(`==================== userStore.userInfo?.id的值为：${userStore.userInfo?.id} ====================`)
      
      if (!userId) return false;
      
      try {
        const res = await updateUserConfigValueApi(userId, key, value);
        
        if (res.code === 200) {
          // 直接更新 state 中的对应字段
          this[key] = value;
          
          // scorpioncode(`【userConfig】${key} 更新为 ${value}`);
          return true;
        }
        
        return false;
      } catch (error) {
        console.error(`【userConfig】更新 ${key} 失败`, error);
        return false;
      }
    },
    
    /**
     * 切换菜单折叠
     */
    async toggleCollapse() {
      return this.updateConfig('collapse_enabled', !this.collapse_enabled);
    },
    
    /**
     * 切换深色模式
     */
    async toggleDark() {
      return this.updateConfig('dark_enabled', !this.dark_enabled);
    },

    /**
     * 获取菜单折叠状态
     */
    getCollapseEnabled() {
      return this.collapse_enabled ?? true;
    },
    
    /**
     * 获取深色模式状态
     */
    getDarkEnabled() {
      return this.dark_enabled ?? true;
    },
    
    /**
     * 清除用户配置缓存（登出时调用）
     */
    clearUserConfig() {
      // 重置为默认值
      this.$reset()
      // scorpioncode('【userConfig】配置缓存已清除');
    },
  },
  
  getters: {
    isCollapseEnabled: (state) => state.collapse_enabled,
    isDarkEnabled: (state) => state.dark_enabled,
    hasConfig: (state) => state.hasLoadedConfig,
    allConfig: (state) => {
      const { hasLoadedConfig, ...config } = state;
      return config;
    }
  }
});