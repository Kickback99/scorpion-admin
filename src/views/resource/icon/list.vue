<template>
    <!-- 切换按钮 -->
  <el-button @click="toggleComponent" :disabled="isSearch">图标搜索</el-button>
  <el-button @click="toggleComponent" :disabled="!isSearch">图标收集</el-button>

<IconSearch v-if="isSearch"></IconSearch>
<IconCollect v-else></IconCollect>
</template>

<script setup>
import IconCollect from '@/views/components/IconCollect.vue';
import IconSearch from '@/views/components/IconSearch.vue';

const isSearch = ref(true)
const toggleComponent = () => {
  isSearch.value = !isSearch.value
}

</script>

<style scoped lang="scss">

</style>