<template>
     <Mask :maskVisible="maskVisible" @closeMask="maskVisible=false" @openDialog="handleOpen">

        <el-form :model="blogData" ref="blogFormRef" :rules="rules">
            <el-form-item prop="title">
                    <el-input 
                    :style="{backgroundColor:colorStore.isDark?'#000':'#fff'}" 
                    :class="{'dark-mode':colorStore.isDark}"
                    placeholder="请输入标题" v-model="blogData.title" />
            </el-form-item>
            <el-form-item prop="content">
         
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
                    <el-radio-group v-model="formModel.descriptionType" @change="handleDescriptionTypeChange">
                        <el-radio :label="'auto'">自动生成</el-radio>
                        <el-radio :label="'empty'">留空</el-radio>
                        <el-radio :label="'custom'">自定义</el-radio>
                    </el-radio-group>
                </el-form-item>
                <!-- 自定义摘要输入框（条件渲染） -->
                <el-form-item v-if="formModel.descriptionType === 'custom'" prop="customDescription">
                    <el-input
                    v-model="formModel.customDescription"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入自定义摘要"
                    maxlength="150"
                    show-word-limit
                    />
                </el-form-item>
                <el-form-item label="文章分类" prop="categoryId">
                    <CateSelect v-model="formModel.categoryId"></CateSelect>
                </el-form-item>

              <!-- 将el-input-tag放在el-form-item中 -->
              <el-form-item label="文章标签" prop="tagNames">
                <SmartAutoComplete
                    v-model="formModel.tagNames"
                    :fetch-suggestions-api="fetchTags"
                    :separators="/[\s\-_\.\/:]+/"
                    placeholder="请输入标签名称"
                    :max="10"
                    :debounce-delay="100"
                    :min-search-length="1"
                />
              </el-form-item>

                <el-form-item label="文章封面" prop="cover">
                    <SmartUpload ref="uploadRef" v-model="formModel.cover"></SmartUpload>
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
import { ref, reactive, onMounted, nextTick } from 'vue';
import Mask from './Mask.vue';
import Markdown from '@/components/Markdown.vue';
import CateSelect from './CateSelect.vue';
import { addApi, findApi, modifyApi } from '@/api/conarticle';
import SmartUpload from '@/views/components/SmartUpload.vue';
import { useColorStore } from '@/store/color';
const colorStore = useColorStore()
let mdHeight = window.innerHeight - 30 - 70 - 200
import PinyinMatch from 'pinyin-match';
import { listApi } from '@/api/contag.js';
import SmartAutoComplete from './SmartAutoComplete.vue';

// ==================== 标签相关 ====================

// 标签数据
const tagList = ref([])

// 加载所有标签数据
const loadAllTags = async () => {
  const res = await listApi(1, 999, {})
  const items = res.data?.items || []
  tagList.value = items.map(item => ({
    value: item.name.trim(),
    id: item.id,
    remark: item.remark
  }))
  console.log('加载所有标签:', tagList.value.length, '条')
}

// 前端搜索函数
const fetchTags = async (params) => {
  const query = params.keyword || ''
  
  if (!query) {
    return tagList.value
  }
  
  const lowerQuery = query.toLowerCase()
  
  const matched = tagList.value.filter(item => {
    const text = item.value
    const lowerText = text.toLowerCase()
    
    // 1. 英文直接包含匹配
    if (lowerText.includes(lowerQuery)) {
      return true
    }
    
    // 2. PinyinMatch（中文拼音）
    if (PinyinMatch.match(text, query)) {
      return true
    }
    
    // 3. 单词前缀匹配
    const words = lowerText.split(/[\s\-_]+/)
    for (const word of words) {
      if (word.startsWith(lowerQuery)) {
        return true
      }
    }
    
    // 4. 复合词首字母匹配
    if (words.length > 1) {
      const initials = words.map(word => word[0]).join('')
      if (initials.includes(lowerQuery)) {
        return true
      }
    }
    
    // 5. 单词内字符匹配
    let charIndex = 0
    for (let i = 0; i < lowerText.length && charIndex < lowerQuery.length; i++) {
      if (lowerText[i] === lowerQuery[charIndex]) {
        charIndex++
      }
    }
    if (charIndex === lowerQuery.length) {
      return true
    }
    
    return false
  })
  
  return matched
}

