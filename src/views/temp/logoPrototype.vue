<!--
  PROTOTYPE — Logo 文字动效评估页
  路由：/logoprototype?variant=A
  5 个结构差异明显的变体，通过底部浮动栏切换

  变体：
    A — Neon            CSS text-shadow 霓虹灯管呼吸（保留）
    B — MultiNeon       SVG 多重描边霓虹 + 心跳脉冲（保留）
    C — EnergyPulse     能量脉冲，暗态常驻不消失（修复）
    D — TechStroke     全镂空 + 单组主题色描边 mask 扫描流动（重构）
    E — GlitchScan      故障扫描线带 RGB 色边（保留）

  评估后：
    1. 选中变体 → 吸收到 index.vue + 注册到 config.js MESSAGE_MAP
    2. 删除本文件 + 所有 prototype 变体组件 + PrototypeSwitcher.vue
-->
<template>
  <div class="proto-page">
    <div class="proto-sidebar">
      <component :is="activeComponent" :hide-image="hideImage" />
      <PrototypeSwitcher
        :variants="variants"
        :labels="labels"
      />
    </div>

    <div class="proto-controls">
      <h3>Logo 文字动效原型 — 5 变体对比</h3>
      <p>使用底部浮动栏或键盘 <kbd>←</kbd> <kbd>→</kbd> 切换变体</p>
      <el-switch v-model="hideImage" active-text="隐藏图片" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import LogoGlitch from '@/components/logo/LogoGlitch.vue'
import LogoBreathe from '@/components/logo/LogoBreathe.vue'
import LogoShimmer from '@/components/logo/LogoShimmer.vue'
import LogoWave from '@/components/logo/LogoWave.vue'
import LogoScanline from '@/components/logo/LogoScanline.vue'
import PrototypeSwitcher from '@/components/logo/PrototypeSwitcher.vue'

const route = useRoute()
const hideImage = ref(false)

const variants = ['A', 'B', 'C', 'D', 'E']
const labels = {
  A: 'Neon — CSS 霓虹灯管',
  B: 'MultiNeon — SVG 描边脉冲',
  C: 'EnergyPulse — 能量脉冲',
  D: 'TechStroke — 镂空扫描描边',
  E: 'GlitchScan — 故障扫描线'
}

const componentMap = {
  A: LogoGlitch,
  B: LogoBreathe,
  C: LogoShimmer,
  D: LogoWave,
  E: LogoScanline
}

const activeComponent = computed(() => {
  const v = route.query.variant || 'A'
  return componentMap[v] || componentMap['A']
})
</script>

<style scoped lang="scss">
.proto-page {
  display: flex;
  height: 100vh;
  background: #1a1a2e;
}

.proto-sidebar {
  width: 260px;
  background: linear-gradient(180deg, #16213e 0%, #0f3460 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  position: relative;
}

.proto-controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #ccc;

  h3 {
    color: #fff;
    font-size: 20px;
    margin: 0;
  }

  p {
    margin: 0;
    color: #888;

    kbd {
      background: #333;
      border: 1px solid #555;
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 12px;
      color: #ddd;
    }
  }
}
</style>
