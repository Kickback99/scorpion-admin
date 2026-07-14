<template>
     <Mask :maskVisible="maskVisible" @closeMask="handleCloseMask" @openDialog="handleOpenDialog">

        <el-form :model="blogData" ref="blogFormRef" :rules="rules">
            <el-form-item prop="title">
                    <el-input 
                    :style="{backgroundColor:userConfigStore.isDarkEnabled?'#000':'#fff'}"
                    :class="{'dark-mode':userConfigStore.isDarkEnabled}"
                    placeholder="请输入标题" v-model="blogData.title" />
            </el-form-item>

            <div 
            :style="{ height: hasSelectedArticle ? IMAGE_REFERENCE_EXPANDED_HEIGHT : IMAGE_REFERENCE_COLLAPSED_HEIGHT }"
            style="transition: height 0.3s ease; overflow: hidden;"
            >
              <ImageReference
                ref="imageReferenceRef"
                :article-id="formModel.id"
                :article-title="blogData.title"
                layout="horizontal"
                title="引用图片"
                search-label="搜索"
                search-placeholder="请输入文章标题搜索已上传的图片"
                :show-clear="true"
                :show-hint="true"
                :disabled="false"
                :showImageTypeSwitch="true"
                image-type="all"
                empty-text="该文章暂无内容图"
                display-field="uuid"
                @select-article="handleImageSelectArticle"
                @insert-image="handleImageInsert"
                @clear="handleImageClear"
                @update:selected="handleSelectedChange"
              />
            </div>

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
            <el-form ref="formRef" :model="formModel" label-width="auto" size="small"> 
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

              <!-- 文章封面：支持文件上传 / 自定义链接 两种模式 -->
              <el-form-item label="文章封面" prop="cover">
                  <el-radio-group v-model="formModel.coverOption" @change="handleCoverOptionChange">
                      <el-radio :label="'upload'">文件上传</el-radio>
                      <el-radio :label="'custom'">自定义链接</el-radio>
                       <el-radio :label="'ref'">引用封面</el-radio>
                  </el-radio-group>
              </el-form-item>

              <!-- 文件上传模式 -->
              <el-form-item v-if="formModel.coverOption === 'upload'" label=" " prop="cover">
                  <SmartUpload ref="uploadRef" v-model="formModel.cover"></SmartUpload>
              </el-form-item>

              <!-- 自定义链接模式 -->
              <el-form-item v-if="formModel.coverOption === 'custom'" label=" " prop="customCoverLink">
                  <el-input
                      v-model="formModel.customCoverLink"
                      placeholder="请输入图片链接地址，如：https://example.com/cover.jpg"
                  />
                  <el-tooltip placement="right">
                      <template #content>
                          <div>输入图片的 URL 地址，将直接作为文章封面使用</div>
                      </template>
                      <el-icon class="form-tip-icon"><QuestionFilled /></el-icon>
                  </el-tooltip>
              </el-form-item>

              <!-- 引用封面模式 -->
              <el-form-item v-if="formModel.coverOption === 'ref'" label=" " prop="coverReference">
                <div class="cover-reference-wrapper">
                  <SmartAutoComplete
                    v-model="selectedCoverArticle"
                    :fetch-suggestions-api="fetchArticleForCover"
                    placeholder="请输入文章标题搜索封面"
                    :max="1"
                    :debounce-delay="300"
                    :min-search-length="1"
                    :auto-search-on-enter="true"
                    :allow-custom="false"
                    custom-disabled-message="请选择已存在的文章"
                    style="width: 100%"
                    @tag-removed="handleCoverArticleRemoved"
                  />
                  <!-- 封面预览 -->
                  <div v-if="formModel.refCover" class="cover-preview">
                    <el-image
                      :src="formModel.refCover"
                      fit="contain"
                      class="cover-image"
                    />
                  </div>
                </div>
              </el-form-item>

              <!-- 轮播设置区域（极简版） -->
              <el-form-item label="轮播设置">
                  <el-radio-group v-model="carouselData.isCarousel" @change="handleCarouselChange">
                      <el-radio :label="true">开启</el-radio>
                      <el-radio :label="false">关闭</el-radio>
                  </el-radio-group>
              </el-form-item>
            
              <!-- 排序输入框（条件渲染） -->
              <el-form-item v-if="carouselData.isCarousel" label="轮播排序">
                  <el-input-number 
                      v-model="carouselData.sort" 
                      :min="0" 
                      :max="999" 
                      controls-position="right"
                      placeholder="自动"
                      style="width:150px;"
                      class="carousel-input"
                       @change="handleSortChange"
                  />
                  <el-tooltip placement="right">
                  <template #content>
                      <div>
                        <span>数字越小越靠前，留空自动排最后</span>
                      </div>
                  </template>
                  <el-icon class="form-tip-icon"><QuestionFilled /></el-icon>
                </el-tooltip>
              </el-form-item>

            </el-form>

            <template #footer>
                <span class="dialog-footer">
                    <el-button size="small" type="info" @click="dialogVisible = false; hasSelectedArticle = (imageReferenceRef?.getImageList()?.length || 0) > 0" plain>取消</el-button>
                    <el-button size="small" type="warning" @click="handlePublish(1)" plain>草稿</el-button>
                    <el-button size="small" type="primary" @click="handlePublish(0)" plain>发布</el-button>
                </span>
            </template>
        </el-dialog>
     </Mask>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch } from 'vue';
