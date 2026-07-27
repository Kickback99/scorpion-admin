<template>
  <!-- ===== Logo：按 logo.animation_style 渲染对应动画 ===== -->
  <LogoNeon v-if="animStyle === 'neon'" :hide-image="hideImage" />
  <LogoMultiNeon v-else-if="animStyle === 'multi-neon'" :hide-image="hideImage" />
  <LogoEnergyPulse v-else-if="animStyle === 'energy-pulse'" :hide-image="hideImage" />
  <LogoStrokeScan v-else-if="animStyle === 'stroke-scan'" :hide-image="hideImage" />
  <LogoGlitch v-else-if="animStyle === 'glitch'" :hide-image="hideImage" />
  <div v-else class="logo logo-plain">
    <img v-if="!hideImage" :src="settingStore.logo" alt="" :style="{marginLeft:userConfigStore.getCollapseEnabled()?27+'px':'0'}">
    <p :style="hideImage ? {flex:'1', textAlign:'center', fontSize:'22px'} : {}">{{ settingStore.title }}</p>
  </div>
</template>

<script setup>
// ============================================================
// 依赖导入
// ============================================================
import { computed } from 'vue'
import { useConfigStore } from '@/store/config'
import { useSettingStore } from '@/setting'
import { useUserConfigStore } from '@/store/userConfig'
import { useUserStore } from '@/store/user'
import LogoNeon from './LogoNeon.vue'
import LogoMultiNeon from './LogoMultiNeon.vue'
import LogoEnergyPulse from './LogoEnergyPulse.vue'
import LogoStrokeScan from './LogoStrokeScan.vue'
import LogoGlitch from './LogoGlitch.vue'

// ============================================================
// 数据
// ============================================================
const configStore = useConfigStore()
const settingStore = useSettingStore()
const userConfigStore = useUserConfigStore()
const userStore = useUserStore()

const animStyle = computed(() => {
  // 管理员：按 configStore 配置走（原逻辑）
  if (userStore.isAdmin) return configStore.getLogoAnimationStyle()

  // 非管理员：menuFollow=true → 霓虹；false → 浅色镂空扫描 / 深色霓虹
  if (settingStore.menuFollow) return 'neon'
  return userConfigStore.isDarkEnabled ? 'neon' : 'stroke-scan'
})
const hideImage = computed(() => configStore.getLogoHideImage())
</script>

<style scoped lang="scss">
.logo-plain {
  @include flex(center, center, null);
  color: var(--el-color-primary);
  font-weight: bold;
  margin: 20px 0;
  height: $base-menu-logo-height;
  padding: 5px 0;
  gap: 10px;

  img {
    width: 50px;
    border-radius: 50%;
    z-index: 1;
  }

  p {
    font-size: 17px;
    z-index: 1;
  }
}
</style>
