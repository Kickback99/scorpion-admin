<template>
    
    <el-config-provider :locale="zhCn">
        <router-view></router-view>
    </el-config-provider>

</template>

<script setup>
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import {useWebSocket} from '@/server/useWebSocket'
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useUserConfigStore } from '@/store/userConfig'
import { applyTheme } from '@/assets/common/theme'

const route = useRoute()
const { initWebSocketListener, closeWebSocket } = useWebSocket()

/** 根据当前路由和缓存注入主题，登录页强制 default */
function applyInitialTheme() {
  const userConfigStore = useUserConfigStore()
  if (route.path === '/login') {
    document.documentElement.classList.remove('dark')
    applyTheme('default', false)
  } else {
    document.documentElement.classList.toggle('dark', userConfigStore.isDarkEnabled)
    applyTheme(userConfigStore.theme || 'default', userConfigStore.isDarkEnabled)
  }
}

onMounted(() => {
  initWebSocketListener()
  applyInitialTheme()
})

// 登录成功后路由从 /login 跳走时，watch 触发 → 应用用户主题
watch(() => route.path, () => {
  applyInitialTheme()
})

</script>

<style  lang="scss">
 html,body,#app{
    height: 100%;
 }
 .app-container{
    padding:20px
 }

.el-dialog__title {
  font-size: 14px !important;
}
</style>