// ============================================================
// 依赖导入
// ============================================================
import { defineStore } from "pinia"
import { getConfigApi, updateConfigValueApi } from "@/api/config"
import { useIconStore } from "./icon"
import msg from '@/components/msg'

// ============================================================
// 系统预定义配置项 key 列表（不可删除）
// ============================================================
const SYSTEM_CONFIG_KEYS = [
  'article_top_limit',
  'carousel_limit',
  'icon_enabled',
  'comment.article_comment_enabled',
  'comment.child_comment_limit',
  'comment.child_page_size',
  'user.login_enabled',
  'article_detail.theme',
  'article_detail.anchor_enabled'
]

// ============================================================
// 配置定义 — 顶层配置优先，嵌套配置按 state 顺序排列
// ============================================================
const CONFIG_DEFINITIONS = {
  // ===== 顶层配置 =====
  article_top_limit:            { type: 'number', message: '文章置顶数量限制', min:1, max:99 },
  carousel_limit:               { type: 'number', message: '轮播图数量限制', min:0, max:99 },
  icon_enabled:                 { type: 'switch', message: '图标搜索增强' },
  config_view_mode:             { type: 'string', message: '配置界面样式' },
  tag_view_mode:                { type: 'string', message: '标签管理样式' },
  websocket_enabled:            { type: 'switch', message: 'WebSocket 连接' },
  search_menu_focus:            { type: 'switch', message: '搜索菜单聚焦' },
  theme_layout_mode:            { type: 'string', message: '主题色布局' },
  theme_dot_shape:              { type: 'string', message: '色块形状' },
  tree_auth_line_style:         { type: 'string', message: '授权树连接线' },
  tree_cate_line_style:         { type: 'string', message: '分类树连接线' },
  tree_cate_parent_mode:        { type: 'string', message: '分类父节点宽度' },
  tree_cate_parent_width:       { type: 'number', message: '分类父节点自定义px', min:12, max:200 },
  tree_cate_child_mode:         { type: 'string', message: '分类子节点宽度' },
  tree_auth_child_mode:         { type: 'string', message: '授权子节点宽度' },

  // ===== comment 评论相关 =====
  'comment.article_comment_enabled':    { type: 'switch', message: '文章评论显示' },
  'comment.friend_link_comment_enabled':{ type: 'switch', message: '友链评论显示' },
  'comment.child_comment_limit':        { type: 'number', message: '子评论默认显示数量', min:0, max:20 },
  'comment.child_page_size':            { type: 'number', message: '子评论分页大小', min:5, max:50 },
  'comment.parent_page_size':           { type: 'number', message: '父评论分页大小', min:5, max:15 },

  // ===== nav 导航相关 =====
  'nav.friend_link_enabled':            { type: 'switch', message: '前端友链' },

  // ===== user 前台用户认证相关 =====
  'user.login_enabled':                 { type: 'switch', message: '前端登录' },
  'user.other_login_enabled':           { type: 'switch', message: '其他登录' },

  // ===== profile 个人中心相关 =====
  'profile.my_publishes_enabled':       { type:'switch', message: '我的发布' },
  'profile.my_comments_enabled':        { type:'switch', message:'我的评论' },
  'profile.my_favorites_enabled':       { type:'switch', message:'我的收藏' },

  // ===== article_detail 文章详情相关 =====
  'article_detail.theme':               { type: 'radio', message: '文章主题' },
  'article_detail.anchor_enabled':      { type: 'switch', message: '文章锚点' },
  'article_detail.favorite_count_enabled':{ type: 'switch', message: '文章收藏数' },

  // ===== article_list 文章列表相关 =====
  'article_list.view_enabled':          { type: 'switch', message: '文章浏览' },
  'article_list.favorite_enabled':      { type: 'switch', message: '文章收藏' },
  'article_list.comment_enabled':       { type: 'switch', message: '文章评论' },
  'article_list.load_mode':             { type: 'string', message: '文章加载方式' },
  'article_list.scroll_page_size':      { type: 'number', message: '滚动模式分页大小', min:5, max:15 },
  'article_list.pagination_page_size':  { type: 'number', message: '分页模式分页大小', min:5, max:15 },

  // ===== notification 通知配置 =====
  'notification.comment_enabled':       { type:'switch', message: '评论通知' },

  // ===== user_config 用户配置 =====
  'user_config.collapse_enabled':       { type:'switch', message:'菜单折叠' },
  'user_config.dark_enabled':           { type:'switch', message:'深色模式' },

  // ===== oss 配置 =====
  'oss.data_retention_days':            { type: 'number', message: '逻辑删除oss数据保留天数', min:0, max:100 },
  'oss.file_retention_days':            { type: 'number', message: 'oss文件保留天数', min:0, max:100 },

  // ===== logo 配置 =====
  'logo.animation_style':               { type:'string', message:'Logo 动画样式' },
  'logo.hide_image':                    { type:'switch', message:'隐藏 Logo 图片' },
}

