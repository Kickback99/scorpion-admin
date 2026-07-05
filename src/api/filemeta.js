import http from '@/utils/request'

/**
 * 分页查询文件元数据
 * @param {number} pageNum 页码
 * @param {number} pageSize 每页大小
 * @param {Object} searchData 查询条件
 * @returns {Promise}
 */
export const fileMetaListApi = (pageNum, pageSize, searchData) => 
    http.get(`/admin/resource/meta`, {
        params: {
            pageNum,
            pageSize,
            ...searchData
        }
    })
