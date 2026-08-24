<template>
  <!-- ===== Logo：按 logo.animation_style 渲染对应动画 ===== -->
  <LogoNeon v-if="animStyle === 'neon'" :hide-image="hideImage" @click="handleLogoClick" />
  <LogoMultiNeon v-else-if="animStyle === 'multi-neon'" :hide-image="hideImage" @click="handleLogoClick" />
  <LogoEnergyPulse v-else-if="animStyle === 'energy-pulse'" :hide-image="hideImage" @click="handleLogoClick" />
  <LogoStrokeScan v-else-if="animStyle === 'stroke-scan'" :hide-image="hideImage" @click="handleLogoClick" />
  <LogoGlitch v-else-if="animStyle === 'glitch'" :hide-image="hideImage" @click="handleLogoClick" />
  <div v-else class="logo logo-plain" @click="handleLogoClick">
    <SvgIcon v-if="!hideImage" name="scorpioncode" width="28" height="28" fill="var(--el-color-primary)" :style="{marginLeft:userConfigStore.getCollapseEnabled()?27+'px':'0'}"></SvgIcon>
    <p :style="hideImage ? {flex:'1', textAlign:'center', fontSize:'22px'} : {}">{{ settingStore.title }}</p>
  </div>
</template>

<script setup>
// ============================================================
// 依赖导入
// ============================================================
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
const route = useRoute()
const router = useRouter()

const animStyle = computed(() => {
  // 管理员：按 configStore 全局配置走，覆盖一切
  if (userStore.isAdmin) return configStore.getLogoAnimationStyle()

  // 非管理员：深色或主题色菜单 → 霓虹；浅色 → 用户浅色 Logo 配置
  if (userConfigStore.isDarkEnabled || settingStore.menuThemeColor) return 'neon'
  return configStore.getUserLightLogo()
})
const hideImage = computed(() => configStore.getLogoHideImage())

// ============================================================
// 事件
// ============================================================
// Logo 点击：不在首页则跳转回首页
const handleLogoClick = () => {
  if (route.path !== '/index') router.push('/index')
}
</script>

<style scoped lang="scss">
// 所有变体根节点统一可点击（子组件根节点携带父组件 scope id，普通选择器即可命中）
.logo {
  cursor: pointer;
}

.logo-plain {
  @include flex(center, center, null);
  color: var(--el-color-primary);
  font-weight: bold;
  margin: 20px 0;
  height: $base-menu-logo-height;
  padding: 5px 0;
  gap: 10px;

  p {
    font-size: 17px;
    z-index: 1;
  }
}
</style>
