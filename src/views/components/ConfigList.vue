<template>
  <div 
  class="tabs-wrapper"
  :class="colorStore.isDark?'dark-mode':'light-mode'"
  >
    <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick" tabPosition="top">
      <el-tab-pane label="前台" name="client">
        <div class="config-container">
          <el-form label-width="140px" label-position="left">
            <!-- 前端登录 -->
            <el-form-item label="前端登录">
              <el-switch
                :model-value="configStore.getLoginEnabled()"
                :active-value="true"
                :inactive-value="false"
                @change="configStore.toggleLoginEnabled"
              />
            </el-form-item>

            <!-- 前端友链 -->
            <el-form-item label="前端友链">
              <el-switch
                :model-value="configStore.getFriendLinkEnabled()"
                :active-value="true"
                :inactive-value="false"
                @change="configStore.toggleFriendLinkEnabled"
              />
            </el-form-item>

            <!-- 文章评论显示 -->
            <el-form-item label="文章评论">
              <el-switch
                :model-value="configStore.getArticleCommentEnabled()"
                :active-value="true"
                :inactive-value="false"
                @change="configStore.toggleArticleCommentEnabled()"
              />
            </el-form-item>

            <!-- 友链评论显示 -->
            <el-form-item label="友链评论">
              <el-switch
                :model-value="configStore.getFriendLinkCommentEnabled()"
                :active-value="true"
                :inactive-value="false"
                @change="configStore.toggleFriendLinkCommentEnabled()"
              />
            </el-form-item>

            <!-- 文章主题 -->
            <el-form-item label="文章主题">
              <el-radio-group :model-value="configStore.getArticleTheme()" @change="configStore.setArticleTheme" class="vertical-radio-group">
                <el-radio :value="0">github主题</el-radio>
                <el-radio :value="1">vuepress主题</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 文章锚点 -->
            <el-form-item label="文章锚点">
              <el-switch
                :model-value="configStore.getAnchorEnabled()"
                :active-value="true"
                :inactive-value="false"
                @change="configStore.toggleAnchorEnabled"
              />
            </el-form-item>

            <!-- 文章收藏数 -->
            <el-form-item label="文章收藏数">
              <el-switch
                :model-value="configStore.getFavoriteCountEnabled()"
                :active-value="true"
                :inactive-value="false"
                @change="configStore.toggleFavoriteCountEnabled()"
              />
            </el-form-item>

            <!-- 子评论默认显示数量 -->
            <el-form-item label="子评论默认显示数量">
              <el-input-number
                :model-value="configStore.getChildCommentLimit()"
                :min="getMin('comment.child_comment_limit')"
                :max="getMax('comment.child_comment_limit')"
                @change="configStore.setChildCommentLimit"
              />
              <el-tooltip content="子评论默认显示的数量，超过此数量显示「查看更多」按钮" placement="right">
                <el-icon class="form-tip-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </el-form-item>

            <!-- 子评论分页大小 -->
            <el-form-item label="子评论分页大小">
              <el-input-number
                :model-value="configStore.getChildPageSize()"
                :min="getMin('comment.child_page_size')"
                :max="getMax('comment.child_page_size')"
                @change="configStore.setChildPageSize"
              />
              <el-tooltip placement="right">
                <template #content>
                    <div>
                      点击「查看更多」时每次加载的数量<br />
                      <span style="color: #ff7875;">⚠️ 该值必须大于「子评论默认显示数量」</span>
                    </div>
                </template>
                <el-icon class="form-tip-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </el-form-item>

            <!-- 我的发布 显示 -->
            <el-form-item label="我的发布">
              <el-switch
                :model-value="configStore.getMyPublishesEnabled()"
                :active-value="true"
                :inactive-value="false"
                @change="configStore.toggleMyPublishesEnabled()"
              />
            </el-form-item>

            <!-- 我的评论 显示 -->
            <el-form-item label="我的评论">
              <el-switch
                :model-value="configStore.getMyCommentsEnabled()"
                :active-value="true"
                :inactive-value="false"
                @change="configStore.toggleMyCommentsEnabled()"
              />
            </el-form-item>

            <!-- 我的收藏 显示 -->
            <el-form-item label="我的收藏">
              <el-switch
                :model-value="configStore.getMyFavoritesEnabled()"
                :active-value="true"
                :inactive-value="false"
                @change="configStore.toggleMyFavoritesEnabled()"
              />
            </el-form-item>

            <!-- 列表浏览 显示 -->
            <el-form-item label="列表浏览">
              <el-switch
                :model-value="configStore.getListViewEnabled()"
                :active-value="true"
                :inactive-value="false"
                @change="configStore.toggleListViewEnabled()"
              />
            </el-form-item>

            <!-- 列表收藏 显示 -->
            <el-form-item label="列表收藏">
              <el-switch
                :model-value="configStore.getListFavoriteEnabled()"
                :active-value="true"
                :inactive-value="false"
                @change="configStore.toggleListFavoriteEnabled()"
              />
            </el-form-item>

            <!-- 列表评论 显示 -->
            <el-form-item label="列表评论">
              <el-switch
                :model-value="configStore.getListCommentEnabled()"
                :active-value="true"
                :inactive-value="false"
                @change="configStore.toggleListCommentEnabled()"
              />
            </el-form-item>

          </el-form>
        </div>
      </el-tab-pane>

      <el-tab-pane label="后台" name="dashboard">
        <div class="config-container">
          <el-form label-width="160px" label-position="left">

            <el-form-item label="菜单折叠">
              <el-switch :model-value="configStore.getIsCollapse()" @change="configStore.toggleCollapseEnabled" />
            </el-form-item>

            <el-form-item label="图标搜索增强">
              <el-switch :model-value="configStore.getIconEnabled()" @change="configStore.toggleIconEnabled" />
            </el-form-item>
            
            <!-- 文章置顶数量限制 -->
            <el-form-item label="文章置顶数量限制">
              <el-input-number
                :model-value="configStore.getArticleTopLimit()"
                :min="getMin('article_top_limit')"
                :max="getMax('article_top_limit')"
                @change="configStore.setArticleTopLimit"
              />
              <!-- <span class="form-tip">（-1表示无限制）</span> -->
            </el-form-item>

            <!-- 轮播图数量限制 -->
            <el-form-item label="轮播图数量限制">
              <el-input-number
                :model-value="configStore.getCarouselLimit()"
                :min="getMin('carousel_limit')"
                :max="getMax('carousel_limit')"
                @change="configStore.setCarouselLimit"
              />
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref} from 'vue'
import { useConfigStore } from '@/store/config'
import { useColorStore } from '@/store/color'
const colorStore = useColorStore()

