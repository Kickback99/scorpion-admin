<template>
  <el-card shadow="none" class="area-chart-card">
    <template #header>
      <div class="area-chart-header">
        <span>近7天浏览量趋势</span>
        <WeekArrows
          :period-label="areaData.periodLabel"
          :left-disabled="areaOffset >= areaData.maxOffset"
          :right-disabled="areaStack.length === 0"
          :loading="areaLoading"
          :offset="areaOffset"
          :max-offset="areaData.maxOffset"
          @prev="handleAreaPrev"
          @next="handleAreaNext"
          @reset="handleAreaReset"
        />
      </div>
    </template>
    <div class="area-chart-wrapper">
      <div ref="chartRef" class="area-chart-box"></div>
      <div v-if="!areaData.hasData" class="chart-empty-hint">暂无数据</div>
    </div>
  </el-card>
</template>

<script setup>
// ============================================================
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { init } from 'echarts/core'
import WeekArrows from './WeekArrows.vue'
import { getChartAreaApi } from '@/api/dashboard'

// ============================================================
// 数据
// ============================================================
const chartRef = ref(null)
let chartInstance = null
let themeObserver = null

const areaOffset = ref(0)
const areaStack = ref([])
const areaLoading = ref(false)
const areaData = reactive({ xData: [], y1: [], periodLabel: '', hasData: false, maxOffset: 12 })

const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

const buildOption = () => ({
  color: [cssVar('--el-color-primary')],
  tooltip: {
    trigger: 'axis',
    borderWidth: 0,
    borderRadius: 10,
    padding: [12, 16],
    backgroundColor: cssVar('--el-bg-color-overlay'),
    formatter: (params) => {
      const p = params[0]
      return `<div style="display:flex;align-items:center;gap:8px">
        <span style="width:10px;height:10px;border-radius:50%;background:${cssVar('--el-color-primary')};display:inline-block"></span>
        <b style="font-size:16px;color:${cssVar('--el-text-color-primary')}">${p.value}</b>
        <span style="font-size:13px;color:${cssVar('--el-text-color-regular')}">访问</span>
        </div>
        <div style="font-size:12px;color:${cssVar('--el-text-color-secondary')};margin-top:4px">${p.name}</div>`
    },
  },
  grid: { left: 0, right: 10, bottom: 20, top: 20, containLabel: true },
  xAxis: {
    data: areaData.xData, type: 'category', boundaryGap: false,
    axisLabel: { color: cssVar('--el-text-color-secondary'), fontSize: 11 },
    axisLine: { show: false },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value', minInterval: 1, splitNumber: 3,
    axisLabel: { show: false },
    splitLine: { lineStyle: { color: cssVar('--el-border-color-lighter') } },
  },
  series: [{
    type: 'line', data: areaData.y1, smooth: true, symbol: 'circle', symbolSize: 8,
    lineStyle: { color: cssVar('--el-color-primary'), width: 3, shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.15)' },
    itemStyle: { color: cssVar('--el-color-primary'), borderColor: cssVar('--el-bg-color'), borderWidth: 2 },
    areaStyle: {
      color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: cssVar('--el-color-primary-light-3') },
          { offset: 1, color: cssVar('--el-color-primary-light-9') },
        ],
      },
    },
  }],
})

// ============================================================
// 渲染
// ============================================================
const renderChart = () => {
  const dom = chartRef.value
  if (!dom) return
  if (!chartInstance) chartInstance = init(dom, { renderer: 'svg' })
  chartInstance.setOption(buildOption(), true)
}

watch(() => [areaData.xData, areaData.y1], renderChart, { deep: true })

const fetchArea = async (direction = 'prev') => {
  areaLoading.value = true
  try {
    const res = await getChartAreaApi(areaOffset.value, null, direction)
    Object.assign(areaData, {
      xData: res.data?.xdata || res.data?.xData || [],
      y1: res.data?.y1 || [],
      periodLabel: res.data?.periodLabel || '',
      hasData: res.data?.hasData || false,
      maxOffset: res.data?.maxOffset || 12,
    })
    areaOffset.value = res.data?.offset ?? areaOffset.value
  } catch { /* keep defaults */ }
  areaLoading.value = false
}

// ============================================================
// 周切换
// ============================================================
const handleAreaPrev = () => { areaStack.value = [...areaStack.value, areaOffset.value]; areaOffset.value++; fetchArea('prev') }
const handleAreaNext = () => {
  const s = areaStack.value
  if (s.length === 0) return
  areaOffset.value = s[s.length - 1]
  areaStack.value = s.slice(0, -1)
  fetchArea('next')
}
const handleAreaReset = () => { areaStack.value = []; areaOffset.value = 0; fetchArea('prev') }

// ============================================================
// 生命周期
// ============================================================
onMounted(() => {
  fetchArea()
  window.addEventListener('resize', () => chartInstance?.resize())
  themeObserver = new MutationObserver(renderChart)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onUnmounted(() => {
  window.removeEventListener('resize', () => chartInstance?.resize())
  themeObserver?.disconnect()
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<style scoped lang="scss">
.area-chart-card {
  border: none;
  border-radius: 10px;
  :deep(.el-card__header) { border-bottom: none; padding-bottom: 0; }
  :deep(.el-card__body) { padding-top: 0; }
}

.area-chart-header {
  display: flex; align-items: center;
  font-size: 15px; font-weight: 500;
  color: var(--el-text-color-primary);
}

.area-chart-wrapper {
  position: relative;
}

.area-chart-box {
  width: 100%;
  height: 190px;
}

.chart-empty-hint {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px; color: var(--el-text-color-placeholder);
  pointer-events: none;
}
</style>
