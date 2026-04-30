<template>
    <div class="layout">

        <!-- 添加返回按钮 -->
        <div v-if="pickMode" class="back-bar">
            <el-button type="primary" plain @click="backToRootList">
                ← 返回根评论列表
            </el-button>
            <span class="parent-info">
                当前模式：{{ pickMode === 'children' ? '挑拣子集' : '挑拣父集' }} - 
                当前查看：{{ currentPickComment?.content }}
            </span>
        </div>

        <el-form ref="formRef" :model="form" label-width="auto" inline> 
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
                <el-tag type="primary" v-if="row.status === 0">已通过</el-tag>
                <el-tag type="danger" v-if="row.status === 1">已驳回</el-tag>
                <el-tag type="warning" v-if="row.status === 2">待审核</el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="username" label="创建者" />
        <el-table-column prop="createTime" label="创建日期" width="190"/>
        <el-table-column label="操作" width="280">
            <template #default="{ row }">
                <el-button type="success"  size="small" plain  @click="handleReply(row)">回复 </el-button>
                <el-button type="primary"  size="small" plain 
                @click="row.rootId === -1?handleSelectChildren(row):handleSelectParent(row)">
                    挑拣
                    <!-- {{ row.rootId === -1 ?'挑选子集':'挑拣父集' }} -->
                </el-button>

                <!-- 待审核：显示审核按钮（带气泡确认框） -->
                <el-popconfirm
                v-if="row.status === 2"
                title="请选择审核结果"
                width="200"
                :hide-after="0"
                @confirm="handleApprove(row)"
                @cancel="handleReject(row)"
                confirm-button-text="通过"
                cancel-button-text="驳回"
                >
                <template #reference>
                    <el-button type="warning" size="small">审核</el-button>
                </template>
                </el-popconfirm>

                 <!-- 已通过/已驳回显示删除按钮 -->
                <el-popconfirm v-if="row.status === 0 || row.status === 1" :title="handleTitle(row.rootId)" @confirm="handleDelete(row.id)" width="250px" icon="WarnTriangleFilled">
                    <template #reference>
                        <el-button type="danger" size="small" plain >删除</el-button>
                    </template>
                </el-popconfirm>
                <el-button type="warning" size="small" plain @click="handleInfo(row)">详情</el-button>
            </template>
        </el-table-column>
    </el-table>

    <el-pagination
        class="mt-5"
		v-model:current-page="params.pageNum"
		v-model:page-size="params.pageSize"
		:page-sizes="[2,3,5,7]"
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
        @loaded="onDetailLoaded"
        @error="onDetailError"
        />
    </el-drawer>
</template>

<script setup>
import { addCommentApi, auditCommentApi, auditCommentsApi, getCommentsApi, removeCommentApi } from '@/api/msgcomment';
import { nextTick, reactive, ref } from 'vue';
import { checkRejectValid, checkApproveValid, confirmBatchAction } from '@/utils/auditHelper'

const tableData = ref([])

const params = reactive({
    pageNum:1,
    pageSize:7
})

const total = ref(null)

const searchData = reactive({
    rootId: -1
})

// 标识当前模式：null-正常模式，'children'-挑拣子集模式，'parent'-挑拣父集模式
const pickMode = ref(null)
const currentPickComment = ref(null)

const render = async() => {
    let res
    if (pickMode.value === 'children' && currentPickComment.value) {
        // 挑拣子集模式：查询子评论
        const searchParams = {
            rootId: currentPickComment.value.id  // 传递父评论id
        }
        if (searchData.keyword) searchParams.keyword = searchData.keyword
        if (searchData.type) searchParams.type = searchData.type
        
        res = await getCommentsApi(params.pageNum, params.pageSize, searchParams)
        tableData.value = res.data.items
        total.value = res.data.total
    } else if (pickMode.value === 'parent' && currentPickComment.value) {
        // 挑拣父集模式：查询父评论和所有子评论
        const searchParams = {
            rootId: currentPickComment.value.rootId,  // 传递父评论id
            pickParent: true,  // 标识这是挑拣父集模式
            currentCommentId: currentPickComment.value.id  // 传递当前评论id
        }
        if (searchData.keyword) searchParams.keyword = searchData.keyword
        if (searchData.type) searchParams.type = searchData.type
        
        res = await getCommentsApi(params.pageNum, params.pageSize, searchParams)
        tableData.value = res.data.items
        total.value = res.data.total
    } else {
        // 正常模式
        res = await getCommentsApi(params.pageNum, params.pageSize, searchData)
        tableData.value = res.data.items
        total.value = res.data.total
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
    // 搜索时重置模式
    pickMode.value = null
    currentPickComment.value = null
    params.pageNum = 1
    render()
}

const onReset = () => {
    // 重置时重置模式
    pickMode.value = null
    currentPickComment.value = null
    params.pageNum = 1
    Object.assign(searchData,{keyword:'',type:null,rootId:-1,status:null})
    render()
}

// 挑选子集
const handleSelectChildren = async (row) => {
    // console.log('挑选子集', row)
    pickMode.value = 'children'
    currentPickComment.value = row
    searchData.rootId = ''
    params.pageNum = 1
    await render()
    ElMessage.success(`正在查看「${row.content}」的子评论`)
}

// 挑拣父集
const handleSelectParent = async (row) => {
    // console.log('挑拣父集', row)
    pickMode.value = 'parent'
    currentPickComment.value = row
    searchData.rootId = ''
    params.pageNum = 1
    await render()
    ElMessage.success(`正在查看「${row.content}」的父评论及其所有子评论`)
}


// 返回根评论列表（挑拣父集）
const backToRootList = () => {
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
}



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

</script>

<style scoped lang="scss">
.layout {
    @include flex(space-between, null, null);
    // margin-bottom: 20px;
}

.back-bar {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
    padding: 10px;
    background-color: #f0f9ff;
    border-radius: 4px;
    
    .parent-info {
        color: #409eff;
        font-size: 14px;
    }
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