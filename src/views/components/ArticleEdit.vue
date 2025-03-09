<template>
     <Mask :maskVisible="maskVisible" @closeMask="maskVisible=false" @openDialog="dialogVisible=true">

        <el-form :model="blogData">
            <el-form-item>
                    <el-input placeholder="请输入标题" v-model="blogData.title" />
            </el-form-item>
            <el-form-item>
         
                <!-- attention -->
                <!-- 老罗使用的是 -->
            <!--1. 老罗使用的数据库字段是content，markdownContent
                2. content字段是 html 格式(监听事件：htmlContent，用于展示端显示)
                3. markdownContent字段是 md 格式(监听事件：update:modelValue，用于编辑数据时，v-md-editor回显) -->
                <!-- <EditorMarkdown :height="mdHeight" v-model="blogData.MarkdownContent"></EditorMarkdown> -->
                
                <!-- 我使用的是 -->
                <!-- md格式到数据库content -->
                <!-- 后期如何将md格式展示到前端，可以看 obsidian笔记 ➟ 12、富文本编辑器 -->
                <Markdown :height="mdHeight" v-model="blogData.content"></Markdown>
                <!-- {{ blogData.content }} -->
            </el-form-item>
        </el-form>

        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="30%">
            <el-form ref="formRef" :model="formModel" label-width="auto"> 
                <el-form-item label="文章描述" prop="description">
                    <el-input v-model="formModel.description" placeholder="请输入" />
                </el-form-item>
                <el-form-item label="分类选择" prop="categoryId">
                    <CateSelect v-model="formModel.categoryId"></CateSelect>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="warning" @click="handlePublish(1)"> 草稿 </el-button>
                    <el-button type="primary" @click="handlePublish(0)"> 发布 </el-button>
                </span>
            </template>
        </el-dialog>
     </Mask>
</template>

<script setup>
import { ref } from 'vue';
import Mask from './Mask.vue';
import Markdown from '@/components/Markdown.vue';
import CateSelect from './CateSelect.vue';
import { addApi, findApi, modifyApi } from '@/api/conarticle';

let mdHeight = window.innerHeight - 30 - 70 - 200

const blogData = ref({})
const formModel = ref({})
const dialogVisible = ref(false)
const dialogTitle = ref('')

// mask弹窗
const maskVisible = ref(false)

// 暴露打开方法


// 暴露打开遮罩层方法
// 无论是添加文章还是编辑文章，都需要打开mask弹窗
const openMask = () => {
    maskVisible.value = !maskVisible.value
}

// 组件对外暴露一个方法handleToggle
// 判断添加还是编辑
/* 
    添加就重置文章数据，编辑就回显文章数据
 */
const handleToggle = async(param) => {
   if(!param.id){
    // 添加重置
    dialogTitle.value = '新增文章'
    blogData.value = {}
    formModel.value = {}
   }else {
    // 回显
      dialogTitle.value = '修改文章'
    const res = await findApi(param.id)
    blogData.value = res.data
    formModel.value = res.data
   }
}

defineExpose({
    handleToggle, openMask
})

const emit = defineEmits(['reRender'])


const handlePublish = async(status) => {

    formModel.value.status = status

    const data = {
        ...blogData.value,
        ...formModel.value
    }

    if(!formModel.value.id){
        // t_article_request：文章新增请求
        await addApi(data)
        ElMessage.success('添加成功')
    }else {
        // t_article_request：文章修改请求
        await modifyApi(data)
        ElMessage.success('修改成功')
    }
    dialogVisible.value = false
    openMask()
    emit('reRender')
}

</script>

<style scoped lang="scss">

</style>