// ==================== 文章相关 ====================

const blogData = ref({
    title: '',
    content: ''
})
const formModel = reactive({
  categoryId: null,
  status:null,
  descriptionType: 'auto', // 默认自动生成
  customDescription: '',   // 自定义摘要内容
  description: null,       // 实际提交给后端的值
  tagNames:[]
})
const dialogVisible = ref(false)
const dialogTitle = ref('')

// mask弹窗
const maskVisible = ref(false)

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
    // 重置数据
    Object.assign(formModel,{
        id:null,
        categoryId: null,
        status:null,
        descriptionType: 'auto', // 默认自动生成
        customDescription: '',   // 自定义摘要内容
        description: null,       // 实际提交给后端的值
        tagNames: [] // 重置标签
    })
   }else {
    // 回显
      dialogTitle.value = '修改文章'
    const res = await findApi(param.id)
    console.log("回显res.data",res.data)
    const {title,content,...rest} = res.data
    blogData.value = {title,content}  
    Object.assign(formModel,rest)
    if(res.data.isAutoDescription === 0){
          formModel.descriptionType = 'auto'
    }else if(res.data.isAutoDescription === 1){
          formModel.descriptionType = 'empty'
    } else {
          formModel.descriptionType = 'custom'
          formModel.customDescription = res.data.description
    }

   }
}

defineExpose({
    handleToggle, openMask
})

const emit = defineEmits(['reRender'])

// 监听描述类型变化
const handleDescriptionTypeChange = (type) => {
  switch(type) {
    case 'auto':
      formModel.description = null // 传null表示自动生成
      break
    case 'empty':
      formModel.description = ''   // 传空字符串表示刻意留空
      break
    case 'custom':
      formModel.description = formModel.customDescription // 使用自定义内容
      break
  }
}


const blogFormRef = ref(null)

const rules = {
  title:[
    { required: true, message: '请输入标题'},
  ],
  content:[
    { required: true, message: '请输入内容'},
  ],
}

const uploadRef = ref()

const handleOpen = async() => {
  const valid = await blogFormRef.value.validate().catch(() => false)
  if (!valid) return
  
  dialogVisible.value = true
  
  // 等待对话框打开和内容渲染
  await nextTick()
  
  // 现在 SmartUpload 组件已经创建
  if (uploadRef.value && uploadRef.value.handleImage) {
    const imageUrl = !formModel.id ? '' : formModel.cover
    console.log('对话框打开后调用 handleImage:', imageUrl)
    uploadRef.value.handleImage(imageUrl)
  }
}

const handlePublish = async(status) => {

    formModel.status = status

    // 最后一次确认description值
  if (formModel.descriptionType === 'custom') {
    formModel.description = formModel.customDescription
    // formModel.isAutoDescription = null; // 明确设置为null
  }

    const data = {
      article:{
        ...blogData.value,
        ...formModel
      },
      tagNames: formModel.tagNames
    }

  // 移除临时字段
  delete data.article.descriptionType
  delete data.article.customDescription
  delete data.article.tagNames // 移除tagNames字段，因为article表中没有这个字段

    if(!formModel.id){
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

// 组件挂载时加载标签数据
onMounted(() => {
    loadAllTags()
})
</script>

<style scoped lang="scss">
  // 针对<el-input placeholder="请输入标题" v-model="blogData.title" />
  // 不管校验是否生效，都保持原来的样式！

 :deep(.el-form .el-form-item .el-form-item__content .el-input__wrapper){

	box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
  .el-input__inner {
    color: #000;
  }
}
 :deep(.dark-mode .el-input__wrapper .el-input__inner){
   color: #fff !important;
 }

</style>