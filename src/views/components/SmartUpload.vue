<template>

      <el-progress v-show="isProgressVisible"  type="circle" :percentage="percentage" :width="178"/>

      <el-upload v-show="!isProgressVisible" class="avatar-uploader" 
          :action="handleAction" 
          name="cover" 
          :headers="headers"
          :show-file-list="false"
          :on-success="onSuccess"
          :on-progress="handleProgress"
          :before-upload="beforeAvatarUpload">
          <img v-if="imageUrl" :src="imageUrl" class="avatar" @load="isProgressVisible=false"/>
          <el-icon v-else class="avatar-uploader-icon">
              <Plus />
          </el-icon>
      </el-upload>
</template>

<script setup>
import { computed, ref } from 'vue';
import {Plus} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus';
import { useTokenStore } from '@/store/token';
const imageUrl = ref('')
let modelValue = defineModel()
const tokenStore = useTokenStore()

// 手动设置请求头
const headers = computed(() => {
  return {
    authorization: tokenStore.token || ''
  }
})

// t_upload_request：封面图片请求
// 处理上传文件地址
const handleAction = computed(()=>{
  return `${import.meta.env.VITE_API}/admin/upload/cover`
})

// 图片上传成功之后的回调
const onSuccess = (res,uploadFile) => {
    console.log(res)
    // 用URL来做图片的本地预览
    imageUrl.value = URL.createObjectURL(uploadFile.raw)
    // 把后端图片的地址传递给父组件 formModel.cover
    modelValue.value = res.data
}

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

// 对外暴露handleImage方法，用与处理新增时清空图片，编辑时回显图片
const handleImage = (params) => {
  console.log('SmartUpload的handleImage被调用了....')
      console.log(params)
      imageUrl.value = params
}

defineExpose({
    handleImage
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