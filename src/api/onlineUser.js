import http from '@/utils/request'

// 获取在线用户
export const getOnlineListApi = () => http.get('/admin/online/list')

// 强退用户
export const kickUserApi = (userId, role) => http.delete(`/admin/online/kick/${userId}/${role}`)