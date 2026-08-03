<template>
    <!-- ===== 搜索栏 ===== -->
    <div class="flex justify-between">
        <el-form ref="formRef" :model="searchModel" label-width="auto" inline size="small">
            <el-form-item>
                <el-input v-model="searchModel.keyword" placeholder="请输入公告内容" clearable />
            </el-form-item>
            <el-form-item style="width: 200px">
                <SmartSelector v-model="searchModel.status" :data="statusOptions" placeholder="请选择状态" />
            </el-form-item>
            <el-form-item style="width: 200px">
                <SmartSelector v-model="searchModel.type" :data="typeOptions" placeholder="请选择消息类型" />
            </el-form-item>
            <el-form-item>
                <el-button size="small" type="primary" icon="Search" @click="handleSearch" plain>搜索</el-button>
                <el-button size="small" type="info" icon="Refresh" @click="handleReset" plain>重置</el-button>
            </el-form-item>
        </el-form>

        <div>
            <el-button size="small" type="primary" icon="Plus" @click="handleAdd" plain>新增公告</el-button>
            <el-button size="small" type="danger" icon="Delete" @click="handleBatchDelete" plain>批量删除</el-button>
        </div>
    </div>

    <!-- ===== 数据表格 ===== -->
    <el-table :data="tableData" style="width: 100%" ref="multipleTableRef" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="content" label="公告内容" show-overflow-tooltip />
        <el-table-column prop="title" label="标题" width="150" show-overflow-tooltip />
        <el-table-column label="消息类型" width="100">
            <template #default=" { row} ">
                <el-button v-if="!row.type" type="primary" size="small" plain>普通</el-button>
                <el-button v-else type="warning" size="small" plain>长文本</el-button>
            </template>
        </el-table-column>
        <el-table-column label="当前展示" width="100" align="center">
            <template #default="{ row }">
                <el-tag v-if="row.isCurrent === 1" type="success" size="small">是</el-tag>
                <el-tag v-else type="info" size="small">否</el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
            <template #default="{ row }">
                <el-button size="small" type="success" v-if="row.status === 1">生效中</el-button>
                <el-button size="small" type="danger" v-else>已下架</el-button>
            </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="200" />
        <el-table-column prop="updateTime" label="更新时间" width="200" />

        <el-table-column label="操作" width="320" fixed="right">
            <template #default="{ row }">
                <!-- 生效中：显示推送 + 下架 -->
                <template v-if="row.status === 1">
                    <el-button size="small" type="success" icon="Position" @click="handlePush(row)" plain>推送</el-button>
                    <el-button size="small" type="warning" icon="Bottom" @click="handleOffline(row)" plain>下架</el-button>
                </template>
                <!-- 已下架：显示上架 -->
                <template v-else>
                    <el-button size="small" type="primary" icon="Top" @click="handleOnline(row)" plain>上架</el-button>
                </template>
                <el-button size="small" type="warning" icon="Edit" @click="handleEdit(row)" plain>编辑</el-button>
                <el-popconfirm :title="`你确定要删除该公告吗？`" @confirm="handleDelete(row.id)" width="250px" icon="WarnTriangleFilled">
                    <template #reference>
                        <el-button size="small" type="danger" icon="Delete" plain>删除</el-button>
                    </template>
                </el-popconfirm>
            </template>
        </el-table-column>
    </el-table>

    <!-- ===== 分页 ===== -->
    <el-pagination
        size="small"
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[5, 10, 20, 50]"
        layout="jumper, sizes, total, ->, prev, pager, next"
        :total="totalCount"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        style="margin-top: 20px; justify-content: flex-end;"
    />

    <!-- ===== 新增/编辑弹窗 ===== -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="50%">
        <el-form ref="ruleFormRef" :model="formModel" :rules="rules" label-width="100px" status-icon size="small">
            
            <!-- 公告标题 -->
            <el-form-item prop="title" label="公告标题">
                <el-input
                    v-model="formModel.title"
                    placeholder="请输入公告标题"
                    maxlength="100"
                    show-word-limit
                />
            </el-form-item>

            <!-- 消息类型（el-radio-group） -->
            <el-form-item prop="type" label="消息类型">
                <template #label>
                    消息类型
                    <el-tooltip content="普通文本适合简短通知，长文本支持 Markdown 格式" placement="top">
                        <el-icon><QuestionFilled /></el-icon>
                    </el-tooltip>
                </template>
                <el-radio-group v-model="formModel.type" @change="handleTypeChange">
                    <el-radio :value="0">普通</el-radio>
                    <el-radio :value="1">长文本</el-radio>
                </el-radio-group>
            </el-form-item>

            <!-- 公告内容（根据 type 切换） -->
            <el-form-item prop="content" label="公告内容">
                <!-- 普通文本模式 -->
                <el-input
                    v-if="formModel.type === 0"
                    v-model="formModel.content"
                    type="textarea"
                    :rows="6"
                    placeholder="请输入公告内容"
                    maxlength="2000"
                    show-word-limit
                />
                <!-- 长文本模式（Markdown） -->
                <Markdown
                    v-else
                    :model-value="formModel.content"
                    @update:model-value="(val) => formModel.content = val"
                    :height="400"
                    upload-handler="notice"
                />
            </el-form-item>

            <!-- 是否设为当前展示 -->
            <el-form-item prop="isCurrent" label="设为当前展示">
                <template #label>
                    设为当前展示
                    <el-tooltip content="设为当前展示后，用户刷新页面将看到此公告" placement="top">
                        <el-icon><QuestionFilled /></el-icon>
                    </el-tooltip>
                </template>
                <el-radio-group v-model="formModel.isCurrent">
                    <el-radio :value="0">否</el-radio>
                    <el-radio :value="1">是</el-radio>
                </el-radio-group>
            </el-form-item>

        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button size="small" type="primary" @click="handleConfirm" plain>确认</el-button>
                <el-button size="small" type="info" @click="dialogVisible = false" plain>取消</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import SmartSelector from '@/views/components/SmartSelector.vue'
