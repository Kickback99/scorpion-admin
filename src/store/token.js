import {defineStore} from 'pinia'
import { computed, ref } from 'vue'

// 定义store
// defineStore('仓库的唯一标识',()=>{...})

export const useTokenStore = defineStore('token',()=>{
    // 声明数据 state ref()
    const token = ref('')
  

    // 声明操作数据的方法 actions (函数)
    const setToken = (newToken) =>{
        token.value = newToken
    }

    const removeToken = () =>{
        token.value = ''
    }


    // 声明基于数据的计算属性 getters (computed)
   
    return {
        token,setToken,removeToken
    }
},{
	persist: true,  // 开启当前仓库的持久化
	/* persist: {
		key: 'wzCount', //修改localStorage的key，默认用仓库唯一标识做为key
		paths:['count'] //存储的是哪些数据，默认存储整个state数据
	} */
})