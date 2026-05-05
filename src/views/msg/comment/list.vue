<template>
    <div class="layout">

        <el-form ref="formRef" :model="form" label-width="auto" inline> 

            <!-- 模式切换按钮组 - 新增挑拣模式（只读，不可选择） -->
            <el-form-item>
                <el-radio-group v-model="viewMode" @change="handleModeChange" size="small">
                    <el-radio-button label="normal">正常模式</el-radio-button>
                    <el-radio-button label="audit">审核模式</el-radio-button>
                    <!-- 挑拣模式(动态只读)：只有进入挑拣模式时才解除禁用，其他模式时禁用 -->
                    <el-radio-button label="pick" :disabled="viewMode !== 'pick'">挑拣模式</el-radio-button>
                </el-radio-group>
            </el-form-item>

            <el-form-item>
                 <el-input v-model="searchData.keyword" placeholder="请输入标题 | 用户名"></el-input>   
            </el-form-item>

            <el-form-item>
                    <el-select  style="width: 200px" v-model="searchData.type" placeholder="请选择评论类型">
                        <el-option label="文章评论" value="0" />
                        <el-option label="友链评论" value="1" />
                    </el-select>
            </el-form-item>

            <el-form-item>
                    <el-select  style="width: 200px" v-model="searchData.status" placeholder="请选择评论状态">
                        <el-option label="请选择评论状态" value="" />
                        <el-option label="已通过" :value="0" />
                        <el-option label="已驳回" :value="1" />
                        <el-option label="待审核" :value="2" />
                    </el-select>
            </el-form-item>

            <el-form-item>
                    <el-select  style="width: 200px" v-model="searchData.rootId" placeholder="请选择评论类型">
                        <el-option label="请选择评论层级" value="" />
                        <el-option label="根评论" :value="-1" />
                        <el-option label="子评论" :value="0" />
                    </el-select>
            </el-form-item>

            <el-form-item>
                <SmartSelector v-model="searchData.sortField" :data="fields" style="width: 255px;" placeholder="请选择排序(默认创建时间)">
                </SmartSelector>
            </el-form-item>

            <el-form-item>
                <el-button icon="Top" circle plain :type="searchData.sortOrder === 'ASC' ? 'primary' : ''"
                    @click="setSortOrder('ASC')" />
                <el-button icon="Bottom" circle plain :type="searchData.sortOrder === 'DESC' ? 'primary' : ''"
                    @click="setSortOrder('DESC')" />
            </el-form-item>

            <el-form-item>
                <el-button type="primary" icon="Search"  plain @click="onSearch">搜索</el-button>
                <el-button type="warning" icon="Refresh" plain @click="onReset" >重置</el-button>
            </el-form-item>            
        </el-form> 

    </div>

    <div class="right mb-5 ml-4">
        <el-button @click="batchApproveRows()" :disabled="$hasPerm('btn.sysUser.remove')" icon="Check"  type="success" plain :dark="isDark" >批量通过</el-button>
        <el-button @click="batchRejectRows()" :disabled="$hasPerm('btn.sysUser.remove')" icon="Close"  type="warning" plain :dark="isDark" >批量驳回</el-button>
        <el-button @click="batchDeleteRows()" :disabled="$hasPerm('btn.sysUser.remove')" icon="Delete"  type="danger"   plain :dark="isDark" >批量删除</el-button>
    </div>


    <el-table :data="tableData" style="width: 100%"
    v-loading="loading"
    ref="multipleTableRef"
    @selection-change="handleMultiple"
    >
        <el-table-column type="selection" :selectable="selectable" width="55" />
        <el-table-column prop="title" label="标题" show-overflow-tooltip />
        <el-table-column label="评论类型" >
            <template #default="{row}">
                {{ row.type === '0' ? '文章评论':'友链评论' }}
            </template>
        </el-table-column>
        <el-table-column label="评论层级">
            <template #default="{row}">
                {{ row.rootId === -1 ? '根评论':'子评论' }}
            </template>
        </el-table-column>
        <el-table-column prop="content" label="评论内容" show-overflow-tooltip />
        <el-table-column prop ="status" label="评论状态">
            <template #default="{row}">
                <el-text type="primary" v-if="row.status === 0">已通过</el-text>
                <el-text type="danger" v-if="row.status === 1">已驳回</el-text>
                <el-text type="warning" v-if="row.status === 2">待审核</el-text>
            </template>
        </el-table-column>
        <el-table-column prop="username" label="创建者" />
        <el-table-column prop="createTime" label="创建日期" width="190"/>
        <!-- 操作列 - 根据模式动态显示不同按钮 -->
        <el-table-column label="操作" width="280" >
            <template #default="{ row }">
                <!--  审核模式：显示 通过/驳回/删除/详情 -->
                <template v-if="viewMode === 'audit'">
                    <el-popconfirm 
                        title="确认通过该评论吗？" 
                        @confirm="handleApprove(row)" 
                        width="200px"
                        :disabled="row.status === 0"
                    >
                        <template #reference>
                            <el-button 
                                type="success" 
                                size="small" 
                                plain
                                :disabled="row.status === 0"
                            >通过</el-button>
                        </template>
                    </el-popconfirm>
                    
                    <el-popconfirm 
                        title="确认驳回该评论吗？" 
                        @confirm="handleReject(row)" 
                        width="200px"
                        :disabled="row.status === 1"
                    >
                        <template #reference>
                            <el-button 
                                type="warning" 
                                size="small" 
                                plain
                                :disabled="row.status === 1"
                            >驳回</el-button>
                        </template>
                    </el-popconfirm>
                    
                    <el-popconfirm :title="handleTitle(row.rootId)" @confirm="handleDelete(row.id)" width="250px" icon="WarnTriangleFilled">
                        <template #reference>
                            <el-button type="danger" size="small" plain>删除</el-button>
                        </template>
                    </el-popconfirm>
                    
                    <el-button type="info" size="small" plain @click="handleInfo(row)">详情</el-button>
                </template>

                <!-- 正常模式/挑拣模式：显示 回复/挑拣/删除/详情 -->
                <template v-else>
                    <el-button type="success" size="small" plain @click="handleReply(row)">回复</el-button>
                    <el-button type="primary" size="small" plain 
                        @click="row.rootId === -1 ? handleSelectChildren(row) : handleSelectParent(row)">
                        挑拣
                    </el-button>
                    <el-popconfirm :title="handleTitle(row.rootId)" @confirm="handleDelete(row.id)" width="250px" icon="WarnTriangleFilled">
                        <template #reference>
                            <el-button type="danger" size="small" plain>删除</el-button>
                        </template>
                    </el-popconfirm>
                    <el-button type="info" size="small" plain @click="handleInfo(row)">详情</el-button>
                </template>
            </template>
        </el-table-column>
    </el-table>

    <el-pagination
        class="mt-5"
		v-model:current-page="params.pageNum"
		v-model:page-size="params.pageSize"
		:page-sizes="[2,5,7,10]"
		:small="false"
		:disabled="false"
		:background="false"
		layout="jumper, total, sizes, prev, pager, next"
		:total="total"
		@size-change="onSizeChange"
		@current-change="onCurrentChange"
    />

    <!-- 回复对话框 -->
    <el-dialog v-model="replyDialogVisible" title="回复评论" width="40%">
        <el-form :model="replyModel" :rules="replyRules" ref="replyModelRef">
            <el-form-item label="原内容">
                <div class="original-content">{{ replyModel.originalContent }}</div>
            </el-form-item>
            <el-form-item label="回复内容" prop="content">
                <el-input 
                    v-model="replyModel.content" 
                    type="textarea" 
                    :rows="4" 
                    placeholder="请输入回复内容"
                    maxlength="512"
                    show-word-limit
                />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="replyDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitReply">确定</el-button>
        </template>
    </el-dialog>

    <!-- 右侧抽屉 - 评论详情 -->
    <el-drawer
        v-model="drawerVisible"
        title="📋 评论详情"
        direction="rtl"
        size="50%"
        :with-header="true"
        destroy-on-close
    >
        <template #header>
        <div class="drawer-header">
            <span class="drawer-title">📋 评论详情</span>
            <el-tag :type="currentDetailComment?.rootId === -1 ? 'success' : 'info'" size="small">
            {{ currentDetailComment?.rootId === -1 ? '根评论' : '子评论' }}
            </el-tag>
        </div>
        </template>
        
        <!-- 加载状态 -->
        <div v-if="drawerLoading" class="drawer-loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载详情中...</span>
        </div>
        
        <!-- 详情内容 -->
        <CommentDetail 
        v-else
        ref="detailRef"
        :comment="currentDetailComment"
        :sortField="searchData.sortField"
        :sortOrder="searchData.sortOrder"
        @loaded="onDetailLoaded"
        @error="onDetailError"
        />
    </el-drawer>
