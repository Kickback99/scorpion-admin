import http from '@/utils/request'

// t_log_api：日志管理

const API = {
    LOG_URL : '/admin/msg/loginLogs',
}


export const removeApi = (params) => http.delete(`${API.LOG_URL}/${params}`)


export const listApi = (pageNum,pageSize,searchData) => http.get(`${API.LOG_URL}/${pageNum}/${pageSize}`,{params:searchData})

