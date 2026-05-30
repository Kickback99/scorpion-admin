import http from '@/utils/request'

export const friendLinkListApi = (pageNum,pageSize,searchData) => http.get(`/admin/content/friendLink/${pageNum}/${pageSize}`,{params:searchData})

export const friendLinkAddApi = (params) => http.post('/admin/content/friendLink',params)

export const friendLinkModifyApi = (params) => http.put('/admin/content/friendLink',params)

export const friendLinkRemoveApi = (ids) => http.delete(`/admin/content/friendLink/${ids}`)