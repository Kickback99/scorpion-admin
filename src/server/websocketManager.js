import { ElMessageBox } from 'element-plus'
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
  }

  // 初始化 WebSocket 连接
  init(userId) {
    if (!userId) {
      console.warn('❌ 没有用户ID，无法初始化 WebSocket')
      return
    }

    // 如果正在连接或已连接，先关闭
    /* if (this.isConnecting || this.socket) {
      this.close()
    } */

    this.isConnecting = true
    
    try {
      const wsUrl = `ws://localhost:8800/websocket/${userId}`
      this.socket = new WebSocket(wsUrl)

      this.socket.onopen = () => {
        console.log('✅ WebSocket 连接成功，用户ID:', userId)
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

  // 处理重连逻辑
  handleReconnect(userId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`🔄 尝试重新连接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.init(userId)
      }, this.reconnectInterval)
    } else {
      console.warn('❌ 达到最大重连次数，停止重连')
    }
  }

  // 处理接收到的消息
  handleMessage(messageData) {
    try {
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
        default:
          console.warn('未知的消息类型:', data.type)
      }
    } catch (error) {
      console.error('解析 WebSocket 消息失败:', error)
    }
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
    if (this.socket) {
      console.log('🔌 手动关闭 WebSocket 连接')
      this.socket.close()
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