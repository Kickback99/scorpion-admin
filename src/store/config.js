import { defineStore } from "pinia"
import { getConfigApi, updateConfigValueApi } from "@/api/config"
import { ElMessage } from "element-plus"
import { useIconStore } from "./icon"

// 字段映射配置
const FIELD_MAP = {
  // 前端驼峰命名 -> 后端下划线命名
  articleTopLimit: { backend: 'article_top_limit', type: 'number', message: '文章置顶数量限制' },
  commentEnabled: { backend: 'comment_enabled', type: 'switch', message: '评论显示' },
  anchorEnabled: { backend: 'anchor_enabled', type: 'switch', message: '锚点显示' },
  theme: { backend: 'theme', type: 'radio', message: '前端主题' },
  loginDisabled: { backend: 'login_disabled', type: 'switch', message: '前端登录' },
  carouselLimit: { backend: 'carousel_limit', type: 'number', message: '轮播图数量限制' },
  isCollapse: { backend: 'is_collapse', type: 'switch', message: '菜单折叠' },
  iconEnabled: { backend: 'icon_enabled', type: 'switch', message: '图标搜索增强' }
}

// 提示消息映射
const MESSAGE_MAP = {
  // Switch 类型 (value: 0=开启, 1=禁用)
  switch: {
    0: (fieldName) => `${fieldName}已开启`,
    1: (fieldName) => `${fieldName}已禁用`
  },
  // 主题类型
  theme: {
    0: '主题已切换为 Github',
    1: '主题已切换为 Vuepress'
  },
  // 数字类型
  number: {
    '-1': (fieldName) => `${fieldName}已设为无限制`,
    default: (fieldName, value) => `${fieldName}已设为 ${value}`
  }
}

export const useConfigStore = defineStore({
  id: 'config',
  state: () => ({
    // 文章置顶数量限制
    articleTopLimit: 3,
    // 评论显示（0开启，1禁用）
    commentEnabled: 0,
    // 锚点显示（0开启，1禁用）
    anchorEnabled: 0,
    // 前端主题（0：github主题，1：vuepress主题）
    theme: 0,
    // 前端登录（0开启，1禁用）
    loginDisabled: 0,
    // 轮播图数量限制
    carouselLimit: 3,
    // 菜单是否折叠（0折叠，1不折叠）
    isCollapse: 1,
    // 图标搜索增强（0开启增强搜索，1关闭）
    iconEnabled: 0,
    // 加载状态
    loading: false
  }),

  actions: {
    /**
     * 加载所有配置
     */
    async loadConfig() {
      this.loading = true
      try {
        const res = await getConfigApi()
          Object.assign(this.$state, res.data)
          this.executeInit()
      } catch (error) {
        console.error('加载配置失败:', error)
        ElMessage.error('加载配置失败')
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新单个配置项（简化版）
     * @param {string} key 配置key（前端驼峰命名）
     * @param {any} value 新值
     */
    async updateConfig(key, value) {
      const fieldConfig = FIELD_MAP[key]
      if (!fieldConfig) {
        console.error(`未找到配置项: ${key}`)
        return
      }

      try {
        const res = await updateConfigValueApi(fieldConfig.backend, value)
        if (res.code === 200) {
          // 更新 store 中的值
          this[key] = value
          // 显示提示消息
          this.showMessage(key, value, fieldConfig)
          // 更新后执行初始化
          this.executeInit()
        } else {
          ElMessage.error(res.message || '更新失败')
          await this.loadConfig() // 回滚
        }
      } catch (error) {
        console.error('更新配置失败:', error)
        ElMessage.error('更新失败')
        await this.loadConfig() // 回滚
      }
    },

    /**
     * 显示提示消息
     */
    showMessage(key, value, fieldConfig) {
      const fieldName = fieldConfig.message
      const type = fieldConfig.type
      
      let message = ''
      
      if (type === 'switch') {
        message = MESSAGE_MAP.switch[value]?.(fieldName) || `${fieldName}已更新`
      } else if (type === 'radio' && key === 'theme') {
        message = MESSAGE_MAP.theme[value] || `${fieldName}已切换`
      } else if (type === 'number') {
        if (value === -1) {
          message = MESSAGE_MAP.number['-1'](fieldName)
        } else {
          message = MESSAGE_MAP.number.default(fieldName, value)
        }
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
      // 图标搜索增强：当 iconEnabled = 0 时开启增强搜索
      if (this.iconEnabled === 0) {
        const iconStore = useIconStore()
        iconStore.resetIconConditions()
      }
    },

    // ========== 便捷方法 ==========
    
    /**
     * 切换评论显示
     */
    toggleComment() {
      const newValue = this.commentEnabled === 0 ? 1 : 0
      this.updateConfig('commentEnabled', newValue)
    },

    /**
     * 切换锚点显示
     */
    toggleAnchor() {
      const newValue = this.anchorEnabled === 0 ? 1 : 0
      this.updateConfig('anchorEnabled', newValue)
    },

    /**
     * 切换前端登录
     */
    toggleLogin() {
      const newValue = this.loginDisabled === 0 ? 1 : 0
      this.updateConfig('loginDisabled', newValue)
    },

    /**
     * 切换主题
     */
    setTheme(value) {
      this.updateConfig('theme', value)
    },

    /**
     * 切换菜单折叠
     */
    toggleCollapse() {
      const newValue = this.isCollapse === 1 ? 0 : 1
      this.updateConfig('isCollapse', newValue)
    },

    /**
     * 切换图标搜索增强
     */
    toggleIconEnabled() {
      const newValue = this.iconEnabled === 0 ? 1 : 0
      this.updateConfig('iconEnabled', newValue)
    },

    /**
     * 设置文章置顶数量
     */
    setArticleTopLimit(value) {
      this.updateConfig('articleTopLimit', value)
    },

    /**
     * 设置轮播图数量
     */
    setCarouselLimit(value) {
      this.updateConfig('carouselLimit', value)
    },

    // ========== Getter 方法 ==========
    
    getIsCollapse() {
      return this.isCollapse === 1
    },

    getIconEnabled() {
      return this.iconEnabled === 0
    }
  },

  getters: {
    isCommentEnabled: (state) => state.commentEnabled === 0,
    isAnchorEnabled: (state) => state.anchorEnabled === 0,
    isLoginEnabled: (state) => state.loginDisabled === 0,
    currentTheme: (state) => state.theme === 0 ? 'github' : 'vuepress'
  }
})