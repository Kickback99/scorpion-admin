// ============================================================
// 主题色预设 — 每个主题定义 5 个语义色基值
// applyTheme() 会自动从基值生成 light-1~9 / dark-2 变体
// ============================================================

export const themePresets = {
  default: {
    label: '默认蓝',
    colors: {
      primary: '#409EFF',
      success: '#67C23A',
      warning: '#E6A23C',
      danger:  '#F56C6C',
      info:    '#909399',
    },
  },
  orange: {
    label: '活力橙',
    colors: {
      primary: '#E67E22',
      success: '#27AE60',
      warning: '#F39C12',
      danger:  '#E74C3C',
      info:    '#7F8C8D',
    },
  },
  pink: {
    label: '柔粉',
    colors: {
      primary: '#E91E63',
      success: '#4CAF50',
      warning: '#FF9800',
      danger:  '#F44336',
      info:    '#607D8B',
    },
  },
  green: {
    label: '翠绿',
    colors: {
      primary: '#2ECC71',
      success: '#1ABC9C',
      warning: '#F1C40F',
      danger:  '#E74C3C',
      info:    '#95A5A6',
    },
  },
  purple: {
    label: '紫韵',
    colors: {
      primary: '#9B59B6',
      success: '#2ECC71',
      warning: '#F39C12',
      danger:  '#E74C3C',
      info:    '#7F8C8D',
    },
  },
}

/** @type {Array<{name: string, label: string}>} */
export const themeList = Object.entries(themePresets).map(([name, preset]) => ({
  name,
  label: preset.label,
}))
