<template>
    <svg :style="{width,height}">
        <use :xlink:href="prefix+name"></use>
    </svg>
</template>

<script setup>
defineProps({
    // 该插件需要的前缀
    prefix:{
        type:String,
        default:'#icon-'
    },
    // 提供图标的名字
    name:{
        type:String,
        required:true
    },
    color:{
        type:String,
        // default:'black'
    },
    width:{
        type:String,
        default:'16px'
    },
    height:{
        type:String,
        default:'16px'
    }

})
</script>

<style scoped lang="scss">

</style>