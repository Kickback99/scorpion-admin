<template>
  <div class="common-layout">
    <el-container>
      <el-aside :style="{backgroundColor: 'var(--sidebar-bg)'}" :class="{ 'menu-follow-off': !settingStore.menuFollow }">
          <Logo></Logo>
          <el-scrollbar class=scrollbar>
        <el-menu router
          ref="menuRef"
          active-text-color="var(--el-color-primary)"
          :default-active="handelUrl"
          text-color="var(--sidebar-text)"
          mode="vertical"
          :collapse="userConfigStore.collapse_enabled"
          :collapse-transition="false"
          @open="handleExclusiveMenuOpen"
          @close="handleMenuClose"
        >
          <el-menu-item index="/index">
                   <el-icon> <SingleIcon :icon="'ep:home-filled'"></SingleIcon> </el-icon> <span>仪表盘</span>
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

// 菜单激活项引用
const menuRef = ref(null)

// ============================================================
// 排它式菜单展开（经典手风琴模式）
// ============================================================

/** 追踪所有已展开的子菜单 index */
const openedSubMenus = ref([])

/**
 * 排它式菜单展开（经典手风琴模式）
 * 只展开 indexPath 指定链路上的子菜单，折叠其余所有已展开的子菜单
 *
 * 调用时机（统一入口）：
 * 1. 点击左侧菜单展开子菜单 → el-menu @open 事件
 * 2. 点击标签页切换路由   → default-active 变更触发 auto-expand → @open 事件
 * 3. SmartMenuSearch 搜索  → router.push → default-active 变更 → @open 事件
 *
 * @param {string} index    - 当前展开的子菜单 index
 * @param {string[]} indexPath - 从根到当前菜单的完整 index 路径链
 */
const handleExclusiveMenuOpen = (index, indexPath) => {
  if (!menuRef.value) return

  // 关闭所有不在当前 indexPath 链路中的已展开子菜单
  // 排除自身及子孙：以当前 index 为前缀的菜单也不关闭（如展开 /system 时不关闭 /system/user）
  const toClose = openedSubMenus.value.filter(i => {
    if (indexPath.includes(i)) return false
    if (i.startsWith(index + '/')) return false
    return true
  })
  toClose.forEach(i => menuRef.value.close(i))

  // 同步追踪列表
  openedSubMenus.value = openedSubMenus.value.filter(i => !toClose.includes(i))
  if (!openedSubMenus.value.includes(index)) {
    openedSubMenus.value.push(index)
  }
}

/**
 * 子菜单关闭时同步追踪列表
 * @param {string} index - 关闭的子菜单 index
 */
const handleMenuClose = (index) => {
  openedSubMenus.value = openedSubMenus.value.filter(i => i !== index)
}

/**
 * 收集目标路由在动态菜单树中的所有祖先 sub-menu index
 * 借鉴 tree.js findByName 的递归收集模式
 * @param {Array} list - 菜单树节点
 * @param {string} targetPath - 目标路由路径
 * @param {string[]} ids - 收集的 sub-menu index（原地修改）
 * @returns {boolean} 是否找到
 */
const collectAncestors = (list, targetPath, ids) => {
  for (const m of list) {
    if (m.hidden) continue
    const t = m.type || ''
    const hasChild = m.children?.length > 0
    // 路由路径对齐 handleChildren 逻辑
    const rp = m._addToParentNode ? `/${t}` : m.level ? `/${t}/${m.parentPath}/${m.path}` : `/${t}/${m.path}`
    if (!hasChild && rp === targetPath) return true
    if (hasChild) {
      // sub-menu index 对齐 MenuTree.vue 格式
      ids.push(`/system/${m.path}`)
      if (collectAncestors(m.children, targetPath, ids)) return true
      ids.pop()
    }
  }
  return false
}

// 路由变化时自动滚动侧边栏 + 排它菜单清理
watch(() => route.path, () => {
  handelUrl.value = route.path
  nextTick(() => {
    // 收集当前路由的祖先 sub-menu index（动态 + 静态）
    const ids = []
    const found = collectAncestors(userStore.userMenu, route.path, ids)
    // 静态菜单兜底
    if (!found) {
      const parts = route.path.split('/').filter(Boolean)
      // 路径段数 > 1：首段即为父级 index（如 /user/profile → /user）
      if (parts.length > 1) {
        ids.push('/' + parts[0])
      } else if (tempMenuConfig.some(item => item.path === route.path)) {
        // temp1~15 路径扁平无前缀，归入 /template 子菜单
        ids.push('/template')
      }
    }
    const toClose = openedSubMenus.value.filter(i => !ids.includes(i))
    toClose.forEach(i => menuRef.value?.close(i))
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

<style lang="scss">
/* ============================================================
   menuFollow=false — 侧边栏中性色背景 + 普通文字（激活项主色）
   ============================================================ */
.el-aside.menu-follow-off {
  --sidebar-bg: var(--el-fill-color-light);
  --sidebar-text: var(--el-text-color-primary);
  --el-menu-bg-color: var(--el-fill-color-light);
  --el-menu-text-color: var(--el-text-color-primary);
  --el-menu-hover-bg-color: var(--el-fill-color);
}

/* Logo 文字色：默认白色（侧边栏深色），浅色模式 + menuFollow=false 切换深色 */
.el-aside {
  --logo-text-color: #fff;
}
html:not(.dark) .el-aside.menu-follow-off {
  --logo-text-color: var(--el-text-color-primary);
}
/* LogoNeon / LogoMultiNeon 在浅色中性底下降一级为中灰 */
html:not(.dark) .el-aside.menu-follow-off .logo-neon p,
html:not(.dark) .el-aside.menu-follow-off .logo-multi-neon p {
  --logo-text-color: var(--el-text-color-placeholder);
}
</style>