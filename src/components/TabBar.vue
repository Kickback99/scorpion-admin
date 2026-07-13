<template>
    <div class="left">
        <!-- 折叠 -->
        <el-icon style="margin-right: 10px;" @click="handleToggleCollapse">
            <component :is="userConfigStore.getCollapseEnabled() ?'Expand':'Fold'"></component>
        </el-icon>
        <!-- 面包屑 -->
        <el-breadcrumb separator-icon="ArrowRight">
            <el-breadcrumb-item v-for="(item, index) in route.matched" :key="index" v-show="!item.meta.hidden"
                :to="item.path" class="breadcrumb">
                <el-icon>
                    <OfflineIcon :icon="item.meta.icon || Home" :isCollect="false"></OfflineIcon>
                </el-icon>
                <span>{{ item.meta.title }}</span>
                <!-- <button @click="queryRouter(item)">查看当前路由</button> -->
            </el-breadcrumb-item>
        </el-breadcrumb>
        <br>
    </div>
    <div class="right">
        <div class="buttons">
            <el-button circle icon="Refresh" @click="modifyRefresh"></el-button>
            <el-button circle icon="FullScreen" @click="fullScreen"></el-button>
            <el-popover placement="bottom" :width="260" trigger="hover">
                <template #reference>
                    <el-button circle icon="Setting"></el-button>
                </template>
                <el-form>
                    <el-form-item label="暗黑模式">
                        <el-switch :model-value="userConfigStore.isDarkEnabled" @change="toggleDark" size="small" inline-prompt active-icon="Moon"
                            inactive-icon="Sunny" />
                    </el-form-item>
                    <el-form-item label="主题色">
                        <div class="theme-picker">
                            <span
                                v-for="t in themeList"
                                :key="t.name"
                                class="theme-dot"
                                :class="{ active: userConfigStore.currentTheme === t.name }"
                                :style="{ backgroundColor: themePresets[t.name].colors.primary.bg }"
                                :title="t.label"
                                @click="handleThemeChange(t.name)"
                            ></span>
                        </div>
                    </el-form-item>
                    <el-form-item label="文字色模式">
                        <el-radio-group
                            :model-value="iconStore.textColorMode"
                            @change="onTextColorModeChange"
                            size="small"
                            :disabled="iconStore.uiMode !== 'full'"
                        >
                            <el-radio-button value="preset">配置文件</el-radio-button>
                            <el-radio-button value="dynamic">动态计算</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="菜单折叠">
                        <el-switch :model-value="userConfigStore.getCollapseEnabled()"  @change="userConfigStore.toggleCollapse" size="small" inline-prompt active-icon="Expand"
                            inactive-icon="Fold" />
                    </el-form-item>
                    <el-divider />
                    <el-form-item label="按钮样式">
                        <ButtonStyleSettings />
                    </el-form-item>
                </el-form>
            </el-popover>
            <SmartMenuSearch />
        </div>
        <el-dropdown @command="handleCommand">
            <span class="el-dropdown_box">
                <!-- 添加key强制渲染？ -->
                <!-- <el-avatar :src="handleAvatar" :key="avatarKey"/> -->
                <el-avatar :src="handleAvatar"/>
                <!-- {{ tokenStore.roleNames[0] || tokenStore.userInfo.username || tokenStore.userInfo.nickname}} -->
                <!-- {{ displayName }} -->

                {{ userStore.userInfo.nickname || userStore.userInfo.username }}
                <el-icon>
                    <component is="ArrowDown"></component>
                </el-icon>
            </span>
            <!-- 折叠的下拉部分 -->
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item command="profile" icon="User">基本资料</el-dropdown-item>
                    <!-- <el-dropdown-item command="avatar" :icon="Crop">更换头像</el-dropdown-item> -->
                    <el-dropdown-item command="rePassword" icon="EditPen">重置密码</el-dropdown-item>
                    <el-dropdown-item command="logout" icon="SwitchButton">退出登录</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
</template>

<script setup>
import Home from "@iconify-icons/ep/home-filled";
import avatar from '@/assets/images/avatar-circle.png'
import { useUserStore } from '@/store/user'
import { useSettingStore } from '@/setting'
import { useRoute, useRouter } from 'vue-router';
import { useTokenStore } from '@/store/token'
import { useUserConfigStore } from '@/store/userConfig'
import { useIconStore } from '@/store/icon'
import { themePresets, themeList } from '@/assets/common/theme/presets'
import { applyTheme } from '@/assets/common/theme'
import { adminLogoutApi } from '@/api/admin'
import { clearRoute } from '@/utils/remove';
import { computed, nextTick, onMounted, ref, watch } from "vue";
import SmartMenuSearch from '@/views/components/SmartMenuSearch.vue'
import ButtonStyleSettings from '@/components/ButtonStyleSettings.vue'
import {useWebSocket} from '@/server/useWebSocket'

// 初始化 WebSocket
const { initWebSocketListener, closeWebSocket } = useWebSocket()

