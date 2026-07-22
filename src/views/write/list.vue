<template>
 <ArticleEdit ref="maskRef" @reRender="render"></ArticleEdit>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ArticleEdit from '@/views/components/ArticleEdit.vue';

const maskRef = ref()

onMounted(() => {
    maskRef.value.openMask()
    maskRef.value.handleToggle({})
})

</script>

<style scoped lang="scss">

</style>