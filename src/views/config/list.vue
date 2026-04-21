<template>
  <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick" tabPosition="top">
    <el-tab-pane label="前台" name="client">
      <div class="config-container">
        <el-form label-width="140px" label-position="left">
          <!-- 评论显示 -->
          <el-form-item label="评论显示">
            <el-switch
              :model-value="configStore.commentEnabled"
              :active-value="true"
              :inactive-value="false"
              @change="configStore.toggleComment"
            />
          </el-form-item>

          <!-- 锚点显示 -->
          <el-form-item label="锚点显示">
            <el-switch
              :model-value="configStore.anchorEnabled"
              :active-value="true"
              :inactive-value="false"
              @change="configStore.toggleAnchor"
            />
          </el-form-item>

          <!-- 前端登录 -->
          <el-form-item label="前端登录">
            <el-switch
              :model-value="configStore.loginEnabled"
              :active-value="true"
              :inactive-value="false"
              @change="configStore.toggleLogin"
            />
          </el-form-item>

          <!-- 前端主题 -->
          <el-form-item label="前端主题">
            <el-radio-group :model-value="configStore.theme" @change="configStore.setTheme">
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

          <el-form-item label="菜单折叠">
            <el-switch :model-value="configStore.getIsCollapse()" @change="configStore.toggleCollapse" />
          </el-form-item>

          <el-form-item label="图标搜索增强">
            <el-switch :model-value="configStore.getIconEnabled()" @change="configStore.toggleIconEnabled" />
          </el-form-item>
          
          <!-- 文章置顶数量限制 -->
          <el-form-item label="文章置顶数量限制">
            <el-input-number
              v-model="configStore.articleTopLimit"
              :min="1"
              :max="99"
              @change="configStore.setArticleTopLimit"
            />
            <!-- <span class="form-tip">（-1表示无限制）</span> -->
          </el-form-item>

          <!-- 轮播图数量限制 -->
          <el-form-item label="轮播图数量限制">
            <el-input-number
              v-model="configStore.carouselLimit"
              :min="0"
              :max="99"
              @change="configStore.setCarouselLimit"
            />
          </el-form-item>
        </el-form>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup>
import { ref} from 'vue'
import { useConfigStore } from '@/store/config'

const configStore = useConfigStore()

const activeName = ref('client')

// Tab 切换处理
const handleClick = (tab, event) => {
  console.log(tab, event)
}
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