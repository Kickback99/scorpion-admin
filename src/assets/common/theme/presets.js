// ============================================================
// 主题色预设 — 每个语义色定义 bg（背景色）和 text（实心按钮文字色）
// light-1~9 / dark-2 变体由 applyTheme() 自动从 bg 生成
// ============================================================

const W = '#ffffff', D = '#303133'

export const themePresets = {
  default: {
    label: '默认蓝',
    colors: {
      primary: { bg: '#409EFF', text: W },
      success: { bg: '#67C23A', text: W },
      warning: { bg: '#E6A23C', text: W },
      danger:  { bg: '#F56C6C', text: W },
      info:    { bg: '#909399', text: W },
    },
  },
  orange: {
    label: '活力橙',
    colors: {
      primary: { bg: '#E67E22', text: W },
      success: { bg: '#27AE60', text: W },
      warning: { bg: '#F39C12', text: W },
      danger:  { bg: '#E74C3C', text: W },
      info:    { bg: '#7F8C8D', text: W },
    },
  },
  pink: {
    label: '柔粉',
    colors: {
      primary: { bg: '#E91E63', text: W },
      success: { bg: '#4CAF50', text: W },
      warning: { bg: '#FF9800', text: W },
      danger:  { bg: '#F44336', text: W },
      info:    { bg: '#607D8B', text: W },
    },
  },
  green: {
    label: '翠绿',
    colors: {
      primary: { bg: '#2ECC71', text: D },
      success: { bg: '#1ABC9C', text: W },
      warning: { bg: '#F1C40F', text: D },
      danger:  { bg: '#E74C3C', text: W },
      info:    { bg: '#95A5A6', text: W },
    },
  },
  purple: {
    label: '紫韵',
    colors: {
      primary: { bg: '#9B59B6', text: W },
      success: { bg: '#2ECC71', text: D },
      warning: { bg: '#F39C12', text: W },
      danger:  { bg: '#E74C3C', text: W },
      info:    { bg: '#7F8C8D', text: W },
    },
  },

  // ======== UI/UX Pro Max 行业配色 ========

  enterprise: {
    label: '企业蓝',
    colors: {
      primary: { bg: '#2563EB', text: W },
      success: { bg: '#16A34A', text: W },
      warning: { bg: '#EA580C', text: W },
      danger:  { bg: '#DC2626', text: W },
      info:    { bg: '#64748B', text: W },
    },
  },

  cyan: {
    label: '炫光青',
    colors: {
      primary: { bg: '#00FFFF', text: D },
      success: { bg: '#00C853', text: D },
      warning: { bg: '#FF6D00', text: W },
      danger:  { bg: '#D50000', text: W },
      info:    { bg: '#546E7A', text: W },
    },
  },

  sky: {
    label: '天空蓝',
    colors: {
      primary: { bg: '#0EA5E9', text: W },
      success: { bg: '#10B981', text: W },
      warning: { bg: '#F59E0B', text: D },
      danger:  { bg: '#EF4444', text: W },
      info:    { bg: '#64748B', text: W },
    },
  },

  amber: {
    label: '琥珀金',
    colors: {
      primary: { bg: '#A16207', text: W },
      success: { bg: '#16A34A', text: W },
      warning: { bg: '#F59E0B', text: D },
      danger:  { bg: '#DC2626', text: W },
      info:    { bg: '#78716C', text: W },
    },
  },

  indigo: {
    label: '鸢尾紫',
    colors: {
      primary: { bg: '#6366F1', text: W },
      success: { bg: '#059669', text: W },
      warning: { bg: '#F59E0B', text: D },
      danger:  { bg: '#DC2626', text: W },
      info:    { bg: '#94A3B8', text: D },
    },
  },
}

/** @type {Array<{name: string, label: string}>} */
export const themeList = Object.entries(themePresets).map(([name, preset]) => ({
  name,
  label: preset.label,
}))
