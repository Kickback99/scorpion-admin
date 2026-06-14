<template>
    <div class="login">
        <el-form ref="loginRef" :model="formModel" :rules="rules" class="login-form">
            <h3 class="title">蝎子编程-后台管理系统</h3>
            <el-form-item prop="username">
                <el-input v-model="formModel.username" :prefix-icon="User" size="large" auto-complete="off" placeholder="账号"></el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input v-model="formModel.password" :prefix-icon="Lock" size="large" auto-complete="off" placeholder="密码" @keyup.enter="handleLogin" show-password></el-input>
            </el-form-item>
            <el-checkbox v-model="formModel.checkPwd" style="margin:0px 0px 25px 0px;" @click="handleCheckbox">记住密码</el-checkbox>
            <el-form-item style="width:100%;">
                <el-button :loading="loading" size="large" type="primary" style="width:100%;" @click.prevent="handleLogin">
                    <span>登 录</span>
                </el-button>
            </el-form-item>
        </el-form>
        <!--  底部  -->
        <div class="el-login-footer">
            <span>Copyright © 2012-2024 <a href="http://www.scorpioncode.vip" target="_blank">scorpioncode.vip</a> 版权所有.</span>
        </div>
    </div>
</template>


<script setup>
import { nextTick, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus'
import {User,Lock} from '@element-plus/icons-vue'
import {adminLoginApi} from '@/api/admin'
import {useTokenStore} from '@/store/token'
import { useUserStore } from '@/store/user';
const tokenStore = useTokenStore()
const userStore = useUserStore()
import { useRoute, useRouter } from 'vue-router'; //编程式导航需要引入useRouter
// 导入全局事件总线对象
import { eventBus } from '@/utils/event-bus'; 

const router = useRouter()
const route = useRoute()

const loginRef = ref(null)
const loading = ref(false)

  // 绑定表单数据
  const formModel = ref({
    username:'',
    password:'',
    checkPwd:false
})

  // 绑定表单校验规则
  const rules = {
      username : [    
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 4, max: 20, message: '用户名必须是 4-20位 的字符', trigger: 'blur' },
    ],
      password : [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { pattern:/^\S{4,15}$/,message:'密码必须是 4-15位 的非空字符',trigger:'blur'}
      ],
    }

//t_user_request：用户登录请求
const handleLogin = async() => {
    await loginRef.value.validate()
    loading.value = true
    try {
    const res = await adminLoginApi(formModel.value)
    // scorpioncode(res.data)
    tokenStore.setToken(res.data)

    // 处理记住密码逻辑 - 简单判断是否勾选
    if (formModel.value.checkPwd) {
        // 用户勾选了记住密码，保存凭证
        tokenStore.saveCredentials(formModel.value.username, formModel.value.password)
    } else {
            // 用户没有勾选记住密码，清除凭证
            tokenStore.clearCredentials()
    }
    loading.value = false
    // 强制刷新用户信息
    await userStore.getUserInfo()
    if(userStore.userInfo.type === 0){
        ElMessage.success('登录成功')
    }
    // 处理重定向逻辑 - 解码重定向路径
    let redirect = route.query.redirect
    if (redirect) {
        // 如果redirect是字符串且被编码过，进行解码
        if (typeof redirect === 'string') {
            // 尝试解码，如果已经是解码状态则不会报错
            try {
                redirect = decodeURIComponent(redirect)
            } catch (e) {
                // 如果解码失败，说明可能已经是解码状态，使用原值
                // scorpioncode('Redirect path is already decoded or invalid')
            }
        }
        router.push(redirect || '/')
    } else {
        router.push('/')
    }

      await nextTick()
      eventBus.emit('adjustTabScroll');

    // 在路由跳转后触发调整
    /* setTimeout(() => {
        eventBus.emit('adjustTabScroll');
    }, 300); */

    } catch (error) {
        // scorpioncode(error)
        loading.value = false
        throw(error)
    }
}

const handleCheckbox = async() => {
        try {
        // 先校验表单
        await loginRef.value.validate()
        // 如果校验通过，允许勾选状态改变（这里不需要额外操作，因为v-model会自动更新）
        
    } catch (error) {
        // 校验失败时，阻止复选框状态改变
        formModel.value.checkPwd = !formModel.value.checkPwd
        ElMessage.warning('请先正确填写用户名和密码')
    }
}

onMounted(()=>{
    if (tokenStore.hasSavedCredentials()) {
        formModel.value.username = tokenStore.savedUsername
        formModel.value.password = tokenStore.getDecryptedPassword()
        formModel.value.checkPwd = true
    }
})

</script>
<style lang="scss" scoped>
a {
    color: white
}

.login {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-image: $login-bg;
    background-size: cover;
}

.title {
    margin: 0px auto 30px auto;
    text-align: center;
    color: #444;
}

.login-form {
    border-radius: 15px;
    background: rgba(255,255,255,0.5);
    width: 400px;
    padding: 25px 25px 5px 25px;
    backdrop-filter: blur(5px);
    box-shadow: 5px 5px 20px rgba(0,0,0,0.8);

    .el-input {
        height: 40px;

        input {
            display: inline-block;
            height: 40px;
        }
    }

    .input-icon {
        height: 39px;
        width: 14px;
        margin-left: 0px;
    }
}

.login-tip {
    font-size: 13px;
    text-align: center;
    color: #bfbfbf;
}

.login-code {
    width: 33%;
    height: 40px;
    float: right;

    img {
        cursor: pointer;
        vertical-align: middle;
    }
}

.el-login-footer {
    height: 40px;
    line-height: 40px;
    position: fixed;
    bottom: 0;
    width: 100%;
    text-align: center;
    color: #fff;
    font-family: Arial;
    font-size: 12px;
    letter-spacing: 1px;
}

.login-code-img {
    height: 40px;
    padding-left: 12px;
}

:deep(.login-form .el-input){
   background-color: #fff !important;
}

:deep(.el-input__wrapper){
    box-shadow: none;
    .el-input__inner {
       color: #606266 !important; 
   }
}

:deep(span.el-checkbox__label){
       color: #606266 !important; 
}
</style>