<template>
    <div class="flex justify-between items-center">
        <el-form ref="formRef" :model="searchModel" label-width="auto" inline>
            <el-form-item>
                <el-input v-model="searchModel.keyword" placeholder="请输入文章标题/描述" />
            </el-form-item>
            <el-form-item>
                <el-button icon="Search" @click="onSearch" type="primary" plain>搜索</el-button>
                <el-button icon="Refresh" type="warning" size="mini" @click="onReset" plain>重置</el-button>
            </el-form-item>
            <div>
                <el-button size="small" type="primary" icon="Plus" @click="handleAdd">新增轮播</el-button>
            </div>
        </el-form>
    </div>

    <el-table :data="tableData" style="width: 100%" ref="multipleTableRef" @selection-change="handleMultiple">
        <el-table-column prop="id" label="轮播ID" width="80" />
        <el-table-column prop="articleTitle" label="文章标题" min-width="150" show-overflow-tooltip />
        <el-table-column prop="description" label="轮播描述" min-width="150" show-overflow-tooltip />
        <el-table-column label="轮播图" width="120">
            <template #default="{ row }">
                <el-image style="width: 80px; height: 45px; border-radius: 4px;" :src="row.img" :fit="'cover'" />
            </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column label="跳转链接" min-width="150" show-overflow-tooltip>
            <template #default="{ row }">
                <span>{{ row.link || '文章详情' }}</span>
            </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
                <el-button @click="handleEdit(row)" size="small" type="warning" icon="Edit" circle />
                <el-popconfirm :title="`你确定要删除「${row.articleTitle}」的轮播吗？`" @confirm="handleDelete(row.id)" width="250px" icon="WarnTriangleFilled">
                    <template #reference>
                        <el-button size="small" type="danger" icon="Delete" circle />
                    </template>
                </el-popconfirm>
            </template>
        </el-table-column>
    </el-table>

    <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[5, 10, 20, 50]"
        layout="jumper, total, sizes, prev, pager, next"
        :total="total"
        @size-change="onSizeChange"
        @current-change="onCurrentChange"
    />

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="45%">
        <el-form ref="ruleFormRef" :model="formModel" :rules="rules" label-width="auto" status-icon>

            <!-- 轮播类型（仅新增时显示） -->
            <el-form-item v-if="!formModel.id" label="轮播类型">
                <el-radio-group v-model="formModel.carouselType" @change="handleTypeChange">
                    <el-radio :label="0">关联文章</el-radio>
                    <el-radio :label="1">外链</el-radio>
                </el-radio-group>
            </el-form-item>

            <!-- 关联文章 - 文章选择（仅新增时显示） -->
            <el-form-item v-if="!formModel.id && formModel.carouselType === 0" label="选择文章">
                <SmartAutoComplete
                    v-model="selectedArticles"
                    :fetch-suggestions-api="fetchArticles"
                    placeholder="请输入文章标题搜索"
                    :max="1"
                    :debounce-delay="300"
                    :min-search-length="1"
                />
            </el-form-item>

            <!-- 外链 - 标题（仅新增时显示） -->
            <el-form-item v-if="!formModel.id && formModel.carouselType === 1" label="轮播标题" prop="title">
                <el-input v-model="formModel.title" placeholder="请输入轮播标题" />
            </el-form-item>

            <!-- 关联文章（只读）- 编辑时显示 -->
            <el-form-item v-if="formModel.id && formModel.articleId" label="关联文章">
                <el-input :value="formModel.articleTitle" disabled />
            </el-form-item>

            <!-- 轮播标题（编辑/新增通用） -->
            <el-form-item label="轮播标题" v-if="formModel.carouselType === 0">
                <el-radio-group v-model="formModel.hasCustomTitle">
                    <el-radio :label="true">自定义标题</el-radio>
                    <el-radio :label="false">使用文章标题</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item v-if="formModel.hasCustomTitle" label="标题内容">
                <el-input
                    v-model="formModel.title"
                    placeholder="请输入自定义标题"
                    maxlength="100"
                    show-word-limit
                />
                <el-tooltip placement="right">
                    <template #content>
                        <div>自定义标题将覆盖默认标题</div>
                    </template>
                    <el-icon class="form-tip-icon"><QuestionFilled /></el-icon>
                </el-tooltip>
            </el-form-item>

            <!-- 排序 -->
            <el-form-item label="轮播排序">
                <el-input-number
                    v-model="formModel.sort"
                    :min="0"
                    :max="999"
                    controls-position="right"
                    placeholder="自动"
                    style="width:150px;"
                    @change="handleSortChange"
                />
                <el-tooltip placement="right">
                    <template #content>
                        <div>数字越小越靠前，0 表示自动排序</div>
                    </template>
                    <el-icon class="form-tip-icon"><QuestionFilled /></el-icon>
                </el-tooltip>
            </el-form-item>

            <!-- 专用图 -->
            <el-form-item label="专用图">
                <el-radio-group v-model="formModel.hasCustomImg" @change="handleCustomImgChange">
                    <el-radio :label="true">使用专用图</el-radio>
                    <el-radio :label="false">
                        {{ formModel.articleId ? '使用文章封面' : '使用默认图' }}
                    </el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item v-if="formModel.hasCustomImg" label="上传图片">
                <el-upload
                    class="avatar-uploader"
                    :show-file-list="false"
                    :auto-upload="false"
                    :on-change="onSelectFile"
                >
                    <img v-if="formModel.imgPreview" :src="formModel.imgPreview" class="avatar" />
                    <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                </el-upload>
                <span style="font-size:12px; color:#909399; margin-left:12px;">建议尺寸：1920 x 600</span>
            </el-form-item>

            <!-- 自定义链接 -->
            <el-form-item label="跳转链接">
                <el-radio-group v-model="formModel.hasCustomLink">
                    <el-radio :label="true">自定义链接</el-radio>
                    <el-radio :label="false">
                        {{ formModel.articleId ? '跳文章详情' : '无跳转' }}
                    </el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item v-if="formModel.hasCustomLink" label="链接地址">
                <el-input
                    v-model="formModel.link"
                    placeholder="请输入链接地址，如：https://example.com"
                />
                <el-tooltip placement="right">
                    <template #content>
                        <div>留空则跳转文章详情页</div>
                    </template>
                    <el-icon class="form-tip-icon"><QuestionFilled /></el-icon>
                </el-tooltip>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleConfirm">确认</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, QuestionFilled } from '@element-plus/icons-vue'
