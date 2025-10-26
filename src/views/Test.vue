<template>
    <!-- {{ listIcons() }} -->
      <!-- addIcon(自行添加) -->
    <offlineIcon icon="ep:check"></offlineIcon>

    <!-- 批量离线图标添加 -->
    <OfflineIcon icon="ep:download"></OfflineIcon>
    <OfflineIcon icon="ep:document"></OfflineIcon>

    <!-- 单个离线图标添加 -->
    <SingleIcon icon="ep:camera"></SingleIcon>


    <!-- 在线图标 -->
    <OnlineIcon icon="ep:box"></OnlineIcon>

  
</template>

<script setup>
import { SingleIcon } from '@/components/MyIcon';
import offlineIcon from '@/components/MyIcon/src/offlineIcon';
import { listIcons } from '@iconify/vue';
</script>

<style scoped lang="scss">
</style>