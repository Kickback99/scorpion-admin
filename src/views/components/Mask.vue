<template>
    <div v-if="maskVisible" class="window" :style="{
        backgroundColor:userConfigStore.isDarkEnabled?'#222':'#fff',
        }">
        <!-- <div class="header">
            <span class="iconfont icon-back" @click="close"></span>
        </div> -->
        <div class="content">
            <slot></slot>
        </div>
        <div class="footer">
            <el-row justify="center" align="middle">
                <el-button size="small" type="info" @click="emit('closeMask')" plain>返回</el-button>
                <el-button size="small" type="primary" @click="emit('openDialog')" plain>确定</el-button>
            </el-row>
        </div>
    </div>
</template>

<script setup>
import { useUserConfigStore } from '@/store/userConfig'
const userConfigStore = useUserConfigStore()
const windowWidth = window.innerWidth - 260

defineProps({
    maskVisible: {
        type: Boolean,
        default: false
    },
})


const emit = defineEmits(['closeMask', 'openDialog'])
const close = () => {
    emit('close')
}

</script>

<style scoped lang="scss">
.window {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: calc(100vh - 70px);
    // min-height: 100%;
    z-index: 20;
}

.header {
    height: 30px;
    display: flex;
    align-items: center;

    .icon-back {
        font-size: 25px;
        cursor: pointer;
    }
}

.content {
    height: calc(100vh - 250px);
    overflow-y: auto;
    padding: 10px;
}

.footer {
    // height: 50px;
    // background: coral;
    // line-height: 50px;
    .el-row {
        margin-top: 35px;
    }

    // background-color: deeppink;
}
</style>