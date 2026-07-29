<template>
  <div ref="chartRef" class="chart-box"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { init } from 'echarts/core'
import { createLineChart } from './lineChart'

// ============================================================
// 数据
// ============================================================
const props = defineProps({
  xData: { type: Array, default: () => [] },
  y1: { type: Array, default: () => [] },
  y2: { type: Array, default: () => [] },
  y3: { type: Array, default: () => [] },
})

const chartRef = ref(null)
let chartInstance = null
let themeObserver = null

// ============================================================
// 渲染
// ============================================================
const renderChart = () => {
  const dom = chartRef.value
  if (!dom) return
  if (!chartInstance) {
    chartInstance = init(dom, { renderer: 'svg' })
  }
  chartInstance.setOption(createLineChart({
    xData: props.xData,
    y1: props.y1,
    y2: props.y2,
    y3: props.y3,
  }), true)
}

const handleResize = () => chartInstance?.resize()

watch(() => [props.xData, props.y1, props.y2, props.y3], renderChart, { deep: true })

// ============================================================
// 生命周期
// ============================================================
onMounted(() => {
  renderChart()
  window.addEventListener('resize', handleResize)
  themeObserver = new MutationObserver(renderChart)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  themeObserver?.disconnect()
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<style scoped lang="scss">
.chart-box { width: 100%; height: 320px; }
</style>
