import http from '@/utils/request'
const API = {
    CATEGORY_URL : '/admin/content/category',
}

export const listApi = () => http.get(API.CATEGORY_URL)

export const addApi = (params) => http.post(API.CATEGORY_URL,params)

export const modifyApi = (params) => http.put(API.CATEGORY_URL,params)