import { getCarouselListApi, getCarouselByIdApi, updateCarouselApi, removeCarouselApi, listAllArticlesApi, addCarouselApi } from '@/api/conarticle'
import SmartAutoComplete from '@/views/components/SmartAutoComplete.vue'
import PinyinMatch from 'pinyin-match'

// ==================== 数据 ====================

const tableData = ref([])
const total = ref(0)

const pagination = reactive({
    pageNum: 1,
    pageSize: 10
})

const searchModel = reactive({
    keyword: ''
})

// 缓存所有已发布的文章列表
const articleList = ref([])

// ==================== 渲染列表 ====================

// 加载所有文章
const loadAllArticles = async () => {
    const res = await listAllArticlesApi()
    articleList.value = (res.data || []).map(item => ({
        value: item.title,
        id: item.id
    }))
    console.log('加载所有文章:', articleList.value.length, '条')
}

const renderCarouselList = async () => {
    const res = await getCarouselListApi(pagination.pageNum, pagination.pageSize, searchModel)
    tableData.value = res.data.items || []
    total.value = res.data.total || 0
}

onMounted(() => {
    renderCarouselList()
})

// ==================== 分页 ====================

const onSizeChange = (size) => {
    pagination.pageNum = 1
    pagination.pageSize = size
    renderCarouselList()
}

const onCurrentChange = (page) => {
    pagination.pageNum = page
    renderCarouselList()
}

// ==================== 搜索/重置 ====================

