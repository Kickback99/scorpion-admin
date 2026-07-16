<!--
  PROTOTYPE — LogoGlitchScan
  问题：故障扫描线 — 竖条扫描线带 RGB 色边，从左到右扫过文字
  评估后请删除或吸收到正式组件
-->
<template>
  <div class="logo logo-glitch-scan">
    <img v-if="!hideImage" :src="settingStore.logo" alt="" :style="{marginLeft:collapse?27+'px':'0'}">
    <p :style="hideImage ? {flex:'1', textAlign:'center', fontSize:'22px'} : {}">{{ settingStore.title }}</p>
  </div>
</template>

<script setup>
// 故障扫描线 — 竖条形扫描线带 R/B 色边 + 白芯，mix-blend-mode 叠加文字
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
  color: var(--el-color-primary-light-5);
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

.logo-glitch-scan p {
  position: relative;

  // 文字偶尔通道分离（模拟信号干扰）
  animation: glitch-text 4s steps(1) infinite;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -15%;
    width: 28px;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      color-mix(in srgb, var(--el-color-primary-light-5) 20%, transparent) 20%,
      var(--el-color-primary-light-7) 45%,
      var(--el-color-primary-light-7) 55%,
      color-mix(in srgb, var(--el-color-primary-light-3) 20%, transparent) 80%,
      transparent 100%
    );
    mix-blend-mode: overlay;
    pointer-events: none;
    animation: scan-sweep 2.8s linear infinite;
  }
}

@keyframes scan-sweep {
  0%   { left: -15%; }
  100% { left: 110%; }
}

@keyframes glitch-text {
  0%, 90%, 92.5%, 95%, 97.5%, 100% { text-shadow: none; }
  91%   { text-shadow: -2px 0 var(--el-color-primary-light-3), 2px 0 var(--el-color-primary-light-5); }
  93.5% { text-shadow: 2px 0 var(--el-color-primary-light-3), -2px 0 var(--el-color-primary-light-5); }
  96%   { text-shadow: -1px 0 var(--el-color-primary-light-3), 1px 0 var(--el-color-primary-light-5); }
}
</style>
