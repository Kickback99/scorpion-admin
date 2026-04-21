<template>
    <div class="left">
        <!-- 折叠 -->
        <el-icon style="margin-right: 10px;" @click="handleToggleCollapse">
            <component :is="configStore.getIsCollapse()?'Expand':'Fold'"></component>
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
            <el-popover placement="bottom" :width="150" trigger="hover">
                <template #reference>
                    <el-button circle icon="Setting"></el-button>
                </template>
                <el-form>
                    <el-form-item label="暗黑模式">
                        <el-switch v-model="dark" @change="toggleDark" size="small" inline-prompt active-icon="Moon"
                            inactive-icon="Sunny" />
                    </el-form-item>
                    <el-divider border-style="dashed" />
                    <el-form-item label="菜单标题">
                        <el-color-picker :show-clear="false" v-model="logoTitleColor" popper-class="colorPic" show-alpha
                            :predefine="predefineColors" @change="setLogoTitleColor" @active-change="currentLogoTitleColor" :teleported=false />
                    </el-form-item>
                    <el-form-item label="保持同步">
                        <el-tooltip content="菜单标题和菜单高亮同步更改" placement="top">
                         <el-checkbox v-model="isSyncColor"/>
                        </el-tooltip>
                    </el-form-item>
                    <el-divider border-style="dashed" />
                    <el-form-item>
                        <el-select v-model="colorModule" ref="selectRef" placeholder="请选择主题色" @change="changeColor" size="small" :teleported=false>
                            <el-option v-for="(item,index) in colorStore.themes" :key="index" :value="item.value" :label="item.label">
                                <span style="display: flex; align-items: center;">
                                    {{ item.label }}
                                    <el-button type="text" v-if="index >= lightMenuThemes.length" icon="Delete" @click.stop="removeOption(item)"
                                        style="margin-left: 8px;"></el-button>
                                </span>
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="菜单背景">
                        <el-color-picker :show-clear="false" v-model="bg" popper-class="colorPic" show-alpha
                            :predefine="predefineColors" @change="setBg" @active-change="currentBg" :teleported=false />
                    </el-form-item>
                    <el-form-item label="菜单文本">
                        <el-color-picker v-model="color" show-alpha :predefine="predefineColors" @change="setColor"
                            @active-change="currentColor" :teleported=false />
                    </el-form-item>
                    <el-form-item label="菜单高亮">
                        <el-color-picker v-model="active" show-alpha :predefine="predefineColors" @change="setActive"
                            @active-change="currentActive" :teleported=false />
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <el-tooltip content="保存当前主题设置" placement="top">
                                <el-button type="primary" :icon="useRenderIcon('ri:save-3-fill')" size="small" @click="addColor" plain circle/>
                            </el-tooltip>
                            <el-button type="primary" icon="Refresh" size="small" @click="resetColor" plain circle/>
                        </template>
                    </el-form-item>
                </el-form>
            </el-popover>
        </div>
        <el-dropdown @command="handleCommand">
            <span class="el-dropdown_box">
                <!-- 添加key强制渲染？ -->
                <!-- <el-avatar :src="handleUrl" :key="avatarKey"/> -->
                <el-avatar :src="handleUrl"/>
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

        <!-- 颜色选择器表单 -->
        <el-dialog v-model="dialogVisible" title="添加主题" width="30%">
            <el-form ref="ruleFormRef" :model="formData" :rules="rules" label-width="120px" class="demo-ruleForm"
                :size="formSize" status-icon>
                <el-form-item label="主题名字" prop="themeName">
                    <el-input :prefix-icon="User" placeholder="请输入主题名字" v-model="formData.themeName" />
                </el-form-item>

                <el-form-item label="主题标识符" prop="themeCode">
                    <el-input :prefix-icon="User" placeholder="请输入主题标识符" v-model="formData.themeCode" />
                </el-form-item>

            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="onConfirm">确认</el-button>
                    <el-button type="primary" @click="dialogVisible = false">
                        取消
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import Home from "@iconify-icons/ep/home-filled";
import avatar from '@/assets/images/avatar.png'
import { useUserStore } from '@/store/user'
import { useSettingStore } from '@/setting'
import { useRoute, useRouter } from 'vue-router';
import { useTokenStore } from '@/store/token'
import { useColorStore } from '@/store/color'
import { adminLogoutApi } from '@/api/admin'
import { clearRoute } from '@/utils/remove';
// import { clearUserInfo } from '@/utils/remove';
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { darkMenuThemes,lightMenuThemes } from '@/assets/common/variable'
import { useRenderIcon } from "./MyIcon/src/hook";
import {useWebSocket} from '@/server/useWebSocket'

