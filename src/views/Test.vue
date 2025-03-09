<template>
    <span>{{ test }}</span>
    <Markdown v-model="test"></Markdown>
</template>

<script setup>
import Markdown from '@/components/Markdown.vue';
import { ref } from 'vue';
const test = ref('')
</script>

<style scoped lang="scss">
</style>