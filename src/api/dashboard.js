// api/dashboard.js
import http from '@/utils/request'

const API = {
  DASHBOARD: '/admin/dashboard',
  CHARTS_BAR: '/admin/charts/bar',
  CHART_LINE: '/admin/chart/line',
  CHART_PIE: '/admin/chart/pie',
}

/**
 * 获取仪表盘卡片统计数据
 * @returns {Promise} 9 个概览指标
 */
export const getDashboardApi = () => http.get(API.DASHBOARD)

/**
 * 获取近7天柱状图数据
 * @returns {Promise} { xData:[], y1:[] }
 */
export const getChartsBarApi = () => http.get(API.CHARTS_BAR)

/**
 * 获取近7天折线图数据
 * @returns {Promise} { xData:[], y1:[] }
 */
export const getChartLineApi = () => http.get(API.CHART_LINE)

/**
 * 获取文章状态饼图数据
 * @returns {Promise} { legendData:[], seriesData:[] }
 */
export const getChartPieApi = () => http.get(API.CHART_PIE)
