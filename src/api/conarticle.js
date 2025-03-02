import http from '@/utils/request'

// t_category_api：分类管理

const API = {
    ARTICLE_URL : '/admin/content/article',
}


export const listApi = (pageNum,pageSize,searchData) => http.get(`${API.ARTICLE_URL}/${pageNum}/${pageSize}`,{params:searchData})

