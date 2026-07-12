<template>
  <!-- ===== 文字渐变填充：文字颜色从左到右流动 ===== -->
  <div class="logo logo-fill">
    <img v-if="!hideImage" :src="settingStore.logo" alt="" :style="{marginLeft:collapse?27+'px':'0'}">
    <p :style="hideImage ? {flex:'1', textAlign:'center', fontSize:'22px'} : {}">{{ settingStore.title }}</p>
  </div>
</template>

<script setup>
// ============================================================
// 文字渐变填充 — 背景渐变从左到右流动，clip 到文字
// ============================================================
import { useSettingStore } from '@/setting'
import { useUserConfigStore } from '@/store/userConfig'

defineProps({
  hideImage: { type: Boolean, default: false }
})

const settingStore = useSettingStore()
const userConfigStore = useUserConfigStore()
const collapse = userConfigStore.getCollapseEnabled()
</script>

<style scoped lang="scss">
.logo {
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

    background: linear-gradient(
      90deg,
      var(--el-text-color-primary) 0%,
      var(--el-color-primary) 25%,
      var(--el-color-primary-light-3) 50%,
      var(--el-color-primary) 75%,
      var(--el-text-color-primary) 100%
    );
    background-size: 300% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: lf-shift 3s linear infinite;
  }
}

@keyframes lf-shift {
  0%   { background-position: 100% 0; }
  100% { background-position: 0% 0; }
}
</style>
