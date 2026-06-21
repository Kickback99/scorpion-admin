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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="40%">
        <el-form ref="ruleFormRef" :model="formModel" label-width="auto" status-icon>
            <!-- 文章标题（只读） -->
            <el-form-item label="文章标题">
                <el-input :value="formModel.articleTitle" disabled />
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
                    <el-radio :label="false">使用文章封面</el-radio>
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
                    <el-radio :label="false">跳文章详情</el-radio>
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
import { getCarouselListApi, getCarouselByIdApi, updateCarouselApi, removeCarouselApi } from '@/api/conarticle'

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

// ==================== 渲染列表 ====================

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

// 表单默认值
const defaultForm = {
    id: null,
    articleId: null,
    articleTitle: '',
    sort: null,
    img: '',
    imgPreview: '',
    hasCustomImg: false,
    link: '',
    hasCustomLink: false
}

const formModel = reactive({ ...defaultForm })

// ==================== 编辑 ====================

const handleEdit = async (row) => {
    dialogVisible.value = true
    dialogTitle.value = '编辑轮播'

    await nextTick()

    // 重置表单
    Object.assign(formModel, defaultForm)

    // 获取详情
    const res = await getCarouselByIdApi(row.id)
    const data = res.data

    // 回显
    formModel.id = data.id
    formModel.articleId = data.articleId
    formModel.articleTitle = data.articleTitle
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
        const params = {
            id: formModel.id,
            articleId: formModel.articleId,
            sort: formModel.sort || 0,
            img: formModel.hasCustomImg ? formModel.img : null,
            link: formModel.hasCustomLink ? formModel.link : null
        }

        await updateCarouselApi(params)
        ElMessage.success('操作成功')
        dialogVisible.value = false
        renderCarouselList()
    } catch (error) {
        ElMessage.error('操作失败')
    }
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