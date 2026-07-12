// ============================================================
// 主题色引擎 — 从基色自动生成 Element Plus 完整色系并注入 DOM
// 同时注入按钮样式全局 CSS（plain / circle / depth）
// ============================================================

import { themePresets } from './presets'
import { useIconStore } from '@/store/icon'

/** hex → RGB */
function hexToRgb(hex) {
  hex = hex.replace('#', '')
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16),
  }
}

/** RGB → #RRGGBB */
function rgbToHex({ r, g, b }) {
  const toHex = (n) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0')
  return '#' + toHex(r) + toHex(g) + toHex(b)
}

/** 线性混合 */
function mix(c1, c2, ratio) {
  const a = hexToRgb(c1), b = hexToRgb(c2)
  return rgbToHex({ r: a.r + (b.r - a.r) * ratio, g: a.g + (b.g - a.g) * ratio, b: a.b + (b.b - a.b) * ratio })
}

/** WCAG 相对亮度 — 动态计算模式用 */
function luminance(hex) {
  var rgb = hexToRgb(hex)
  var f = function (c) { c = c / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4) }
  return 0.2126 * f(rgb.r) + 0.7152 * f(rgb.g) + 0.0722 * f(rgb.b)
}

// ============================================================
// 动态注入的 style 元素
// ============================================================
let _plainCssEl = null

function ensureEl(id) {
  let el = document.getElementById(id)
  if (!el) { el = document.createElement('style'); el.id = id; document.head.appendChild(el) }
  return el
}

function clearEl(id) {
  let el = document.getElementById(id)
  if (el) el.textContent = ''
}

// ============================================================
// applyTheme — 核心入口
// ============================================================

/**
 * @param {string} themeName
 * @param {boolean} _isDark
 */
export function applyTheme(themeName, _isDark) {
  themeName = themeName || 'default'
  const preset = themePresets[themeName]
  if (!preset) return

  const iconStore = useIconStore()
  const btnStyle = iconStore.buttonStyle || 'full'
  const btnDepth = iconStore.buttonDepth != null ? iconStore.buttonDepth : (btnStyle === 'full' ? 0 : 35)

  const root = document.documentElement
  const types = ['primary', 'success', 'warning', 'danger', 'info']

  // light-1~9 / dark-2 永远完整色阶
  for (const t of types) {
    var c = preset.colors[t]
    setColorSeries(root, t, c.bg)
    if (btnStyle === 'full') {
      // 实心：depth → 背景混白；文字 → preset or 动态计算
      root.style.setProperty('--el-color-' + t + '-solid-bg', mix(c.bg, '#FFFFFF', btnDepth / 100))
      var textColor = c.text
      if (iconStore.textColorMode === 'dynamic') {
        textColor = luminance(c.bg) > 0.4 ? '#303133' : '#ffffff'
      }
      root.style.setProperty('--el-color-' + t + '-text', textColor)
    } else {
      // 描边：depth → 文字混黑
      root.style.setProperty('--el-color-' + t + '-plain', mix(c.bg, '#000000', btnDepth / 100))
    }
  }

  // 侧边栏
  const primary = preset.colors.primary.bg
  root.style.setProperty('--sidebar-bg', mix(primary, '#0a0a0f', 0.88))
  root.style.setProperty('--sidebar-text', '#eee')
  root.style.setProperty('--sidebar-active-text', primary)

  // el-menu
  root.style.setProperty('--el-menu-bg-color', mix(primary, '#0a0a0f', 0.88))
  root.style.setProperty('--el-menu-text-color', '#eee')
  root.style.setProperty('--el-menu-active-color', primary)
  root.style.setProperty('--el-menu-hover-bg-color', mix(primary, '#0a0a0f', 0.75))

  // 按钮样式全局 CSS — 互斥：激活一个就清空另一个
  const hoverLevel = (btnStyle === 'full' ? iconStore.buttonHoverFull : iconStore.buttonHoverPlain) || 3
  if (btnStyle === 'full') {
    clearEl('theme-plain-fix')
    injectSolidCss(types)
  } else {
    clearEl('theme-solid-fix')
    injectPlainCss(types)
  }
  injectHoverCss(types, hoverLevel)
}

// ============================================================
// 颜色系列 + depth
// ============================================================
function setColorSeries(root, type, base) {
  root.style.setProperty('--el-color-' + type, base)
  for (var i = 1; i <= 9; i++) {
    root.style.setProperty('--el-color-' + type + '-light-' + i, mix(base, '#FFFFFF', i / 10))
  }
  root.style.setProperty('--el-color-' + type + '-dark-2', mix(base, '#000000', 0.2))
}

// ============================================================
// plain 按钮文字色注入
// ============================================================
function injectPlainCss(types) {
  _plainCssEl = ensureEl('theme-plain-fix')
  var css = ''
  for (var i = 0; i < types.length; i++) {
    var t = types[i]
    css += '.el-button--' + t + '.is-plain{' +
      'color:var(--el-color-' + t + '-plain);' +
      '--el-button-text-color:var(--el-color-' + t + '-plain);' +
      '--el-button-border-color:var(--el-color-' + t + '-plain);' +
      '--el-button-hover-text-color:var(--el-color-white);' +
      '--el-button-hover-bg-color:var(--el-color-' + t + ');' +
      '--el-button-hover-border-color:var(--el-color-' + t + ');' +
      '--el-button-active-color:var(--el-color-' + t + '-plain);' +
      '}'
  }
  _plainCssEl.textContent = css
}

// ============================================================
// 实心按钮 — 强制覆盖含 is-plain 的所有按钮，背景填充，文字固定
// ============================================================
var _solidCssEl = null
function injectSolidCss(types) {
  _solidCssEl = ensureEl('theme-solid-fix')
  var css = ''
  for (var i = 0; i < types.length; i++) {
    var t = types[i]
    // 默认态：背景 + 文字；hover / active 由 injectHoverCss 控制
    css += 'html .el-button--' + t + '{' +
      'color:var(--el-color-' + t + '-text)!important;' +
      '--el-button-text-color:var(--el-color-' + t + '-text)!important;' +
      '--el-button-bg-color:var(--el-color-' + t + '-solid-bg)!important;' +
      '--el-button-border-color:var(--el-color-' + t + '-solid-bg)!important;' +
      '}'
  }
  _solidCssEl.textContent = css
}

// ============================================================
// hover 强度注入 — 控制 el-button hover 时背景色明亮度
// ============================================================
var _hoverCssEl = null
function injectHoverCss(types, level) {
  _hoverCssEl = ensureEl('theme-hover-fix')
  var css = ''
  for (var i = 0; i < types.length; i++) {
    var t = types[i]
    css += '.el-button--' + t + ':not(.is-plain){' +
      '--el-button-hover-bg-color:var(--el-color-' + t + '-light-' + level + ');' +
      '--el-button-hover-border-color:var(--el-color-' + t + '-light-' + level + ');' +
      '}' +
      '.el-button--' + t + '.is-plain{' +
      '--el-button-hover-bg-color:var(--el-color-' + t + '-light-' + level + ');' +
      '--el-button-hover-border-color:var(--el-color-' + t + '-light-' + level + ');' +
      '}'
  }
  _hoverCssEl.textContent = css
}
