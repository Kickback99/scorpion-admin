import { defineStore } from "pinia"
import { getConfigApi, updateConfigValueApi } from "@/api/config"
import { ElMessage } from "element-plus"
import { useIconStore } from "./icon"

// 字段映射配置（重构后）
const FIELD_MAP = {
  // 前端驼峰命名 -> 后端下划线命名
  articleTopLimit: { backend: 'article_top_limit', type: 'number', message: '文章置顶数量限制' },
  carouselLimit: { backend: 'carousel_limit', type: 'number', message: '轮播图数量限制' },
  theme: { backend: 'theme', type: 'radio', message: '前端主题' },
  commentEnabled: { backend: 'comment_enabled', type: 'switch', message: '评论显示' },
  anchorEnabled: { backend: 'anchor_enabled', type: 'switch', message: '锚点显示' },
  loginEnabled: { backend: 'login_enabled', type: 'switch', message: '前端登录' },
  collapseEnabled: { backend: 'collapse_enabled', type: 'switch', message: '菜单折叠' },
  iconEnabled: { backend: 'icon_enabled', type: 'switch', message: '图标搜索增强' },
  childCommentLimit: { backend: 'child_comment_limit', type: 'number', message: '子评论默认显示数量' },
}

// 提示消息映射（重构后）
const MESSAGE_MAP = {
  // Switch 类型 (true=开启, false=禁用)
  switch: {
    true: (fieldName) => `${fieldName}已开启`,
    false: (fieldName) => `${fieldName}已禁用`
  },
  // 主题类型
  theme: {
    0: '主题已切换为 Github',
    1: '主题已切换为 Vuepress'
  },
  // 数字类型
  number: {
    default: (fieldName, value) => `${fieldName}已设为 ${value}`
  }
}

export const useConfigStore = defineStore({
  id: 'config',
  state: () => ({
    // 文章置顶数量限制
    articleTopLimit: 3,
    // 轮播图数量限制
    carouselLimit: 3,
    // 前端主题（0：github主题，1：vuepress主题）
    theme: 0,
    // 评论显示（true开启，false禁用）
    commentEnabled: true,
    // 锚点显示（true开启，false禁用）
    anchorEnabled: true,
    // 前端登录（true开启，false禁用）
    loginEnabled: true,
    // 菜单是否折叠（true折叠，false不折叠）
    collapseEnabled: false,
    // 图标搜索增强（true开启，false关闭）
    iconEnabled: true,
    // 子评论默认显示数量（超过此数量显示分页）
    childCommentLimit: 3,
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
      // 图标搜索增强：当 iconEnabled = true 时开启增强搜索
      if (this.iconEnabled === true) {
        const iconStore = useIconStore()
        iconStore.resetIconConditions()
      }
    },

    // ========== 便捷方法 ==========
    
    /**
     * 切换评论显示
     */
    toggleComment() {
      this.updateConfig('commentEnabled', !this.commentEnabled)
    },

    /**
     * 切换锚点显示
     */
    toggleAnchor() {
      this.updateConfig('anchorEnabled', !this.anchorEnabled)
    },

    /**
     * 切换前端登录
     */
    toggleLogin() {
      this.updateConfig('loginEnabled', !this.loginEnabled)
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
      this.updateConfig('collapseEnabled', !this.collapseEnabled)
    },

    /**
     * 切换图标搜索增强
     */
    toggleIconEnabled() {
      this.updateConfig('iconEnabled', !this.iconEnabled)
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

    /**
     * 设置子评论默认显示数量
     */
    setChildCommentLimit(value) {
      this.updateConfig('childCommentLimit', value)
    },

    // ========== Getter 方法 ==========
    
    getIsCollapse() {
      return this.collapseEnabled === true
    },

    getIconEnabled() {
      return this.iconEnabled === true
    },
    
    getChildCommentLimit() {
      return this.childCommentLimit
    }
  },

  getters: {
    isCommentEnabled: (state) => state.commentEnabled === true,
    isAnchorEnabled: (state) => state.anchorEnabled === true,
    isLoginEnabled: (state) => state.loginEnabled === true,
    currentTheme: (state) => state.theme === 0 ? 'github' : 'vuepress'
  }
})