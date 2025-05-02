<template>
    <div class="layout">
        <el-form ref="formRef"  label-width="auto" inline> 
            <el-form-item>
                <el-input v-model="searchData.keyword" placeholder="请输入标题 | 内容" />
            </el-form-item>
            <el-form-item>
                <CateSelect v-model="searchData.categoryId"></CateSelect>
            </el-form-item>
            <el-form-item>
                <el-select v-model="searchData.status" placeholder="请选择状态">
                    <el-option label="已发布" value="0" />
                    <el-option label="草稿" value="1" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" :icon="Search"  plain @click="onSearch">搜索</el-button>
                <el-button type="warning" :icon="Refresh" plain @click="onReset" >重置</el-button>
            </el-form-item>
        </el-form>
        <div class="right">
            <el-button type="success" :icon="Plus"  plain @click="handleAdd({})">新增</el-button>
        </div>
    </div>

    <el-table :data="tableData" :style="{ width: '100%' }" >
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="categoryId" label="分类" />
        <el-table-column prop="status" label="状态" />
        <el-table-column prop="createTime" label="创建日期" />
        <el-table-column label="操作">
            <template #default="{row}">
                <el-button @click="handleEdit(row)" type="primary" :icon="Edit"   circle plain ></el-button>
                <el-button @click="handleDelete(row.id)" type="danger" :icon="Delete" circle plain ></el-button>
            </template>
        </el-table-column>
    </el-table>

    <el-pagination
        v-model:current-page="params.pageNum"
        v-model:page-size="params.pageSize"
        :page-sizes="[2, 5, 7, 10]"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="onSizeChange"
        @current-change="onCurrentChange"
    />

    <ArticleEdit ref="maskRef" @reRender="render"></ArticleEdit>
   
</template>

<script setup>
import { listApi, removeApi } from '@/api/conarticle';
import CateSelect from '@/views/components/CateSelect.vue';
import { ref } from 'vue';
import {Search,Refresh,Plus,Edit,Delete} from '@element-plus/icons-vue'
import ArticleEdit from '@/views/components/ArticleEdit.vue';

//搜索相关
const searchData = ref({
    
})

const params = ref({
    pageNum :1,
    pageSize : 10
})

const total = ref(null)

const tableData = ref([])

// t_article_request：文章列表请求
const render = async() => {
    const res = await listApi(params.value.pageNum,params.value.pageSize,searchData.value)
    console.log(res)
    tableData.value = res.data.items
    total.value = res.data.total
}

render()

//点击分页事件
const onSizeChange = (size) => {
    //console.log(`onSizeChange：每页显示${size}条`)
    //每页条数发生变化时，重新从第一页渲染
    params.value.pageNum = 1
    //更新每页条数
    params.value.pageSize = size
    //重新渲染
    render()
}

const onCurrentChange = (page) => {
    //console.log(`onCurrentChange：当前第${page}页`)
    //更新当前页
    params.value.pageNum = page
    //重新渲染
    render()
}

const onSearch = () => {
    params.value.pageNum = 1
    render()
}

const onReset = () => {
    params.value.pageNum = 1
    searchData.value = {}
    render()
}

const maskRef = ref()

const handleAdd = (param) => {
    console.log('hello')
    maskRef.value.openMask()
    maskRef.value.handleToggle(param)
}

const handleEdit = (param) => {
    maskRef.value.openMask()
    maskRef.value.handleToggle(param)
}

// t_article_request：文章删除请求
const handleDelete = async(id) => {
    console.log(id)
    await removeApi(id)
    ElMessage.success('删除成功')
    render()
}

</script>

<style lang="scss" scoped>
.layout {
    @include flex(space-between,null,null)
}
</style>