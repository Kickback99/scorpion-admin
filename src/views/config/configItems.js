/**
 * 配置项数据定义 — 所有配置界面变体的唯一数据源
 *
 * 扩展方式：在对应 groups 的 items 数组中增删条目即可，
 * 所有变体组件（分栏/折叠面板/折叠行内列表）自动同步。
 */
import { useConfigStore } from '@/store/config'
import {
  Monitor, Lock, Key, Link, ChatDotSquare, ChatLineSquare, Brush,
  Aim, Star, ChatDotRound, List, Document, Postcard, Comment, Collection,
  View, CollectionTag, ChatSquare, Tickets, Bell, Search,
  Top, PictureFilled, DeleteFilled, FolderDelete, Fold, Moon, Grid
} from '@element-plus/icons-vue'

/**
 * @returns {{ groups: import('./configItems').ConfigGroup[], getMin: (key: string) => number, getMax: (key: string) => number }}
 */
export function useConfigItems() {
  const config = useConfigStore()

  const getMin = (key) => {
    const limit = config.getLimitMin(key)
    return limit !== undefined ? limit : -Infinity
  }
  const getMax = (key) => {
    const limit = config.getLimitMax(key)
    return limit !== undefined ? limit : Infinity
  }

  const groups = [
    {
      key: 'client', label: '前台', icon: Monitor,
      items: [
        { type: 'switch', key: 'login',           label: '前端登录',       desc: '控制前台登录功能的开启与关闭',         icon: Lock,           get: () => config.getUserLoginEnabled(),         set: (v) => config.updateConfig('user.login_enabled', v) },
        { type: 'switch', key: 'other_login',      label: '其他登录',       desc: '允许第三方登录方式',                    icon: Key,            get: () => config.getUserOtherLoginEnabled(),     set: (v) => config.updateConfig('user.other_login_enabled', v) },
        { type: 'switch', key: 'friend_link',      label: '前端友链',       desc: '控制前台友链模块的显示',                icon: Link,           get: () => config.getFriendLinkEnabled(),         set: (v) => config.updateConfig('nav.friend_link_enabled', v) },
        { type: 'switch', key: 'article_comment',  label: '文章评论',       desc: '开启后文章详情页显示评论区',            icon: ChatDotSquare,  get: () => config.getArticleCommentEnabled(),     set: (v) => config.updateConfig('comment.article_comment_enabled', v) },
        { type: 'switch', key: 'fl_comment',       label: '友链评论',       desc: '开启后友链页显示评论区',                icon: ChatLineSquare, get: () => config.getFriendLinkCommentEnabled(),  set: (v) => config.updateConfig('comment.friend_link_comment_enabled', v) },
        { type: 'radio',  key: 'theme',            label: '文章主题',       desc: '文章详情页的代码高亮主题风格',          icon: Brush,          get: () => config.getArticleTheme(),              set: (v) => config.updateConfig('article_detail.theme', v),             options: [{ value: 0, label: 'github' }, { value: 1, label: 'vuepress' }] },
        { type: 'switch', key: 'anchor',           label: '文章锚点',       desc: '自动生成文章标题导航锚点',              icon: Aim,            get: () => config.getAnchorEnabled(),             set: (v) => config.updateConfig('article_detail.anchor_enabled', v) },
        { type: 'switch', key: 'favorite_count',   label: '文章收藏数',     desc: '文章列表显示收藏数量',                  icon: Star,           get: () => config.getFavoriteCountEnabled(),       set: (v) => config.updateConfig('article_detail.favorite_count_enabled', v) },
        { type: 'number', key: 'child_comment_limit', label: '子评论默认显示数量', desc: '超过此数量显示「查看更多」按钮',       icon: ChatDotRound,   get: () => config.getChildCommentLimit(),          set: (v) => config.updateConfig('comment.child_comment_limit', v),       min: () => getMin('comment.child_comment_limit'), max: () => getMax('comment.child_comment_limit') },
        { type: 'number', key: 'child_page_size',  label: '子评论分页大小', desc: '点击查看更多时每次加载的数量',          icon: List,           get: () => config.getChildPageSize(),              set: (v) => config.updateConfig('comment.child_page_size', v),           min: () => getMin('comment.child_page_size'),     max: () => getMax('comment.child_page_size') },
        { type: 'number', key: 'parent_page_size', label: '父评论分页大小', desc: '每次滚动加载父评论的分页大小',          icon: Document,       get: () => config.getParentPageSize(),             set: (v) => config.updateConfig('comment.parent_page_size', v),          min: () => getMin('comment.parent_page_size'),    max: () => getMax('comment.parent_page_size') },
        { type: 'switch', key: 'my_publishes',     label: '我的发布',       desc: '个人中心显示发布内容入口',              icon: Postcard,       get: () => config.getMyPublishesEnabled(),         set: (v) => config.updateConfig('profile.my_publishes_enabled', v) },
        { type: 'switch', key: 'my_comments',      label: '我的评论',       desc: '个人中心显示评论入口',                  icon: Comment,        get: () => config.getMyCommentsEnabled(),          set: (v) => config.updateConfig('profile.my_comments_enabled', v) },
        { type: 'switch', key: 'my_favorites',     label: '我的收藏',       desc: '个人中心显示收藏入口',                  icon: Collection,     get: () => config.getMyFavoritesEnabled(),         set: (v) => config.updateConfig('profile.my_favorites_enabled', v) },
        { type: 'switch', key: 'list_view',        label: '列表浏览',       desc: '文章列表支持浏览模式切换',              icon: View,           get: () => config.getListViewEnabled(),            set: (v) => config.updateConfig('article_list.view_enabled', v) },
        { type: 'switch', key: 'list_favorite',    label: '列表收藏',       desc: '文章列表显示收藏按钮',                  icon: CollectionTag,  get: () => config.getListFavoriteEnabled(),        set: (v) => config.updateConfig('article_list.favorite_enabled', v) },
        { type: 'switch', key: 'list_comment',     label: '列表评论',       desc: '文章列表显示评论数',                    icon: ChatSquare,     get: () => config.getListCommentEnabled(),         set: (v) => config.updateConfig('article_list.comment_enabled', v) },
        { type: 'radio',  key: 'load_mode',        label: '文章加载方式',   desc: '列表页文章的加载方式',                  icon: Tickets,        get: () => config.getListLoadMode(),              set: (v) => config.updateConfig('article_list.load_mode', v),           options: [{ value: 'scroll', label: '滚动加载' }, { value: 'pagination', label: '分页加载' }] },
        { type: 'number', key: 'scroll_page_size', label: '滚动分页大小',   desc: '滚动模式下每次加载的文章数量',          icon: List,           get: () => config.getListScrollPageSize(),         set: (v) => config.updateConfig('article_list.scroll_page_size', v),     min: () => getMin('article_list.scroll_page_size'), max: () => getMax('article_list.scroll_page_size') },
        { type: 'number', key: 'pagination_page_size', label: '分页大小',   desc: '分页模式下每页文章数量',                icon: List,           get: () => config.getListPaginationPageSize(),     set: (v) => config.updateConfig('article_list.pagination_page_size', v), min: () => getMin('article_list.pagination_page_size'), max: () => getMax('article_list.pagination_page_size') },
      ]
    },
    {
      key: 'dashboard', label: '后台', icon: Monitor,
      items: [
        { type: 'radio',  key: 'config_view_mode',      label: '配置界面样式',   desc: '切换配置列表的展示布局',                icon: Grid,           get: () => config.getConfigViewMode(),            set: (v) => config.setConfigViewMode(v),                                options: [{ value: 'sidebar', label: '分栏面板' }, { value: 'card', label: '折叠面板' }, { value: 'table', label: '折叠行内列表' }] },
        { type: 'switch', key: 'notification_comment', label: '评论通知',       desc: '后台收到新评论时弹出通知提醒',           icon: Bell,           get: () => config.getNotificationCommentEnabled(), set: (v) => config.updateConfig('notification.comment_enabled', v) },
        { type: 'switch', key: 'icon',                  label: '图标搜索增强',   desc: '增强图标选择器的搜索功能',              icon: Search,         get: () => config.getIconEnabled(),                set: (v) => config.updateConfig('icon_enabled', v) },
        { type: 'number', key: 'top_limit',             label: '文章置顶数量限制', desc: '允许同时置顶的最大文章数',             icon: Top,            get: () => config.getArticleTopLimit(),            set: (v) => config.updateConfig('article_top_limit', v),                  min: () => getMin('article_top_limit'), max: () => getMax('article_top_limit') },
        { type: 'number', key: 'carousel_limit',        label: '轮播图数量限制', desc: '允许上传的最大轮播图数量',              icon: PictureFilled,  get: () => config.getCarouselLimit(),              set: (v) => config.updateConfig('carousel_limit', v),                     min: () => getMin('carousel_limit'), max: () => getMax('carousel_limit') },
        { type: 'number', key: 'oss_data_days',         label: 'OSS 数据保留天数', desc: '业务表逻辑删除数据的保留天数',         icon: DeleteFilled,   get: () => config.getOssDataRetentionDays(),       set: (v) => config.updateConfig('oss.data_retention_days', v),             min: () => getMin('oss.data_retention_days'), max: () => getMax('oss.data_retention_days') },
        { type: 'number', key: 'oss_file_days',         label: 'OSS 文件保留天数', desc: 'OSS 文件删除后的保留天数',             icon: FolderDelete,   get: () => config.getOssFileRetentionDays(),       set: (v) => config.updateConfig('oss.file_retention_days', v),             min: () => getMin('oss.file_retention_days'), max: () => getMax('oss.file_retention_days') },
      ]
    },
    {
      key: 'user', label: '用户配置', icon: Collection,
      items: [
        { type: 'switch', key: 'collapse_menu', label: '菜单折叠', desc: '侧边栏菜单默认折叠状态', icon: Fold, get: () => config.getUserCollapseEnabled(), set: (v) => config.updateConfig('user_config.collapse_enabled', v) },
        { type: 'switch', key: 'dark_theme',    label: '深色主题', desc: '切换暗色/亮色显示模式',   icon: Moon, get: () => config.getUserDarkEnabled(),     set: (v) => config.updateConfig('user_config.dark_enabled', v) },
      ]
    },
  ]

  return { groups, getMin, getMax }
}
