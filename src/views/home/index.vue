<template>
  <div class="dashboard">
    <!-- ===== 顶部区域：问候 + 统计 ===== -->
    <el-card class="top-card" shadow="hover">
      <div class="top-content">
        <!-- 左侧：问候语 -->
        <div class="profile-section">
          <div class="profile-info">
            <h2 class="greeting">{{ greeting }}，{{ nickname }}，今天又是充满活力的一天！</h2>
            <p class="hitokoto">{{ hitokoto }}</p>
          </div>
        </div>

        <!-- 右侧：统计数字组 -->
        <div class="stats-row">
          <div class="stat-chip">
            <span class="stat-chip-label">文章</span>
            <span class="stat-chip-value">{{ dashboard.articleCount ?? 0 }}</span>
          </div>
          <div class="stat-divider" />
          <div class="stat-chip">
            <span class="stat-chip-label">已发布</span>
            <span class="stat-chip-value">{{ dashboard.publishedCount ?? 0 }}</span>
          </div>
          <div class="stat-divider" />
          <div class="stat-chip">
            <span class="stat-chip-label">评论</span>
            <span class="stat-chip-value">{{ dashboard.commentCount ?? 0 }}</span>
          </div>
          <div class="stat-divider" />
          <div class="stat-chip">
            <span class="stat-chip-label">草稿</span>
            <span class="stat-chip-value">{{ dashboard.draftCount ?? 0 }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- ===== 中间：概览卡片 ===== -->
    <el-row :gutter="14" class="overview-cards">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="overview-card" shadow="hover">
          <div class="card-icon icon-blue">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="card-body">
            <div class="card-label">总访问数</div>
            <div class="card-value">{{ formatNumber(dashboard.totalViewCount ?? 0) }}</div>
            <div class="card-sub">
              <span>今日 {{ dashboard.todayViewCount ?? 0 }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="overview-card" shadow="hover">
          <div class="card-icon icon-purple">
            <el-icon><View /></el-icon>
          </div>
          <div class="card-body">
            <div class="card-label">总文章数</div>
            <div class="card-value">{{ formatNumber(dashboard.articleCount ?? 0) }}</div>
            <div class="card-sub">
              <span>已发布 {{ dashboard.publishedCount ?? 0 }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="overview-card" shadow="hover">
          <div class="card-icon icon-green">
            <el-icon><ChatDotRound /></el-icon>
          </div>
          <div class="card-body">
            <div class="card-label">总评论数</div>
            <div class="card-value">{{ formatNumber(dashboard.commentCount ?? 0) }}</div>
            <div class="card-sub">
              <span>今日 {{ dashboard.todayCommentCount ?? 0 }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="overview-card" shadow="hover">
          <div class="card-icon icon-orange">
            <el-icon><UserFilled /></el-icon>
          </div>
          <div class="card-body">
            <div class="card-label">用户总数</div>
            <div class="card-value">{{ formatNumber(dashboard.userCount ?? 0) }}</div>
            <div class="card-sub">
              <span>今日 {{ dashboard.todayUserCount ?? 0 }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ===== 图表区域 ===== -->
    <el-row :gutter="14" class="charts-row">
      <el-col :xs="24" :md="15">
        <el-card shadow="hover">
          <template #header>
            <div class="chart-header">
              <span>近7天文章数据趋势</span>
            </div>
          </template>
          <LineChart :x-data="lineChart.xData" :y1="lineChart.y1" :y2="lineChart.y2" :y3="lineChart.y3" />
        </el-card>
      </el-col>
      <el-col :xs="24" :md="9">
        <el-card shadow="hover">
          <template #header>
            <div class="chart-header">
              <span>分类统计</span>
            </div>
          </template>
          <PieChart :legend-data="pieChart.legendData" :series-data="pieChart.seriesData" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
// ============================================================
// 依赖导入
// ============================================================
import { computed, onMounted, reactive, ref } from 'vue'
import { View, TrendCharts, ChatDotRound, UserFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import LineChart from './charts/LineChart.vue'
import PieChart from './charts/PieChart.vue'
import { getDashboardApi, getChartLineApi, getChartPieApi } from '@/api/dashboard'

// ============================================================
// 数据
// ============================================================
const userStore = useUserStore()
const dashboard = reactive({})
const lineChart = reactive({ xData: [], y1: [], y2: [], y3: [] })
const pieChart = reactive({ legendData: [], seriesData: [] })
const hitokoto = ref('加载中...')

// ============================================================
// 计算属性
// ============================================================
const nickname = computed(() => userStore.userInfo?.nickname || userStore.userInfo?.username || 'Admin')

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6)  return '凌晨好'
  if (h < 9)  return '早安'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 17) return '下午好'
  if (h < 19) return '傍晚好'
  if (h < 22) return '晚上好'
  return '夜深了'
})

// ============================================================
// 工具函数
// ============================================================
const formatNumber = (num) => {
  if (num == null) return '0'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

// ============================================================
// 一言
// ============================================================
const fetchHitokoto = async () => {
  try {
    const res = await fetch('https://api.pearapi.ai/api/hitokoto/')
    const text = await res.text()
    hitokoto.value = text || '静心沉淀，代码生花。'
  } catch {
    hitokoto.value = '静心沉淀，代码生花。'
  }
}

// ============================================================
// 数据请求
// ============================================================
const fetchDashboard = async () => {
  try {
    const res = await getDashboardApi()
    Object.assign(dashboard, res.data)
  } catch { /* keep defaults */ }
}

const fetchLineChart = async () => {
  try {
    const res = await getChartLineApi()
    lineChart.xData = res.data?.xdata || res.data?.xData || []
    lineChart.y1 = res.data?.y1 || []
    lineChart.y2 = res.data?.y2 || []
    lineChart.y3 = res.data?.y3 || []
  } catch { /* keep defaults */ }
}

const fetchPieChart = async () => {
  try {
    const res = await getChartPieApi()
    pieChart.legendData = res.data?.legendData || []
    pieChart.seriesData = res.data?.seriesData || []
  } catch { /* keep defaults */ }
}

// ============================================================
// 生命周期
// ============================================================
onMounted(() => {
  fetchDashboard()
  fetchHitokoto()
  fetchLineChart()
  fetchPieChart()
})
</script>

<style scoped lang="scss">
.dashboard {
  // ===== 顶部卡片 =====
  .top-card {
    margin-bottom: 14px;

    :deep(.el-card__body) {
      padding: 24px 28px;
    }

    .top-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 32px;
    }

    .profile-section {
      flex: 1;
      min-width: 0;

      .greeting {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0 0 8px 0;
      }

      .hitokoto {
        font-size: 14px;
        color: var(--el-text-color-secondary);
        margin: 0;
      }
    }

    .stats-row {
      display: flex;
      align-items: center;
      gap: 32px;
      flex-shrink: 0;

      .stat-chip {
        text-align: center;

        .stat-chip-label {
          display: block;
          font-size: 13px;
          color: var(--el-text-color-secondary);
          margin-bottom: 4px;
        }

        .stat-chip-value {
          font-size: 26px;
          font-weight: 700;
          color: var(--el-text-color-primary);
        }
      }

      .stat-divider {
        width: 1px;
        height: 36px;
        background-color: var(--el-border-color-lighter);
      }
    }
  }

  // ===== 概览卡片 =====
  .overview-cards {
    margin-bottom: 14px;

    .overview-card {
      transition: box-shadow 0.3s;

      :deep(.el-card__body) {
        padding: 18px 16px;
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .card-icon {
        width: 48px;
        height: 48px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        flex-shrink: 0;

        &.icon-purple { background-color: var(--el-color-primary-light-9); color: var(--el-color-primary); }
        &.icon-blue   { background-color: #e8f4ff; color: #409eff; }
        &.icon-green  { background-color: #e8f8f0; color: #67c23a; }
        &.icon-orange { background-color: #fff3e0; color: #e6a23c; }
      }

      .card-body {
        flex: 1;
        min-width: 0;

        .card-label {
          font-size: 13px;
          color: var(--el-text-color-secondary);
          margin-bottom: 4px;
        }

        .card-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--el-text-color-primary);
          line-height: 1.2;
          margin-bottom: 4px;
        }

        .card-sub {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }

  // ===== 图表 =====
  .charts-row {
    .chart-header {
      font-size: 15px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }
}

// ===== 响应式 =====
@media (max-width: 991px) {
  .dashboard .top-card .top-content {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
