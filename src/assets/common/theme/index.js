// ============================================================
// 主题色引擎 — 从基色自动生成 Element Plus 完整色系并注入 DOM
// ============================================================

import { themePresets } from './presets'

/** hex → RGB {r, g, b} */
function hexToRgb(hex) {
  hex = hex.replace('#', '')
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16),
  }
}

/** RGB → #RRGGBB */
function rgbToHex({ r, g, b }) {
  const toHex = (n) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/** 线性 RGB 混合，ratio=0 → pure c1，ratio=1 → pure c2 */
function mix(c1, c2, ratio) {
  const a = hexToRgb(c1)
  const b = hexToRgb(c2)
  return rgbToHex({
    r: a.r + (b.r - a.r) * ratio,
    g: a.g + (b.g - a.g) * ratio,
    b: a.b + (b.b - a.b) * ratio,
  })
}

/** 为单个语义色设置完整的 11 个 CSS 变量 */
function setColorSeries(root, type, baseColor) {
  root.style.setProperty(`--el-color-${type}`, baseColor)

  for (let i = 1; i <= 9; i++) {
    root.style.setProperty(
      `--el-color-${type}-light-${i}`,
      mix(baseColor, '#FFFFFF', i / 10)
    )
  }

  root.style.setProperty(
    `--el-color-${type}-dark-2`,
    mix(baseColor, '#000000', 0.2)
  )
}

/**
 * 应用主题色
 * @param {string} themeName - 主题名 (default/orange/pink/green/purple)
 * @param {boolean} _isDark - 保留参数，未来可扩展深色模式下的独立色值
 */
export function applyTheme(themeName = 'default', _isDark = false) {
  const preset = themePresets[themeName]
  if (!preset) return

  const root = document.documentElement
  const semanticTypes = ['primary', 'success', 'warning', 'danger', 'info']

  for (const type of semanticTypes) {
    setColorSeries(root, type, preset.colors[type])
  }

  // 侧边栏变量 — 基于 primary 深色变体
  const primary = preset.colors.primary
  root.style.setProperty('--sidebar-bg', mix(primary, '#0a0a0f', 0.88))
  root.style.setProperty('--sidebar-text', '#eee')
  root.style.setProperty('--sidebar-active-text', primary)

  // el-menu 变量 — 让 Element Plus 菜单跟随主题
  root.style.setProperty('--el-menu-bg-color', mix(primary, '#0a0a0f', 0.88))
  root.style.setProperty('--el-menu-text-color', '#eee')
  root.style.setProperty('--el-menu-active-color', primary)
  root.style.setProperty('--el-menu-hover-bg-color', mix(primary, '#0a0a0f', 0.75))
}