</template>

<script setup>
import { addCommentApi, auditCommentApi, auditCommentsApi, getCommentsApi, removeCommentApi } from '@/api/msgcomment';
import { nextTick, reactive, ref } from 'vue';
import { checkRejectValid, checkApproveValid, confirmBatchAction } from '@/utils/auditHelper'
import SmartSelector from '@/views/components/SmartSelector.vue';
// 视图模式：normal-正常模式，audit-审核模式，pick-挑拣模式
const viewMode = ref('normal')
const currentPickComment = ref(null)
// 记录进入审核模式前的模式
const previousMode = ref('normal')

// 标识当前模式：null-正常模式，'children'-挑拣子集模式，'parent'-挑拣父集模式
// const pickMode = ref(null)

const tableData = ref([])

const params = reactive({
    pageNum:1,
    pageSize:10
})

const total = ref(null)
// 默认关闭loading
const loading = ref(false)

const searchData = reactive({
    rootId: -1,
    sortOrder:'DESC',
    sortField:'create_time',

})

const render = async () => {
    // 开启loading动效
    loading.value = true
    try{
        let res

        // 审核模式特殊处理
        if (viewMode.value === 'audit' && previousMode.value === 'pick') {
            const searchParams = { ...searchData }
            
            // 如果是从挑拣模式进来的，需要带上挑拣上下文
            if (previousMode.value === 'pick' && currentPickComment.value) {
                const isRootComment = currentPickComment.value.rootId === -1
                searchParams.rootId = isRootComment ? currentPickComment.value.id : currentPickComment.value.rootId
                if (isRootComment) {
                    searchParams.pickChildren = true
                } else {
                    searchParams.pickParent = true
                    searchParams.currentCommentId = currentPickComment.value.id
                }
            }
            
            res = await getCommentsApi(params.pageNum, params.pageSize, searchParams)
            tableData.value = res.data.items
            total.value = res.data.total
            return
        }

        // 挑拣模式逻辑（整合 v1 后端的 pickParent 逻辑）
        if (viewMode.value === 'pick' && currentPickComment.value) {
            const isRootComment = currentPickComment.value.rootId === -1
            const searchParams = {
                // 子集模式：传当前评论id作为 rootId
                // 父集模式：传当前评论的 rootId 作为 rootId
                rootId: isRootComment ? currentPickComment.value.id : currentPickComment.value.rootId
            }
            
            // 区分挑拣子集和挑拣父集
            if (isRootComment) {
                // 子集模式（点击的是根评论）
                searchParams.pickChildren = true
            } else {
                // 父集模式（点击的是子评论）
                searchParams.pickParent = true
                searchParams.currentCommentId = currentPickComment.value.id
            }
            
            // 添加其他筛选条件
            if (searchData.keyword) searchParams.keyword = searchData.keyword
            if (searchData.type) searchParams.type = searchData.type
            if (searchData.status !== undefined && searchData.status !== null && searchData.status !== '') searchParams.status = searchData.status
            if (searchData.sortField) searchParams.sortField = searchData.sortField
            if (searchData.sortOrder) searchParams.sortOrder = searchData.sortOrder
            
            res = await getCommentsApi(params.pageNum, params.pageSize, searchParams)
            tableData.value = res.data.items
            total.value = res.data.total
        } else {
            // 正常模式/审核模式
            const searchParams = { ...searchData }
            res = await getCommentsApi(params.pageNum, params.pageSize, searchParams)
            tableData.value = res.data.items
            total.value = res.data.total
        }
    }finally{
        // 关闭loading动效
        loading.value = false
    }
}

