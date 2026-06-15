import { ElMessageBox, ElMessage } from 'element-plus'
import { useTokenStore } from '@/store/token'
import { useUserStore } from '@/store/user'
import router from '@/router';

class WebSocketManager {
  constructor() {
    this.socket = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 3000
    this.isConnecting = false
    this.isManualClose = false  // 是否手动关闭
    this.cachedOnlineUsers = null  // 缓存在线用户
  }

  // 初始化 WebSocket 连接
  init(userId, role = 'admin') { // 管理端默认 role='admin'
    if (!userId) {
      console.warn('❌ 没有用户ID，无法初始化 WebSocket')
      return
    }

    
    // 重置手动关闭标志
    this.isManualClose = false

    // 如果正在连接或已连接，先关闭
    if (this.isConnecting || this.socket) {
      if (this.socket) {
        console.log('🔌 关闭现有连接，准备重新连接')
        this.socket.close()
        this.socket = null
      }
    }

    this.isConnecting = true
    
    try {
      const wsUrl = `ws://localhost:8800/websocket/${role}/${userId}`
      this.socket = new WebSocket(wsUrl)

      this.socket.onopen = () => {
        console.log(`✅ WebSocket 连接成功，角色: ${role}，用户ID: ${userId}`)
        this.isConnecting = false
        this.reconnectAttempts = 0
      }

      this.socket.onmessage = (event) => {
        this.handleMessage(event.data)
      }

      this.socket.onclose = (event) => {
        console.log('🔌 WebSocket 连接关闭:', event.code, event.reason)
        this.isConnecting = false
        // this.handleReconnect(userId)

        // 只在应该重连且不是手动关闭才重连
        if (this.shouldReconnectOnClose(event.code) && !this.isManualClose) {
            this.handleReconnect(userId, role)
        }
      }

      this.socket.onerror = (error) => {
        console.error('❌ WebSocket 连接错误:', error)
        this.isConnecting = false
        // this.handleReconnect(userId)
      }

    } catch (error) {
      console.error('❌ 创建 WebSocket 失败:', error)
      this.isConnecting = false
    }
  }

  getSocket() {
        return this.socket
  }

    // 判断是否应该重连
  shouldReconnectOnClose(code) {
    // 正常关闭，不重连
    if (code === 1000) return false
    
    // 1001：页面关闭，不重连
    if (code === 1001) return false
    
    // 1008：策略违规，可能是权限问题，不重连
    if (code === 1008) return false
    
    // 其他错误码，尝试重连
    return true
  }

  // 处理重连逻辑
  handleReconnect(userId, role) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`🔄 尝试重新连接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.init(userId, role)
      }, this.reconnectInterval)
    } else {
      console.warn('❌ 达到最大重连次数，停止重连')
    }
  }

  // 处理接收到的消息
  handleMessage(messageData) {
    try {

      // 判断是否是纯文本消息（定时任务结果）
      if (typeof messageData === 'string' && !messageData.startsWith('{')) {
        // sendMessage，直接显示(目前有定时任务、强退用户的操作结果反馈：用户主动操作/心跳拦截)
        ElMessage.success({
          message: messageData.replace(/\n/g, '<br><br>'),
          dangerouslyUseHTMLString: true,
        })

        return
    }

      const data = JSON.parse(messageData)
      console.log('📨 收到 WebSocket 消息:', data)

      switch (data.type) {
        case 'force_logout':
          this.showForceLogoutDialog(data.title, data.message)
          break
        case 'password_changed':
          this.showPasswordChangedDialog(data.title, data.message)
          break
        case 'account_disabled':
          this.showAccountDisabledDialog(data.title, data.message)
          break
        case 'session_expired':
          this.showSessionExpiredDialog(data.title, data.message)
          break
        case 'online_users_update':
          // 缓存数据
          this.cachedOnlineUsers = data
          console.log('缓存在线用户数据:', data)
          // 触发全局事件
          window.dispatchEvent(new CustomEvent('online-users-update', {
              detail: data
          }))
          break
        default:
          // 普通任务结果消息
          if (data.message) {
            ElMessage.success(data.message)
            return
          }
          console.warn('未知的消息类型:', data.type)
      }
    } catch (error) {
      console.error('解析 WebSocket 消息失败:', error)
    }
  }

  // 获取缓存
  getCachedOnlineUsers() {
      return this.cachedOnlineUsers
  }

  // 显示强制退出对话框
  showForceLogoutDialog(title, message) {
    ElMessageBox.alert(message, title, {
      confirmButtonText: '重新登录',
      callback: () => {
        this.logoutAndRedirect()
      }
    })
  }

  showPasswordChangedDialog(title, message) {
    ElMessageBox.alert(message, title, {
      confirmButtonText: '重新登录',
      callback: () => {
        this.logoutAndRedirect()
      }
    })
  }

  showAccountDisabledDialog(title, message) {
    ElMessageBox.alert(message, title, {
      confirmButtonText: '确定',
      callback: () => {
        this.logoutAndRedirect()
      }
    })
  }

  showSessionExpiredDialog(title, message) {
    ElMessageBox.alert(message, title, {
      confirmButtonText: '重新登录',
      callback: () => {
        this.logoutAndRedirect()
      }
    })
  }

  // 统一的退出和跳转
  logoutAndRedirect() {
    this.close()
    
    const tokenStore = useTokenStore()
    const userStore = useUserStore()
    
    tokenStore.removeToken()
    userStore.clearUserStore()
    router.push('/login')
  }

  // 关闭 WebSocket 连接
  close() {
    // 连接正在建立或已建立，才需要关闭
    // readyState 小于 2 表示正在连接或已连接
    if (this.socket && this.socket.readyState < 2) {
      this.isManualClose = true  // 标记为手动关闭，防止重连
      console.log('🔌 手动关闭 WebSocket 连接')
      this.socket.close(1000, 'Manual close')
      this.socket = null
    }
    this.isConnecting = false
    this.reconnectAttempts = 0
  }

  // 获取连接状态
  getStatus() {
    if (!this.socket) return 'disconnected'
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting'
      case WebSocket.OPEN:
        return 'connected'
      case WebSocket.CLOSING:
        return 'closing'
      case WebSocket.CLOSED:
        return 'closed'
      default:
        return 'unknown'
    }
  }

  // 发送消息（如果需要的话）
  send(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket 未连接，无法发送消息')
    }
  }
}

// 创建单例实例
const websocketManager = new WebSocketManager()

export default websocketManager