const onSearch = () => {
    pagination.pageNum = 1
    renderCarouselList()
}

const onReset = () => {
    pagination.pageNum = 1
    Object.assign(searchModel, { keyword: '' })
    renderCarouselList()
}

// ==================== 弹窗 ====================

const dialogVisible = ref(false)
const dialogTitle = ref('')
const ruleFormRef = ref(null)

// 用于 SmartAutoComplete 的选中值
const selectedArticles = ref([])

// 表单默认值
const defaultForm = {
    id: null,
    carouselType: 0,        // 0=关联文章, 1=外链
    articleId: null,
    articleTitle: '',
    title: '',              // 轮播标题
    hasCustomTitle: false,  // 是否自定义标题
    sort: null,
    img: '',
    imgPreview: '',
    hasCustomImg: false,
    link: '',
    hasCustomLink: false
}

const formModel = reactive({ ...defaultForm })

// 表单校验规则
const rules = {
    articleId: [
        { required: true, message: '请选择关联文章', trigger: 'change' }
    ],
    articleTitle: [
        { required: true, message: '关联文章不能为空', trigger: 'change' }
    ],
    title: [
        { required: true, message: '请输入轮播标题', trigger: 'blur' }
    ]
}

// ==================== SmartAutoComplete 联想搜索 ====================

