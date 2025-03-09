import http from '@/utils/request'

// t_article_api：文章管理

const API = {
    ARTICLE_URL : '/admin/content/article',
    ARTICLEBYID_URL : '/admin/content/article/find'
}

export const addApi = (params) => http.post(`${API.ARTICLE_URL}`,params)

export const removeApi = (aId) => http.delete(`${API.ARTICLE_URL}/${aId}`)

export const modifyApi = (params) => http.put(`${API.ARTICLE_URL}`,params)

export const findApi = (articleId) => http.get(`${API.ARTICLEBYID_URL}`,{params:{articleId}})

export const listApi = (pageNum,pageSize,searchData) => http.get(`${API.ARTICLE_URL}/${pageNum}/${pageSize}`,{params:searchData})



