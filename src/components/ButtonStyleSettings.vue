<template>
  <div class="btn-style-settings">
    <div class="btn-style-label">按钮样式</div>
    <el-radio-group
      :model-value="iconStore.uiMode"
      @change="onStyleChange"
      size="small"
    >
      <el-radio-button value="full">实心</el-radio-button>
      <el-radio-button value="plain">描边</el-radio-button>
    </el-radio-group>

    <div class="btn-depth-row">
      <span class="btn-depth-label">{{ depthLabel }}</span>
      <el-slider
        :model-value="iconStore.uiDepth"
        @input="onDepthChange"
        :min="0"
        :max="100"
        :step="5"
        size="small"
        show-input
        :format-tooltip="depthTooltip"
      />
    </div>

    <div class="btn-depth-row">
      <span class="btn-depth-label">hover 强度</span>
      <el-slider
        :model-value="hoverValue"
        @input="onHoverChange"
        :min="1"
        :max="9"
        :step="1"
        size="small"
        show-input
        :format-tooltip="(v) => 'light-' + v"
      />
    </div>
  </div>
</template>

<script setup>
// ============================================================
// 依赖导入
// ============================================================
import { computed } from 'vue'
import { useIconStore } from '@/store/icon'
import { applyTheme } from '@/assets/common/theme'
import { useUserConfigStore } from '@/store/userConfig'

// ============================================================
// Store
// ============================================================
const iconStore = useIconStore()
const userConfigStore = useUserConfigStore()

// ============================================================
// 计算属性
// ============================================================
const depthLabel = computed(() => {
  const style = iconStore.uiMode
  if (style === 'full') return '色阶深度'
  return '描边深度'
})

const hoverValue = computed(() => {
  return iconStore.uiMode === 'full'
    ? iconStore.hoverFull
    : iconStore.hoverPlain
})

// ============================================================
// 方法
// ============================================================
function depthTooltip(val) {
  if (iconStore.uiMode === 'full') {
    return `±${val}%`
  }
  return `${val}%`
}

function onStyleChange(style) {
  iconStore.setUiMode(style)
  // full 默认 depth=0, plain/circle 默认 depth=35
  iconStore.setUiDepth(style === 'full' ? 0 : 35)
  reapplyTheme()
}

function onDepthChange(depth) {
  iconStore.setUiDepth(depth)
  reapplyTheme()
}

function onHoverChange(hover) {
  if (iconStore.uiMode === 'full') {
    iconStore.setHoverFull(hover)
  } else {
    iconStore.setHoverPlain(hover)
  }
  reapplyTheme()
}

function reapplyTheme() {
  applyTheme(userConfigStore.currentTheme, userConfigStore.isDarkEnabled)
}
</script>

<style scoped lang="scss">
.btn-style-settings {
  .btn-style-label {
    font-size: 13px;
    color: var(--el-text-color-regular);
    margin-bottom: 6px;
  }

  .btn-depth-row {
    margin-top: 10px;

    .btn-depth-label {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      display: block;
      margin-bottom: 4px;
    }
  }
}
</style>
