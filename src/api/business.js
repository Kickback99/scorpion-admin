import http from '@/utils/request'

/**
 * 获取文章业务数据（用于 SmartAutoComplete 联想搜索，如 ImageReference）
 * @param {Number} id 文章 ID（可选）
 * @returns {Promise}
 */
export const getArticleBusinessDataApi = (id) => {
  const params = {}
  if (id !== undefined && id !== null) {
    params.id = id
  }
  return http.get('/business/search/article', { params })
}

/**
 * 获取所有文章列表（用于 SmartAutoComplete 联想搜索）
 * @returns {Promise}
 */
export const getAllArticlesApi = () => http.get('/admin/content/article/list/all')

/**
 * 分页查询标签列表（用于 SmartAutoComplete 联想搜索）
 * @param {Number} pageNum 页码
 * @param {Number} pageSize 每页数量
 * @param {Object} searchData 查询条件
 * @returns {Promise}
 */
export const getTagListApi = (pageNum, pageSize, searchData) =>
  http.get(`/admin/content/tag/${pageNum}/${pageSize}`, { params: searchData })

/**
 * 获取全业务搜索数据（用于 SmartAutoComplete 联想搜索）
 * @returns {Promise}
 */
export const getAllBusinessDataApi = () => http.get('/business/search/all')
