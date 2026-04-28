// api/comment.js
import http from '@/utils/request'

/**
 * 获取评论列表
 * @param {Number} pageNum 页码
 * @param {Number} pageSize 每页数量
 * @param {Number} articleId 文章ID
 * @returns 
 */
export const getCommentsApi = (pageNum, pageSize, searchData) => 
  http.get(`/admin/msg/comment/${pageNum}/${pageSize}`, { 
    params: searchData
  })


/**
 * 添加评论
 * @param {Object} data 评论数据
 * @param {Number} data.articleId 文章ID
 * @param {String} data.content 评论内容
 * @param {String} data.type 评论类型（0文章评论，1友链评论）
 * @param {Number} [data.rootId] 根评论ID
 * @param {Number} [data.toCommentId] 回复的目标评论ID
 * @param {Number} [data.toCommentUserId] 回复的目标评论用户ID
 * @returns 
 */
export const addCommentApi = ( data ) => 
  http.post('/admin/msg/comment', data)