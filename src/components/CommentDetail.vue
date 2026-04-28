<!--
评论详情组件
功能：根据评论类型展示不同的详情内容
类型：
  1. 根评论 - 展示父评论 + 所有子评论
  2. 子评论（回复父评论）- 展示父评论 + 当前子评论（当前高亮）
  3. 嵌套评论（回复子评论）- 展示父评论 + 被回复评论 + 当前评论（当前高亮）
-->
<template>
  <div class="comment-detail-container">
    <!-- 情况1：根评论 - 展示所有子评论 -->
    <div v-if="detailMode === 'parent'" class="detail-box">
      <!-- 父评论（当前评论） -->
      <div class="comment-card">
        <div class="comment-card-header">
          <el-avatar :size="32" :src="comment.userAvatar || defaultAvatar" />
          <div class="comment-card-info">
            <span class="username">{{ comment.username }}</span>
            <span class="time">{{ comment.createTime }}</span>
          </div>
        </div>
        <div class="comment-card-content">{{ comment.content }}</div>
      </div>

      <!-- 子评论列表 -->
      <div class="sub-title">子评论 ({{ children.length }})</div>
      <div class="children-list">
        <div 
          v-for="child in children" 
          :key="child.id" 
          class="comment-card child-card"
          :class="{ 'direct-reply': child.toCommentId === child.rootId }"
        >
          <div class="comment-card-header">
            <el-avatar :size="28" :src="child.userAvatar || defaultAvatar" />
            <div class="comment-card-info">
              <span class="username">{{ child.username }}</span>
              <span class="time">{{ child.createTime }}</span>
            </div>
          </div>
          <div class="comment-card-content">
            <!-- 嵌套回复时显示回复目标 -->
            <span v-if="child.toCommentId !== child.rootId && child.toCommentUserName" class="reply-tag">
              @{{ child.toCommentUserName }}
            </span>
            {{ child.content }}
          </div>
        </div>
        <div v-if="children.length === 0" class="empty-tip">暂无子评论</div>
      </div>
    </div>

    <!-- 情况2：子评论（直接回复父评论）- 展示父评论 + 当前子评论（当前高亮） -->
    <div v-else-if="detailMode === 'childReply'" class="detail-box">
      <!-- 父评论（普通样式） -->
      <div class="sub-title">父评论</div>
      <div class="comment-card">
        <div class="comment-card-header">
          <el-avatar :size="32" :src="parentComment?.userAvatar || defaultAvatar" />
          <div class="comment-card-info">
            <span class="username">{{ parentComment?.username || '未知用户' }}</span>
            <span class="time">{{ parentComment?.createTime || '未知时间' }}</span>
          </div>
        </div>
        <div class="comment-card-content">{{ parentComment?.content || '无内容' }}</div>
      </div>

      <!-- 当前子评论（高亮 + 绿色边框） -->
      <div class="sub-title">当前回复</div>
      <div class="comment-card current-card">
        <div class="comment-card-header">
          <el-avatar :size="32" :src="comment.userAvatar || defaultAvatar" />
          <div class="comment-card-info">
            <span class="username">{{ comment.username }}</span>
            <span class="time">{{ comment.createTime }}</span>
          </div>
        </div>
        <div class="comment-card-content">{{ comment.content }}</div>
      </div>
    </div>

    <!-- 情况3：嵌套评论（回复子评论）- 展示父评论 + 被回复评论 + 当前评论（当前高亮） -->
    <div v-else-if="detailMode === 'nestedReply'" class="detail-box">
      <!-- 父评论（普通样式） -->
      <div class="sub-title">父评论</div>
      <div class="comment-card">
        <div class="comment-card-header">
          <el-avatar :size="32" :src="parentComment?.userAvatar || defaultAvatar" />
          <div class="comment-card-info">
            <span class="username">{{ parentComment?.username || '未知用户' }}</span>
            <span class="time">{{ parentComment?.createTime || '未知时间' }}</span>
          </div>
        </div>
        <div class="comment-card-content">{{ parentComment?.content || '无内容' }}</div>
      </div>

      <!-- 被回复的评论（普通样式） -->
      <div class="sub-title">被回复的评论</div>
      <div class="comment-card">
        <div class="comment-card-header">
          <el-avatar :size="32" :src="replyToComment?.userAvatar || defaultAvatar" />
          <div class="comment-card-info">
            <span class="username">{{ replyToComment?.username || '未知用户' }}</span>
            <span class="time">{{ replyToComment?.createTime || '未知时间' }}</span>
          </div>
        </div>
        <div class="comment-card-content">
          <!-- 被回复的评论如果是嵌套评论，也要显示它的回复目标 -->
          <span v-if="replyToComment?.toCommentId !== replyToComment?.rootId && replyToComment?.toCommentUserName" class="reply-tag">
            @{{ replyToComment.toCommentUserName }}
          </span>
          {{ replyToComment?.content || '无内容' }}
        </div>
      </div>

      <!-- 当前嵌套评论（高亮 + 绿色边框） -->
      <div class="sub-title">当前回复</div>
      <div class="comment-card current-card">
        <div class="comment-card-header">
          <el-avatar :size="32" :src="comment.userAvatar || defaultAvatar" />
          <div class="comment-card-info">
            <span class="username">{{ comment.username }}</span>
            <span class="time">{{ comment.createTime }}</span>
          </div>
        </div>
        <div class="comment-card-content">
          <span class="reply-tag">@{{ replyToComment?.username }}</span>
          {{ comment.content }}
        </div>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-else-if="loading" class="loading-box">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getCommentsApi, getCommentByIdApi } from '@/api/msgcomment'