import Mask from './Mask.vue';
import Markdown from '@/components/Markdown.vue';
import CateSelect from './CateSelect.vue';
import { addApi, findApi, getCarouselByArticleApi, modifyApi, uploadCoverApi } from '@/api/article.js';
import SmartUpload from '@/views/components/SmartUpload.vue';
import { useUserConfigStore } from '@/store/userConfig';
const userConfigStore = useUserConfigStore()
let mdHeight = window.innerHeight - 30 - 70 - 200
import PinyinMatch from 'pinyin-match';
import { getTagListApi } from '@/api/business';
import SmartAutoComplete from './SmartAutoComplete.vue';
import ImageReference from '@/views/components/ImageReference.vue';
import { getArticleBusinessDataApi } from '@/api/business'; 
import { fileMetaListApi } from '@/api/filemeta'; //
import msg from '@/components/msg'

// ==================== 引用图片相关 ====================

const imageReferenceRef = ref(null);
const hasSelectedArticle = ref(false);
const selectedCoverArticle = ref([]);
const coverArticleCache = ref([]);  // 缓存文章搜索结果

// 引用图片组件容器高度
const IMAGE_REFERENCE_EXPANDED_HEIGHT = '330px';
const IMAGE_REFERENCE_COLLAPSED_HEIGHT = '150px';

// 处理选中状态变化
const handleSelectedChange = (selected) => {
  hasSelectedArticle.value = selected;
};

/**
 * Mask 关闭 / 确定时，重置选中状态为未展开
 */
const handleCloseMask = () => {
  maskVisible.value = false;
  hasSelectedArticle.value = false;
};

const handleOpenDialog = () => {
  handleOpen();
};

/**
 * 选择文章时触发
 */
const handleImageSelectArticle = (data) => {
  if (data) {
    console.log('已选择文章:', data.id, data.title);
  } else {
    console.log('已取消选择');
  }
};

/**
 * 插入图片时触发
 */
const handleImageInsert = (data) => {
  console.log('插入图片:', data);
  
  // 将图片插入到 Markdown 内容中
  const currentContent = blogData.value.content || '';
  blogData.value.content = currentContent + '\n' + data.markdown;
  
  msg.primary(`图片 "${data.title || '图片'}" 已插入到内容末尾`);
  
  // 重置选中状态
  imageReferenceRef.value?.resetSelection();
};

/**
 * 清空时触发
 */
const handleImageClear = () => {
  console.log('已清空');
};

// 在编辑文章回显时，自动加载图片
/* const handleToggle = async(param) => {
  // ... 原有回显逻辑 ...
  
  // 编辑文章时，ImageReference 组件会自动通过 articleId 加载图片
  // 如果需要在特定时机手动触发，可以调用：
  // await imageReferenceRef.value?.loadByArticleId(param.id);
} */

// ============================================================
// 引用封面相关
// ============================================================

/**
 * 搜索文章（用于引用封面）
 */
const fetchArticleForCover = async (params) => {
  const query = params.keyword || '';

  try {
    const res = await getArticleBusinessDataApi();
    if (res.code === 200) {
      const data = (res.data || []).map(item => ({
        value: item.title,
        id: item.id
      }));
      coverArticleCache.value = data;

      if (!query) {
        return data;
      }

      const lowerQuery = query.toLowerCase();
      return data.filter(item => {
        const text = item.value;
        const lowerText = text.toLowerCase();

        if (lowerText.includes(lowerQuery)) return true;
        if (PinyinMatch.match(text, query)) return true;

        const words = lowerText.split(/[\s\-_]+/);
        for (const word of words) {
          if (word.startsWith(lowerQuery)) return true;
        }

        if (words.length > 1) {
          const initials = words.map(w => w[0]).join('');
          if (initials.includes(lowerQuery)) return true;
        }

        return false;
      });
    }
    return [];
  } catch (error) {
    console.error('搜索文章失败:', error);
    return [];
  }
};

/**
 * 监听 selectedCoverArticle 变化 → 用标题反查 ID → 加载封面
 */