// 导入全局事件总线对象
import { useTabStore } from "@/store/tabs";

const userStore = useUserStore()
const userConfigStore = useUserConfigStore()
const iconStore = useIconStore()
const handleAvatar = computed(()=>{
    return userStore.userInfo.avatar || avatar
})




const tokenStore = useTokenStore()
const tabStore = useTabStore()

const route = useRoute()
const router = useRouter()

const displayName = computed(() => {
    /* if (userStore.roleNames && userStore.roleNames.length > 0) return userStore.roleNames[0]
    else if (userStore.userInfo.nickname) return userStore.userInfo.nickname
    else return userStore.userInfo.username */
    if(userStore.userInfo.nickname) return userStore.userInfo.nickname
    else return userStore.userInfo.username
})

/* const queryRouter = (item) =>{
    console.log(item.path)
} */

// 处理菜单折叠
const stringStore = useSettingStore()

const handleToggleCollapse = async () => {
    // 调用 userConfigStore 的 toggleCollapse 方法
    // 该方法会：
    // 1. 切换本地 isCollapse 状态（0: 折叠, 1: 展开）
    // 2. 调用后端 API 更新配置
    // 3. 显示成功/失败提示
    await userConfigStore.toggleCollapse()
    
    // 可选：如果需要触发其他组件响应折叠状态变化，可以发送事件
    // emitter.emit('collapse-change', userConfigStore.getUserCollapseEnabled())
}

const modifyRefresh = () => {
    stringStore.refresh = !stringStore.refresh
}

// 处理全屏
const fullScreen = () => {
    let full = document.fullscreenElement
    // 切换全屏模式，是全屏则为true，不是则为false
    if (!full) {
        document.documentElement.requestFullscreen()
    } else document.exitFullscreen()
}

// 处理下拉事件
const handleCommand = async (key) => {
    console.log('下拉事件执行了')
    if (key === 'logout') {
        await ElMessageBox.confirm('你确认要退出登录吗', '温馨提示', {
            type: 'warning',
            confirmButtonText: '确认',
            cancelButtonText: '取消'
        })
        // 发送注销请求
        const res = await adminLogoutApi()
        closeWebSocket()
        // 清空token
        tokenStore.removeToken()
        console.log('清空前', router.getRoutes())
        // 清空用户信息
        // clearUserInfo()
        // 清空动态路由数据
        clearRoute(userStore.userMenu)
        console.log('清空后', router.getRoutes())
        // 清空用户信息和菜单
        userStore.clearUserStore()
        // 清空标签页
        tabStore.clearTabs()
        // 清空菜单
        // userStore.removeUserAuth()
        // 清空用户名
        // userStore.username = ''
        // 提示信息
        ElMessage.success(res.message)
        // 跳转到登录页
        // router.push({ path: '/login', query: { redirect: route.path } })
                // 构建完整的重定向URL，包含查询参数
        const redirectUrl = route.path + (route.query && Object.keys(route.query).length ? `?${new URLSearchParams(route.query).toString()}` : '')
        
        // 跳转到登录页，携带完整的重定向信息
        router.push({
            path: '/login',
            query: {
                redirect: redirectUrl
            }
        })
    }else {
        router.push(`/user/${key}`)
    }
}

// 暗黑模式切换
const toggleDark = async () => {
    const html = document.documentElement
    await userConfigStore.toggleDark()
    html.className = userConfigStore.isDarkEnabled ? 'dark' : ''
}

// 主题色切换
const handleThemeChange = async (themeName) => {
    await userConfigStore.setTheme(themeName)
}

// 实心文字色模式切换
const onTextColorModeChange = (mode) => {
    iconStore.setTextColorMode(mode)
    applyTheme(userConfigStore.currentTheme, userConfigStore.isDarkEnabled)
}
</script>

<style scoped lang="scss">
.el-dropdown_box {
    display: flex;
    align-items: center;
    outline: none;

    .el-avatar {
        margin-right: 5px;
    }

    .el-icon {
        margin-left: 5px;
    }
}

.left {
    @include flex(null, center, null);
    .breadcrumb {

        .el-icon,
        span {
            font-size: 15px;
            vertical-align: middle;
        }

        .el-icon {
            margin-right: 2px
        }
    }
}

.right {
    @include flex(null, center, null);

    .buttons {
        margin-right: 20px;
    }
}

// 隐藏颜色选择器清空按钮的2种方式

// 组件内颜色选择器包含 popper-class="colorPic" 生效
/* :deep(.colorPic .el-color-dropdown__link-btn){
    display: none
   } */

// 组件内生效
:deep(.el-color-dropdown__link-btn) {
    display: none
}

.theme-picker {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  .theme-dot {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid transparent;
    transition: border-color 0.2s, transform 0.2s;

    &:hover {
      transform: scale(1.15);
    }

    &.active {
      border-color: var(--el-color-primary);
      box-shadow: 0 0 0 2px var(--el-bg-color), 0 0 0 4px var(--el-color-primary);
    }
  }
}
</style>