// src/api/business.js
import http from '@/utils/request'

/**
 * 获取文章业务数据（用于联想搜索）
 * @param {number} id 文章ID（可选）
 * @returns {Promise}
 */
export const getArticleBusinessDataApi = (id) => {
  const params = {};
  if (id !== undefined && id !== null) {
    params.id = id;
  }
  return http.get(`/business/search/article`, { params });
};