<template>
  <!-- 区块1: 固定右下角铃铛按钮 -->
  <div class="notice-bell-wrapper">
    <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99">
      <el-button type="primary" circle :icon="Bell" size="medium" @click="handleTogglePopover" />
    </el-badge>
  </div>

  <!-- 区块2: 弹出列表卡片 -->
  <el-popover
    :visible="popoverVisible"
    placement="top-end"
    :width="420"
    trigger="manual"
    :hide-on-click="false"
    @hide="popoverVisible = false"
  >
    <template #reference>
      <div style="position: fixed; bottom: 20px; right: 20px; width: 0; height: 0;" />
    </template>

    <div class="popover-header">
      <span class="popover-title">公告通知</span>
      <div class="popover-header-actions">
        <el-button v-if="unreadCount > 0" type="primary" link size="small" @click="handleMarkAllRead">全部已读</el-button>
        <el-button :icon="Close" link size="small" @click="popoverVisible = false" />
      </div>
    </div>

    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="未读" name="unread">
        <div v-loading="loading" class="notice-list">
          <div v-for="item in unreadList" :key="item.id" class="notice-item">
            <span class="notice-title">{{ item.title }}</span>
            <div class="notice-actions">
              <el-button type="primary" link size="small" @click="handleViewDetail(item)">查看详情</el-button>
              <el-button type="success" link size="small" @click="handleMarkRead(item.id)">已读</el-button>
            </div>
          </div>
          <el-empty v-if="!loading && unreadList.length === 0" description="暂无未读公告" :image-size="0" class="empty-no-icon"/>
        </div>
        <!-- 分页 -->
        <div v-if="unreadTotal > pageSize" class="notice-pagination">
          <el-pagination
            v-model:current-page="pageNum"
            :page-size="pageSize"
            :total="unreadTotal"
            size="small"
            layout="prev, pager, next"
            @current-change="fetchUnreadList"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="已读" name="read">
        <div v-loading="readLoading" class="notice-list">
          <div v-for="item in readList" :key="item.id" class="notice-item">
            <span class="notice-title">{{ item.title }}</span>
            <div class="notice-actions">
              <el-button type="primary" link size="small" @click="handleViewDetail(item)">查看详情</el-button>
            </div>
          </div>
          <el-empty v-if="!readLoading && readList.length === 0" description="暂无已读公告" :image-size="0" />
        </div>
        <!-- 分页 -->
        <div v-if="readTotal > pageSize" class="notice-pagination">
          <el-pagination
            v-model:current-page="readPageNum"
            :page-size="pageSize"
            :total="readTotal"
            size="small"
            layout="prev, pager, next"
            @current-change="fetchReadList"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-popover>

  <!-- 区块4: 详情弹窗 -->
  <el-dialog v-model="detailVisible" :title="currentNotice?.title || '公告详情'" width="650px" destroy-on-close>
    <div class="notice-meta">
      <span class="meta-time">推送时间：{{ currentNotice?.pushTime || '-' }}</span>
    </div>
    <el-divider />
    <div v-if="currentNotice?.type === 0" class="notice-body">{{ currentNotice?.content || '' }}</div>
    <div v-else :class="{ 'dark-mode': userConfigStore.isDarkEnabled }" class="detail-panel">
      <component :is="MarkdownPreview" :text="currentNotice?.content || ''" />
    </div>
  </el-dialog>
</template>

<script setup>
// 1. 导入
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Bell, Close } from '@element-plus/icons-vue'
import { noticeUnreadListApi, noticeUnreadCountApi, noticeMarkReadApi, noticeReadListApi, noticeMarkAllReadApi } from '@/api/notice'
import { createMarkdownPreview } from '@/utils/markdown-config'
import { useUserConfigStore } from '@/store/userConfig'

const userConfigStore = useUserConfigStore()
const MarkdownPreview = computed(() => {
  return createMarkdownPreview(userConfigStore.isDarkEnabled ? 'vuepress' : 'github', true)
})

// 2. 状态
const popoverVisible = ref(false)
const activeTab = ref('unread')
const unreadList = ref([])
const unreadCount = ref(0)
const unreadTotal = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const readList = ref([])
const readTotal = ref(0)
const readPageNum = ref(1)
const readLoading = ref(false)
const detailVisible = ref(false)
const currentNotice = ref(null)

// 3. 常量
// (无)

// 4. 数据获取
const fetchUnreadCount = async () => {
  try {
    const res = await noticeUnreadCountApi()
    unreadCount.value = res.data || 0
  } catch (e) {
    console.error('获取未读数量失败:', e)
  }
}

