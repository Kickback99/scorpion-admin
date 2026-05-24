import http from '@/utils/request'

const API = {
    CONFIG_URL:'/admin/config'
}

// 查询全部配置
export const getConfigApi = () => http.get(`${API.CONFIG_URL}`)

// 修改单个配置
export const updateConfigValueApi = (key, value) => http.put(`${API.CONFIG_URL}/updateValue`, { key, value })

// 修改全部配置
export const updateAllConfigApi = (params) => http.put(`${API.CONFIG_URL}/updateAll`,params)