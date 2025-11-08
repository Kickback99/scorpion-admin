import {defineStore} from 'pinia'
import { ref } from 'vue'
import CryptoJS from 'crypto-js'

// 定义store
// defineStore('仓库的唯一标识',()=>{...})

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

export const useTokenStore = defineStore('token',{
    state:()=>({
        token:'',
        savedUsername:'',
        savedPassword:'',
        rememberMe:false
    }),
    actions:{
        setToken(newToken) {
            this.token = newToken
        },
        removeToken(){
            this.token = ''
        },
        // 保存用户凭证
        saveCredentials(username, password) {
            this.savedUsername = username
            this.savedPassword = CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString()
            this.rememberMe = true
        },
        // 获取解密后的密码
        getDecryptedPassword() {
            if (!this.savedPassword) return ''
            try {
                const bytes = CryptoJS.AES.decrypt(this.savedPassword, ENCRYPTION_KEY)
                const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8)
                
                // 如果解密失败或结果为空，清除无效的凭证
                if (!decryptedPassword) {
                    this.clearCredentials()
                    return ''
                }
                
                return decryptedPassword
            } catch (error) {
                console.error('密码解密失败:', error)
                this.clearCredentials()
                return ''
            }
        },
        // 清除用户凭证
        clearCredentials() {
            this.savedUsername = ''
            this.savedPassword = ''
            this.rememberMe = false
        },
        // 检查是否有保存的凭证
        hasSavedCredentials() {
            return this.rememberMe && this.savedUsername && this.savedPassword
        }
        
    },
    persist:true
})