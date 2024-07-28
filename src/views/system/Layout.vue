<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="250px">
        <el-menu router
      active-text-color="#ffd04b" 
          background-color="darkslategray" 
          :default-active="$route.path"
          text-color="#fff"
          mode="vertical"
        >
          <menu-tree :listData="listData"></menu-tree>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>Header</el-header>
        <el-main><router-view></router-view></el-main>
        <el-footer>Footer</el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import MenuTree from '@/components/MenuTree.vue';
import {useUserStore} from '@/store/user'
import { ref } from 'vue';
const userStore = useUserStore()
const listData = ref([])
listData.value = userStore.userMenu

</script>

<style lang="scss" scoped>
.el-container{
  height: 100vh;
}

.el-aside {
  background-color: #232323;
}
</style>