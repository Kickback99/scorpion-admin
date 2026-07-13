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
function ensureEl(id) {
  let el = document.getElementById(id)
  if (!el) { el = document.createElement('style'); el.id = id; document.head.appendChild(el) }
  return el
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
  const btnStyle = iconStore.uiMode || 'full'
  const btnDepth = iconStore.uiDepth != null ? iconStore.uiDepth : (btnStyle === 'full' ? 0 : 35)

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
      // plain 背景：depth 越大底色越深（0=纯白, 100=50%白混合）
      root.style.setProperty('--el-color-' + t + '-plain-bg', mix(c.bg, '#FFFFFF', 1 - btnDepth / 200))
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

  // html 类注入 — 供所有组件（tab / button 等）读取 uiMode
  root.classList.remove('ui-full', 'ui-plain')
  root.classList.add(btnStyle === 'plain' ? 'ui-plain' : 'ui-full')

  const hoverLevel = (btnStyle === 'full' ? iconStore.hoverFull : iconStore.hoverPlain) || 3
  injectButtonCss(types)
  injectHoverCss(types, hoverLevel)

  // tab 激活态变量
  root.style.setProperty('--tab-active-bg', 'var(--el-color-primary-solid-bg)')
  root.style.setProperty('--tab-active-hover-bg', 'var(--el-color-primary-light-' + hoverLevel + ')')

  injectRadioCss()
  injectDropdownCss()
  injectInputCss()
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
// 按钮全局样式 — 通过 .ui-full / .ui-plain 跟随 uiMode
// ============================================================
var _buttonCssEl = null
function injectButtonCss(types) {
  _buttonCssEl = ensureEl('theme-button-fix')
  var css = ''
  for (var i = 0; i < types.length; i++) {
    var t = types[i]
    // full — 实心填充
    css += '.ui-full .el-button--' + t + ':not(.is-disabled){' +
      'color:var(--el-color-' + t + '-text)!important;' +
      '--el-button-text-color:var(--el-color-' + t + '-text)!important;' +
      '--el-button-bg-color:var(--el-color-' + t + '-solid-bg)!important;' +
      '--el-button-border-color:var(--el-color-' + t + '-solid-bg)!important;' +
      '}' +
    // plain — 描边
    '.ui-plain .el-button--' + t + ':not(.is-disabled){' +
      'color:var(--el-color-' + t + '-plain);' +
      '--el-button-text-color:var(--el-color-' + t + '-plain);' +
      '--el-button-border-color:var(--el-color-' + t + '-plain);' +
      '--el-button-hover-text-color:var(--el-color-white);' +
      '--el-button-hover-bg-color:var(--el-color-' + t + ');' +
      '--el-button-hover-border-color:var(--el-color-' + t + ');' +
      '--el-button-active-color:var(--el-color-' + t + '-plain);' +
      '}'
  }
  _buttonCssEl.textContent = css
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

// ============================================================
// radio-button 全局样式 — 通过 .ui-full / .ui-plain 跟随 uiMode
// ============================================================
var _radioCssEl = null
function injectRadioCss() {
  _radioCssEl = ensureEl('theme-radio-fix')
  var sel = '.el-radio-button.is-active .el-radio-button__inner,' +
            '.el-radio-button__original-radio:checked+.el-radio-button__inner'
  _radioCssEl.textContent =
    '.ui-full ' + sel + '{' +
    'color:var(--el-color-primary-text)!important;' +
    'background-color:var(--el-color-primary-solid-bg)!important;' +
    'border-color:var(--el-color-primary-solid-bg)!important;' +
    'box-shadow:-1px 0 0 0 var(--el-color-primary-solid-bg)!important;' +
    '}' +
    '.ui-plain ' + sel + '{' +
    'color:var(--el-color-primary-plain)!important;' +
    'background-color:var(--el-color-primary-plain-bg)!important;' +
    'border-color:var(--el-color-primary-plain)!important;' +
    'box-shadow:-1px 0 0 0 var(--el-color-primary-plain)!important;' +
    '}' +
    '.el-radio-button .el-radio-button__inner:hover{' +
    'color:var(--el-color-primary)!important;' +
    '}'
}

// ============================================================
// dropdown 全局样式 — 通过 .ui-full / .ui-plain 跟随 uiMode
// ============================================================
var _dropdownCssEl = null
function injectDropdownCss() {
  _dropdownCssEl = ensureEl('theme-dropdown-fix')
  var item = '.el-dropdown-menu__item:not(.is-disabled)'
  _dropdownCssEl.textContent =
    '.ui-full ' + item + ':focus,' +
    '.ui-full ' + item + ':hover,' +
    '.ui-full ' + item + '.is-active{' +
    'color:var(--el-color-primary-text)!important;' +
    'background-color:var(--el-color-primary-solid-bg)!important;' +
    '}' +
    '.ui-plain ' + item + ':focus,' +
    '.ui-plain ' + item + ':hover,' +
    '.ui-plain ' + item + '.is-active{' +
    'color:var(--el-color-primary)!important;' +
    'background-color:var(--el-color-primary-plain-bg)!important;' +
    '}'
}

// ============================================================
// input / select 全局样式 — 通过 .ui-full / .ui-plain 跟随 uiMode
// ============================================================
var _inputCssEl = null
function injectInputCss() {
  _inputCssEl = ensureEl('theme-input-fix')
  var focusSel = '.el-input.is-focus .el-input__wrapper,' +
                 '.el-input .el-input__wrapper.is-focus,' +
                 '.el-select .el-input.is-focus .el-input__wrapper'
  _inputCssEl.textContent =
    // full
    '.ui-full .el-input .el-input__wrapper:hover,' +
    '.ui-full .el-select .el-input .el-input__wrapper:hover{' +
    'box-shadow:0 0 0 1px var(--el-color-primary-solid-bg) inset!important;' +
    '}' +
    '.ui-full ' + focusSel + '{' +
    'box-shadow:0 0 0 1px var(--el-color-primary) inset!important;' +
    '}' +
    '.ui-full .el-select-dropdown__item.is-selected{' +
    'color:var(--el-color-primary-text)!important;' +
    'background-color:var(--el-color-primary-solid-bg)!important;' +
    '}' +
    // plain
    '.ui-plain .el-input .el-input__wrapper:hover,' +
    '.ui-plain .el-select .el-input .el-input__wrapper:hover{' +
    'box-shadow:0 0 0 1px var(--el-color-primary-plain) inset!important;' +
    '}' +
    '.ui-plain ' + focusSel + '{' +
    'box-shadow:0 0 0 1px var(--el-color-primary-plain) inset!important;' +
    '}' +
    '.ui-plain .el-select-dropdown__item.is-selected{' +
    'color:var(--el-color-primary)!important;' +
    'background-color:var(--el-color-primary-plain-bg)!important;' +
    '}' +
    // hover (通用)
    '.el-select-dropdown__item:not(.is-disabled):hover{' +
    'background-color:var(--el-color-primary-light-9)!important;' +
    '}'
}
