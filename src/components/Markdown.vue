<template>
    <div :class="{'dark-mode': userConfigStore.isDarkEnabled}" style="width: 100%;">
        <!-- <v-md-editor :modelValue="modelValue"
            :height="height + 'px'" :include-level="[1, 2, 3, 4, 5, 6]" :disabled-menus="[]"
            @change="onChange"
            :config="{mode:'markdown'}"
            @upload-image="handleUploadImage">
        </v-md-editor> -->

        <component 
        :is="MarkdownPreview" 
        :modelValue="modelValue"
        :height="height + 'px'" :include-level="[1, 2, 3, 4, 5, 6]" :disabled-menus="[]"
        @change="onChange"
        :config="{mode:'markdown'}"
        @upload-image="handleUploadImage"
        :key="userConfigStore.isDarkEnabled"
        />  

    </div>
</template>

<script setup>
import { uploadApi } from '@/api/article'
import { computed } from 'vue'
import { useUserConfigStore } from '@/store/userConfig'
const userConfigStore = useUserConfigStore()
import { createMarkdownPreview } from '@/utils/markdown-config'

// 使用 computed 每次重新创建组件
const MarkdownPreview = computed(() => {
  console.log('创建主题:', userConfigStore.isDarkEnabled?"vuepress":"github")
  return createMarkdownPreview(userConfigStore.isDarkEnabled?"vuepress":"github")
})

// import { uploadImgService } from '@/api/article'

defineProps({
    modelValue: {
        type: String
    },
    height: {
        type: Number,
        default: 500
    }
})

const emit = defineEmits(['update:modelValue','htmlContent'])

const onChange = (markdownContent,htmlContent) =>{
    emit('update:modelValue',markdownContent)
    // emit('htmlContent',htmlContent)
}


const handleUploadImage = async (event, insertImage, files) => {
    const formData = new FormData()
    formData.append('content', files[0])
    try {
        // t_upload_request：内容图片请求
        const res = await uploadApi(formData)
        insertImage({
            url: res.data,
            desc: '图片描述的信息',
            // width: 'auto',
            // height: 'auto',
        });
    } catch (error) {
        console.error('上传失败', error)
    }
}
</script>

<style lang="scss" scoped>

:root {
    --editor-bg: #fff;
    --editor-text: #000;
    --toolbar-bg: #f5f5f5;
    --toolbar-text: #333;
}

.dark-mode {
    --editor-bg: #000;
    --editor-text: #fff;
    --toolbar-bg: #000;
    --toolbar-text: #ccc;
}

 /* v-md-editor-工具栏 */
:deep(.v-md-editor__right-area .v-md-editor__toolbar){
    background-color: var(--toolbar-bg) !important;
    color: var(--toolbar-text);
    .v-md-editor__toolbar-left-wrapper li{
           color: var(--toolbar-text);
    }
    .v-md-editor__toolbar-left-wrapper .v-md-editor__toolbar-item:hover{
           color: var(--editor-bg) !important;
    }
}

 /* v-md-editor-左边的编辑器 */
:deep(.v-md-editor__editor-wrapper textarea){
    background-color: var(--editor-bg) !important;
    color: var(--editor-text)
}
 /* v-md-editor-右边的预览区 */
/* :deep(.v-md-editor__preview-wrapper .github-markdown-body) {
    background-color: var(--editor-bg) !important;
    color: var(--editor-text)
} */

 /* vuepress主题下的v-md-editor-右边的预览区 */
:deep(.v-md-editor__preview-wrapper .v-md-editor-preview .vuepress-markdown-body){
  color: #fff;
  background: black !important;
}

// 这样设置切换主题不会生效
/* :deep(.v-md-editor__preview-wrapper){
       background: black !important;
} */


 /* vuepress主题下的v-md-editor-右边的预览区 */
:deep(.v-md-editor__preview-wrapper:has(.vuepress-markdown-body)){
    background: black !important;
}

// vuepress主题下的v-md-editor-右边的预览区 代码块颜色
:deep(.v-md-editor__preview-wrapper .vuepress-markdown-body code){
    color: $code-color !important;
}

</style>