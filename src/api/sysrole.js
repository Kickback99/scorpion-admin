import http from '@/utils/request'

// 角色管理

// 新增角色
export const addApi = (params) => http.post('/admin/system/roles',params)


// 删除角色
export const removeApi  = (ids) => http.delete(`/admin/system/roles/${ids}`)


// 修改角色
export const modifyApi = (params) => http.put('/admin/system/roles',params)


// 分页查询全部角色
export const listApi = (pageNum,pageSize,searchData) => http.get(`/admin/system/roles/${pageNum}/${pageSize}`,{params:searchData})
// export const listApi = (params) => http.get(`/admin/system/roles/${params.pageNum}/${params.pageSize}`,{params:{roleName:params.roleName}})