render()

//点击分页事件
const onSizeChange = (size) => {
    //console.log(`onSizeChange：每页显示${size}条`)
    //每页条数发生变化时，重新从第一页渲染
    params.pageNum = 1
    //更新每页条数
    params.pageSize = size
    //重新渲染
    render()
}

const onCurrentChange = (page) => {
    //console.log(`onCurrentChange：当前第${page}页`)
    //更新当前页
    params.pageNum = page
    //重新渲染
    render()
}

const onSearch = () => {
    /* if(Boolean(searchData.value.sortField) != Boolean(searchData.value.sortOrder)){
        ElMessage.error(searchData.value.sortField?'请选择排序':'请选择排序字段')
    } */
    // 只有切换到正常模式时才清空挑拣上下文
    // 切换到审核模式时，保留 currentPickComment（因为需要它的数据）
    if (viewMode.value === 'normal') {
        currentPickComment.value = null
    }
    params.pageNum = 1
    render()
}

const onReset = () => {
    // 重置时退出挑拣模式，恢复到正常模式
    if (viewMode.value === 'pick') {
        viewMode.value = 'normal'
    }
    if(viewMode.value === 'normal'){
        Object.assign(searchData, { keyword: '', type: null, rootId: -1, status: null, sortOrder: 'DESC', sortField: 'create_time' })
    }else {
        Object.assign(searchData, { keyword: '', type: null, rootId: '', status: null, sortOrder: 'DESC', sortField: 'status' })
    }
    currentPickComment.value = null
    //  重置 previousMode
    previousMode.value = 'normal'
    params.pageNum = 1    
    render()
}

