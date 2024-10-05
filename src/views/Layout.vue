<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="220px">
        <el-menu router
      active-text-color="palegreen" 
          background-color="transparent" 
          :default-active="handelUrl"
          text-color="666"
          mode="vertical"
        >
          <menu-tree :listData="listData"></menu-tree>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>
          <div><h2>{{userStore.username}}</h2></div>
                <el-dropdown @command="handleCommand">
                        <span class="el-dropdown_box">
                            <el-avatar :src=" userStore.avatar || avatar" />
                            <el-icon>
                                    <arrow-down />
                            </el-icon>
                        </span>
                        <!-- 折叠的下拉部分 -->
                        <template #dropdown>
                            <el-dropdown-menu>
                            <el-dropdown-item command="profile" :icon="User"
                                >基本资料</el-dropdown-item
                            >
                            <el-dropdown-item command="avatar" :icon="Crop"
                                >更换头像</el-dropdown-item
                            >
                            <el-dropdown-item command="password" :icon="EditPen"
                                >重置密码</el-dropdown-item
                            >
                            <el-dropdown-item command="logout" :icon="SwitchButton"
                                >退出登录</el-dropdown-item
                            >
                            </el-dropdown-menu>
                        </template>
                </el-dropdown>
        </el-header>
        <el-main>
          <el-breadcrumb separator=">">
              <el-breadcrumb-item :to="{ path: r.path === '/system'?'/system/sysUser':r.path }" v-for="r in breadList">
                {{ r.meta.title }}
              </el-breadcrumb-item>
          </el-breadcrumb>
          <router-view/>
        </el-main>
        <el-footer>Footer</el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import MenuTree from '@/components/MenuTree.vue';
import {useUserStore} from '@/store/user'
import {useTokenStore} from '@/store/token'
import { ref,watch } from 'vue';
import {ArrowDown} from '@element-plus/icons-vue'
import avatar from '@/assets/avatar.jpg'
import {userLogoutService} from '@/api/user'
// import { ElMessage } from 'element-plus'
const userStore = useUserStore()
const listData = ref([])
listData.value = userStore.userMenu

//路由对象--获取路由参数
import { useRoute, useRouter } from 'vue-router'
import { clearRoute } from '@/utils/clearRoute';
const route = useRoute()

const router = useRouter()

// 面包屑

const breadList = ref([])

function getBreadList(){
  breadList.value =  route.matched
}
getBreadList()

watch(route, () => getBreadList());

const handelUrl = ref('/')
handelUrl.value = route.path 
watch(()=>route.path,()=>{
  handelUrl.value = route.path 
})



const tokenStore = useTokenStore()

// 处理下拉事件
const handleCommand = async(key) => {
  console.log('下拉事件执行了')
  if(key === 'logout'){
    // 发送注销请求
    const res = await userLogoutService()
    // 清空token
    tokenStore.removeToken()
    console.log('清空前',router.getRoutes())
    // 清空动态路由数据
    clearRoute(userStore.userMenu)
    console.log('清空后',router.getRoutes())
    // 清空菜单
    userStore.userMenu = []
    // 清空用户名
    userStore.username = ''
    // 提示信息
    ElMessage.success(res.msg)
    // 跳转到登录页
    router.replace('/login')
  }
}



</script>

<style lang="scss" scoped>
.el-container{
  height: 100vh;
}

.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .el-icon{
            margin-left: 10px;
        }
    .el-dropdown_box {
      display: flex;
      align-items: center;
      outline: none;
      &:active,
      &:hover {
        outline: none;
      }
    }
}

.el-aside {
  background-color: coral;
}
</style>