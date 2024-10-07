import request from '@/utils/request'

export const userRegisterService = (registerData) =>{
    const params = new URLSearchParams();

    for(let key in registerData){
        params.append(key,registerData[key])
    }

    return request.post('/user/register',params)
}

export const userLoginService = (params) =>{

    return request.post('/admin/login',params)


    /* const params = new URLSearchParams();

    for(let key in loginData){
        params.append(key,loginData[key])
    }

    return request.post('/user/login',params) */
}

export const userInfoService = () => {
    return request.get('/admin/userDetailInfo')
}

export const userLogoutService = () => {
    return request.get("/admin/logout")
}