// 挑选子集
const handleSelectChildren = async (row) => {
    // console.log('挑选子集', row)
    viewMode.value = 'pick' // 此时 pick 按钮的 disabled 变为 false
    // pickMode.value = 'children'
    updateModeSettings()  // 手动调用
    currentPickComment.value = row
    // searchData.rootId = ''
    params.pageNum = 1
    await render()
    ElMessage.success(`正在查看「${row.content}」的子评论`)
}

// 挑拣父集
const handleSelectParent = async (row) => {
    // console.log('挑拣父集', row)
    viewMode.value = 'pick' //  此时 pick 按钮的 disabled 变为 false
    // pickMode.value = 'parent'
    updateModeSettings()  // 手动调用
    currentPickComment.value = row
    // searchData.rootId = ''
    params.pageNum = 1
    await render()
    ElMessage.success(`正在查看「${row.content}」的父评论及其所有子评论`)
}

// 抽离公共方法
const updateModeSettings = () => {
    if (viewMode.value === 'audit') {
        searchData.sortField = 'status'
        searchData.sortOrder = 'DESC'
        if(previousMode.value === 'normal'){
            searchData.rootId = ''
        }
    } else if (viewMode.value === 'normal') {
        searchData.sortField = 'create_time'
        searchData.sortOrder = 'DESC'
        searchData.rootId = -1
    } else if (viewMode.value === 'pick') {
        searchData.sortField = 'group'
        searchData.sortOrder = 'DESC'
        // searchData.rootId = ''
        previousMode.value = viewMode.value
    }
}

// 切换模式（用户点击正常/审核模式时自动退出挑拣模式）
const handleModeChange = () => {
    updateModeSettings()
    if (viewMode.value === 'normal') {
        currentPickComment.value = null
    }
    params.pageNum = 1
    render()
}


// 返回根评论列表（挑拣父集）
/* const backToRootList = () => {
    // 返回时重置模式
    pickMode.value = null
    currentPickComment.value = null

    
    // 重置搜索条件
    searchData.rootId = -1
    
    // 重置分页
    params.pageNum = 1
    
    // 重新渲染
    render()
    
    ElMessage.info('已返回根评论列表')
} */



const replyDialogVisible = ref(false)
const replyModelRef = ref()
const replyModel = reactive({})

const replyRules = {
    content: [
        { required: true, message: '请输入回复内容', trigger: 'blur' },
        { min: 1, max: 512, message: '长度在 1 到 512 个字符', trigger: 'blur' }
    ]
}

const handleReply = (row) => {
    console.log('回复的评论:', row)
    
    // 设置原内容
    replyModel.originalContent = row.content
    
    // 清空回复内容
    replyModel.content = ''

    nextTick(()=>{
        replyModelRef.value.resetFields(['content'])
    })
    
    // 设置请求参数
    replyModel.articleId = row.articleId
    replyModel.type = row.type
    
    if (row.rootId === -1) {
        // 回复根评论
        replyModel.rootId = row.id
        replyModel.toCommentId = row.id
        replyModel.toCommentUserId = row.createBy
    } else {
        // 回复子评论
        replyModel.rootId = row.rootId
        replyModel.toCommentId = row.id
        replyModel.toCommentUserId = row.createBy
    }
    
    // 打开对话框
    replyDialogVisible.value = true
}

const submitReply = async () => {
    // 表单验证
    await replyModelRef.value.validate()
    
    const requestData = {
        articleId: replyModel.articleId,
        type: replyModel.type,
        rootId: replyModel.rootId,
        toCommentId: replyModel.toCommentId,
        toCommentUserId: replyModel.toCommentUserId,
        content: replyModel.content
    }
    
    console.log('提交数据:', requestData)
    
    await addCommentApi(requestData)
    ElMessage.success('回复成功')
    replyDialogVisible.value = false
    
    // 刷新列表
    render()
}

