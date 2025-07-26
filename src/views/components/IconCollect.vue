<template>
    <!-- 隐藏的预加载容器 -->
    <div style="display: none;">
      <component 
        v-for="(item, index) in preloadedComponents" 
        :key="index"
        :is="item.component" 
      />
    </div>

  <div class="icons-container">
      <el-input
        v-model="filterValue"
        placeholder="搜索图标"
        clearable
        @clear="onClear"
      />

    <el-tabs v-model="currentActiveType" @tab-click="handleClick">
      <el-tab-pane
        v-for="(pane, index) in filteredTabsList"
        :key="index"
        :label="pane.label"
        :name="pane.name"
      >
        <el-scrollbar class="icon-scrollbar">
          <ul class="flex flex-wrap px-2 ml-2">
            <li
              v-for="(item, key) in pageList"
              :key="key"
              :title="item"
              class="icon-item p-2 cursor-pointer mr-1 mt-1 flex justify-center items-center border border-[#e5e7eb]"
              style="width: 37.6px; height: 37.6px; min-width: 37.6px; min-height: 37.6px;"
              @click="copyIconName(item)"
            >
                <OnlineIcon
                  v-if="currentActiveType === 'online'"
                  :icon="item"
                  width="20px"
                  height="20px"
                />
                <OfflineIcon 
                  v-else
                  :icon="item"
                  width="20px"
                  height="20px"
                  :isCollect="false"
                />
            </li>
          </ul>
          <el-empty
            v-show="pageList.length === 0"
            description="未找到匹配的图标"
            :image-size="60"
          />
        </el-scrollbar>
      </el-tab-pane>
    </el-tabs>

    <div class="pagination-container">
      <el-pagination
        :total="totalPage * pageSize"
        :current-page="currentPage"
        :page-size="pageSize"
        :pager-count="5"
        layout="prev, pager, next"
        background
        small
        @current-change="onCurrentChange"
      />
      <el-button
        class="clear-btn"
        type="danger"
        size="small"
        text
        bg
        @click="onClear"
      >
        清空
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { useIconStore } from '@/store/icon'
import { ref, computed,onMounted,nextTick } from 'vue'
import { addBatchIconList } from '@/components/MyIcon/src/iconifyBachOffline'
import { useRoute } from 'vue-router'
import { getDynamicRouteComponents } from '@/utils/routeComponents'
import { getLocalRouteComponents } from '@/router'
import { useLoadStore } from '@/store/load'

const route = useRoute()
const preloadedComponents = ref([])
const loadStore = useLoadStore()
const iconStore = useIconStore()


onMounted(async () => {
  try {
    // 获取所有路由组件 (本地 + 动态)
    const localComponents = getLocalRouteComponents();
    const dynamicComponents = getDynamicRouteComponents(loadStore.excludeDynamicComponents);
    const allComponents = [...localComponents, ...dynamicComponents];

    console.log('All route components:', allComponents);
    
    // 初始化预加载组件数组
    preloadedComponents.value = allComponents.map(route => ({
      path: route.path,
      name: route.name,
      component: null,
      loaded: false
    }));
    
    // 并行加载所有组件
    const loadPromises = allComponents.map(async (route, index) => {
      if (loadStore.isComponentLoaded(route.name)) {
        console.log(`⏩ 已跳过加载: ${route.name} (已缓存)`)
        return
      }
      
      try {
        // 如果是动态导入函数则执行，否则直接使用组件
        const module = typeof route.component === 'function' 
          ? await route.component() 
          : route.component;
          
        preloadedComponents.value[index].component = module.default || module;
        preloadedComponents.value[index].loaded = true;
        loadStore.setComponentLoaded(route.name)
        console.log(`✅ 已静默加载: ${route.name}`)
      } catch (error) {
        console.error(`❌ 加载组件 ${route.name} 失败:`, error);
      }
    });
    console.log('preloadedComponents',preloadedComponents.value)
    await Promise.all(loadPromises);
    console.log("所有路由组件已静默预加载");

    // 所有组件加载完成后，在下一个tick中统一销毁
    if (preloadedComponents.value.some(comp => comp.loaded)) {
      nextTick(() => {
        console.log('所有组件已挂载，开始清理...')
        preloadedComponents.value = []
      })
    }
  } catch (err) {
    console.error('预加载组件失败:', err)
  }
})

