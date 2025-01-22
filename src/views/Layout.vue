<template>
  <div class="common-layout">
    <el-container>
      <el-aside :style="{backgroundColor: finalBg}">
          <Logo></Logo>
          <el-scrollbar class=scrollbar>
        <el-menu router
          :active-text-color="finalActive" 
          :background-color="finalBg" 
          :default-active="handelUrl"
          :text-color="finalColor"
          mode="vertical"
          :collapse="settingStore.isCollapse"
          :collapse-transition="false"
        >
          <el-menu-item index="/index">
                   <el-icon> <IconifyOffline :icon="'ep:home-filled'"></IconifyOffline> </el-icon> <span>首页</span> 
          </el-menu-item>
          <menu-tree :listData="listData"></menu-tree>
        </el-menu>
      </el-scrollbar>
      </el-aside>
      <el-container>
        <el-header>
            <TabBar></TabBar>
        </el-header>
        <el-main>
            <el-scrollbar>
            <router-view v-if="isDestroy"/>
          </el-scrollbar>
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
import {useColorStore} from '@/store/color'
import {useSettingStore} from '@/setting'
//路由对象--获取路由参数
import { useRoute } from 'vue-router'
import Logo from '@/components/logo/index.vue';

// 方式一：使用css变量动态设置el-menu的text-color属性值
// const textColor = ref('')

/* onMounted(()=>{
  const styles =  getComputedStyle(document.documentElement)
  textColor.value = styles.getPropertyValue('--text')
}) */

// 方式二：使用颜色选择器和pinia仓库动态设置el-menu的text-color属性值
const colorStore = useColorStore()
const finalColor =  computed(()=>colorStore.menuTextColor)

// 菜单背景颜色
const finalBg = computed(()=>colorStore.menuBg)

// 菜单高亮颜色
const finalActive = computed(()=>colorStore.menuActive)

// import { ElMessage } from 'element-plus'
const userStore = useUserStore()

const listData = computed(()=>
  userStore.userMenu
)



const route = useRoute()

// 处理刷新业务

const isDestroy = ref(true)

const settingStore =  useSettingStore()
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
  width: auto;
  background-color: $menu-background;
  height: 100vh;
  &::-webkit-scrollbar {
    width: 0;
  }
  .el-menu {
    border-right: none;
    &.el-menu--collapse {
      width: $menu-min-width;
    }
    &:not(.el-menu--collapse){
      width: 220px;
    }
  }
}

.el-aside:has(.el-menu.el-menu--collapse){
  width: $menu-min-width;
}

// 滚动条样式

.scrollbar {
  height: calc(100vh - $base-menu-logo-height);
}

/* .content-scrollbar {
  max-height: calc(100vh - 50px);
} */

 /*  .el-menu-item,.el-sub-menu__title{
    color:$menu-color
  } */

</style>