<template>
    <v-md-editor :modelValue="modelValue"
        :height="height + 'px'" :include-level="[1, 2, 3, 4, 5, 6]" :disabled-menus="[]"
        @change="onChange"
        :config="{mode:'markdown'}"
        @upload-image="handleUploadImage"></v-md-editor>
</template>

<script setup>
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
    /* const formData = new FormData()
    formData.append('picture', files[0])
    try {
        const res = await uploadImgService(formData)
        insertImage({
            url: res.data,
            desc: '图片描述的信息',
            // width: 'auto',
            // height: 'auto',
        });
    } catch (error) {
        console.error('上传失败', error)
    } */
}
</script>