const fetchUnreadList = async () => {
  loading.value = true
  try {
    const res = await noticeUnreadListApi(pageNum.value, pageSize.value)
    unreadList.value = res.data?.items || []
    unreadTotal.value = res.data?.total || 0
  } catch (e) {
    console.error('获取未读列表失败:', e)
  } finally {
    loading.value = false
  }
}

const fetchReadList = async () => {
  readLoading.value = true
  try {
    const res = await noticeReadListApi(readPageNum.value, pageSize.value)
    readList.value = res.data?.items || []
    readTotal.value = res.data?.total || 0
  } catch (e) {
    console.error('获取已读列表失败:', e)
  } finally {
    readLoading.value = false
  }
}

// 5. 操作
const handleTogglePopover = () => {
  popoverVisible.value = !popoverVisible.value
  if (popoverVisible.value) {
    pageNum.value = 1
    if (activeTab.value === 'unread') {
      fetchUnreadList()
    } else {
      readPageNum.value = 1
      fetchReadList()
    }
  }
}

const handleTabChange = (tab) => {
  if (tab === 'read' && readList.value.length === 0) {
    readPageNum.value = 1
    fetchReadList()
  }
}

const handleViewDetail = (notice) => {
  currentNotice.value = notice
  detailVisible.value = true
}

const handleMarkRead = async (noticeId) => {
  try {
    await noticeMarkReadApi(noticeId)
    fetchUnreadCount()
    fetchUnreadList()
    // 已读 Tab 已有数据时刷新
    if (readList.value.length > 0) {
      readPageNum.value = 1
      fetchReadList()
    }
  } catch (e) {
    console.error('标记已读失败:', e)
  }
}

const handleMarkAllRead = async () => {
  try {
    await noticeMarkAllReadApi()
    unreadCount.value = 0
    unreadList.value = []
    unreadTotal.value = 0
  } catch (e) {
    console.error('全部已读失败:', e)
  }
}

// 6. WebSocket 事件处理
let syncTimer = null
const handleNoticePush = () => {
  // 乐观更新：立即 +1，避免竞态
  unreadCount.value++
  // 如果弹窗已打开，同时刷新列表
  if (popoverVisible.value) {
    fetchUnreadList()
  }
  // 去抖同步：300ms 内多次推送只发一次 API 校准
  clearTimeout(syncTimer)
  syncTimer = setTimeout(() => fetchUnreadCount(), 300)
}

// 7. 生命周期
onMounted(() => {
  fetchUnreadCount()
  window.addEventListener('notice-push', handleNoticePush)
  window.addEventListener('notice-refresh', fetchUnreadCount)
})

onUnmounted(() => {
  window.removeEventListener('notice-push', handleNoticePush)
  window.removeEventListener('notice-refresh', fetchUnreadCount)
})

// 8. 暴露
defineExpose({})
</script>

<style lang="scss" scoped>
.notice-bell-wrapper {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 2000;

  :deep(.el-badge__content) {
    background-color: var(--el-color-danger);
  }
}

.popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  margin-bottom: 4px;
  // border-bottom: 1px solid var(--el-border-color-lighter);

  .popover-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .popover-header-actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.notice-list {
  min-height: 200px;
  max-height: 360px;
  overflow-y: auto;
}

.notice-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &:last-child {
    border-bottom: none;
  }

  .notice-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--el-text-color-primary);
    margin-right: 8px;
  }

  .notice-actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }
}

.notice-pagination {
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

.notice-meta {
  display: flex;
  align-items: center;
  gap: 12px;

  .meta-time {
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }
}

.notice-body {
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--el-text-color-primary);
  line-height: 1.7;
  max-height: 400px;
  overflow-y: auto;
}

:deep(.el-empty .el-empty__image) {
  display: none !important;
  margin: 0;
}

.dark-mode {
  :deep(.v-md-editor) {
    background-color: #000 !important;
  }
  :deep(.v-md-editor__preview-wrapper) {
    background: black !important;
  }
  :deep(.vuepress-markdown-body) {
    color: #fff;
    background: black !important;
  }
}

/* 代码高亮 + 表格样式（同步 Markdown.vue scoped 块） */
.detail-panel {
  :deep(.vuepress-markdown-body code) {
    color: $code-color !important;
    .token .operator {
      background-color: transparent !important;
    }
    .token.operator, .token.entity, .token.url, .language-css .token.string, .style .token.string {
      background-color: transparent !important;
    }
  }
  :deep(.vuepress-markdown-body img){
    width: $notice-img !important;
    margin: $notice-img-margin !important;
  }
  :deep(.vuepress-markdown-body tr:nth-child(2n)) {
    color: black;
  }
}
</style>
