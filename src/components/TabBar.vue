<template>
    <div class="left">
        <el-breadcrumb :separator-icon="ArrowRight">
            <el-breadcrumb-item v-for="(item, index) in route.matched" :key="index" v-show="!item.meta.hidden"
                :to="item.path" class="breadcrumb">
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
            <el-popover placement="bottom" :width="150" trigger="hover">
                <template #reference>
                    <el-button circle :icon="Setting"></el-button>
                </template>
                <el-form>
                    <el-form-item label="暗黑模式">
                        <el-switch v-model="dark" @change="toggleDark" size="small" inline-prompt :active-icon="Sunny"
                            :inactive-icon="Moon" />
                    </el-form-item>
                    <el-divider border-style="dashed" />
                    <el-form-item>
                        <el-select v-model="colorModule" placeholder="请选择主题色" @change="changeColor" size="small" :teleported=false>
                            <el-option v-for="(item,index) in colorStore.themes" :key="index" :value="item.value" :label="item.label">
                                <span style="display: flex; align-items: center;">
                                    {{ item.label }}
                                    <el-button type="text" :disabled="index<2" :icon="Delete" @click.stop="removeOption(item)"
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
                            <el-button type="primary" :icon="Plus" size="small" @click="addColor" plain />
                            <el-tooltip content="应用当前主题设置" placement="top">
                                <el-icon>
                                    <i-ep-questionFilled></i-ep-questionFilled>
                                </el-icon>
                            </el-tooltip>
                            <el-button type="primary" :icon="Refresh" size="small" @click="resetColor" plain
                                style="margin-left: 10px;" />
                        </template>
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
import {
    Delete,
    ArrowDown,
    ArrowRight,
    Refresh,
    FullScreen,
    Setting,
    Moon,
    Sunny,
    Plus
} from '@element-plus/icons-vue'
import avatar from '@/assets/avatar.jpg'
import { useUserStore } from '@/store/user'
import { useSettingStore } from '@/store/setting'
import { useRoute, useRouter } from 'vue-router';
import { useTokenStore } from '@/store/token'
import { useColorStore } from '@/store/color'
import { adminLogoutApi } from '@/api/admin'
import { clearRoute } from '@/utils/remove';
import { clearUserInfo } from '@/utils/remove';
import { computed, nextTick, onMounted, ref } from "vue";
import { darkMenu,menuThemeArr } from '@/assets/common/variable'

const userStore = useUserStore()
const tokenStore = useTokenStore()
const colorStore = useColorStore()

const route = useRoute()
const router = useRouter()

const displayName = computed(() => {
    if (userStore.roleNames && userStore.roleNames.length > 0) return userStore.roleNames[0]
    else if (userStore.userInfo.nickname) return userStore.userInfo.nickname
    else return userStore.userInfo.username
})

/* const queryRouter = (item) =>{
    console.log(item.path)
} */

// 处理刷新业务
const settingStore = useSettingStore()

const modifyRefresh = () => {
    settingStore.refresh = !settingStore.refresh
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
        // 发送注销请求
        const res = await adminLogoutApi()
        // 清空token
        tokenStore.removeToken()
        console.log('清空前', router.getRoutes())
        // 清空用户信息
        clearUserInfo()
        // 清空动态路由数据
        clearRoute(userStore.userMenu)
        console.log('清空后', router.getRoutes())
        // 清空菜单
        userStore.userMenu = []
        // 清空用户名
        userStore.username = ''
        // 提示信息
        ElMessage.success(res.message)
        // 跳转到登录页
        router.push({ path: '/login', query: { redirect: route.path } })
    }
}

// 颜色选择器
const predefineColors = ref([
    '#333333',
    '#eeeeee',
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

// 菜单背景颜色
const bg = ref(colorStore.menuBg)
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
}

// 当前激活的颜色
const currentColor = (color) => {
    console.log('active-change事件触发了...')
    colorStore.setMenuTextColor(color)
}

// 菜单激活颜色
const active = ref(colorStore.menuActive)

const setActive = () => {
    colorStore.setMenuActive(active.value)
}

const currentActive = (color) => {
    colorStore.setMenuActive(color)
}

/* let cacheColor = {
    menuBg:'',
    menuTextColor:'',
    menuActive:''
} */

// 暗黑模式切换
const dark = ref(false)
let cacheColorModule = ''

const collectColor = {}
const toggleDark = () => {
    // 获取html根节点
    const html = document.documentElement
    // 如果dark为真，给html标签添加dark类
    dark.value ? html.className = 'dark' : html.className = ''
    if (dark.value) {
        colorStore.storageColors()
        colorStore.setMenuBg(darkMenu.bg)
        colorStore.setMenuTextColor(darkMenu.textColor)
        colorStore.setMenuActive(darkMenu.active)
        console.log(colorStore.menuBg)
        cacheColorModule = colorModule.value
        colorModule.value = ''
    } else {
        if(cacheColorModule != ''){
            colorModule.value = cacheColorModule
        }
        colorStore.setMenuBg(colorStore.storageColors.menuBg),
        colorStore.setMenuTextColor(colorStore.storageColors.menuTextColor),
        colorStore.setMenuActive(colorStore.storageColors.menuActive)
    }
        bg.value = colorStore.menuBg
        color.value = colorStore.menuTextColor
        active.value = colorStore.menuActive
}

// 主题颜色
const colorModule = ref('')

/* onMounted(()=>{
    menuThemeArr.forEach(item => {
        colorStore.addThemes(item)
    })
}) */

onMounted(()=>{
    initColorModule()
})

const  initColorModule = () => {
    if(!dark.value){
        const currentTheme = colorStore.themes.find(item => item.bg === colorStore.menuBg)
        if(currentTheme) {
            colorModule.value = currentTheme.value
        }else {
            colorModule.value = ''
        }
    }
}

const changeColor = () => {
    if(dark.value){
        dark.value = false
    }
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
    batchSetMenu(selected)

}

const dialogVisible = ref(false)

const formData = ref({})

const ruleFormRef = ref(null)
const addColor = () =>{
    if(withAnyBg(colorStore.menuBg,colorStore.themes)){
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
    dark.value = false
    // if(colorStore.themes)
    const themeObj = {
        label:formData.value.themeName,
        value:formData.value.themeCode,
        bg:colorStore.menuBg,
        textColor:colorStore.menuTextColor,
        active:colorStore.menuActive
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
   if(colorStore.themes.length === menuThemeArr.length){
        ElMessage.error('你没有定义任何的主题，赶快添加吧')
        return;
   }
    let text = withAnyBg(colorStore.menuBg,colorStore.themes)?'这将会删除你自定义的主题，你确定吗？':'当前主题未保存，你确定要重置吗'
    await ElMessageBox.confirm(text,'温馨提示', {
      type: 'warning',
      confirmButtonText: '确认',
      cancelButtonText: '取消'
    })
    colorStore.resetThemes()
    if(!dark.value && colorStore.themes.length > 0){
        batchSetMenu(menuThemeArr[0])
        colorModule.value = menuThemeArr[0].value                  
    }else {
        colorModule.value = ''
    }

    ElMessage.success('主题重置成功')
 }

 // 批量设置batchSetMenu方法
 const batchSetMenu = (data)=>{
    colorStore.setMenuBg(data.bg)
    colorStore.setMenuTextColor(data.textColor)
    colorStore.setMenuActive(data.active)
 }

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
      if (colorModule.value === item.value) {
        colorModule.value = '';
      }
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