<template>
  <!-- ===== 周切换箭头 ===== -->
  <span v-if="periodLabel" class="chart-period">{{ periodLabel }}</span>
  <div class="chart-arrows">
    <el-button size="small" text circle :disabled="leftDisabled" @click="handlePrev">
      <el-icon><ArrowLeft /></el-icon>
    </el-button>
    <el-button size="small" text circle :disabled="rightDisabled" @click="handleNext">
      <el-icon><ArrowRight /></el-icon>
    </el-button>
  </div>
</template>

<script setup>
// ============================================================
// 数据
// ============================================================
const props = defineProps({
  periodLabel: { type: String, default: '' },
  leftDisabled:  { type: Boolean, default: false },
  rightDisabled: { type: Boolean, default: true },
})

const emit = defineEmits(['prev', 'next'])

// ============================================================
// 渲染
// ============================================================
const handlePrev = () => emit('prev')
const handleNext = () => emit('next')
</script>

<style scoped lang="scss">
.chart-period {
  font-size: 12px; font-weight: 400;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  padding: 2px 10px; border-radius: 4px;
}

.chart-arrows {
  display: flex; gap: 2px; margin-left: auto;
}
</style>
