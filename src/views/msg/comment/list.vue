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
                    <el-select  style="width: 200px" v-model="searchData.rootId" placeholder="请选择评论类型">
                        <el-option label="请选择评论类型" value="" />
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


    <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="title" label="标题" show-overflow-tooltip />
        <el-table-column label="评论类型" >
            <template #default="{row}">
                {{ row.type === '0' ? '文章评论':'友链评论' }}
            </template>
        </el-table-column>
        <el-table-column label="评论类别">
            <template #default="{row}">
                {{ row.rootId === -1 ? '根评论':'子评论' }}
            </template>
        </el-table-column>
        <el-table-column prop="content" label="评论内容" show-overflow-tooltip />
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
                <el-button type="danger"  size="small" plain  @click="handleDelete(row.id)">删除</el-button>
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
import { addCommentApi, getCommentsApi } from '@/api/msgcomment';
import { nextTick, reactive, ref } from 'vue';

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
    Object.assign(searchData,{keyword:'',type:null,rootId:-1})
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

</script>

<style scoped lang="scss">
.layout {
    @include flex(space-between, null, null);
    margin-bottom: 20px;
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