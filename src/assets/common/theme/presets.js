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
}

/** @type {Array<{name: string, label: string}>} */
export const themeList = Object.entries(themePresets).map(([name, preset]) => ({
  name,
  label: preset.label,
}))
