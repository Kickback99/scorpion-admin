<template>
  <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick" tabPosition="left">
    <el-tab-pane label="前台" name="client">
      <div class="config-container">
        <el-form label-width="140px" label-position="left">
          <!-- 评论显示 -->
          <el-form-item label="评论显示">
            <el-switch
              v-model="configData.commentEnabled"
              :active-value="0"
              :inactive-value="1"
              @change="handleSwitchChange('commentEnabled', configData.commentEnabled)"
            />
          </el-form-item>

          <!-- 锚点显示 -->
          <el-form-item label="锚点显示">
            <el-switch
              v-model="configData.anchorEnabled"
              :active-value="0"
              :inactive-value="1"
              @change="handleSwitchChange('anchorEnabled', configData.anchorEnabled)"
            />
          </el-form-item>

          <!-- 前端登录 -->
          <el-form-item label="前端登录">
            <el-switch
              v-model="configData.loginDisabled"
              :active-value="0"
              :inactive-value="1"
              @change="handleSwitchChange('loginDisabled', configData.loginDisabled)"
            />
          </el-form-item>

          <!-- 前端主题 -->
          <el-form-item label="前端主题">
            <el-radio-group v-model="configData.theme" @change="handleThemeChange">
              <el-radio :value="0">github主题</el-radio>
              <el-radio :value="1">vuepress主题</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
    </el-tab-pane>

    <el-tab-pane label="后台" name="dashboard">
      <div class="config-container">
        <el-form label-width="160px" label-position="left">
          <!-- 文章置顶数量限制 -->
          <el-form-item label="文章置顶数量限制">
            <el-input-number
              v-model="configData.articleTopLimit"
              :min="-1"
              :max="99"
              @change="handleNumberChange('articleTopLimit', configData.articleTopLimit)"
            />
            <span class="form-tip">（-1表示无限制）</span>
          </el-form-item>

          <!-- 轮播图数量限制 -->
          <el-form-item label="轮播图数量限制">
            <el-input-number
              v-model="configData.carouselLimit"
              :min="-1"
              :max="99"
              @change="handleNumberChange('carouselLimit', configData.carouselLimit)"
            />
          </el-form-item>
        </el-form>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { getConfigApi, updateConfigValueApi } from '@/api/config'

// 配置数据
const configData = reactive({
  articleTopLimit: 3,
  commentEnabled: 0,
  anchorEnabled: 0,
  theme: 0,
  loginDisabled: 0,
  carouselLimit: 3
})

const activeName = ref('client')
const loading = ref(false)

// 加载配置数据
const loadConfig = async () => {
  loading.value = true
  try {
    const res = await getConfigApi()
    if (res.code === 200 && res.data) {
      Object.assign(configData, res.data)
    }
  } catch (error) {
    console.error('加载配置失败:', error)
    ElMessage.error('加载配置失败')
  } finally {
    loading.value = false
  }
}

// 更新配置的通用方法
const updateConfig = async (key, value, successMsg) => {
  try {
    const res = await updateConfigValueApi(key, value)
    if (res.code === 200) {
      ElMessage.success(successMsg || '更新成功')
    } else {
      ElMessage.error(res.message || '更新失败')
      // 更新失败，重新加载数据回滚
      await loadConfig()
    }
  } catch (error) {
    console.error('更新配置失败:', error)
    ElMessage.error('更新失败')
    // 更新失败，重新加载数据回滚
    await loadConfig()
  }
}

// Switch 变化处理
const handleSwitchChange = (key, value) => {
  let fieldName = ''
  let successMsg = ''
  
  switch (key) {
    case 'commentEnabled':
      fieldName = 'comment_enabled'
      successMsg = value === 0 ? '评论已开启' : '评论已禁用'
      break
    case 'anchorEnabled':
      fieldName = 'anchor_enabled'
      successMsg = value === 0 ? '锚点已开启' : '锚点已禁用'
      break
    case 'loginDisabled':
      fieldName = 'login_disabled'
      successMsg = value === 0 ? '前端登录已开启' : '前端登录已禁用'
      break
    default:
      fieldName = key
  }
  
  updateConfig(fieldName, value, successMsg)
}

// Radio 变化处理
const handleThemeChange = (value) => {
  updateConfig('theme', value, value === 0 ? '主题已切换为 Github' : '主题已切换为 Vuepress')
}

// 数字输入框变化处理
const handleNumberChange = (key, value) => {
  let fieldName = ''
  let successMsg = ''
  
  switch (key) {
    case 'articleTopLimit':
      fieldName = 'article_top_limit'
      successMsg = value === -1 ? '文章置顶数量已设为无限制' : `文章置顶数量已设为 ${value}`
      break
    case 'carouselLimit':
      fieldName = 'carousel_limit'
      successMsg = value === -1 ? '轮播图数量已设为无限制' : `轮播图数量已设为 ${value}`
      break
    default:
      fieldName = key
  }
  
  updateConfig(fieldName, value, successMsg)
}

// Tab 切换处理
const handleClick = (tab, event) => {
  console.log(tab, event)
}

// 组件挂载时加载配置
onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

.config-container {
  padding: 20px;
  max-width: 600px;
}

.form-tip {
  margin-left: 12px;
  color: #909399;
  font-size: 12px;
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-switch) {
  --el-switch-on-color: #13ce66;
  --el-switch-off-color: #ff4949;
}
</style>