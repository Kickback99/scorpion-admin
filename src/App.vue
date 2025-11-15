<template>
    
    <el-config-provider :locale="zhCn">
        <router-view></router-view>
    </el-config-provider>

</template>

<script setup>
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import { useTokenStore } from '@/store/token';
import { useUserStore } from '@/store/user';
import { onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()
const userStore = useUserStore()
const tokenStore = useTokenStore()
let socket;

// 关闭WebSocket连接
const closeWebSocket = () => {
    if (socket) {
        console.log('🔌 关闭WebSocket连接')
        socket.close()
        socket = null
    }
}

const initWebsocket = () => {
      const userId = userStore.userInfo?.id
     if (!userId) {
        return
    }
    
     let wsUrl = `ws://localhost:8800/websocket/${userId}`
     socket = new WebSocket(wsUrl)

    //  连接建立时调用
     socket.onopen = ()=>{
        console.log('ws is open...')
     }

     // 监听到服务端返回消息时调用
     socket.onmessage = (event)=> {
        handleWebSocketMessage(event.data)
     }


     // 连接关闭时调用
     socket.onclose = ()=>{
        console.log('ws is close...')
     }

    //  连接错误时调用
     socket.onerror = ()=>{
        console.log('ws is error...')
     }

     // 处理强制退出
    /* const handleForceLogout = (message) => {
        ElMessageBox.alert(message, '账号异地登录', {
            confirmButtonText: '重新登录',
            callback: () => {
            // 清除本地token和用户信息
            tokenStore.removeToken()
            userStore.clearUserStore()
            // 跳转到登录页
            router.push('/login')
            }
        })
    } */

    const handleWebSocketMessage = (messageData) => {
            const data = JSON.parse(messageData)
    
    switch (data.type) {
            case 'force_logout':
                showForceLogoutDialog(data.title, data.message)
                break
                
            case 'password_changed':
                showPasswordChangedDialog(data.title, data.message)
                break
                
            case 'account_disabled':
                showAccountDisabledDialog(data.title, data.message)
                break
                
            case 'session_expired':
                showSessionExpiredDialog(data.title, data.message)
                break
                
            default:
                console.warn('未知的消息类型:', data.type)
        }
    }


    // 强制退出对话框
    const showForceLogoutDialog = (title, message) => {
        ElMessageBox.alert(message, title, {
            confirmButtonText: '重新登录',
            callback: () => {
                logoutAndRedirect()
            }
        })
    }

    // 密码修改对话框
    const showPasswordChangedDialog = (title, message) => {
        ElMessageBox.alert(message, title, {
            confirmButtonText: '重新登录',
            callback: () => {
                logoutAndRedirect()
            }
        })
    }

}

// 统一的退出和跳转
const logoutAndRedirect = () => {
    tokenStore.removeToken()
    userStore.clearUserStore()
    router.push('/login')
}

// 方案1：监听用户信息变化
watch(() => userStore.userInfo, (newUserInfo,oldUserInfo) => {
    console.log('👤 用户信息发生变化:', newUserInfo,oldUserInfo)
    if (newUserInfo?.id) {
        console.log('✅ 检测到有效userId，初始化WebSocket')
        if(!socket || !socket.onopen()){
            // 延迟一点确保完全加载
            initWebsocket()
        }
    }
}, { deep: true, immediate: true })


onMounted(()=>{
    initWebsocket()
})

onUnmounted(()=>{
  closeWebSocket()  
})
</script>

<style  lang="scss">
 html,body,#app{
    height: 100%;
 }
 .app-container{
    padding:20px
 }
</style>