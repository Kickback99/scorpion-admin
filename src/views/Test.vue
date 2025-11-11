<template>
    <offlineIcon icon="ep:check"></offlineIcon>

    <el-button   color="#000" style="color:red" type="primary" icon="Edit"  circle plain/>
    <el-button icon="Plus" type="primary">sds </el-button>

    <el-popconfirm :title="`你确定要删除吗`" @confirm="handleRemove(1)" width="250px"
        icon="Plus" icon-color="red">
        <template #reference>
            <el-button type="danger" icon="Delete" circle plain />
        </template>
    </el-popconfirm>

    <!-- color优先级高于style -->
    <el-icon style="color:yellow">
      <User color="red"/>
    </el-icon>

      <el-switch  v-model="dark" @change="toggleDark" size="small" inline-prompt active-icon="Moon" inactive-icon="Sunny"     style="--el-switch-on-color: #000; --el-switch-off-color: #f00"/>	

       <!-- style优先级高于color，在去找父级的style -->
      <el-icon style="margin-right: 10px;color:#ff0" @click="stringStore.isCollapse = !stringStore.isCollapse">
          <component :is="1+1==2?'Top':'Bottom'" color="red" style="color:black"></component>
      </el-icon>

      <el-form-item label="呢称" prop="nickname">	
            <el-input prefix-icon="User" placeholder="请输入呢称" v-model="dark" />
      </el-form-item>

</template>

<script setup>
import { IconFont, SingleIcon } from '@/components/MyIcon';
import offlineIcon from '@/components/MyIcon/src/offlineIcon';
import SvgIcon from '@/components/MyIcon/src/SvgIcon.vue';
import { ref } from 'vue';

const dark = ref(false)
const toggleDark = () => {

}
</script>

<style scoped lang="scss">
.iconfont {
  color: blue;
}
</style>