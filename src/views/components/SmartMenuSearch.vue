<!-- src/views/components/SmartMenuSearch.vue -->
<template>
  <!-- ===== 菜单搜索 ===== -->
  <div class="smart-menu-search" ref="containerRef">
    <!-- 折叠：圆形按钮，和 Refresh/FullScreen/Setting 完全一致 -->
    <el-button v-if="!isFocused" circle @click="handleTriggerClick">
      <el-icon><Search /></el-icon>
    </el-button>

    <!-- 展开：图标 + 输入框 + 下拉结果 -->
    <div v-else class="search-expanded">
      <div class="search-input-row">
        <el-icon class="search-input-icon" @click="handleTriggerClick"><Search /></el-icon>
        <input
          ref="inputRef"
          v-model="query"
          class="search-input-field"
          placeholder="搜索菜单..."
          @keydown="handleKeydown"
        />
      </div>

      <div class="search-results" v-if="displayList.length > 0">
        <div v-if="!query.trim()" class="results-header">最近访问</div>
        <div
          v-for="(item, index) in displayList"
          :key="item.path"
          class="result-item"
          :class="{ 'is-active': index === activeIndex }"
          @mousedown.prevent="navigateTo(item)"
          @mouseenter="activeIndex = index"
        >
          <el-icon class="result-item-icon">
            <SingleIcon :icon="item.icon || 'ep:menu'" />
          </el-icon>
          <div class="result-item-text">
            <span class="result-item-title" v-html="highlight(item.title)"></span>
            <span class="result-item-breadcrumb">{{ item.breadcrumb.join(' › ') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// ============================================================
// 依赖导入
// ============================================================
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import PinyinMatch from 'pinyin-match'

const router = useRouter()
const userStore = useUserStore()

// ============================================================
// 数据
// ============================================================
const query = ref('')
const isFocused = ref(false)
const activeIndex = ref(0)
const inputRef = ref(null)
const containerRef = ref(null)
const recentList = ref([])

const MAX_RECENT = 5

// ============================================================
// 菜单扁平化
// ============================================================

/**
 * 将 userMenu 树递归展平为可搜索的菜单项列表
 * 父级菜单（Layout / ParentView）解析到第一个子叶路径用于导航
 */
const flattenMenu = (menus, typePrefix = '', parentPath = '', breadcrumb = []) => {
  const result = []

  for (const menu of menus) {
    if (menu.hidden) continue

    const title = menu.meta?.title || menu.path || ''
    const icon = menu.meta?.icon || 'ep:menu'
    const currentBreadcrumb = [...breadcrumb, title]
    const currentType = menu.type || typePrefix
    const isParent = menu.component === 'Layout' || menu.component === 'ParentView'
    const isList = menu.component === 'list'

    if (menu.children && menu.children.length > 0 && !isList) {
      const firstLeafPath = resolveFirstLeaf(menu, currentType)
      result.push({ title, icon, path: firstLeafPath, breadcrumb: currentBreadcrumb })

      const childOptions = flattenMenu(
        menu.children,
        currentType,
        menu.component === 'ParentView' ? menu.path : '',
        currentBreadcrumb,
      )
      result.push(...childOptions)
    } else {
      let fullPath
      if (menu._addToParentNode) {
        fullPath = `/${currentType}`
      } else if (parentPath) {
        fullPath = `/${currentType}/${parentPath}/${menu.path}`
      } else {
        fullPath = `/${currentType}/${menu.path}`
      }

      result.push({ title, icon, path: fullPath, breadcrumb: currentBreadcrumb })
    }
  }

  return result
}

const resolveFirstLeaf = (menu, typePrefix) => {
  if (!menu.children || menu.children.length === 0) {
    if (menu._addToParentNode) return `/${typePrefix}`
    return `/${typePrefix}/${menu.path}`
  }
  const firstChild = menu.children[0]
  const parentPath = menu.component === 'ParentView' ? menu.path : ''
  return resolveChildPath(firstChild, typePrefix, parentPath)
}

const resolveChildPath = (menu, typePrefix, parentPath) => {
  if (menu.children && menu.children.length > 0 && menu.component !== 'list') {
    const nextParent = menu.component === 'ParentView' ? menu.path : parentPath
    return resolveChildPath(menu.children[0], typePrefix, nextParent)
  }
  if (menu._addToParentNode) return `/${typePrefix}`
  if (parentPath) return `/${typePrefix}/${parentPath}/${menu.path}`
  return `/${typePrefix}/${menu.path}`
}

const allMenuItems = computed(() => flattenMenu(userStore.userMenu))

// ============================================================
// 搜索
// ============================================================

const filteredItems = computed(() => {
  const q = query.value.trim()
  if (!q) return []

  const lowerQ = q.toLowerCase()
  return allMenuItems.value.filter(item => {
    const text = item.title
    const lowerText = text.toLowerCase()

    if (lowerText.includes(lowerQ)) return true
    if (PinyinMatch.match(text, q)) return true
    if (item.path.toLowerCase().includes(lowerQ)) return true
    if (item.breadcrumb.join(' ').toLowerCase().includes(lowerQ)) return true
    try {
      const initials = text.split(/[\s\-_]+/).map(w => w[0]).join('').toLowerCase()
      if (initials.includes(lowerQ)) return true
    } catch { /* 忽略 */ }

    return false
  })
})

const displayList = computed(() => {
  if (query.value.trim()) return filteredItems.value
  return recentList.value.filter(item =>
    allMenuItems.value.some(m => m.path === item.path),
  )
})

const highlight = (text) => {
  const q = query.value.trim()
  if (!q) return text
  const idx = text.toLowerCase().indexOf(q.toLowerCase())
  if (idx === -1) return text
  return (
    text.substring(0, idx) +
    '<strong>' +
    text.substring(idx, idx + q.length) +
    '</strong>' +
    text.substring(idx + q.length)
  )
}

// ============================================================
// 导航
// ============================================================

const navigateTo = (item) => {
  const exists = recentList.value.findIndex(r => r.path === item.path)
  if (exists !== -1) recentList.value.splice(exists, 1)
  recentList.value.unshift({ title: item.title, path: item.path, icon: item.icon, breadcrumb: item.breadcrumb })
  if (recentList.value.length > MAX_RECENT) recentList.value.pop()

  router.push(item.path)
  // 只清空输入，保持焦点和下拉可见，方便继续搜索
  query.value = ''
  activeIndex.value = 0
}

// ============================================================
// 交互
// ============================================================

const resetState = () => {
  query.value = ''
  isFocused.value = false
  activeIndex.value = 0
}

const handleTriggerClick = () => {
  if (isFocused.value) {
    query.value = ''
    activeIndex.value = 0
  }
  isFocused.value = true
  nextTick(() => inputRef.value?.focus())
}

const handleKeydown = (e) => {
  const list = displayList.value

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      activeIndex.value = Math.min(activeIndex.value + 1, list.length - 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      activeIndex.value = Math.max(activeIndex.value - 1, 0)
      break
    case 'Enter':
      e.preventDefault()
      if (list.length > 0 && activeIndex.value >= 0) {
        navigateTo(list[activeIndex.value])
      }
      break
    case 'Escape':
      inputRef.value?.blur()
      resetState()
      break
  }
}

watch(query, () => { activeIndex.value = 0 })

const handleClickOutside = (e) => {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    query.value = ''
    isFocused.value = false
    activeIndex.value = 0
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style scoped lang="scss">
.smart-menu-search {
  position: relative;
  display: inline-flex;
  vertical-align: middle;
  margin-left: 12px;
}

// ============================================================
// 展开态：图标 + 输入框（内联，图标右侧）
// ============================================================
.search-expanded {
  position: relative;
  display: inline-flex;
}

.search-input-row {
  display: flex;
  align-items: center;
  height: 32px;
  width: 200px;
  border: 1px solid var(--el-color-primary);
  border-radius: 6px;
  background: var(--el-bg-color);
}

.search-input-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
}

.search-input-field {
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: var(--el-text-color-regular);
  padding-right: 8px;

  &::placeholder {
    color: var(--el-text-color-placeholder);
  }
}

// ============================================================
// 下拉结果（输入框下方弹出）
// ============================================================
.search-results {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 3000;
}

.results-header {
  padding: 8px 12px 4px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover,
  &.is-active {
    background: var(--el-fill-color-light);
  }

  .result-item-icon {
    flex-shrink: 0;
    font-size: 18px;
    color: var(--el-text-color-regular);
  }

  .result-item-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .result-item-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-regular);

    :deep(strong) {
      color: var(--el-color-primary);
    }
  }

  .result-item-breadcrumb {
    font-size: 11px;
    color: var(--el-text-color-secondary);
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
