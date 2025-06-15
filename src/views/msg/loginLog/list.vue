<template>
    <div class="toolbar">
        <el-form label-width="auto" inline> 
            <el-form-item>
                <el-input v-model="searchData.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item>
                <el-select v-model="searchData.type" placeholder="请选择用户类型">
                    <el-option label="前台" value="1" />
                    <el-option label="后台" value="0" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-select v-model="searchData.status" placeholder="请选择登录状态">
                    <el-option label="登录" value="0" />
                    <el-option label="注册" value="1" />
                    <el-option label="退出" value="2" />
                </el-select>
            </el-form-item>
<!--             <el-form-item label="时间范围">
                <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                @change="handleDateChange"
                />
            </el-form-item> -->
            <el-form-item>
                <el-date-picker
                    v-model="searchData.createTimeBegin"
                    type="date"
                    placeholder="开始日期"
                    value-format="YYYY-MM-DD"
                    :disabled-date="(date) => searchData.createTimeEnd ? date > new Date(searchData.createTimeEnd) : false"
                />
                <span style="margin: 0 8px">至</span>
                <el-date-picker
                    v-model="searchData.createTimeEnd"
                    type="date"
                    placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                    :disabled-date="(date) => searchData.createTimeBegin ? date < new Date(searchData.createTimeBegin) : false"
                />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" :icon="Search"  plain @click="onSearch">搜索</el-button>
                <el-button type="warning" :icon="Refresh" plain @click="onReset" >重置</el-button>
                <el-button plain color="#626aef" :dark="isDark"  @click="deleteSelectRows()">批量删除</el-button>
            </el-form-item>
        </el-form>
    </div>

    <el-table :data="tableData" :style="{ width: '100%' }"  @selection-change="removeMultiple">
        <el-table-column type="selection" :selectable="selectable" width="55" />
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="username" label="用户名"  />
        <el-table-column  label="用户类型">
            <template #default="{row}">
                {{ row.type === 0 ? '后台用户':'前台用户' }}
            </template>
        </el-table-column>
        <el-table-column prop="status" label="登录状态">
            <template #default="{row}">
                <el-tag type="success" v-if="row.status === 0">{{ { 0: '登录', 1: '注册', 2: '退出' }[row.status] || '未知状态' }}</el-tag>
                <el-tag type="primary" v-if="row.status === 1">{{ { 0: '登录', 1: '注册', 2: '退出' }[row.status] || '未知状态' }}</el-tag>
                <el-tag type="danger" v-if="row.status === 2">{{ { 0: '登录', 1: '注册', 2: '退出' }[row.status] || '未知状态' }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="createTime" label="操作日期"  />
        <el-table-column  label="操作" width="150">
            <template #default="{row}">
                <el-popconfirm :title="`你确定要删除这条数据吗`" @confirm="removeRow(row.id)" width="250px" :icon="WarnTriangleFilled">
                <template #reference>
                    <el-button type="danger" :icon="Delete"  circle plain/>
                </template>
                </el-popconfirm>
            </template>
        </el-table-column>
    </el-table>

    <el-pagination
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

</template>

<script setup>
import { reactive, ref } from 'vue';
import {Delete,WarnTriangleFilled} from '@element-plus/icons-vue'
import { loginLogListApi,loginLogRemoveApi } from '@/api/msglog';
import { ElMessage } from 'element-plus';

const searchData = reactive({})


const tableData = ref([])

const params = ref({
    pageNum:1,
    pageSize:10
})

const total = ref(null)

// t_log_request：日志列表请求
const render = async() => {
    const res = await loginLogListApi(params.value.pageNum,params.value.pageSize,searchData)
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
    Object.assign(searchData,{username:'',type:null,status:null,createTimeBegin:'',createTimeEnd:''})
    render()
}

const multipleSelection = ref([])

// t_log_request：登录日志删除请求
const removeRow = async(id) => {
    await loginLogRemoveApi(id)
    ElMessage.success('删除成功')
    render()
}

// t_log_request：登录日志批量删除请求
const deleteSelectRows = async() => {
    console.log(multipleSelection.value.length)
    if(multipleSelection.value.length === 0){
        ElMessage.error('请先勾选要删除的行')
        return
    }
    
    await ElMessageBox.confirm('你确认要进行删除么','温馨提示', {
        type: 'warning',
        confirmButtonText: '确认',
        cancelButtonText: '取消'
    })
   const rowIds = multipleSelection.value.map(row => row.id)
   await removeRow(rowIds)
}

const removeMultiple = (raw) =>{
    console.log(raw)
    multipleSelection.value = raw
    // console.log(multipleSelection.value)
}

</script>

<style lang="scss" scoped>
.toolbar {
    @include flex(space-between,null,null)
}
</style>