// ============================================================
// 提示消息映射 — type/value → 中文消息
// ============================================================
const MESSAGE_MAP = {
  switch: {
    true: (fieldName) => `${fieldName}已开启`,
    false: (fieldName) => `${fieldName}已禁用`
  },
  'article_detail.theme': {
    0: '主题已切换为 Github',
    1: '主题已切换为 Vuepress'
  },
  number: {
    default: (fieldName, value) => `${fieldName}已设为 ${value}`
  },
  string: {
    // ===== 顶层配置 =====
    'config_view_mode': {
      'sidebar': '分栏面板',
      'card': '折叠面板',
      'table': '折叠行内列表'
    },
    'tag_view_mode': {
      'table': '表格',
      'card': '卡片网格',
      'cloud': '标签云'
    },
    'theme_layout_mode': {
      'float': '底部浮动',
      'inline': '行内色点',
      'popover': '全部 Popover'
    },
    'theme_dot_shape': {
      'circle': '圆形',
      'rect': '矩形',
      'square': '方形'
    },
    'tree_auth_line_style': {
      'none': '无',
      'solid': '实线',
      'dashed': '虚线'
    },
    'tree_cate_line_style': {
      'none': '无',
      'solid': '实线',
      'dashed': '虚线'
    },
    'tree_cate_parent_mode': {
      'content': '内容宽',
      'custom': '较大值'
    },
    'tree_cate_child_mode': {
      'content': '内容宽',
      'fill': '占满'
    },
    'tree_auth_child_mode': {
      'content': '内容宽',
      'fill': '占满'
    },

    // ===== 文章列表 =====
    'article_list.load_mode': {
      'scroll': '滚动',
      'pagination': '分页'
    },

    // ===== logo =====
    'logo.animation_style': {
      'none': '无动画',
      'neon': '霓虹灯管',
      'multi-neon': 'SVG 多重描边霓虹',
      'energy-pulse': '能量脉冲',
      'stroke-scan': '镂空扫描描边',
      'glitch': '故障扫描线'
    },
  }
}

