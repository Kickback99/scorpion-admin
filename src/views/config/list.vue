<template>
  <div class="icon-switcher">
    <el-radio-group 
      v-model="isSearch" 
      size="small"
      @change="toggleComponent"
    >
      <el-radio-button :label="true">
        <el-icon class="mr-1"><Search /></el-icon>
        配置列表
      </el-radio-button>
      <el-radio-button :label="false">
        <el-icon class="mr-1"><Collection /></el-icon>
        配置管理
      </el-radio-button>
    </el-radio-group>
  </div>

  <component :is="isSearch ? ConfigList : ConfigManager" />
</template>

<script setup>
import { ref } from 'vue'
import { Search, Collection } from '@element-plus/icons-vue'
import ConfigManager from '@/views/components/ConfigManager.vue'
import ConfigList from '@/views/components/ConfigList.vue'

const isSearch = ref(true)
const toggleComponent = () => {
  // 无需手动切换，v-model 已绑定
}
</script>

<style scoped>
.icon-switcher {
  margin-bottom: 20px;
  display: flex;
  justify-content: center; /* 居中显示 */
}

/* 自定义选中样式 */
:deep(.el-radio-button__inner) {
  transition: all 0.3s;
}
:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: var(--el-color-primary);
  color: white;
  border-color: var(--el-color-primary);
}
</style>