<template>
  <!-- ===== 分栏面板：左侧分类导航 + 右侧配置行 ===== -->
  <div class="cs-split">
    <aside class="cs-sidebar">
      <div
        v-for="group in groups"
        :key="group.key"
        class="cs-nav-item"
        :class="{ active: activeGroup === group.key }"
        @click="activeGroup = group.key"
      >
        <el-icon><component :is="group.icon" /></el-icon>
        <span>{{ group.label }}</span>
      </div>
    </aside>
    <main class="cs-content">
      <template v-for="group in groups" :key="group.key">
        <div v-if="activeGroup === group.key" class="cs-panel">
          <h2 class="cs-panel-title">{{ group.label }}</h2>
          <div v-for="item in group.items" :key="item.key" class="cs-row">
            <div class="cs-row-info">
              <span class="cs-row-label">{{ item.label }}</span>
              <span class="cs-row-desc">{{ item.desc }}</span>
            </div>
            <div class="cs-row-ctrl">
              <ConfigControl :item="item" />
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
// ============================================================
// 依赖导入
// ============================================================
import { ref } from 'vue'
import { useConfigItems } from './configItems'
import ConfigControl from './ConfigControl.vue'

// ============================================================
// 数据
// ============================================================
const { groups } = useConfigItems()
const activeGroup = ref('client')
</script>

<style lang="scss" scoped>
// ============================================================
// 分栏面板
// ============================================================
.cs-split {
  display: flex;
  min-height: 480px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  overflow: hidden;
  background: var(--el-bg-color);
}

.cs-sidebar {
  width: 180px;
  flex-shrink: 0;
  background: var(--el-bg-color-overlay);
  border-right: 1px solid var(--el-border-color-lighter);
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cs-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  cursor: pointer;
  font-size: 14px;
  color: var(--el-text-color-regular);
  transition: all .15s;
  border-right: 3px solid transparent;
  margin-right: -1px;

  &:hover {
    background: var(--el-fill-color-lighter);
    color: var(--el-text-color-primary);
  }

  &.active {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-right-color: var(--el-color-primary);
    font-weight: 600;
  }
}

.cs-content {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
}

.cs-panel {
  max-width: 640px;

  &-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 20px;
  }
}

.cs-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  gap: 24px;

  &-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }

  &-label {
    font-weight: 500;
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  &-desc {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.5;
  }

  &-ctrl {
    flex-shrink: 0;
  }
}
</style>
