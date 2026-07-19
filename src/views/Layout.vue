<template>
  <div class="common-layout">
    <el-container>
      <el-aside :style="{backgroundColor: 'var(--sidebar-bg)'}">
          <Logo></Logo>
          <el-scrollbar class=scrollbar>
        <el-menu router
          ref="menuRef"
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
        <el-main class="main-container">
          <Tabs></Tabs>
          <el-scrollbar v-if="!isConfigRoute" class="main-scrollbar">
            <router-view v-if="isDestroy"/>
          </el-scrollbar>
          <div v-else class="main-scrollbar main-scrollbar--plain">
            <router-view v-if="isDestroy"/>
          </div>
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

// config 模块自己管理滚动，不需要外层 el-scrollbar
const isConfigRoute = computed(() => route.path.startsWith('/config'))

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

// 菜单激活项引用
const menuRef = ref(null)

// 路由变化时自动滚动侧边栏，使当前激活菜单项可见
watch(() => route.path, () => {
  nextTick(() => {
    const activeEl = menuRef.value?.$el?.querySelector('.is-active')
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
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
  display: flex;
  flex-direction: column;
  width: auto;
  height: 100vh;
  overflow: hidden;
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

// 侧边栏滚动区：flex:1 自动填充 Logo 下方剩余高度
.scrollbar {
  flex: 1;
}

// el-main 改为 flex column，Tabs 固定顶部，scrollbar 占满剩余空间
.main-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 20px;
}

.main-scrollbar {
  flex: 1;
}

.main-scrollbar--plain {
  overflow: hidden;
}
</style>