import { Loading } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  autoLoad: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['loaded', 'error'])

// 数据
const loading = ref(false)
const detailMode = ref(null)  // 'parent', 'childReply', 'nestedReply'
const children = ref([])      // 子评论列表（情况1使用）
const parentComment = ref(null)  // 父评论信息（情况2、3使用）
const replyToComment = ref(null)  // 被回复的评论（情况3使用）

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

/**
 * 加载详情
 * 后端返回的评论数据已包含 username、userAvatar、toCommentUserName 等字段
 * 无需重复请求用户信息
 */
const loadDetail = async () => {
  if (!props.comment) return

  loading.value = true

  try {
    resetState()

    const comment = props.comment

    // 评论类型判断：
    // 1. rootId === -1 : 根评论
    // 2. toCommentUserId !== -1 && toCommentId === rootId : 子评论（回复父评论）
    // 3. toCommentUserId !== -1 && toCommentId !== rootId : 嵌套评论（回复子评论）

    if (comment.rootId === -1) {
      // 情况1：根评论 - 查询子评论列表
      detailMode.value = 'parent'
      const res = await getCommentsApi(1, 999, { rootId: comment.id })
      // 过滤掉父评论本身（后端可能把父评论也返回了）
      children.value = (res.data.items || []).filter(item => item.id !== comment.id)
    } else if (comment.toCommentUserId !== -1 && comment.toCommentId === comment.rootId) {
      // 情况2：子评论 - 查询父评论
      detailMode.value = 'childReply'
      const parentRes = await getCommentByIdApi(comment.rootId)
      parentComment.value = parentRes.data
    } else if (comment.toCommentUserId !== -1 && comment.toCommentId !== comment.rootId) {
      // 情况3：嵌套评论 - 查询父评论和被回复的评论
      detailMode.value = 'nestedReply'
      const parentRes = await getCommentByIdApi(comment.rootId)
      parentComment.value = parentRes.data
      const replyToRes = await getCommentByIdApi(comment.toCommentId)
      replyToComment.value = replyToRes.data
    } else {
      detailMode.value = 'simple'
    }

    emit('loaded', { mode: detailMode.value, comment: props.comment })
  } catch (error) {
    console.error('加载详情失败:', error)
    emit('error', error)
  } finally {
    loading.value = false
  }
}

// 重置状态
const resetState = () => {
  detailMode.value = null
  children.value = []
  parentComment.value = null
  replyToComment.value = null
}

// 监听comment变化
watch(
  () => props.comment,
  () => {
    if (props.autoLoad) {
      loadDetail()
    }
  },
  { immediate: true, deep: true }
)

// 暴露方法
defineExpose({
  loadDetail,
  resetState
})
</script>

<style scoped lang="scss">
.comment-detail-container {
  width: 100%;
}

.detail-box {
  padding: 8px 0;
}

.sub-title {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin: 16px 0 12px 0;
  padding-left: 8px;
  border-left: 3px solid #909399;
}

.comment-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid #ebeef5;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
}

// 当前高亮评论（绿色边框 + 浅绿色背景）
.current-card {
  // background-color: #f0f9ff;
  border-left-color: #67c23a;
}

.comment-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.comment-card-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.username {
  font-weight: bold;
  color: #409eff;
  font-size: 14px;
}

.time {
  font-size: 12px;
  color: #909399;
}

.comment-card-content {
  font-size: 14px;
  color: #303133;
  line-height: 1.5;
  word-break: break-all;
  padding-left: 42px;
}

.reply-tag {
  color: #f56c6c;
  margin-right: 6px;
  font-weight: 500;
}

.children-list {
  padding-left: 20px;
}

.child-card {
  margin-left: 20px;
}

.direct-reply {
  border-left-color: #67c23a;
}

.empty-tip {
  text-align: center;
  padding: 32px;
  color: #909399;
  font-size: 14px;
}

.loading-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px;
  color: #909399;
}
</style>