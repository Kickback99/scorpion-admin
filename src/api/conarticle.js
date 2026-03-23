import http from '@/utils/request'

// t_article_api：文章管理

const API = {
    ARTICLE_URL : '/admin/content/article',
    ARTICLE_BY_ID_URL : '/admin/content/article/find',
    ARTICLE_BY_ISTOP : '/admin/content/article/isTop',
    UPLOAD_URL : '/admin/upload/content'
}

export const addApi = (params) => http.post(`${API.ARTICLE_URL}`,params)

export const removeApi = (aId) => http.delete(`${API.ARTICLE_URL}/${aId}`)

export const modifyApi = (params) => http.put(`${API.ARTICLE_URL}`,params)

export const findApi = (articleId) => http.get(`${API.ARTICLE_BY_ID_URL}/${articleId}`)

export const listApi = (pageNum,pageSize,searchData) => http.get(`${API.ARTICLE_URL}/${pageNum}/${pageSize}`,{params:searchData})

//t_upload_api
export const uploadApi = (formData) => http.post(API.UPLOAD_URL,formData)

// 修改文章置顶
export const isTopApi = (id,isTop) => http.put(`${API.ARTICLE_BY_ISTOP}/${id}/${isTop}`)