/* onMounted(async () => {

  // 动态导入 Index.vue
   const module = await import("@/views/Index.vue");
  IndexComponent.value = module.default;
      await collectIconsFromSource()
  console.log("Index.vue 已加载并挂载（但隐藏）"); 
}); */

/* onMounted(async () => {
      // 添加延迟确保应用完全加载
      setTimeout(async () => {

      }, 2000)
    }) */

// 每页显示的图标数量
const pageSize = ref(33)
const currentPage = ref(1)
const currentActiveType = ref('online')
const filterValue = ref('')

// tabs数据 - 按照你提供的分类方式
const tabsList = [
  {
    label: "在线图标",
    name: "online",
    icons: () => iconStore.onlineIcons // 使用getter
  },
  {
    label: "批量图标",
    name: "batch",
    icons: () => iconStore.batchIcons
  },
    {
    label: "批量图标已使用",
    name: "batchUsed",
    icons: () => iconStore.batchUsedIcons
  },
  {
    label: "单个图标",
    name: "single",
    icons: () => iconStore.singleIcons
  },
  {
    label: "自定义图标",
    name: "custom",
    icons: () => iconStore.customIcons,
    show: () => iconStore.customIcons.length > 0
  }
]

// 过滤后的标签页列表（不显示空分类）
const filteredTabsList = computed(() => {
  return tabsList.filter(tab => {
    if (tab.show) return tab.show()
    return true
  })
})

// 当前显示的图标列表
const currentIcons = computed(() => {
  const tab = tabsList.find(t => t.name === currentActiveType.value)
  if (!tab) return []
  
  return tab.icons().filter(icon => {
    if (typeof icon === 'string') {
      return icon.toLowerCase().includes(filterValue.value.toLowerCase())
    }
    return true
  })
})

// 分页后的图标列表
const pageList = computed(() => {
  return currentIcons.value.slice(
    (currentPage.value - 1) * pageSize.value,
    currentPage.value * pageSize.value
  )
})

// 总页数
const totalPage = computed(() => {
  return Math.ceil(currentIcons.value.length / pageSize.value)
})

// 切换页码
function onCurrentChange(page) {
  currentPage.value = page
}

const batchArr = []

// 切换标签页
function handleClick({ props }) {
  currentPage.value = 1
  currentActiveType.value = props.name
}

// 复制图标名称到剪贴板
async function copyIconName(icon) {
  try {
    const iconName = typeof icon === 'string' ? icon : JSON.stringify(icon)
    await navigator.clipboard.writeText(iconName)
    ElMessage.success('图标已复制')
  } catch (err) {
    console.error('复制失败:', err)
    ElMessage.error('复制失败')
  }
}

// 清空搜索
function onClear() {
  filterValue.value = ''
  currentPage.value = 1
}

/* const getIconColor = (icon) => {
  return iconStore.isExcludeInline && iconStore.onlineIconsGets.includes(icon) ? '#ccc' : ''
} */
</script>



<style lang="scss" scoped>
.icons-container {
  height: 100%;
  width: 500px;
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 8px; /* 减少间距 */
}

.search-container {
//   width: 250px;
  // padding: 0 12px;
}

// tabs内容区的总高度
.icon-scrollbar {
    height: 140px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 8px;
  padding: 12px;
  margin: 0;
}
.icon-item {
  border: 1px #e5e7eb solid;
  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary);
    transition: all 0.4s;
    transform: scaleX(1.05);
  }
}


.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  margin-top: 4px; /* 减少上边距 */
}

.clear-btn {
  margin-left: 12px;
}

/* 保持与Select.vue一致的标签页样式 */
:deep(.el-tabs__nav-next),
:deep(.el-tabs__nav-prev) {
  font-size: 15px;
  line-height: 32px;
}

:deep(.el-tabs__nav-next) {
  box-shadow: -5px 0 5px -6px #ccc;
}

:deep(.el-tabs__nav-prev) {
  box-shadow: 5px 0 5px -6px #ccc;
}

:deep(.el-tabs__item) {
  height: 30px;
  font-size: 12px;
  font-weight: normal;
  line-height: 30px;
}

:deep(.el-tabs__header),
:deep(.el-tabs__nav-wrap) {
  position: static;
  margin: 0;
  // box-shadow: 0 2px 5px rgb(0 0 0 / 6%);
}

:deep(.el-tabs__nav-wrap::after) {
  height: 0;
}

:deep(.el-tabs__nav-wrap) {
  padding: 0 10px;
}
</style>