export const useConfigStore = defineStore({
  id: 'config',

  // ============================================================
  // 数据
  // ============================================================
  state: () => ({
    loading: false,
    // ===== 顶层配置 =====
    article_top_limit: 3,
    carousel_limit: 3,
    icon_enabled: true,
    config_view_mode: 'card',
    tag_view_mode: 'card',
    websocket_enabled: true,
    search_menu_focus: false,
    theme_layout_mode: 'inline',
    theme_dot_shape: 'circle',
    tree_auth_line_style: 'dashed',
    tree_cate_line_style: 'dashed',
    tree_cate_parent_mode: 'custom',
    tree_cate_parent_width: 75,
    tree_cate_child_mode: 'fill',
    tree_auth_child_mode: 'fill',
    // ===== 嵌套配置 =====
    comment: {
      article_comment_enabled: true,
      friend_link_comment_enabled: false,
      child_comment_limit: 3,
      child_page_size: 10,
      parent_page_size:10
    },
    nav:{
      friend_link_enabled: false,
    },
    user:{
      login_enabled: true,
      other_login_enabled: false
    },
    profile:{
      my_publishes_enabled: false,
      my_comments_enabled: true,
      my_favorites_enabled: true
    },
    article_detail:{
      theme: 0,
      anchor_enabled: true,
      favorite_count_enabled: true
    },
    article_list:{
      view_enabled: true,
      favorite_enabled: true,
      comment_enabled: true,
      load_mode: 'scroll',
      scroll_page_size: 10,
      pagination_page_size: 7
    },
    notification: {
      comment_enabled: true
    },
    user_config:{
      collapse_enabled: false,
      dark_enabled: false
    },
    oss: {
      data_retention_days: 30,
      file_retention_days: 7
    },
    logo: {
      animation_style: 'neon',
      hide_image: false
    },
    // 存储数字类型的 min/max 限制，结构如：{ "vote": { min: 1, max: 7 } }
    numberLimits: {}
  }),

  // ============================================================
  // 渲染
  // ============================================================
  actions: {

    /** 判断是否为系统字段 */
    isSystemConfig(key) {
      return SYSTEM_CONFIG_KEYS.includes(key)
    },

    /** 获取配置项的定义 */
    getConfigDefinition(key) {
      return CONFIG_DEFINITIONS[key]
    },

    /** 初始化数字限制（从 CONFIG_DEFINITIONS 加载） */
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

    /** 设置数字配置项的限制范围 */
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

    /** 获取数字配置项的限制范围 */
    getNumberLimit(key) {
      return this.numberLimits[key] || { min: undefined, max: undefined }
    },

    /** 删除数字配置项的限制范围 */
    removeNumberLimit(key) {
      delete this.numberLimits[key]
    },

    /** 加载所有配置 */
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
        msg.error('加载配置失败')
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
          msg.error(res.message || '更新失败')
          await this.loadConfig()
        }
      } catch (error) {
        console.error('更新配置失败:', error)
        msg.error('更新失败')
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
      } else if (type === 'radio' && MESSAGE_MAP[key]) {
      // 下面这个写法也可以的
      // else if (type === 'radio' && key === 'article_detail.theme') {
        message = MESSAGE_MAP[key][value] || `${fieldName}已切换`
      } else if (type === 'number') {
        message = MESSAGE_MAP.number.default(fieldName, value)
      } else if (type === 'string') {
        const stringMap = MESSAGE_MAP.string?.[key]
        const displayValue = stringMap?.[value] || value
        message = `${fieldName}已切换为 ${displayValue}`
      } else {
        message = `${fieldName}已更新`
      }
      
      msg.primary(message)
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

    // ========== 顶层配置 ==========

    // article_top_limit
    setArticleTopLimit(value) {
      this.updateConfig('article_top_limit', value)
    },

    getArticleTopLimit(){
      return this.article_top_limit ?? 3
    },

    // carousel_limit
    setCarouselLimit(value) {
      this.updateConfig('carousel_limit', value)
    },

    getCarouselLimit(){
      return this.carousel_limit ?? 3
    },

    // icon_enabled
    toggleIconEnabled() {
      this.updateConfig('icon_enabled', !this.icon_enabled)
    },

    getIconEnabled() {
      return this.icon_enabled === true
    },

    // config_view_mode
    getConfigViewMode(){
      return this.config_view_mode || 'card'
    },

    setConfigViewMode(value){
      this.updateConfig('config_view_mode', value)
    },

    // tag_view_mode
    getTagViewMode(){
      return this.tag_view_mode || 'card'
    },

    setTagViewMode(value){
      this.updateConfig('tag_view_mode', value)
    },

    // websocket_enabled
    getWebsocketEnabled(){
      return this.websocket_enabled ?? true
    },

    toggleWebsocketEnabled(){
      this.updateConfig('websocket_enabled', !this.websocket_enabled)
    },

    // search_menu_focus
    getSearchMenuFocus(){
      return this.search_menu_focus === true
    },

    toggleSearchMenuFocus(){
      this.updateConfig('search_menu_focus', !this.search_menu_focus)
    },

    // theme_layout_mode
    getThemeLayoutMode(){
      return this.theme_layout_mode || 'float'
    },

    setThemeLayoutMode(value){
      this.updateConfig('theme_layout_mode', value)
    },

    // theme_dot_shape
    getThemeDotShape(){
      return this.theme_dot_shape || 'circle'
    },

    setThemeDotShape(value){
      this.updateConfig('theme_dot_shape', value)
    },

    // tree_auth_line_style
    getTreeAuthLineStyle(){
      return this.tree_auth_line_style || 'dashed'
    },

    setTreeAuthLineStyle(value){
      this.updateConfig('tree_auth_line_style', value)
    },

    // tree_cate_line_style
    getTreeCateLineStyle(){
      return this.tree_cate_line_style || 'dashed'
    },

    setTreeCateLineStyle(value){
      this.updateConfig('tree_cate_line_style', value)
    },

    // tree_cate_parent_mode
    getTreeCateParentMode(){
      return this.tree_cate_parent_mode || 'custom'
    },

    setTreeCateParentMode(value){
      this.updateConfig('tree_cate_parent_mode', value)
    },

    // tree_cate_parent_width
    getTreeCateParentWidth(){
      return this.tree_cate_parent_width ?? 75
    },

    setTreeCateParentWidth(value){
      this.updateConfig('tree_cate_parent_width', value)
    },

    // tree_cate_child_mode
    getTreeCateChildMode(){
      return this.tree_cate_child_mode || 'fill'
    },

    setTreeCateChildMode(value){
      this.updateConfig('tree_cate_child_mode', value)
    },

    // tree_auth_child_mode
    getTreeAuthChildMode(){
      return this.tree_auth_child_mode || 'fill'
    },

    setTreeAuthChildMode(value){
      this.updateConfig('tree_auth_child_mode', value)
    },

    // ========== comment ==========

    toggleArticleCommentEnabled() {
      this.updateConfig('comment.article_comment_enabled', !this.comment?.article_comment_enabled)
    },

    getArticleCommentEnabled() {
      return this.comment?.article_comment_enabled ?? true
    },

    toggleFriendLinkCommentEnabled() {
      this.updateConfig('comment.friend_link_comment_enabled', !this.comment?.friend_link_comment_enabled)
    },

    getFriendLinkCommentEnabled() {
      return this.comment?.friend_link_comment_enabled ?? true
    },

    setChildCommentLimit(value) {
      this.updateConfig('comment.child_comment_limit', value)
    },

    getChildCommentLimit() {
      return this.comment?.child_comment_limit ?? 3
    },

    setChildPageSize(value) {
      this.updateConfig('comment.child_page_size', value)
    },

    getChildPageSize() {
      return this.comment?.child_page_size ?? 7
    },

    setParentPageSize(value) {
      this.updateConfig('comment.parent_page_size', value)
    },

    getParentPageSize() {
      return this.comment?.parent_page_size ?? 10
    },

    // ========== nav ==========

    toggleFriendLinkEnabled() {
      this.updateConfig('nav.friend_link_enabled', !this.nav?.friend_link_enabled)
    },

    getFriendLinkEnabled(){
      return this.nav?.friend_link_enabled === true
    },

    // ========== user ==========

    toggleUserLoginEnabled() {
      this.updateConfig('user.login_enabled', !this.user?.login_enabled)
    },

    getUserLoginEnabled(){
      return this.user?.login_enabled === true
    },

    toggleUserOtherLoginEnabled() {
      this.updateConfig('user.other_login_enabled', !this.user?.other_login_enabled)
    },

    getUserOtherLoginEnabled(){
      return this.user?.other_login_enabled === true
    },

    // ========== profile ==========

    toggleMyPublishesEnabled(){
      this.updateConfig('profile.my_publishes_enabled',!this.profile.my_publishes_enabled)
    },

    getMyPublishesEnabled() {
      return this.profile?.my_publishes_enabled ?? true
    },

    toggleMyCommentsEnabled(){
      this.updateConfig('profile.my_comments_enabled',!this.profile.my_comments_enabled)
    },

    getMyCommentsEnabled() {
      return this.profile?.my_comments_enabled ?? true
    },

    toggleMyFavoritesEnabled(){
      this.updateConfig('profile.my_favorites_enabled',!this.profile.my_favorites_enabled)
    },

    getMyFavoritesEnabled() {
      return this.profile?.my_favorites_enabled ?? true
    },

    // ========== article_detail ==========

    setArticleTheme(value) {
      this.updateConfig('article_detail.theme', value)
    },

    getArticleTheme(){
      return this.article_detail?.theme
    },

    toggleAnchorEnabled() {
      this.updateConfig('article_detail.anchor_enabled', !this.article_detail?.anchor_enabled)
    },

    getAnchorEnabled(){
      return this.article_detail?.anchor_enabled ?? true
    },

    toggleFavoriteCountEnabled(){
      this.updateConfig('article_detail.favorite_count_enabled', !this.article_detail?.favorite_count_enabled)
    },

    getFavoriteCountEnabled(){
      return this.article_detail?.favorite_count_enabled ?? true
    },

    // ========== article_list ==========

    toggleListViewEnabled(){
      this.updateConfig('article_list.view_enabled', !this.article_list?.view_enabled)
    },

    getListViewEnabled(){
      return this.article_list?.view_enabled ?? true
    },

    toggleListFavoriteEnabled(){
      this.updateConfig('article_list.favorite_enabled', !this.article_list?.favorite_enabled)
    },

    getListFavoriteEnabled(){
      return this.article_list?.favorite_enabled ?? true
    },

    toggleListCommentEnabled(){
      this.updateConfig('article_list.comment_enabled', !this.article_list?.comment_enabled)
    },

    getListCommentEnabled(){
      return this.article_list?.comment_enabled ?? true
    },

    setListLoadMode(value){
      this.updateConfig('article_list.load_mode', value)
    },

    getListLoadMode(){
      return this.article_list?.load_mode
    },

    setListScrollPageSize(value){
      this.updateConfig('article_list.scroll_page_size', value)
    },

    getListScrollPageSize(){
      return this.article_list?.scroll_page_size ?? 10
    },

    setListPaginationPageSize(value){
      this.updateConfig('article_list.pagination_page_size', value)
    },

    getListPaginationPageSize(){
      return this.article_list?.pagination_page_size ?? 7
    },

    // ========== notification ==========

    toggleNotificationCommentEnabled(){
      this.updateConfig('notification.comment_enabled', !this.notification?.comment_enabled)
    },

    getNotificationCommentEnabled(){
      return this.notification?.comment_enabled ?? true
    },

    // ========== user_config ==========

    toggleUserCollapseEnabled(){
      this.updateConfig('user_config.collapse_enabled', !this.user_config?.collapse_enabled)
    },

    getUserCollapseEnabled() {
      return this.user_config?.collapse_enabled ?? true
    },

    toggleUserDarkEnabled(){
      this.updateConfig('user_config.dark_enabled', !this.user_config?.dark_enabled)
    },

    getUserDarkEnabled(){
      return this.user_config?.dark_enabled ?? true
    },

    // ========== oss ==========

    setDataRetentionDays(value){
      this.updateConfig('oss.data_retention_days',value)
    },

    getOssDataRetentionDays(){
      return this.oss?.data_retention_days ?? 30
    },

    setFileRetentionDays(value){
      this.updateConfig('oss.file_retention_days',value)
    },

    getOssFileRetentionDays(){
      return this.oss?.file_retention_days ?? 7
    },

    // ========== logo ==========

    getLogoAnimationStyle(){
      return this.logo?.animation_style || 'neon'
    },

    setLogoAnimationStyle(value){
      this.updateConfig('logo.animation_style', value)
    },

    getLogoHideImage(){
      return this.logo?.hide_image === true
    },

    toggleLogoHideImage(){
      this.updateConfig('logo.hide_image', !this.logo?.hide_image)
    },

    // ========== numberLimits ==========

    getLimitMin(key) {
      return this.numberLimits[key]?.min
    },

    getLimitMax(key) {
      return this.numberLimits[key]?.max
    }
  },

  // ============================================================
  // 计算属性
  // ============================================================
  getters: {
    // ===== 顶层配置 =====
    configViewMode: (state) => state.config_view_mode || 'card',
    tagViewMode: (state) => state.tag_view_mode || 'card',
    isWebsocketEnabled: (state) => state.websocket_enabled === true,
    isSearchMenuFocus: (state) => state.search_menu_focus === true,
    themeLayoutMode: (state) => state.theme_layout_mode || 'float',
    themeDotShape: (state) => state.theme_dot_shape || 'circle',
    treeAuthLineStyle: (state) => state.tree_auth_line_style || 'dashed',
    treeCateLineStyle: (state) => state.tree_cate_line_style || 'dashed',
    treeCateParentMode: (state) => state.tree_cate_parent_mode || 'custom',
    treeCateParentWidth: (state) => state.tree_cate_parent_width ?? 75,
    treeCateChildMode: (state) => state.tree_cate_child_mode || 'fill',
    treeAuthChildMode: (state) => state.tree_auth_child_mode || 'fill',

    // ===== comment =====
    isArticleCommentEnabled: (state) => state.comment?.article_comment_enabled === true,
    isFriendLinkCommentEnabled: (state) => state.comment?.friend_link_comment_enabled === true,

    // ===== user =====
    isUserLoginEnabled: (state) => state.user?.login_enabled === true,
    isUserOtherLoginEnabled: (state) => state.user?.other_login_enabled === true,

    // ===== profile =====
    isMyPublishesEnabled: (state) => state.profile?.my_publishes_enabled ?? true,
    isMyCommentsEnabled: (state) => state.profile?.my_comments_enabled ?? true,
    isMyFavoritesEnabled: (state) => state.profile?.my_favorites_enabled ?? true,

    // ===== article_detail =====
    currentArticleTheme: (state) => state.article_detail?.theme === 0 ? 'github' : 'vuepress',
    isAnchorEnabled: (state) => state.article_detail?.anchor_enabled ?? true,
    isFavoriteCountEnabled: (state) => state.article_detail?.favorite_count_enabled ?? true,

    // ===== article_list =====
    isListViewEnabled: (state) => state.article_list?.view_enabled ?? true,
    isListFavoriteEnabled: (state) => state.article_list?.favorite_enabled ?? true,
    isListCommentEnabled: (state) => state.article_list?.comment_enabled ?? true,

    // ===== notification =====
    isNotificationCommentEnabled:(state) => state.notification?.comment_enabled ?? true,

    // ===== user_config =====
    isUserCollapseEnabled: (state) => state.user_config?.collapse_enabled ?? true,
    isUserDarkEnabled: (state) => state.user_config?.dark_enabled ?? true,

    // ===== logo =====
    logoAnimationStyle: (state) => state.logo?.animation_style || 'neon',
    isLogoImageHidden: (state) => state.logo?.hide_image === true,
  },

  // ============================================================
  // 持久化
  // ============================================================
  persist: {
    key: 'scorpion-config',
    paths: ['numberLimits']  // 只持久化 numberLimits
  },
})