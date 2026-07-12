<template>
  <div class="common-layout">
    <el-container>
      <el-aside :style="{backgroundColor: 'var(--sidebar-bg)'}">
          <Logo></Logo>
          <el-scrollbar class=scrollbar>
        <el-menu router
          active-text-color="var(--el-color-primary)"
          background-color="var(--sidebar-bg)"
          :default-active="handelUrl"
          text-color="var(--sidebar-text)"
          mode="vertical"
          :collapse="userConfigStore.collapse_enabled"
          :collapse-transition="false"
        >
          <el-menu-item index="/index">
                   <el-icon> <SingleIcon :icon="'ep:home-filled'"></SingleIcon> </el-icon> <span>首页</span> 
          </el-menu-item>

              <el-sub-menu index="/template">
                <template #title>
                  <el-icon><Document /></el-icon>
                  <span>模板页面</span>
                </template>
                
                <el-menu-item 
                  v-for="item in tempMenuConfig" 
                  :key="item.path"
                  :index="item.path"
                >
                  {{ item.title }}
                </el-menu-item>
            </el-sub-menu>
      
          <menu-tree :listData="listData"></menu-tree>

          			<!--多级菜单-->
          <el-sub-menu index="/user">
                <template #title>
                    <el-icon><Aim /></el-icon> <span>个人中心</span>
                </template>
			   <!--展开的每一个菜单项-->
                <el-menu-item index="/user/profile">
                    <el-icon><Aim /></el-icon> <span>基本资料</span>
                </el-menu-item>
                <el-menu-item index="/user/rePassword">
					          <el-icon><Aim /></el-icon> <span>重置密码</span>
                </el-menu-item>
            </el-sub-menu>

            <el-menu-item index="/test">
                   <el-icon> <SingleIcon :icon="'ep:home-filled'"></SingleIcon> </el-icon> <span>测试</span> 
            </el-menu-item>
        </el-menu>
      </el-scrollbar>
      </el-aside>
      <el-container>
        <el-header>
            <TabBar></TabBar>
        </el-header>
        <el-main>
            <el-scrollbar>
              <Tabs></Tabs>
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
import {useSettingStore} from '@/setting'
//路由对象--获取路由参数
import { useRoute } from 'vue-router'
import Logo from '@/components/logo/index.vue';
import Tabs from '@/views/tabs/list.vue';
import { tempMenuConfig } from '@/config/menuConfig'
import { useUserConfigStore } from '@/store/userConfig';

const userStore = useUserStore()

const listData = computed(()=>
  userStore.userMenu
)

// 配置存储
const userConfigStore = useUserConfigStore()

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
  // background-color: $menu-background;
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
</style>