<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="220px">
        <el-menu router
        popper-class="menuList"
      active-text-color="palegreen" 
          background-color="transparent" 
          :default-active="handelUrl"
          :text-color="finalColor"
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
import TabBar from '@/components/TabBar.vue';
import {useUserStore} from '@/store/user'
import { computed, nextTick, onMounted, ref,watch } from 'vue';
import {useSettingStore} from '@/store/setting'

// 方式一：使用css变量动态设置el-menu的text-color属性值
// const textColor = ref('')

/* onMounted(()=>{
  const styles =  getComputedStyle(document.documentElement)
  textColor.value = styles.getPropertyValue('--text')
}) */

// 方式二：使用颜色选择器和pinia仓库动态设置el-menu的text-color属性值
const settingStore =  useSettingStore()
const finalColor =  computed(()=>settingStore.menuTextColor)

// import { ElMessage } from 'element-plus'
const userStore = useUserStore()

const listData = computed(()=>
  userStore.userMenu
)

//路由对象--获取路由参数
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()

// 处理刷新业务

const isDestroy = ref(true)


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
  @include flex(space-between,center,null)

}

.el-aside {
  background-color: $menu-background;
}

 /*  .el-menu-item,.el-sub-menu__title{
    color:$menu-color
  } */

</style>