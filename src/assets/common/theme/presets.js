// ============================================================
// 主题色预设 — 每个语义色定义 bg（背景色）和 text（{ light, dark } 文字色）
// light-1~9 / dark-2 变体由 applyTheme() 自动从 bg 生成
// ============================================================

const W = '#f0f0f0', D = '#303133', WD = '#ffffff'
// W  = 浅色模式浅色字（微软白）
// D  = 浅色模式深色字（暗灰）
// WD = 深色模式浅色字（纯白，高对比）

export const themePresets = {
  default: {
    label: '默认蓝',
    colors: {
      primary: { bg: '#409EFF', text: { light: W, dark: WD } },
      success: { bg: '#67C23A', text: { light: W, dark: WD } },
      warning: { bg: '#E6A23C', text: { light: W, dark: WD } },
      danger:  { bg: '#F56C6C', text: { light: W, dark: WD } },
      info:    { bg: '#909399', text: { light: W, dark: WD } },
    },
  },
  orange: {
    label: '活力橙',
    colors: {
      primary: { bg: '#E67E22', text: { light: W, dark: WD } },
      success: { bg: '#27AE60', text: { light: W, dark: WD } },
      warning: { bg: '#F39C12', text: { light: W, dark: WD } },
      danger:  { bg: '#E74C3C', text: { light: W, dark: WD } },
      info:    { bg: '#7F8C8D', text: { light: W, dark: WD } },
    },
  },
  pink: {
    label: '柔粉',
    colors: {
      primary: { bg: '#E91E63', text: { light: W, dark: WD } },
      success: { bg: '#4CAF50', text: { light: W, dark: WD } },
      warning: { bg: '#FF9800', text: { light: W, dark: WD } },
      danger:  { bg: '#F44336', text: { light: W, dark: WD } },
      info:    { bg: '#607D8B', text: { light: W, dark: WD } },
    },
  },
  green: {
    label: '翠绿',
    colors: {
      primary: { bg: '#2ECC71', text: { light: D, dark: D } },
      success: { bg: '#1ABC9C', text: { light: W, dark: WD } },
      warning: { bg: '#F1C40F', text: { light: D, dark: D } },
      danger:  { bg: '#E74C3C', text: { light: W, dark: WD } },
      info:    { bg: '#95A5A6', text: { light: W, dark: WD } },
    },
  },
  purple: {
    label: '紫韵',
    colors: {
      primary: { bg: '#9B59B6', text: { light: W, dark: WD } },
      success: { bg: '#2ECC71', text: { light: D, dark: D } },
      warning: { bg: '#F39C12', text: { light: W, dark: WD } },
      danger:  { bg: '#E74C3C', text: { light: W, dark: WD } },
      info:    { bg: '#7F8C8D', text: { light: W, dark: WD } },
    },
  },

  // ======== UI/UX Pro Max 行业配色 ========

  enterprise: {
    label: '企业蓝',
    colors: {
      primary: { bg: '#2563EB', text: { light: W, dark: WD } },
      success: { bg: '#16A34A', text: { light: W, dark: WD } },
      warning: { bg: '#EA580C', text: { light: W, dark: WD } },
      danger:  { bg: '#DC2626', text: { light: W, dark: WD } },
      info:    { bg: '#64748B', text: { light: W, dark: WD } },
    },
  },

  coral: {
    label: '柔红',
    colors: {
      primary: { bg: '#F05454', text: { light: W, dark: WD } },
      success: { bg: '#10B981', text: { light: W, dark: WD } },
      warning: { bg: '#F59E0B', text: { light: D, dark: D } },
      danger:  { bg: '#DC2626', text: { light: W, dark: WD } },
      info:    { bg: '#64748B', text: { light: W, dark: WD } },
    },
  },

  warm: {
    label: '柠绿',
    colors: {
      primary: { bg: '#CDCD00', text: { light: D, dark: D } },
      success: { bg: '#16A34A', text: { light: W, dark: WD } },
      warning: { bg: '#EA580C', text: { light: W, dark: WD } },
      danger:  { bg: '#DC2626', text: { light: W, dark: WD } },
      info:    { bg: '#64748B', text: { light: W, dark: WD } },
    },
  },

  aqua: {
    label: '海碧',
    colors: {
      primary: { bg: '#2DD4BF', text: { light: D, dark: D } },
      success: { bg: '#059669', text: { light: W, dark: WD } },
      warning: { bg: '#F59E0B', text: { light: D, dark: D } },
      danger:  { bg: '#DC2626', text: { light: W, dark: WD } },
      info:    { bg: '#64748B', text: { light: W, dark: WD } },
    },
  },

  indigo: {
    label: '鸢尾紫',
    colors: {
      primary: { bg: '#6366F1', text: { light: W, dark: WD } },
      success: { bg: '#059669', text: { light: W, dark: WD } },
      warning: { bg: '#F59E0B', text: { light: D, dark: D } },
      danger:  { bg: '#DC2626', text: { light: W, dark: WD } },
      info:    { bg: '#94A3B8', text: { light: D, dark: D } },
    },
  },
}

/** @type {Array<{name: string, label: string}>} */
export const themeList = Object.entries(themePresets).map(([name, preset]) => ({
  name,
  label: preset.label,
}))