// 初始化 WebSocket
const { initWebSocketListener, closeWebSocket } = useWebSocket()

// 导入全局事件总线对象
import emitter from '@/utils/event-bus.js' // 引入事件总线
import { useTabStore } from "@/store/tabs";
import { useConfigStore } from "@/store/config";
const avatarUrlWithTimestamp = ref('') // 带时间戳的头像URL
// const avatarKey = ref(Date.now()) // 初始key
const userStore = useUserStore()
const handleUrl = computed(()=>{
    return avatarUrlWithTimestamp.value || userStore.userInfo.avatar || avatar
})

// 处理URL覆盖
async function overwriteAvatarUrl() {
    await userStore.getUserInfo(true)
      if (userStore.userInfo.avatar) {
    // 1. 添加时间戳
    const timestamp = new Date().getTime()
    avatarUrlWithTimestamp.value = `${userStore.userInfo.avatar}?_t=${timestamp}`
    // console.log('添加时间戳:', avatarUrlWithTimestamp.value)
    // 2. 更新key强制重新创建组件（只在这里改key）
    // avatarKey.value = timestamp
    // 1秒后去掉时间戳，恢复原始URL
    setTimeout(() => {
      avatarUrlWithTimestamp.value = ''
    //   console.log('恢复原始URL')
    }, 1000)
  }
}

emitter.on('changeUrl',overwriteAvatarUrl)




const tokenStore = useTokenStore()
const colorStore = useColorStore()
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

const configStore = useConfigStore()

