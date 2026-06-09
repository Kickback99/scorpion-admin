<template>
    <el-button type="success" @click="handleClick">强制踢出用户端id为1的用户</el-button>
</template>

<script setup>
import { helloApi } from '@/api/hello';



const handleClick = async() => {
    await helloApi()
}
</script>

<style scoped lang="scss">

</style>