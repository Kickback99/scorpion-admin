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
        <el-main>
          <el-breadcrumb separator=">">
              <el-breadcrumb-item :to="{ path: r.path === '/system'?'/system/sysUser':r.path }" v-for="r in breadList">
                {{ r.meta.title }}
              </el-breadcrumb-item>
          </el-breadcrumb>
          <router-view/>
        </el-main>
        <el-footer>Footer</el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import MenuTree from '@/components/MenuTree.vue';
import {useUserStore} from '@/store/user'
import { ref,watch } from 'vue';
const userStore = useUserStore()
const listData = ref([])
listData.value = userStore.userMenu

const breadList = ref([])

//路由对象--获取路由参数
import { useRoute } from 'vue-router'
const route = useRoute()

watch(route, () => getBreadList());

function getBreadList(){
  breadList.value =  route.matched
}

getBreadList()

</script>

<style lang="scss" scoped>
.el-container{
  height: 100vh;
}

.el-aside {
  background-color: #232323;
}
</style>