<template>
  <!-- ===== Logo：按 logo.animation_style 渲染对应动画 ===== -->
  <LogoBorder v-if="animStyle === 'border'" :hide-image="hideImage" />
  <LogoFill v-else-if="animStyle === 'fill'" :hide-image="hideImage" />
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
import LogoBorder from './LogoBorder.vue'
import LogoFill from './LogoFill.vue'

// ============================================================
// 数据
// ============================================================
const configStore = useConfigStore()
const settingStore = useSettingStore()
const userConfigStore = useUserConfigStore()

const animStyle = computed(() => configStore.getLogoAnimationStyle())
const hideImage = computed(() => configStore.getLogoHideImage())
</script>

<style scoped lang="scss">
.logo-plain {
  @include flex(center, center, null);
  color: white;
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
