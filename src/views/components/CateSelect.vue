<template>
    <el-tree-select
      v-model="modelValue"
      :data="cateData"
      :props="defaultProps"
      check-strictly
      :render-after-expand="false"
      placeholder="请选择分类"
      style="width: 240px"
    />
  </template>

<script setup>
import { listApi } from '@/api/concategory';
import { ref } from 'vue';

const defaultProps = {
  children: 'children',
  label: 'name',
  value:'id'
}

const modelValue = defineModel()

const cateData = ref([])

const render = async() => {
  console.log('分类列表...')
    const res = await listApi()
    console.log(res)
    /* cateData.value = res.data.map(item => {
        return {
            ...item,
            value:item.id+''

        }
    }) */
    cateData.value = res.data
}

render()
</script>

<style scoped lang="scss">

</style>