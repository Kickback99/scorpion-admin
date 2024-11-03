<template>
    <div class="left">
        <el-breadcrumb :separator-icon="ArrowRight">
            <el-breadcrumb-item  to="item.patch" v-for="(item, index) in route.matched" v-show="!item.meta.hidden" :key="index"
            class="breadcrumb"
            >
                <el-icon>
                    <IconifyOffline :icon="item.meta.icon || Home"></IconifyOffline>
                </el-icon>
                <span>{{ item.meta.title }}</span>
            </el-breadcrumb-item>
        </el-breadcrumb>
    </div>
    <div class="right">
        <div class="buttons">
            <el-button circle :icon="Refresh"></el-button>
            <el-button circle :icon="FullScreen"></el-button>
            <el-button circle :icon="Setting"></el-button>
        </div>
        <el-dropdown @command="handleCommand">
            <span class="el-dropdown_box">
                <el-avatar :src="userStore.avatar || avatar" />
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
import { useRoute } from 'vue-router';
const userStore = useUserStore()

const route =  useRoute()

</script>

<style scoped lang="scss">


.el-dropdown_box {
    display: flex;
    align-items: center;
    outline: none;
    .el-icon {
    margin-left: 10px;
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