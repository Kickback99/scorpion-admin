<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="220px">
        <el-menu router
      active-text-color="palegreen" 
          background-color="transparent" 
          :default-active="handelUrl"
          text-color="666"
          mode="vertical"
        >
          <el-menu-item index="/index">
                   <el-icon> <IconifyOffline :icon="Home"></IconifyOffline> </el-icon> <span>首页</span> 
          </el-menu-item>
          <menu-tree :listData="listData"></menu-tree>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>
            <TabBar></TabBar>
        </el-header>
        <el-main>
          <router-view v-if="isDestroy"/>
        </el-main>
        <el-footer>Footer</el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import MenuTree from '@/components/MenuTree.vue';
import { useSettingStore } from '@/store/setting';
import {useUserStore} from '@/store/user'
import { nextTick, ref,watch } from 'vue';

// import { ElMessage } from 'element-plus'
const userStore = useUserStore()
const listData = ref([])
listData.value = userStore.userMenu

//路由对象--获取路由参数
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()

// 处理刷新业务

const isDestroy = ref(true)

const settingStore = useSettingStore()

watch(()=>settingStore.refresh,()=>{
  isDestroy.value = false
  nextTick(()=>{
    isDestroy.value = true
  })
})


// 面包屑

/* const breadList = ref([])

function getBreadList(){
  breadList.value =  route.matched
}
getBreadList()

watch(route, () => getBreadList()); */

// 处理菜单的默认展开
const handelUrl = ref('/')
handelUrl.value = route.path 
watch(()=>route.path,()=>{
  handelUrl.value = route.path 
})



</script>

<style lang="scss" scoped>
.el-container{
  height: 100vh;
}

.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

}

.el-aside {
  background-color: coral;
}
</style>