// 抽屉相关
const drawerVisible = ref(false)
const drawerLoading = ref(false)
const currentDetailComment = ref(null)
const detailRef = ref()

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

/**
 * 详情按钮逻辑 - 打开右侧抽屉
 */
const handleInfo = async (comment) => {
  console.log('🔍 点击详情按钮，评论数据:', comment)
  
  // 设置当前评论
  currentDetailComment.value = comment
  
  // 打开抽屉并显示加载状态
  drawerVisible.value = true
  drawerLoading.value = true
  
  // 等待详情组件加载完成
  await nextTick()
  
  // 延迟一点关闭加载状态（让组件有时间加载）
  setTimeout(() => {
    drawerLoading.value = false
  }, 500)
}

// 详情加载完成回调
const onDetailLoaded = (data) => {
  console.log('✅ 详情加载完成:', data)
}

// 详情加载错误回调
const onDetailError = (error) => {
  console.error('❌ 详情加载失败:', error)
  ElMessage.error('加载详情失败')
  drawerLoading.value = false
}

const handleTitle = (rootId) => {
    if(rootId === -1) return '删除父评论，该子评论一律删除'
    else return '你确定要删除这条评论吗？' 
}

// 批量业务相关
const multipleTableRef = ref()
const multipleSelection = ref([])

const handleMultiple = (raw) => {
    console.log(raw)
    multipleSelection.value = raw
}


// 批量通过
const batchApproveRows = async () => {
    // 检查选中项是否全部为待通过状态
    const check = checkApproveValid(multipleSelection.value)
    
    if (!check.valid) {
        ElMessage.warning(check.message)
        return
    }
    
    await confirmBatchAction(check.validRows.length, '通过')
    
    const ids = multipleSelection.value.map(row => row.id)
    await auditCommentsApi(ids, 0)
    ElMessage.success(`成功通过${ids.length}条评论`)
    render()
}

// 批量驳回
const batchRejectRows = async () => {
    const check = checkRejectValid(multipleSelection.value)
    
    if (!check.valid) {
        ElMessage.warning(check.message)
        return
    }
    
    await confirmBatchAction(check.validRows.length, '驳回')
    
    const ids = multipleSelection.value.map(row => row.id)
    await auditCommentsApi(ids, 1)
    ElMessage.success(`成功驳回${ids.length}条评论`)
    render()
}


// 批量删除
const batchDeleteRows = async() => {
    let title;
    if(multipleSelection.value.length === 0){
        ElMessage.error('请先勾选要删除的评论')
        return
    }
    const rowIds = multipleSelection.value.map(row => row.id)
    const rootIds = multipleSelection.value.map(row => row.rootId)
    if(rootIds.length > 0){
        title = 
        `你选择了${rootIds.length}个根评论，你确认要删除吗？
        删除后，子评论也一律删除
        `
        console.log('rootIds',rootIds)
    }else title = '你确认要进行删除么'

    await ElMessageBox.confirm(title,'温馨提示', {
      type: 'warning',
      confirmButtonText: '确认',
      cancelButtonText: '取消'
    })
    handleDelete(rowIds)

}

const handleApprove = async (row) => {
    await auditCommentApi(row.id, 0)
    ElMessage.success('审核通过')
    render()
}

const handleReject = async (row) => {
    await auditCommentApi(row.id, 1)
    ElMessage.success('已驳回')
    render()
}

const handleDelete = async(ids) => {
    await removeCommentApi(ids)
    ElMessage.success('删除成功')
    render()
}

// 设置排序方向
const setSortOrder = (order) => {
  searchData.sortOrder = order
}

const fields = ref([
    {label:'请选择排序(默认创建时间)',value:''},
    {label:'评论内容',value:'content'},
    {label:'评论状态',value:'status'},
    {label:'创建时间',value:'create_time'},
    {label:'修改时间',value:'update_time'},
    {label:'自定义分组',value:'group'},
])

</script>

<style scoped lang="scss">
.layout {
    @include flex(space-between, null, null);
    // margin-bottom: 20px;
}


// 抽屉头部样式
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  
  .drawer-title {
    font-size: 18px;
    font-weight: bold;
  }
}

// 加载样式
.drawer-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px;
  color: #909399;
  font-size: 14px;
  
  .el-icon {
    font-size: 24px;
  }
}

.original-content {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-all;
}
</style>