import msg from '@/components/msg'
import Markdown from '@/components/Markdown.vue'  // 引入 Markdown 组件
import {
    noticeListApi,
    noticeAddApi,
    noticeUpdateApi,
    noticeRemoveApi,
    noticeOnlineApi,
    noticeOfflineApi,
    noticePushApi
} from '@/api/notice'

// ============================================================
// 数据
// ============================================================
const tableData = ref([])
const totalCount = ref(0)

const pagination = reactive({
    pageNum: 1,
    pageSize: 10
})

const searchModel = reactive({
    keyword: '',
    status: '',
    type: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('')

const formModel = reactive({
    id: null,
    title: '',
    content: '',
    type: 0,        // 0-普通 1-长文本
    isCurrent: 0    // 0-否 1-是
})

const ruleFormRef = ref(null)
const multipleTableRef = ref(null)
const selectedRows = ref([])

// 状态选项
const statusOptions = [
    { label: '全部状态', value: '' },
    { label: '生效中', value: '1' },
    { label: '已下架', value: '0' }
]

// 消息类型选项
const typeOptions = [
    { label: '全部类型', value: '' },
    { label: '普通', value: '0' },
    { label: '长文本', value: '1' }
]

// ============================================================
// 表单校验规则
// ============================================================
const rules = {
    content: [
        { required: true, message: '请输入公告内容', trigger: 'blur' },
        { min: 2, max: 2000, message: '公告内容长度为 2-2000 个字符', trigger: 'blur' }
    ]
}

const handleTypeChange = () => {
    // 切换消息类型时，重置 content 字段的校验状态
    nextTick(() => {
        ruleFormRef.value?.clearValidate(['content'])
    })
}

// ============================================================
// 数据渲染
// ============================================================
/**
 * 获取公告列表（前端分页）
 */
const fetchNotices = async () => {
    const res = await noticeListApi()
    // 前端做分页和搜索过滤
    let list = res.data || []

    // 搜索过滤
    if (searchModel.keyword) {
        list = list.filter(item => item.content.includes(searchModel.keyword))
    }
    if (searchModel.status !== '') {
        list = list.filter(item => item.status === Number(searchModel.status))
    }

    // 类型搜索过滤
    if (searchModel.type !== '') {
        list = list.filter(item => item.type === Number(searchModel.type))
    }

    totalCount.value = list.length

    // 分页切割
    const start = (pagination.pageNum - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    tableData.value = list.slice(start, end)
}

onMounted(() => {
    fetchNotices()
})

/**
 * 每页条数变化
 */
const handleSizeChange = () => {
    pagination.pageNum = 1
    fetchNotices()
}

/**
 * 页码变化
 */
const handlePageChange = () => {
    fetchNotices()
}

/**
 * 表格勾选变化
 */
const handleSelectionChange = (raw) => {
    selectedRows.value = raw
}

// ============================================================
// 搜索和重置
// ============================================================
const handleSearch = () => {
    pagination.pageNum = 1
    fetchNotices()
}

const handleReset = () => {
    pagination.pageNum = 1
    searchModel.keyword = ''
    searchModel.status = ''
    searchModel.type = ''
    fetchNotices()
}

// ============================================================
// 新增
// ============================================================
const handleAdd = async () => {
    dialogVisible.value = true
    dialogTitle.value = '新增公告'
    await nextTick()
    ruleFormRef.value?.resetFields()
    Object.assign(formModel, {
        id: null,
        title: '',
        content: '',
        type: 0,
        isCurrent: 0
    })
}

// ============================================================
// 编辑
// ============================================================
const handleEdit = async (row) => {
    dialogVisible.value = true
    dialogTitle.value = '编辑公告'
    await nextTick()
    ruleFormRef.value?.resetFields()
    Object.assign(formModel, {
        id: row.id,
        title: row.title || '',
        content: row.content || '',
        type: row.type !== undefined ? row.type : 0,
        isCurrent: row.isCurrent || 0
    })
}

// ============================================================
// 保存
// ============================================================
const handleConfirm = async () => {
    await ruleFormRef.value.validate()
    try {
        const params = {
            title: formModel.title,
            content: formModel.content,
            type: formModel.type,
            isCurrent: formModel.isCurrent
        }
        if (!formModel.id) {
            await noticeAddApi(params)
        } else {
            await noticeUpdateApi({
                id: formModel.id,
                ...params
            })
        }
        msg.primary('操作成功')
        dialogVisible.value = false
        fetchNotices()
    } catch (error) {
        msg.error('操作失败')
    }
}

// ============================================================
// 删除
// ============================================================
const handleBatchDelete = async () => {
    if (selectedRows.value.length === 0) {
        msg.error('请先勾选要删除的行')
        return
    }
    await ElMessageBox.confirm('你确认要进行删除么？', '温馨提示', {
        type: 'warning',
        confirmButtonText: '确认',
        cancelButtonText: '取消'
    })
    const ids = selectedRows.value.map(row => row.id)
    await handleDelete(ids)
}

const handleDelete = async (id) => {
    await noticeRemoveApi(id)
    msg.primary('操作成功')
    fetchNotices()
}

// ============================================================
// 上架/下架/推送
// ============================================================
const handleOnline = async (row) => {
    await noticeOnlineApi(row.id)
    msg.primary('上架成功')
    fetchNotices()
}

const handleOffline = async (row) => {
    await noticeOfflineApi(row.id)
    msg.primary('下架成功')
    fetchNotices()
}

const handlePush = async (row) => {
    await noticePushApi(row.id)
    msg.primary('推送成功，所有在线用户已收到公告')
}
</script>

<style scoped lang="scss">
.flex {
    display: flex;
}
.justify-between {
    justify-content: space-between;
}
.items-center {
    align-items: center;
}

/* 弹窗样式调整 */
:deep(.el-dialog) {
    .el-dialog__body {
        max-height: 80vh;
        overflow-y: auto;
    }
}
</style>