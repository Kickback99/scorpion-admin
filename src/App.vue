<template>
    
    <el-config-provider :locale="zhCn">
        <router-view></router-view>
    </el-config-provider>

</template>

<script setup>
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import {useWebSocket} from '@/server/useWebSocket'
import { onMounted } from 'vue';

// 初始化 WebSocket
const { initWebSocketListener, closeWebSocket } = useWebSocket()

onMounted(()=>{
    initWebSocketListener()
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