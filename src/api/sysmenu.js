import http from '@/utils/request'

// t_menu_api：菜单管理

// 新增菜单
export const addApi = (params) => http.post('/admin/system/menus',params)


// 删除菜单
export const removeApi  = (ids) => http.delete(`/admin/system/menus/${ids}`)


// 修改菜单
export const modifyApi = (params) => http.put('/admin/system/menus',params)


// 查询全部菜单
export const listApi = () => http.get(`/admin/system/menus`)

// 修改菜单状态
export const statusApi = (id,status) => http.get(`/admin/system/menus/${id}`,{params:{status}})


// 获取用户菜单数据
export const allocmenusApi = (userId) => http.get(`/admin/system/menus/assign/${userId}`)

// 给用户分配菜单
export const doAllocmenusApi = (userRoleData) => http.post(`/admin/system/menus/assign`,userRoleData)