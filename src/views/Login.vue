<template>
    <el-row class="login-page">
        <el-col :span="12" class="bg"></el-col>
        <el-col :offset="3" :span="6" class="form">
            
      <el-form
        ref="ruleFormRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        class="demo-ruleForm"
        :size="formSize"
        status-icon
        v-if="isRegister"
        >
        <!-- 注册表单 -->
        <el-form-item>
            <h1>注册</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input :prefix-icon="User"  placeholder="请输入用户名" v-model="formData.username"/>
        </el-form-item>
    
        <el-form-item prop="password">
          <el-input :prefix-icon="Lock"  placeholder="请输入密码" v-model="formData.password"  show-password/>
        </el-form-item>
    
        <el-form-item prop="repassword">
          <el-input :prefix-icon="Lock" placeholder="请输入确认密码" v-model="formData.repassword" show-password/>
        </el-form-item>
        <el-form-item>
          <el-button @click="registerEve" type="primary" class="button">注册</el-button>
        </el-form-item>
        <el-form-item class="flex">
        <el-link type="info" :underline="false" @click="isRegister = false;clearRegisterData()">
            ← 返回
            </el-link>
        </el-form-item>
      </el-form>
    
              
      <el-form
        ref="ruleFormRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        class="demo-ruleForm"
        :size="formSize"
        status-icon
        v-else
        >
        <!-- 登录表单 -->
        <el-form-item>
            <h1>登录</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input :prefix-icon="User"  placeholder="请输入用户名" v-model="formData.username"/>
        </el-form-item>
    
        <el-form-item prop="password">
          <el-input :prefix-icon="Lock"  placeholder="请输入密码" v-model="formData.password"  show-password/>
        </el-form-item>
        <el-form-item>
            <div class="flex">
                <el-checkbox>记住我</el-checkbox>
                <el-link type="primary">忘记密码？</el-link>
            </div>
        </el-form-item>
        <el-form-item>
          <el-button @click="loginEve" auto-insert-space type="primary" class="button">登录</el-button>
        </el-form-item>
        <el-form-item class="flex">
        <el-link type="info" :underline="false" @click="isRegister = true;clearRegisterData()">
            ← 注册
            </el-link>
        </el-form-item>
      </el-form>
    
        </el-col>
    </el-row>
    </template>
    
    <script setup>
    import {ref} from 'vue'
    import { ElMessage } from 'element-plus'
    import {User,Lock} from '@element-plus/icons-vue'
    import {userRegisterService,userLoginService} from '@/api/user'
    import {useTokenStore} from '@/store/token'
    const tokenStore = useTokenStore()
    const ruleFormRef = ref(null)
    const isRegister = ref(false)
    import { useRouter } from 'vue-router'; //编程式导航需要引入useRouter
    const router = useRouter()
    
    // 绑定表单数据
      const formData = ref({
        username:'',
        password:'',
        repassword:''
      })
    
    // 检验确认密码规则
    const checkRePassword = (rule,value,callback)=>{
        if(!value){
            callback(new Error('请输入密码'))
        }else if(value != formData.value.password){
            callback(new Error('两次密码填写不一致'))
        }else callback()
    }
    
    // 绑定表单校验规则
      const rules = {
        username : [    
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 5, max: 10, message: '用户名必须是 5-10位 的字符', trigger: 'blur' },
      ],
        password : [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { pattern:/^\S{6,15}$/,message:'密码必须是 6-15位 的非空字符',trigger:'blur'}
        ],
        // 自定义校验规则
        repassword: [
          { validator: checkRePassword, trigger: 'blur' }    
        ]
      }
    
      //t_user_request：用户注册请求
    const registerEve = async() => {
        //预校验：注册成功之前，先进行校验，校验成功 ➟ 请求，校验失败 ➟ 自动提示
        await ruleFormRef.value.validate()
        await userRegisterService(formData.value)
        // console.log('开始发送注册请求...')
        ElMessage.success('注册成功')
    
        
    }
    
    //t_user_request：用户登录请求
    const loginEve = async() =>{
      await ruleFormRef.value.validate()
      const res = await userLoginService(formData.value)
      console.log(res.data)
      tokenStore.setToken(res.data)
      ElMessage.success('登录成功')
      router.push('/')
    }
    
    </script>
    
    <style scoped lang="scss">
    .login-page {
        height: 100vh;
        // background-color: red;
        .bg {
            background: url('@/assets/logo2.png') no-repeat 60% center / 240px auto,
                url('@/assets/login_bg.jpg') no-repeat center / cover;
            border-radius: 0 20px 20px 0;
        }
    
        .form {
            display: flex;
            flex-direction: column;
            justify-content: center;
    
         
                .flex {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                }
    
                .el-button {
                    width: 100%;
                }
        }
    }
    </style>