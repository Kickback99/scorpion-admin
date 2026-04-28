<template>
  <div class="demo-container">
    <h2>评论/聊天组件对比</h2>
    
    <!-- 方案1：Timeline 时间线 -->
    <el-divider content-position="left">方案1：Timeline 时间线</el-divider>
    <el-timeline>
      <el-timeline-item
        v-for="item in timelineData"
        :key="item.id"
        :timestamp="item.createTime"
        placement="top"
      >
        <el-card shadow="hover">
          <div class="comment-header">
            <div class="user-info">
              <el-avatar :size="32" :src="item.avatar" />
              <span class="username">{{ item.username }}</span>
              <el-tag v-if="item.rootId === -1" type="success" size="small">楼主</el-tag>
            </div>
            <div class="comment-content">{{ item.content }}</div>
            <div class="comment-actions">
              <el-button text type="primary" size="small" @click="handleReply(item)">回复</el-button>
            </div>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>

    <!-- 方案2：聊天样式（推荐） -->
    <el-divider content-position="left">方案2：聊天样式（推荐）</el-divider>
    <div class="chat-container">
      <div 
        v-for="message in chatData" 
        :key="message.id" 
        class="message-item"
        :class="{ 'is-self': message.isSelf }"
      >
        <el-avatar :size="40" :src="message.avatar" class="avatar" />
        <div class="message-content">
          <div class="message-header">
            <span class="username">{{ message.username }}</span>
            <span class="time">{{ message.createTime }}</span>
          </div>
          <div class="message-bubble">
            {{ message.content }}
            <div v-if="message.replyTo" class="quote-reply">
              <span class="quote-user">@{{ message.replyTo }}</span>
              <span class="quote-text">{{ message.quoteContent }}</span>
            </div>
          </div>
          <div class="message-actions">
            <el-button text type="primary" size="small" @click="handleReply(message)">回复</el-button>
          </div>
          <!-- 嵌套回复 -->
          <div v-if="message.replies && message.replies.length" class="reply-list">
            <div v-for="reply in message.replies" :key="reply.id" class="reply-item">
              <span class="reply-user">{{ reply.username }}：</span>
              <span class="reply-content">{{ reply.content }}</span>
              <el-button text type="primary" size="small" @click="handleReply(reply)">回复</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 方案3：Collapse 折叠面板 -->
    <el-divider content-position="left">方案3：Collapse 折叠面板</el-divider>
    <el-collapse v-model="activeNames">
      <el-collapse-item 
        v-for="comment in collapseData" 
        :key="comment.id"
        :name="comment.id"
      >
        <template #title>
          <div class="collapse-title">
            <el-avatar :size="24" :src="comment.avatar" />
            <span class="username">{{ comment.username }}</span>
            <span class="preview">{{ comment.content.substring(0, 30) }}...</span>
          </div>
        </template>
        <div class="comment-detail">
          <div class="comment-content">{{ comment.content }}</div>
          <div class="comment-replies">
            <div v-for="reply in comment.replies" :key="reply.id" class="reply">
              <span class="reply-user">{{ reply.username }}：</span>
              <span>{{ reply.content }}</span>
            </div>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>

    <!-- 方案4：Tree 树形组件 -->
    <el-divider content-position="left">方案4：Tree 树形组件</el-divider>
    <el-tree
      :data="treeData"
      :props="defaultProps"
      node-key="id"
      default-expand-all
      class="tree-demo"
    >
      <template #default="{ node, data }">
        <div class="custom-tree-node">
          <div class="node-header">
            <el-avatar :size="28" :src="data.avatar" />
            <span class="username">{{ data.username }}</span>
            <span class="time">{{ data.createTime }}</span>
          </div>
          <div class="node-content">{{ data.content }}</div>
          <div class="node-actions">
            <el-button text type="primary" size="small" @click="handleReply(data)">回复</el-button>
          </div>
        </div>
      </template>
    </el-tree>

    <!-- 方案5：卡片列表（最简单） -->
    <el-divider content-position="left">方案5：卡片列表（最简单）</el-divider>
    <div class="card-list">
      <el-card 
        v-for="comment in cardData" 
        :key="comment.id" 
        class="comment-card"
        shadow="hover"
      >
        <template #header>
          <div class="card-header">
            <div class="user">
              <el-avatar :size="32" :src="comment.avatar" />
              <span class="name">{{ comment.username }}</span>
              <el-badge 
                v-if="comment.rootId === -1" 
                value="楼主" 
                type="primary" 
                class="badge"
              />
            </div>
            <div class="time">{{ comment.createTime }}</div>
          </div>
        </template>
        
        <div class="comment-body">
          <div class="content">{{ comment.content }}</div>
          <div class="reply-btn">
            <el-button text type="primary" size="small" @click="handleReply(comment)">回复</el-button>
          </div>
          <!-- 回复列表 -->
          <div v-if="comment.replies && comment.replies.length" class="card-replies">
            <div v-for="reply in comment.replies" :key="reply.id" class="card-reply">
              <span class="reply-user">{{ reply.username }}：</span>
              <span>{{ reply.content }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 写死的模拟数据
const timelineData = ref([
  {
    id: 1,
    username: '小明同学',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    content: '这篇文章写得真好，受益匪浅！',
    createTime: '2024-01-15 10:30:00',
    rootId: -1
  },
  {
    id: 2,
    username: '小花老师',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    content: '请问有没有相关的资料推荐？',
    createTime: '2024-01-15 11:00:00',
    rootId: -1
  }
])

const chatData = ref([
  {
    id: 1,
    username: '小明同学',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    content: '有人能帮忙解答一下这个问题吗？',
    createTime: '10:30',
    isSelf: false,
    replies: []
  },
  {
    id: 2,
    username: '我',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    content: '我来回答你！首先需要配置环境变量...',
    createTime: '10:32',
    isSelf: true,
    replies: []
  },
  {
    id: 3,
    username: '小红',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    content: '楼上说得对，我再补充一点...',
    createTime: '10:35',
    isSelf: false,
    replyTo: '小明同学',
    quoteContent: '有人能帮忙解答一下这个问题吗？',
    replies: [
      {
        id: 31,
        username: '小明同学',
        content: '感谢解答！',
        createTime: '10:36'
      }
    ]
  }
])

const collapseData = ref([
  {
    id: 1,
    username: '张三',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    content: '这是第一条评论，内容比较长，在折叠面板中会显示预览...',
    createTime: '2024-01-15 10:30:00',
    replies: [
      { id: 11, username: '李四', content: '支持一下！' },
      { id: 12, username: '王五', content: '说得很有道理' }
    ]
  },
  {
    id: 2,
    username: '赵六',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    content: '这是第二条评论，也可以折叠起来...',
    createTime: '2024-01-15 11:00:00',
    replies: [
      { id: 21, username: '小红', content: '赞一个！' }
    ]
  }
])

const treeData = ref([
  {
    id: 1,
    username: '评论一',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    content: '这是父评论',
    createTime: '10:30',
    children: [
      {
        id: 11,
        username: '回复1',
        avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
        content: '这是对父评论的回复',
        createTime: '10:32',
        children: [
          {
            id: 111,
            username: '回复1-1',
            avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
            content: '嵌套回复',
            createTime: '10:35'
          }
        ]
      },
      {
        id: 12,
        username: '回复2',
        avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
        content: '另一个回复',
        createTime: '10:33'
      }
    ]
  },
  {
    id: 2,
    username: '评论二',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    content: '第二条父评论',
    createTime: '10:40',
    children: []
  }
])

const cardData = ref([
  {
    id: 1,
    username: '科技爱好者',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    content: '这篇文章太有用了，解决了我的疑惑！',
    createTime: '2024-01-15 10:30:00',
    rootId: -1,
    replies: [
      { id: 11, username: '小编', content: '感谢支持！' },
      { id: 12, username: '路人甲', content: '同感+1' }
    ]
  },
  {
    id: 2,
    username: '程序猿',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    content: '代码示例很清晰，已经收藏了',
    createTime: '2024-01-15 11:00:00',
    rootId: -1,
    replies: [
      { id: 21, username: '作者', content: '谢谢认可！' }
    ]
  }
])

const activeNames = ref([1, 2])
const defaultProps = {
  children: 'children',
  label: 'username'
}

const handleReply = (item) => {
  console.log('回复', item)
  alert(`回复：${item.username}`)
}
</script>

<style scoped>
.demo-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* 聊天样式 */
.chat-container {
  max-height: 500px;
  overflow-y: auto;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.message-item {
  display: flex;
  margin-bottom: 20px;
}

.message-item.is-self {
  flex-direction: row-reverse;
}

.message-item.is-self .message-bubble {
  background-color: #95ec69;
}

.avatar {
  margin: 0 12px;
}

.message-content {
  flex: 1;
  max-width: 70%;
}

.message-header {
  margin-bottom: 6px;
}

.username {
  font-weight: bold;
  margin-right: 12px;
}

.time {
  font-size: 12px;
  color: #999;
}

.message-bubble {
  background-color: #fff;
  padding: 10px 15px;
  border-radius: 12px;
  word-wrap: break-word;
  position: relative;
}

.quote-reply {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e4e7ed;
  font-size: 12px;
}

.quote-user {
  color: #409eff;
}

.message-actions {
  margin-top: 6px;
  font-size: 12px;
}

.reply-list {
  margin-top: 12px;
  padding-left: 12px;
  border-left: 2px solid #e4e7ed;
}

.reply-item {
  font-size: 13px;
  margin: 8px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reply-user {
  color: #409eff;
}

/* 树形组件样式 */
.tree-demo {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
}

.custom-tree-node {
  flex: 1;
  padding: 8px;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.node-content {
  margin: 8px 0;
  padding-left: 36px;
}

.node-actions {
  padding-left: 36px;
}

/* 卡片列表样式 */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name {
  font-weight: bold;
}

.time {
  font-size: 12px;
  color: #999;
}

.badge {
  margin-left: 8px;
}

.comment-body {
  margin: 12px 0;
}

.content {
  line-height: 1.5;
  margin-bottom: 12px;
}

.reply-btn {
  text-align: right;
}

.card-replies {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
}

.card-reply {
  font-size: 13px;
  margin: 8px 0;
}

.reply-user {
  color: #409eff;
  font-weight: bold;
}

/* 折叠面板样式 */
.collapse-title {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.preview {
  color: #999;
  font-size: 12px;
  margin-left: 12px;
}

.comment-detail {
  padding: 12px;
  background-color: #fafafa;
  border-radius: 4px;
}

.comment-content {
  margin-bottom: 12px;
  line-height: 1.5;
}

.comment-replies {
  margin-top: 12px;
  padding-left: 20px;
  border-left: 2px solid #e4e7ed;
}

.reply {
  margin: 8px 0;
  font-size: 13px;
}

.reply-user {
  color: #409eff;
}

/* Timeline 样式 */
.comment-header {
  padding: 8px 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.comment-actions {
  margin-top: 12px;
  text-align: right;
}
</style>