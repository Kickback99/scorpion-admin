<template>
    <div class="left">
        <el-breadcrumb :separator-icon="ArrowRight">
            <el-breadcrumb-item   v-for="(item, index) in route.matched" :key="index" v-show="!item.meta.hidden" :to="item.path" 
            class="breadcrumb"
            >
                <el-icon>
                    <IconifyOffline :icon="item.meta.icon || Home"></IconifyOffline>
                </el-icon>
                <span>{{ item.meta.title }}</span>
                <!-- <button @click="queryRouter(item)">查看当前路由</button> -->
            </el-breadcrumb-item>
        </el-breadcrumb>
        <br>
    </div>
    <div class="right">
        <div class="buttons">
            <el-button circle :icon="Refresh" @click="modifyRefresh"></el-button>
            <el-button circle :icon="FullScreen" @click="fullScreen"></el-button>
            <el-popover
    placement="bottom"
    :width="300"
    :height="700"
    trigger="hover"
  >
    <template #reference>
        <el-button circle :icon="Setting"></el-button>
    </template>
    <el-form> 
    <el-form-item>
        <el-color-picker v-model="color" show-alpha :predefine="predefineColors" @change="setColor" @active-change="currentColor" :teleported=false  />
    </el-form-item>
  </el-form>
  </el-popover>
        </div>
        <el-dropdown @command="handleCommand">
            <span class="el-dropdown_box">
                <el-avatar :src="userStore.userInfo.avatar || avatar" />
                <!-- {{ tokenStore.roleNames[0] || tokenStore.userInfo.username || tokenStore.userInfo.nickname}} -->
                  {{ displayName }}
                <el-icon>
                    <arrow-down />
                </el-icon>
            </span>
            <!-- 折叠的下拉部分 -->
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item command="profile" :icon="User">基本资料</el-dropdown-item>
                    <el-dropdown-item command="avatar" :icon="Crop">更换头像</el-dropdown-item>
                    <el-dropdown-item command="password" :icon="EditPen">重置密码</el-dropdown-item>
                    <el-dropdown-item command="logout" :icon="SwitchButton">退出登录</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
</template>

<script setup>
import Home from "@iconify-icons/ep/home-filled";
import { ArrowDown,
ArrowRight,
Refresh,
FullScreen,
Setting} from '@element-plus/icons-vue'
import avatar from '@/assets/avatar.jpg'
import { useUserStore } from '@/store/user'
import {useSettingStore} from '@/store/setting'
import { useRoute,useRouter} from 'vue-router';
import {useTokenStore} from '@/store/token'
import {adminLogoutApi} from '@/api/admin'
import { clearRoute } from '@/utils/remove';
import { clearUserInfo } from '@/utils/remove';
import { computed, onMounted,ref } from "vue";

const userStore = useUserStore()
const tokenStore = useTokenStore()

const route =  useRoute()
const router = useRouter()

const displayName = computed(()=>{
    if(userStore.roleNames && userStore.roleNames.length >0)return userStore.roleNames[0]
    else if(userStore.userInfo.nickname) return userStore.userInfo.nickname
    else return userStore.userInfo.username
})

/* const queryRouter = (item) =>{
    console.log(item.path)
} */

// 处理刷新业务
const settingStore =  useSettingStore()

const modifyRefresh = () =>{
    settingStore.refresh = !settingStore.refresh
}

// 处理全屏
const fullScreen = () => {
    let full = document.fullscreenElement
    // 切换全屏模式，是全屏则为true，不是则为false
    if(!full) {
        document.documentElement.requestFullscreen()
    }else document.exitFullscreen()
}

// 处理下拉事件
const handleCommand = async(key) => {
  console.log('下拉事件执行了')
  if(key === 'logout'){
    // 发送注销请求
    const res = await adminLogoutApi()
    // 清空token
    tokenStore.removeToken()
    console.log('清空前',router.getRoutes())
    // 清空用户信息
    clearUserInfo()
    // 清空动态路由数据
    clearRoute(userStore.userMenu)
    console.log('清空后',router.getRoutes())
    // 清空菜单
    userStore.userMenu = []
    // 清空用户名
    userStore.username = ''
    // 提示信息
    ElMessage.success(res.message)
    // 跳转到登录页
    router.push({path:'/login',query:{redirect:route.path}})
  }
}

// 颜色选择器
const color = ref(settingStore.menuTextColor)
const predefineColors = ref([
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
  'rgba(255, 69, 0, 0.68)',
  'rgb(255, 120, 0)',
  'hsv(51, 100, 98)',
  'hsva(120, 40, 94, 0.5)',
  'hsl(181, 100%, 37%)',
  'hsla(209, 100%, 56%, 0.73)',
  '#c7158577',
])

// 点击确定后的颜色
const setColor = () => {
    settingStore.setMenuTextColor(color.value)
}

// 当前激活的颜色
const currentColor = (color) => {
    settingStore.setMenuTextColor(color)
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
    .breadcrumb {
        .el-icon, span{
            font-size: 15px;
            vertical-align: middle;
        }
        .el-icon {
            margin-right: 2px
        }
    }
}

.right {
    @include flex(null,center,null);
    .buttons {
        margin-right: 20px;
    }
}
</style>