import http from '@/utils/request'

/**
 * 查询公告列表
 * @returns {Promise}
 */
export const noticeListApi = () => http.get('/admin/msg/notice/list')

/**
 * 新增公告
 * @param {String} content 公告内容
 * @returns {Promise}
 */
export const noticeAddApi = (content) => http.post('/admin/msg/notice/add', null, { params: { content } })

/**
 * 修改公告
 * @param {Number} id 公告ID
 * @param {String} content 公告内容
 * @returns {Promise}
 */
export const noticeUpdateApi = (id, content) => http.put('/admin/msg/notice/update', null, { params: { id, content } })

/**
 * 删除公告
 * @param {Number|Number[]} ids 公告 ID 或 ID 数组
 * @returns {Promise}
 */
export const noticeRemoveApi = (ids) => http.delete(`/admin/msg/notice/delete/${ids}`)

/**
 * 上架公告
 * @param {Number} id 公告ID
 * @returns {Promise}
 */
export const noticeOnlineApi = (id) => http.put(`/admin/msg/notice/online/${id}`)

/**
 * 下架公告
 * @param {Number} id 公告ID
 * @returns {Promise}
 */
export const noticeOfflineApi = (id) => http.put(`/admin/msg/notice/offline/${id}`)

/**
 * 推送公告给所有在线用户
 * @param {Number} id 公告ID
 * @returns {Promise}
 */
export const noticePushApi = (id) => http.post(`/admin/msg/notice/push/${id}`)