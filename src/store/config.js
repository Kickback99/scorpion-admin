import { defineStore } from "pinia"
import { getConfigApi, updateConfigValueApi } from "@/api/config"
import { ElMessage } from "element-plus"
import { useIconStore } from "./icon"

// 系统预定义配置项的 key 列表（只有这些才是系统字段，不可删除）
const SYSTEM_CONFIG_KEYS = [
  'article_top_limit',
  'carousel_limit',
  'theme',
  'anchor_enabled',
  'login_enabled',
  'collapse_enabled',
  'icon_enabled',
  'comment.comment_enabled',
  'comment.child_comment_limit',
  'comment.child_page_size'
]

// 统一配置定义 - 扩展时只需在这里添加一行
const CONFIG_DEFINITIONS = {
  // 顶层配置
  article_top_limit: { type: 'number', message: '文章置顶数量限制', min:1, max:99},
  carousel_limit: { type: 'number', message: '轮播图数量限制', min:0, max:99},
  theme: { type: 'radio', message: '前端主题' },
  anchor_enabled: { type: 'switch', message: '锚点显示' },
  login_enabled: { type: 'switch', message: '前端登录' },
  collapse_enabled: { type: 'switch', message: '菜单折叠' },
  icon_enabled: { type: 'switch', message: '图标搜索增强' },
  friend_link_enabled: { type: 'switch', message: '友链显示' },
  
  // 嵌套配置 - 使用点号路径作为 key
  'comment.comment_enabled': { type: 'switch', message: '评论显示' },
  'comment.child_comment_limit': { type: 'number', message: '子评论默认显示数量', min:0, max:20 },
  'comment.child_page_size': { type: 'number', message: '子评论分页大小', min:5, max: 50  }
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
    article_top_limit: 3,
    carousel_limit: 3,
    theme: 0,
    anchor_enabled: true,
    login_enabled: true,
    collapse_enabled: false,
    icon_enabled: true,
    friend_link_enabled: false,
    // 嵌套配置
    comment: {
      comment_enabled: true,
      child_comment_limit: 3,
      child_page_size: 10
    },
    // 存储数字类型的 min/max 限制，结构如：{ "vote": { min: 1, max: 7 } }
    numberLimits: {}
  }),

  actions: {

    /**
     * 判断是否为系统字段（基于 SYSTEM_CONFIG_KEYS 数组）
     */
    isSystemConfig(key) {
      return SYSTEM_CONFIG_KEYS.includes(key)
    },

    /**
     * 获取配置项的定义（从 CONFIG_DEFINITIONS）
     */
    getConfigDefinition(key) {
      return CONFIG_DEFINITIONS[key]
    },

    /**
     * 🦄 初始化数字限制（从 CONFIG_DEFINITIONS 加载）
     */
    initNumberLimits() {
      for (const [key, def] of Object.entries(CONFIG_DEFINITIONS)) {
        if (def.type === 'number' && (def.min !== undefined || def.max !== undefined)) {
          if (!this.numberLimits[key]) {
            this.numberLimits[key] = {}
          }
          if (def.min !== undefined) {
            this.numberLimits[key].min = def.min
          }
          if (def.max !== undefined) {
            this.numberLimits[key].max = def.max
          }
        }
      }
    },

    /**
     * 设置数字配置项的限制范围
     * @param {string} key 配置项路径，如 'vote' 或 'comment.child_comment_limit'
     * @param {number} min 最小值
     * @param {number} max 最大值
     */
    setNumberLimit(key, min, max) {
      if (!this.numberLimits[key]) {
        this.numberLimits[key] = {}
      }
      if (min !== undefined && min !== null) {
        this.numberLimits[key].min = min
      }
      if (max !== undefined && max !== null) {
        this.numberLimits[key].max = max
      }
    },

    /**
     * 获取数字配置项的限制范围
     * @param {string} key 配置项路径
     * @returns {{ min: number|undefined, max: number|undefined }}
     */
    getNumberLimit(key) {
      return this.numberLimits[key] || { min: undefined, max: undefined }
    },

    /**
     * 删除数字配置项的限制范围
     * @param {string} key 配置项路径
     */
    removeNumberLimit(key) {
      delete this.numberLimits[key]
    },

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
          // 直接更新 store 中的值
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
      this.updateConfig('comment.comment_enabled', !this.comment.comment_enabled)
    },

    toggleAnchor() {
      this.updateConfig('anchor_enabled', !this.anchor_enabled)
    },

    toggleLogin() {
      this.updateConfig('login_enabled', !this.login_enabled)
    },

    setTheme(value) {
      this.updateConfig('theme', value)
    },

    toggleCollapse() {
      this.updateConfig('collapse_enabled', !this.collapse_enabled)
    },

    toggleIconEnabled() {
      this.updateConfig('icon_enabled', !this.icon_enabled)
    },

    toggleFriendLinkEnabled() {
      this.updateConfig('friend_link_enabled', !this.friend_link_enabled)
    },

    setArticleTopLimit(value) {
      this.updateConfig('article_top_limit', value)
    },

    setCarouselLimit(value) {
      this.updateConfig('carousel_limit', value)
    },

    setChildCommentLimit(value) {
      this.updateConfig('comment.child_comment_limit', value)
    },

    setChildPageSize(value) {
      this.updateConfig('comment.child_page_size', value)
    },

    // ========== Getter 方法 ==========
    
    getIsCollapse() {
      return this.collapse_enabled === true
    },

    getLoginEnabled(){
      return this.login_enabled === true
    },

    getFriendLinkEnabled(){
      return this.friend_link_enabled === true
    },

    getAnchorEnabled(){
      return this.anchor_enabled === true
    },

    getIconEnabled() {
      return this.icon_enabled === true
    },

    getArticleTopLimit(){
      return this.article_top_limit ?? 3
    },

    getCarouselLimit(){
      return this.carousel_limit ?? 3
    },
    
    getChildCommentLimit() {
      return this.comment?.child_comment_limit ?? 3
    },

    getChildPageSize() {
      return this.comment?.child_page_size ?? 7
    },

    getCommentEnabled() {
      return this.comment?.comment_enabled ?? true
    },

    // 获取数字配置项的最小值限制
    getLimitMin(key) {
      return this.numberLimits[key]?.min
    },
    // 获取数字配置项的最大值限制
    getLimitMax(key) {
      return this.numberLimits[key]?.max
    }
  },

  getters: {
    isCommentEnabled: (state) => state.comment?.comment_enabled === true,
    isAnchorEnabled: (state) => state.anchor_enabled === true,
    isLoginEnabled: (state) => state.login_enabled === true,
    currentTheme: (state) => state.theme === 0 ? 'github' : 'vuepress'
  },

  // 配置持久化
  persist: {
    key: 'scorpion-config',
    paths: ['numberLimits']  // 只持久化 numberLimits
  },
})