const configStore = useConfigStore()

const activeName = ref('client')

// Tab 切换处理
const handleClick = (tab, event) => {
  console.log(tab, event)
}

// 获取配置项的最小值
const getMin = (key) => {
  const limit = configStore.getLimitMin(key)
  return limit !== undefined ? limit : -Infinity
}

// 获取配置项的最大值
const getMax = (key) => {
  const limit = configStore.getLimitMax(key)
  return limit !== undefined ? limit : Infinity
}
</script>

<style scoped>
/* .demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
} */

.tabs-wrapper {
  max-width: 500px;
  width: 100%;
  margin: 0 auto;
}

.light-mode {
  --tab-bg: #f8f9fc;
}

.dark-mode {
  --tab-bg: #1a1a1a;
}


:deep(.el-tabs__content){
  align-self: center;  /* 防止被拉伸 */
  width: 100%;
  background-color: var(--tab-bg);
}

:deep(.el-tabs__header.is-top){
  /* align-self: center; */
  width: 100%;
  /* background-color: var(--tab-bg); */
}

.vertical-radio-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start; 
}

.config-container {
  padding: 20px;
  max-width: 600px;
}

/*
.form-tip {
  margin-left: 12px;
  color: #909399;
  font-size: 12px;
}*/

.form-tip-icon {
  margin-left: 8px;
  color: #909399;
  font-size: 14px;
  cursor: help;
  vertical-align: middle;
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-switch) {
  --el-switch-on-color: #13ce66;
  --el-switch-off-color: #ff4949;
}
</style>