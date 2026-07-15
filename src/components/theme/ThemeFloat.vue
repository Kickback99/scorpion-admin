<template>
  <!-- ===== A: 页面底部 MoreFilled → hover 弹出主题色点 ===== -->
  <div class="tf-root">
    <el-popover placement="top" trigger="hover" :offset="4" :show-arrow="false" popper-class="tf-popover">
      <template #reference>
        <span class="tf-icon"><el-icon><MoreFilled /></el-icon></span>
      </template>
      <div class="tf-picker">
        <ThemeDots />
      </div>
    </el-popover>
  </div>
</template>

<script setup>
// ============================================================
// 底部浮动 — 页面底部中间 MoreFilled 图标，hover 弹出色点
// ============================================================
import ThemeDots from './ThemeDots.vue'
</script>

<style scoped lang="scss">
.tf-root {
  position: fixed;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: auto;
  line-height: 0;
}

.tf-icon {
  cursor: pointer;
  color: var(--el-text-color-placeholder);
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color .2s;

  &:hover { color: var(--el-color-primary); }
}

.tf-picker {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: nowrap;
}
</style>

<style lang="scss">
.tf-popover {
  padding: 8px 12px !important;
  min-width: auto !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;

  .el-popover__arrow {
    display: none !important;
  }
}
</style>
