<template>
     <Mask :maskVisible="maskVisible" @closeMask="maskVisible=false"></Mask>
</template>

<script setup>
import { ref } from 'vue';
import Mask from './Mask.vue';

// mask弹窗
const maskVisible = ref(false)

// 暴露打开方法


// 暴露打开遮罩层方法
const openMask = () => {
    maskVisible.value = !maskVisible.value
}

// 组件对外暴露一个方法toggleShow
// 无论是添加文章还是编辑文章，都需要打开window弹窗
const toggleShow = () => {
   
}

defineExpose({
    toggleShow, openMask
})

</script>

<style scoped lang="scss">

</style>