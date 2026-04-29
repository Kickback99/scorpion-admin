import { defineStore } from "pinia"
import { getConfigApi, updateConfigValueApi } from "@/api/config"
import { ElMessage } from "element-plus"
import { useIconStore } from "./icon"

// 🎯 统一配置定义 - 扩展时只需在这里添加一行
const CONFIG_DEFINITIONS = {
  // 顶层配置
  articleTopLimit: { type: 'number', message: '文章置顶数量限制' },
  carouselLimit: { type: 'number', message: '轮播图数量限制' },
  theme: { type: 'radio', message: '前端主题' },
  anchorEnabled: { type: 'switch', message: '锚点显示' },
  loginEnabled: { type: 'switch', message: '前端登录' },
  collapseEnabled: { type: 'switch', message: '菜单折叠' },
  iconEnabled: { type: 'switch', message: '图标搜索增强' },
  
  // 🎯 嵌套配置 - 使用点号路径作为 key
  'comment.commentEnabled': { type: 'switch', message: '评论显示' },
  'comment.childCommentLimit': { type: 'number', message: '子评论默认显示数量' },
  'comment.childPageSize': { type: 'number', message: '子评论分页大小' }
}

// 提示消息映射
const MESSAGE_MAP = {
  switch: {
    true: (fieldName) => `${fieldName}已开启`,
    false: (fieldName) => `${fieldName}已禁用`
  },
  theme: {
    0: '主题已切换为 Github',
    1: '主题已切换为 Vuepress'
  },
  number: {
    default: (fieldName, value) => `${fieldName}已设为 ${value}`
  }
}

export const useConfigStore = defineStore({
  id: 'config',
  
  state: () => ({
    loading: false,
    // 顶层配置
    articleTopLimit: 3,
    carouselLimit: 3,
    theme: 0,
    anchorEnabled: true,
    loginEnabled: true,
    collapseEnabled: false,
    iconEnabled: true,
    // 嵌套配置
    comment: {
      commentEnabled: true,
      childCommentLimit: 3,
      childPageSize: 10
    }
  }),

  actions: {
    /**
     * 加载所有配置
     */
    async loadConfig() {
      this.loading = true
      try {
        const res = await getConfigApi()
        if (res.code === 200 && res.data) {
          Object.assign(this.$state, res.data)
          this.executeInit()
        }
      } catch (error) {
        console.error('加载配置失败:', error)
        ElMessage.error('加载配置失败')
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新单个配置项
     * @param {string} key 配置key（如 'comment.commentEnabled'）
     * @param {any} value 新值
     */
    async updateConfig(key, value) {
      const def = CONFIG_DEFINITIONS[key]
      if (!def) {
        console.error(`未找到配置项: ${key}`)
        return
      }

      try {
        const res = await updateConfigValueApi(key, value)
        if (res.code === 200) {
          // 🎯 直接更新 store 中的值
          if (key.includes('.')) {
            const parts = key.split('.')
            this[parts[0]][parts[1]] = value
          } else {
            this[key] = value
          }
          this.showMessage(def.message, value, def.type, key)
          this.executeInit()
        } else {
          ElMessage.error(res.message || '更新失败')
          await this.loadConfig()
        }
      } catch (error) {
        console.error('更新配置失败:', error)
        ElMessage.error('更新失败')
        await this.loadConfig()
      }
    },

    /**
     * 显示提示消息
     */
    showMessage(fieldName, value, type, key) {
      let message = ''
      
      if (type === 'switch') {
        message = MESSAGE_MAP.switch[value]?.(fieldName) || `${fieldName}已更新`
      } else if (type === 'radio' && key === 'theme') {
        message = MESSAGE_MAP.theme[value] || `${fieldName}已切换`
      } else if (type === 'number') {
        message = MESSAGE_MAP.number.default(fieldName, value)
      } else {
        message = `${fieldName}已更新`
      }
      
      ElMessage.success(message)
    },

    /**
     * 批量更新配置
     */
    async batchUpdateConfig(configData) {
      Object.assign(this.$state, configData)
      this.executeInit()
    },

    /**
     * 执行初始化逻辑
     */
    executeInit() {
      if (this.iconEnabled === true) {
        const iconStore = useIconStore()
        iconStore.resetIconConditions()
      }
    },

    // ========== 便捷方法 ==========
    
    toggleComment() {
      this.updateConfig('comment.commentEnabled', !this.comment.commentEnabled)
    },

    toggleAnchor() {
      this.updateConfig('anchorEnabled', !this.anchorEnabled)
    },

    toggleLogin() {
      this.updateConfig('loginEnabled', !this.loginEnabled)
    },

    setTheme(value) {
      this.updateConfig('theme', value)
    },

    toggleCollapse() {
      this.updateConfig('collapseEnabled', !this.collapseEnabled)
    },

    toggleIconEnabled() {
      this.updateConfig('iconEnabled', !this.iconEnabled)
    },

    setArticleTopLimit(value) {
      this.updateConfig('articleTopLimit', value)
    },

    setCarouselLimit(value) {
      this.updateConfig('carouselLimit', value)
    },

    setChildCommentLimit(value) {
      this.updateConfig('comment.childCommentLimit', value)
    },

    setChildPageSize(value) {
      this.updateConfig('comment.childPageSize', value)
    },

    // ========== Getter 方法 ==========
    
    getIsCollapse() {
      return this.collapseEnabled === true
    },

    getIconEnabled() {
      return this.iconEnabled === true
    },
    
    getChildCommentLimit() {
      return this.comment?.childCommentLimit ?? 3
    },

    getChildPageSize() {
      return this.comment?.childPageSize ?? 10
    },

    getCommentEnabled() {
      return this.comment?.commentEnabled ?? true
    }
  },

  getters: {
    isCommentEnabled: (state) => state.comment?.commentEnabled === true,
    isAnchorEnabled: (state) => state.anchorEnabled === true,
    isLoginEnabled: (state) => state.loginEnabled === true,
    currentTheme: (state) => state.theme === 0 ? 'github' : 'vuepress'
  }
})