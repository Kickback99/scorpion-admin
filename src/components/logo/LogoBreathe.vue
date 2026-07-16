<!--
  PROTOTYPE — LogoMultiNeon (增强版)
  多重描边霓虹 — SVG feGaussianBlur + feMerge GPU 加速发光，心跳脉冲节奏
  评估后请删除或吸收到正式组件
-->
<template>
  <div class="logo logo-multi-neon">
    <svg class="neon-filters" aria-hidden="true">
      <filter id="proto-multi-neon" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="glow-outer" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="glow-mid" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="glow-inner" />
        <feMerge>
          <feMergeNode in="glow-outer" />
          <feMergeNode in="glow-mid" />
          <feMergeNode in="glow-inner" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </svg>
    <img v-if="!hideImage" :src="settingStore.logo" alt="" :style="{marginLeft:collapse?27+'px':'0'}">
    <p :style="hideImage ? {flex:'1', textAlign:'center', fontSize:'22px'} : {}">{{ settingStore.title }}</p>
  </div>
</template>

<script setup>
// 多重描边霓虹增强版 — SVG 滤镜 3 层发光 + 心跳式高光脉冲（蓄力→爆发→间歇）
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

.neon-filters {
  position: absolute;
  width: 0;
  height: 0;
}

.logo-multi-neon p {
  filter: url(#proto-multi-neon);
  color: #fff;

  background: linear-gradient(
    90deg,
    #fff 0%,
    #fff 25%,
    #ffffcc 48%,
    #ffffff 50%,
    #ffffcc 52%,
    #fff 75%,
    #fff 100%
  );
  background-size: 250% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;

  // 双动画：高光脉冲 + 光晕呼吸
  animation:
    multi-pulse-sweep 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite,
    multi-glow-breathe 3.2s ease-in-out infinite;
}

// 心跳脉冲：蓄力→爆发→快速回落→间歇
@keyframes multi-pulse-sweep {
  0%, 32%, 100% { background-position: 100% 0; }  // 间歇（暗）
  40%           { background-position: 30% 0; }    // 蓄力
  46%           { background-position: 0% 0; }     // 爆发
  50%           { background-position: 0% 0; }     // 峰值保持
  54%           { background-position: 100% 0; }   // 快速回落
}

// 光晕呼吸：爆发瞬间文字阴影扩散
@keyframes multi-glow-breathe {
  0%, 32%, 100% { text-shadow: 0 0 2px rgba(255,255,255,0.4); }
  40%           { text-shadow: 0 0 6px rgba(255,255,255,0.6), 0 0 12px var(--el-color-primary-light-3); }
  46%           { text-shadow: 0 0 10px #fff, 0 0 24px var(--el-color-primary), 0 0 40px var(--el-color-primary-light-3); }
  50%           { text-shadow: 0 0 10px #fff, 0 0 24px var(--el-color-primary), 0 0 40px var(--el-color-primary-light-3); }
  54%           { text-shadow: 0 0 2px rgba(255,255,255,0.4); }
}
</style>