const handleToggleCollapse = async () => {
    // 调用 configStore 的 toggleCollapse 方法
    // 该方法会：
    // 1. 切换本地 isCollapse 状态（0: 折叠, 1: 展开）
    // 2. 调用后端 API 更新配置
    // 3. 显示成功/失败提示
    await configStore.toggleCollapse()
    
    // 可选：如果需要触发其他组件响应折叠状态变化，可以发送事件
    // emitter.emit('collapse-change', configStore.getIsCollapse())
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

// 主题颜色
const colorModule = ref('')

// 颜色选择器
const predefineColors = ref([
    '#333333',
    '#ffffff',
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

// 关联高亮和标题颜色
const isSyncColor = ref(false)

// 同步颜色的方法
const syncColors = (source, target, sourceRef, targetRef) => {
  if (!isSyncColor.value) return;
  colorStore[target] = source;
  targetRef.value = source; // 直接更新响应式变量
};

// 菜单标题颜色
const logoTitleColor = ref(colorStore.logoTitleColor)
// 点击确定后的颜色
const setLogoTitleColor = () => {
    colorStore.setLogoTitleColor(logoTitleColor.value)
    if (isSyncColor.value) {
    colorStore.setMenuActive(logoTitleColor.value);
    active.value = logoTitleColor.value; // 同步UI
  }
    initColorModule()
}

const currentLogoTitleColor = (color) =>{
    if (isSyncColor.value) {
    colorStore.setMenuActive(color);
    active.value = color; // 同步UI
  }
    colorStore.setLogoTitleColor(color)
}


// 菜单背景颜色
const bg = ref(colorStore.menuBg)
// 点击确定后的颜色
const setBg = () => {
    colorStore.setMenuBg(bg.value)
    initColorModule()
}

const currentBg = (color) => {
    colorStore.setMenuBg(color)
}

// 菜单文本颜色
const color = ref(colorStore.menuTextColor)
// 点击确定后的颜色
const setColor = () => {
    console.log('change事件触发了...')
    colorStore.setMenuTextColor(color.value)
    initColorModule()
}

// 当前激活的颜色
const currentColor = (color) => {
    console.log('active-change事件触发了...')
    colorStore.setMenuTextColor(color)
}

// 菜单激活颜色
const active = ref(colorStore.menuActive)
// 点击确定后的颜色
const setActive = () => {
    colorStore.setMenuActive(active.value)
    if (isSyncColor.value) {
    colorStore.setLogoTitleColor(active.value);
    logoTitleColor.value = active.value; // 同步UI
  }
    initColorModule()
}

const currentActive = (color) => {
    colorStore.setMenuActive(color)
    if (isSyncColor.value) {
    colorStore.setLogoTitleColor(color);
    logoTitleColor.value = color; // 同步UI
  }
}

watch(isSyncColor,()=>{
    if(isSyncColor.value){
        setLogoTitleColor()
    }
})

/* let cacheColor = {
    menuBg:'',
    menuTextColor:'',
    menuActive:''
} */

// 暗黑模式切换
const dark = ref(colorStore.isDark)

const darkStarted = ref(colorStore.darkStarted)


const toggleDark = () => {
    // 获取html根节点
    const html = document.documentElement
    // 如果dark为真，给html标签添加dark类
    colorStore.setDark()
    dark.value ? html.className = 'dark' : html.className = ''
    if (dark.value) {
        // 先存储浅色主题状态
        colorStore.setStorageLightColors(colorModule.value)
        if(darkStarted.value){
            batchSetMenu(darkMenuThemes[0])
            colorModule.value = darkMenuThemes[0].value
            colorStore.setDarkStarted()
        }else {
            if(colorStore.storageDarkColors.colorModel != ''){
                colorModule.value = colorStore.storageDarkColors.colorModel
            }else colorModule.value = ''
            // initColorModule()
            if(colorStore.storageDarkColors.menuBg){
                // 使用深色主题
                batchSetMenuStore(colorStore.storageDarkColors)
            }
        }
    } else {
        // 先存储深色主题状态
        colorStore.setStorageDarkColors(colorModule.value)
        // 使用浅色主题
        if(colorStore.storageLightColors.menuActive){
            batchSetMenuStore(colorStore.storageLightColors)
        }
        if(colorStore.storageLightColors.colorModel != ''){
            colorModule.value = colorStore.storageLightColors.colorModel
        }else colorModule.value = ''
    }
        bg.value = colorStore.menuBg
        color.value = colorStore.menuTextColor
        active.value = colorStore.menuActive
        logoTitleColor.value = colorStore.logoTitleColor
}



/* onMounted(()=>{
    lightMenuThemes.forEach(item => {
        colorStore.addThemes(item)
    })
}) */

onMounted(()=>{
    initColorModule()
})

// 初始化下拉列表的选中项
const  initColorModule = () => {
//   if (dark.value) return;
    const html = document.documentElement
    dark.value ? html.className = 'dark' : html.className = ''
  
  const { menuBg, menuTextColor, menuActive, logoTitleColor, themes } = colorStore;
  console.log('themes',themes)
  
  colorModule.value = themes.find(({ bg, textColor, active, title }) => 
    bg === menuBg &&
    textColor === menuTextColor &&
    active === menuActive &&
    title === logoTitleColor
  )?.value || '';
}

const changeColor = () => {
    /* if(dark.value){
        dark.value = false
    } */
    // 获取html根节点
    const html = document.documentElement
    // 如果dark为真，给html标签添加dark类
    dark.value ? html.className = 'dark' : html.className = ''
    const selected = colorStore.themes.find((item)=> item.value === colorModule.value)
    console.log(selected)
    console.log(colorModule.value)
    bg.value = selected.bg
    color.value = selected.textColor
    active.value = selected.active
    logoTitleColor.value = selected.title
    batchSetMenu(selected)
}

const dialogVisible = ref(false)

const formData = ref({})

const ruleFormRef = ref(null)
const addColor = () =>{
    if(matchesTheme()){
        ElMessage.error('请重新设置主题颜色')
        return;
    }
    dialogVisible.value = true
    formData.value = {}
    nextTick(()=>{
        ruleFormRef.value.clearValidate('themeName')
        ruleFormRef.value.clearValidate('themeCode')
    })
}

const onConfirm = async() => {
    await ruleFormRef.value.validate()
    // if(colorStore.themes)
    const themeObj = {
        label:formData.value.themeName,
        value:formData.value.themeCode,
        bg:colorStore.menuBg,
        textColor:colorStore.menuTextColor,
        active:colorStore.menuActive,
        title:colorStore.logoTitleColor
    }
    colorStore.addThemes(themeObj)
    colorModule.value = themeObj.value
    ElMessage.success('主题新增成功')
    dialogVisible.value = false
}

// 判断背景名字是否包含其中的背景，只要有1个就返回true
function withAnyBg(bg,bgs){
 return bgs.some(item => bg===item.bg) || dark.value
}

function matchesTheme(){
    const { menuBg, menuTextColor, menuActive, logoTitleColor, themes } = colorStore;
    return themes.some(t => 
        t.bg === menuBg &&
        t.textColor === menuTextColor &&
        t.active === menuActive &&
        t.title === logoTitleColor
    )
}


// 绑定表单校验规则
const rules = {
    themeName : [    
      { required: true, message: '请输入主题名字', trigger: 'blur' },
      { min: 1, max: 5, message: '主题名必须是 1-5位 的字符', trigger: 'blur' },
  ],
  themeCode: [
      { required: true, message: '请输入主题标识符', trigger: 'blur' },
      { pattern:/^\S{1,20}$/,message:'主题标识符必须是 1-10位 的非空字符',trigger:'blur'}
    ],
  }

 const resetColor = async() =>{
    console.log(colorStore.menuBg)
    /* if(withAnyBg(colorStore.menuBg,themeBgs)){
        console.log('仓库主题有1个与当前主题相同')
    }else {
        console.log('仓库主题没有包含当前的主题')
    } */
   if(colorStore.themes.length === lightMenuThemes.length){
        ElMessage.error('你没有定义任何的主题，赶快添加吧')
        return;
   }
    let text = matchesTheme()?'这将会删除你自定义的主题，你确定吗？':'当前主题未保存，你确定要重置吗'
    await ElMessageBox.confirm(text,'温馨提示', {
      type: 'warning',
      confirmButtonText: '确认',
      cancelButtonText: '取消'
    })
    colorStore.resetThemes()
    const firstThemes = colorStore.themes[0]
    batchSetMenu(firstThemes)
    colorModule.value = firstThemes.value

    /* if(!dark.value && colorStore.themes.length > 0){
        batchSetMenu(lightMenuThemes[0])
        colorModule.value = lightMenuThemes[0].value                  
    }else {
        colorModule.value = ''
    } */

    bg.value = firstThemes.bg
    color.value = firstThemes.textColor
    active.value = firstThemes.active
    logoTitleColor.value = firstThemes.title
    ElMessage.success('主题重置成功')
 }

 // 批量设置batchSetMenu方法
 const batchSetMenu = (data)=>{
    colorStore.setMenuBg(data.bg)
    colorStore.setMenuTextColor(data.textColor)
    colorStore.setMenuActive(data.active)
    colorStore.setLogoTitleColor(data.title)
 }

  const batchSetMenuStore = (data)=>{
    console.log('data',data)
    colorStore.setMenuBg(data.menuBg)
    colorStore.setMenuTextColor(data.menuTextColor)
    colorStore.setMenuActive(data.menuActive)
    colorStore.setLogoTitleColor(data.logoTitleColor)
 }

 const selectRef = ref(null) // 引用 select 元素

   // 删除选项的方法
   const removeOption = async(item) => {
    await ElMessageBox.confirm(`你确认要删除${item.label}吗`,'温馨提示', {
      type: 'warning',
      confirmButtonText: '确认',
      cancelButtonText: '取消'
    })
    const index = colorStore.themes.indexOf(item);
    if (index !== -1) {
        colorStore.themes.splice(index, 1);
      /* if (colorModule.value === item.value) {
        colorModule.value = '';
      } */
     colorModule.value = lightMenuThemes[0].value
     selectRef.value.$emit('change');
    }
  };
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
</style>