// 前端搜索函数（参考 fetchTags 风格）
const fetchArticles = async (params) => {
    const query = params.keyword || ''
    
    // 如果还没有加载文章列表，先加载
    if (articleList.value.length === 0) {
        await loadAllArticles()
    }
    
    if (!query) {
        return articleList.value
    }
    
    const lowerQuery = query.toLowerCase()
    
    const matched = articleList.value.filter(item => {
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

// 监听选中变化，正确获取文章 ID
watch(selectedArticles, (newVal) => {
    if (newVal.length > 0) {
        // 从所有文章列表中查找对应的文章
        const selected = articleList.value.find(item => item.value === newVal[0])
        if (selected) {
            formModel.articleId = selected.id
            formModel.articleTitle = selected.title || selected.value
        }
    } else {
        formModel.articleId = null
        formModel.articleTitle = ''
    }
}, { deep: true })

// ==================== 新增 ====================

const handleAdd = async () => {
    dialogVisible.value = true
    dialogTitle.value = '新增轮播'

    await nextTick()
    // 重置表单校验状态
    ruleFormRef.value?.resetFields()

    // 重置表单
    Object.assign(formModel, {
        ...defaultForm,
        carouselType: 0
    })
    selectedArticles.value = []

    // 预加载文章列表
    if (articleList.value.length === 0) {
        await loadAllArticles()
    }
}


// ==================== 编辑 ====================

const handleEdit = async (row) => {
    dialogVisible.value = true
    dialogTitle.value = '编辑轮播'

    await nextTick()

    // 重置表单校验状态
    ruleFormRef.value?.resetFields()

    // 重置表单
    Object.assign(formModel, defaultForm)

    // 获取详情
    const res = await getCarouselByIdApi(row.id)
    const data = res.data

    // 回显
    formModel.id = data.id

    // 判断类型：articleId 为 null 则是外链
    if (data.articleId) {
        formModel.carouselType = 0  // 关联文章
        formModel.articleId = data.articleId
        formModel.articleTitle = data.articleTitle
    } else {
        formModel.carouselType = 1  // 外链
        formModel.articleId = null
        formModel.articleTitle = '外链'
    }


    // 轮播标题回显
    if (data.title) {
        formModel.hasCustomTitle = true
        formModel.title = data.title
    } else {
        formModel.hasCustomTitle = false
        formModel.title = ''
    }

    formModel.sort = data.sort || null

    // 专用图回显
    if (data.img) {
        formModel.hasCustomImg = true
        formModel.img = data.img
        formModel.imgPreview = data.img
    } else {
        formModel.hasCustomImg = false
        formModel.img = ''
        formModel.imgPreview = ''
    }

    // 链接回显
    if (data.link) {
        formModel.hasCustomLink = true
        formModel.link = data.link
    } else {
        formModel.hasCustomLink = false
        formModel.link = ''
    }
}

// ==================== 图片上传（本地预览） ====================

const onSelectFile = (file) => {
    const url = URL.createObjectURL(file.raw)
    formModel.imgPreview = url
    formModel.img = url
}

// ==================== 切换事件 ====================

// 轮播类型切换
const handleTypeChange = (val) => {
    if (val === 0) {
        // 关联文章
        formModel.articleId = null
        formModel.articleTitle = ''
        formModel.title = ''
        formModel.hasCustomTitle = false
        selectedArticles.value = []
    } else {
        // 外链
        formModel.articleId = null
        formModel.articleTitle = ''
        formModel.title = ''  // 外链标题由用户输入
        formModel.hasCustomTitle = false
        selectedArticles.value = []
    }
    // 切换时清除校验
    ruleFormRef.value?.clearValidate(['articleId', 'title'])
}

const handleSortChange = (val) => {
    if (val === 0) {
        formModel.sort = null
    }
}

const handleCustomImgChange = (val) => {
    if (!val) {
        formModel.img = ''
        formModel.imgPreview = ''
    }
}

// ==================== 保存 ====================
const handleConfirm = async () => {
        try {

        // 动态校验
        const isValid = await validateForm()
        if (!isValid) return

        // 构建提交参数
        const params = {
            id: formModel.id,
            articleId: formModel.articleId,
            sort: formModel.sort || 0,
            img: formModel.hasCustomImg ? formModel.img : null,
            link: formModel.hasCustomLink ? formModel.link : null
        }

        // 根据类型处理标题和 articleId
        if (formModel.carouselType === 1) {
            // 外链：articleId 为 null，title 为输入的标题
            params.articleId = null
            params.title = formModel.title || null
        } else {
            // 关联文章：articleId 有值，title 根据 hasCustomTitle 决定
            params.articleId = formModel.articleId
            params.title = formModel.hasCustomTitle ? formModel.title : null
        }

        if (formModel.id) {
            // 编辑
            await updateCarouselApi(params)
            ElMessage.success('修改成功')
        } else {
            // 新增
            await addCarouselApi(params)
            ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        renderCarouselList()
    } catch (error) {
        console.log(error.message)
        ElMessage.error(formModel.id ? '修改失败' : '添加失败')
    }
}

// 动态校验函数
const validateForm = async () => {
    // 外链：title 必填
    if (formModel.carouselType === 1) {
        if (!formModel.title || !formModel.title.trim()) {
            ElMessage.warning('请输入轮播标题')
            return false
        }
        return true
    }

    // 关联文章：articleId 必填
    if (!formModel.articleId) {
        ElMessage.warning('请选择关联文章')
        return false
    }

    // 关联文章 + 自定义标题：title 必填
    if (formModel.hasCustomTitle && (!formModel.title || !formModel.title.trim())) {
        ElMessage.warning('请输入自定义标题')
        return false
    }

    return true
}

// ==================== 删除 ====================

const handleDelete = async (id) => {
    try {
        await removeCarouselApi(id)
        ElMessage.success('删除成功')
        renderCarouselList()
    } catch (error) {
        ElMessage.error('删除失败')
    }
}

// ==================== 批量选择 ====================

const multipleSelection = ref([])

const handleMultiple = (raw) => {
    multipleSelection.value = raw
}
</script>

<style scoped lang="scss">
.form-tip-icon {
    margin-left: 8px;
    color: #909399;
    font-size: 14px;
    cursor: help;
    vertical-align: middle;
}

.avatar-uploader {
    :deep(.el-upload) {
        border: 1px dashed var(--el-border-color);
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: var(--el-transition-duration-fast);
        width: 178px;
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
            border-color: var(--el-color-primary);
        }
    }
}

.avatar {
    width: 178px;
    height: 100px;
    display: block;
    object-fit: cover;
}

.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>