watch(selectedCoverArticle, async (newVal) => {
  if (newVal.length > 0) {
    const title = newVal[0];
    // 从缓存中反查 ID
    const found = coverArticleCache.value.find(item => item.value === title);
    if (found) {
      try {
        const res = await fileMetaListApi(1, 1, {
          targetIds: found.id,
          fileType: 'cover'
        });
        if (res.code === 200 && res.data.items && res.data.items.length > 0) {
          const coverFileMeta = res.data.items[0];
          formModel.refCover = coverFileMeta.img;        // 用于预览
          formModel.refCoverUuid = coverFileMeta.uuid;   // 保存 UUID，用于提交
        } else {
          formModel.refCover = null;
          msg.warning('该文章暂无封面');
        }
      } catch (error) {
        console.error('获取封面失败:', error);
        msg.warning('获取封面失败');
      }
    }
  } else {
    // 移除标签 → 清空封面
    formModel.refCover = null;
  }
}, { deep: true });

/**
 * 移除引用文章 → 清空封面
 */
const handleCoverArticleRemoved = () => {
  formModel.cover = null;
};

// ==================== 标签相关 ====================

// 标签数据
const tagList = ref([])

// 加载所有标签数据
const loadAllTags = async () => {
  const res = await getTagListApi(1, 999, {})
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

// 封面上传状态
const isCoverUploading = ref(false)

const formModel = reactive({
  categoryId: null,
  status:null,
  descriptionType: 'auto', // 默认自动生成
  customDescription: '',   // 自定义摘要内容
  description: null,       // 实际提交给后端的值
  tagNames:[],
  coverOption: 'upload',       // 默认文件上传
  customCoverLink: '',      // 封面文件对象（File 或 URL 字符串）
  cover:null,                // / 最终存储的封面URL（用于回显）
  refCover: null,            // 预览 URL
  refCoverUuid: null         // 提交用的 UUID
})

// 独立轮播数据
const carouselData = ref({
    isCarousel: false,    // 是否在轮播中
    sort: null,           // 排序号
    carouselId: null,     // 轮播记录ID（用于更新/删除）
    articleId: null       // 关联的文章ID
})

// 重置轮播数据
const resetCarouselData = () => {
    carouselData.value = {
        isCarousel: false,
        sort: null,
        carouselId: null,
        articleId: null
    }
}

// 处理排序变化：0 自动转为 null（自动）
const handleSortChange = (val) => {
    if (val === 0) {
        carouselData.value.sort = null
    }
}

const dialogVisible = ref(false)
const dialogTitle = ref('')

// mask弹窗
const maskVisible = ref(false)

// 暴露打开遮罩层方法
// 无论是添加文章还是编辑文章，都需要打开mask弹窗
const openMask = () => {
    maskVisible.value = !maskVisible.value
}

// 封面选项切换时，清空另一个字段的值
const handleCoverOptionChange = (val) => {
    if (val === 'upload') {
        // 切换到文件上传：清空自定义链接
        formModel.customCoverLink = ''
        formModel.refCover = null
        nextTick(() => uploadRef.value?.handleImage(formModel.cover))
    } else if(val === 'custom') {
        // 切换到自定义链接：清空文件上传的值
        if(!formModel.id){
          formModel.refCover = null
          formModel.cover = null
        }
        // 如果 uploadRef 有清空方法，可以调用
        /* if (uploadRef.value && uploadRef.value.clear) {
            uploadRef.value.clear()
        } */
    }else if (val === 'ref') {
        // 切换到引用封面时，清空自定义链接
        formModel.customCoverLink = '';
        // 如果当前 cover 是自定义链接（http开头），清空
          formModel.cover = null
    }
}

// 处理轮播开关变化
const handleCarouselChange = (val) => {
    if (!val) {
        carouselData.value.sort = null
    }
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
    selectedCoverArticle.value = [],  // 清空引用标题

    // 重置数据
    Object.assign(formModel,{
        id:null,
        categoryId: null,
        status:null,
        descriptionType: 'auto', // 默认自动生成
        customDescription: '',   // 自定义摘要内容
        description: null,       // 实际提交给后端的值
        tagNames: [],             // 重置标签
        coverOption: 'upload',        //默认文件上传
        customCoverLink: '',       // 清空自定义链接
        cover: null,
        refCover: null,            // 预览 URL
        refCoverUuid: null         // 提交用的 UUID
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

    // 根据后端返回的 coverMode 回显封面
    if (res.data.coverMode === 'upload') {
      formModel.coverOption = 'upload'
      formModel.cover = res.data.cover  // 完整 URL
      formModel.customCoverLink = ''
      formModel.refCover = null
      formModel.refCoverUuid = null
    } else if (res.data.coverMode === 'custom') {
      formModel.coverOption = 'custom'
      formModel.customCoverLink = res.data.cover
      formModel.cover = null
      formModel.refCover = null
      formModel.refCoverUuid = null
    } else if (res.data.coverMode === 'ref') {
      formModel.coverOption = 'ref'
      formModel.refCover = res.data.cover  // 完整 URL（预览用）
      formModel.refCoverUuid = rest.cover   // UUID（提交用）
      // 回显引用的文章标题到 SmartAutoComplete
      if (res.data.coverSourceTitle) {
        selectedCoverArticle.value = [res.data.coverSourceTitle]
      }
      formModel.cover = null
    }
    

    // 查询轮播信息并回显到 carouselData
    try {
        const carouselRes = await getCarouselByArticleApi(param.id)
        if (carouselRes.data) {
            carouselData.value.isCarousel = true
            carouselData.value.sort = carouselRes.data.sort
            carouselData.value.carouselId = carouselRes.data.id
            carouselData.value.articleId = param.id
        } else {
            resetCarouselData()
        }
    } catch (e) {
        // 没有轮播记录，保持默认状态
        resetCarouselData()
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

  hasSelectedArticle.value = false
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

    hasSelectedArticle.value = false
    formModel.status = status

    // 最后一次确认description值
  if (formModel.descriptionType === 'custom') {
    formModel.description = formModel.customDescription
    // formModel.isAutoDescription = null; // 明确设置为null
  }

    let cover;
    if (formModel.coverOption === 'custom') {
      if (!formModel.customCoverLink) {
          msg.warning('请填写自定义图片链接')
          return
      }
      cover = formModel.customCoverLink
    }else if (formModel.coverOption === 'ref') {
      // 引用封面模式：使用 refCover
      if (!formModel.refCoverUuid) {
        msg.warning('请先选择要引用的文章封面');
        return;
      }
      cover = formModel.refCoverUuid;
    }else if (formModel.coverOption === 'upload') {
    // 直接传 formModel.cover，不管它是 URL 还是 File
    // 后端会自己判断格式
    if (formModel.cover instanceof File) {
        cover = null; // 新文件等待上传
    } else {
        cover = formModel.cover; // 直接传，后端会提取 UUID
    }
}

    const data = {
      article:{
        ...blogData.value,
        ...formModel,
        cover: cover
      },
      tagNames: formModel.tagNames,
      isCarousel: carouselData.value.isCarousel,
      sort: carouselData.value.sort || 0
    }

  // 移除临时字段
  delete data.article.descriptionType
  delete data.article.customDescription
  delete data.article.tagNames // 移除tagNames字段，因为article表中没有这个字段

  try {
    
    let articleId = formModel.id

    if(!formModel.id){
        // t_article_request：文章新增请求
        const res = await addApi(data)
        const articleId = res.data
        console.log("==================== articleId ====================", articleId)
        // 如果是文件上传模式，上传封面
        if (formModel.coverOption === 'upload' && formModel.cover instanceof File) {
            const coverUrl = await uploadCoverApi(articleId, formModel.cover)
            if (coverUrl) {
                formModel.cover = coverUrl
            }
        }
    }else {
        // t_article_request：文章修改请求
        await modifyApi(data)
        // 如果是文件上传模式，上传封面
        if (formModel.coverOption === 'upload' && formModel.cover instanceof File) {
            const coverUrl = await uploadCoverApi(articleId, formModel.cover)
            if (coverUrl) {
                formModel.cover = coverUrl
            }
        }
    }
    msg.primary(formModel.id ? '修改成功' : '添加成功')
    dialogVisible.value = false
    openMask()
    emit('reRender')
  }catch(error){
    msg.error('提交失败，请重试')
  }
}

// 组件挂载时加载标签数据
onMounted(() => {
    loadAllTags()
})

// 编辑回显时展开，新增时收缩
/* watch(() => formModel.id, (newVal) => {
  if (newVal) {
    hasSelectedArticle.value = true;
  }
}, { immediate: true }); */
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


 .form-tip-icon {
  margin-left: 8px;
  color: #909399;
  font-size: 14px;
  cursor: help;
  vertical-align: middle;
}

:deep(.el-form .el-form-item .el-form-item__content .el-input__wrapper .el-input__inner ){
   color: var(--el-text-color-regular);
}

// 覆盖所有 el-form-item__content 会影响 原生 `label` 和 `el-form-item` 的布局
/* :deep(.el-form-item .el-form-item__content) {
    display: block !important;
    width: 100% !important;
    flex: none !important;
    align-items: stretch !important;
} */
// ============================================================
// 封面样式
// ============================================================

.cover-reference-wrapper {
  width: 100%;

  .cover-preview {
    position: relative;
    margin-top: 12px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--el-border-color-lighter);
    background: var(--el-fill-color-light);
    transition: all 0.3s ease;
    aspect-ratio: 16 / 9;
    max-width: 120px;

    .cover-image {
      width: 100%;
      height: auto;
      display: block;
      object-fit: contain;
    }
  }

}

</style>