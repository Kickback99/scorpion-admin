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
            <el-checkbox style="margin:0px 0px 25px 0px;">记住密码</el-checkbox>
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
import { ref } from 'vue';
import { ElMessage } from 'element-plus'
import {User,Lock} from '@element-plus/icons-vue'
import {adminLoginApi} from '@/api/admin'
import {useTokenStore} from '@/store/token'
const tokenStore = useTokenStore()
import { useRoute, useRouter } from 'vue-router'; //编程式导航需要引入useRouter
const router = useRouter()
const route = useRoute()

const loginRef = ref(null)
const loading = ref(false)

  // 绑定表单数据
  const formModel = ref({
    username:'',
    password:'',
})

  // 绑定表单校验规则
  const rules = {
      username : [    
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 4, max: 20, message: '用户名必须是 5-10位 的字符', trigger: 'blur' },
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
    console.log(res.data)
    tokenStore.setToken(res.data)
    ElMessage.success('登录成功')
    loading.value = false
    // 从本地存储中获取原始路由的查询参数
    const originalRouteQuery = JSON.parse(localStorage.getItem('originalRouteQuery'));
     // 如果存在保存的路由信息，则重定向到该路由
      if (originalRouteQuery) {
        // 使用带有查询参数的路径重定向用户
        console.log('从本地跳转')
        if(originalRouteQuery.path === '/404'){
          router.push('/')
          localStorage.removeItem('originalRouteQuery');
          return;
        }
        router.push({ path: originalRouteQuery.path, query: originalRouteQuery.query });
        // 清除保存的路由信息
        localStorage.removeItem('originalRouteQuery');
      } else {
        // 如果没有保存的路由信息，可以重定向到首页或其他默认页面
        console.log('开始重定向')
        let redirect = route.query.redirect
        router.push({path: redirect || '/'});
      }
    } catch (error) {
      loading.value = false
    }
}



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
</style>