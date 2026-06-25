<template>

      <el-progress v-show="isProgressVisible"  type="circle" :percentage="percentage" :width="178"/>

      <el-upload v-show="!isProgressVisible" class="avatar-uploader" 
          :auto-upload="false"
          name="cover" 
          :show-file-list="false"
          :on-progress="handleProgress"
          :onChange="handleSelectAvatar"
          :before-upload="beforeAvatarUpload">
          <img v-if="imageUrl" :src="imageUrl" class="avatar" @load="isProgressVisible=false"/>
          <el-icon v-else class="avatar-uploader-icon">
              <Plus />
          </el-icon>
      </el-upload>
</template>

<script setup>
import { ref } from 'vue';
import {Plus} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus';

// 定义 props
const props = defineProps({
    // 父组件传递的回调函数，用于触发校验
    onValidate: {
        type: Function,
        default: null
    }
})

const imageUrl = ref('')
let modelValue = defineModel()

// 进度条业务
const percentage = ref(0)

const  isProgressVisible = ref(false)


// 准备上传的回调
const beforeAvatarUpload = (rawFile) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(rawFile.type)){
    ElMessage.error('必须为 jpg | png | jpeg 格式')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('图片不能超过2MB')
    return false
  }
   isProgressVisible.value = true
  return true
}

// 上传时的回调
const handleProgress = (event) => {
  percentage.value =  Math.floor(event.percent)
} 

// 文件选择的回调
const handleSelectAvatar = (file) => {
    imageUrl.value = URL.createObjectURL(file.raw)
    modelValue.value = file.raw

    // 如果父组件传递了 onValidate 回调，则执行
    if (props.onValidate && typeof props.onValidate === 'function') {
        props.onValidate()
    }
}

// 对外暴露handleImage方法，用与处理新增时清空图片，编辑时回显图片
const handleImage = (params) => {
  // 如果 params 是 File 对象，转换为 URL
  // 新增时，上传图片是 File 对象，编辑是 图片 显示的是 url 字符串
  if (params instanceof File) {
    imageUrl.value = URL.createObjectURL(params)
  } else {
    imageUrl.value = params
  }
}

defineExpose({
    handleImage,
})


</script>

<style scoped lang="scss">

</style>

<style lang="scss" scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 150px;
  height: 150px;
  text-align: center;
}
</style>