<template>
    <div class="window" v-if="maskVisible">
        <!-- <div class="header">
            <span class="iconfont icon-back" @click="close"></span>
        </div> -->
        <div class="content">
            <slot></slot>
        </div>
        <div class="footer">
            <el-row justify="center">
                <el-button type="danger" @click="emit('closeMask')">返回</el-button>
                <el-button type="primary" @click="emit('openDialog')">确定</el-button>
            </el-row>
        </div>
    </div>
</template>

<script setup>

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
    z-index: 3;
    background-color: red;
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
    // background-color: honeydew;
    padding: 10px;
}

.footer {
    height: 50px;

    .el-row {
        margin-top: 5px;
    }

    // background-color: deeppink;
}
</style>