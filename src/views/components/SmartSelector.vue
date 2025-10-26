<template>
    <el-select v-model="text" :placeholder="placeholder">
        <el-option v-for="item in data" :key="item.value" :label="item.label" :value="item.value" />
    </el-select>
</template>
 
<script setup>
const text = defineModel()

defineProps({
    placeholder:{
        type:String,
        required:true
    },
    data:{
        type:Array,
        required:null
    }
})
</script>


<style scoped lang="scss">

</style>