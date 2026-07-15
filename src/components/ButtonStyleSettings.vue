<template>
  <div class="btn-style-settings">
    <div class="btn-style-label">按钮样式</div>
    <el-radio-group
      :model-value="uiStore.uiMode"
      @change="onStyleChange"
      size="small"
    >
      <el-radio-button value="full">实心</el-radio-button>
      <el-radio-button value="plain">描边</el-radio-button>
    </el-radio-group>

    <div class="btn-depth-row">
      <span class="btn-depth-label">{{ depthLabel }}</span>
      <el-slider
        :model-value="uiStore.uiDepth"
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
import { useUiStore } from '@/store/ui'
import { applyTheme } from '@/assets/common/theme'
import { useUserConfigStore } from '@/store/userConfig'

// ============================================================
// Store
// ============================================================
const uiStore = useUiStore()
const userConfigStore = useUserConfigStore()

// ============================================================
// 计算属性
// ============================================================
const depthLabel = computed(() => {
  const style = uiStore.uiMode
  if (style === 'full') return '色阶深度'
  return '描边深度'
})

const hoverValue = computed(() => {
  return uiStore.uiMode === 'full'
    ? uiStore.hoverFull
    : uiStore.hoverPlain
})

// ============================================================
// 方法
// ============================================================
function depthTooltip(val) {
  if (uiStore.uiMode === 'full') {
    return `±${val}%`
  }
  return `${val}%`
}

function onStyleChange(style) {
  uiStore.setUiMode(style)
  // full 默认 depth=0, plain/circle 默认 depth=35
  uiStore.setUiDepth(style === 'full' ? 0 : 35)
  reapplyTheme()
}

function onDepthChange(depth) {
  uiStore.setUiDepth(depth)
  reapplyTheme()
}

function onHoverChange(hover) {
  if (uiStore.uiMode === 'full') {
    uiStore.setHoverFull(hover)
  } else {
    uiStore.setHoverPlain(hover)
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
