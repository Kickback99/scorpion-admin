<!-- LogoEnergyPulse — 能量脉冲，心跳式高光扫过 -->
<template>
  <div class="logo logo-energy-pulse">
    <img v-if="!hideImage" :src="settingStore.logo" alt="" :style="{marginLeft:collapse?27+'px':'0'}">
    <p :style="hideImage ? {flex:'1', textAlign:'center', fontSize:'22px'} : {}">{{ settingStore.title }}</p>
  </div>
</template>

<script setup>
// 能量脉冲 — 文字始终 25% 亮度可见，高光带心跳式从左到右冲过
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

.logo-energy-pulse p {
  // 底色始终 25% 可见，文字不会消失
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.25) 0%,
    rgba(255, 255, 255, 0.25) 28%,
    rgba(255, 255, 255, 0.9) 47%,
    #fff 50%,
    rgba(255, 255, 255, 0.9) 53%,
    rgba(255, 255, 255, 0.25) 72%,
    rgba(255, 255, 255, 0.25) 100%
  );
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;

  animation:
    energy-sweep 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite,
    energy-glow 2.8s ease-in-out infinite;
}

// 能量波扫过：蓄力→释放→间歇
@keyframes energy-sweep {
  0%, 35%, 100% { background-position: 100% 0; }  // 暗态
  52%           { background-position: 10% 0; }    // 释放
  57%           { background-position: 0% 0; }     // 峰值
  60%           { background-position: 100% 0; }   // 快速回落
}

// 光晕随脉冲膨胀收缩
@keyframes energy-glow {
  0%, 100% { text-shadow: none; }
  35%      { text-shadow: 0 0 8px var(--el-color-primary-light-5); }   // 蓄力
  50%      { text-shadow: 0 0 4px #fff, 0 0 16px var(--el-color-primary), 0 0 36px var(--el-color-primary-light-3); }  // 释放
  57%      { text-shadow: 0 0 4px #fff, 0 0 16px var(--el-color-primary), 0 0 36px var(--el-color-primary-light-3); }  // 峰值
  65%      { text-shadow: none; }                                        // 回落
}
</style>
