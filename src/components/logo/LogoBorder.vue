<template>
  <!-- ===== 边框跑马灯：容器边框 hue-rotate 流光 ===== -->
  <div class="logo logo-border">
    <img v-if="!hideImage" :src="settingStore.logo" alt="" :style="{marginLeft:collapse?27+'px':'0'}">
    <p :style="hideImage ? {color:colorStore.logoTitleColor, flex:'1', textAlign:'center', fontSize:'22px'} : {color:colorStore.logoTitleColor}">{{ settingStore.title }}</p>
  </div>
</template>

<script setup>
// ============================================================
// 边框跑马灯 — 容器边框色相旋转流光动画
// ============================================================
import { useSettingStore } from '@/setting'
import { useColorStore } from '@/store/color'
import { useUserConfigStore } from '@/store/userConfig'

defineProps({
  hideImage: { type: Boolean, default: false }
})

const settingStore = useSettingStore()
const colorStore = useColorStore()
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
  padding: 5px 12px;
  gap: 10px;
  position: relative;
  border-radius: 8px;

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

.logo-border {
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    border-radius: 8px;
    border: 2px solid transparent;
    background: linear-gradient(
      90deg,
      var(--el-color-primary),
      var(--el-color-primary-light-5),
      var(--el-color-primary-light-7),
      var(--el-color-primary)
    ) border-box;
    -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    animation: lb-spin 2s linear infinite;
  }
}

@keyframes lb-spin {
  0%   { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}
</style>
