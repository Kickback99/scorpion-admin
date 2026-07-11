<template>
    <div class="tag-page">
    <div class="toolbar">
        <el-form label-width="auto" inline> 
            <el-form-item>
                <el-input size="small" v-model="searchData.keyword" placeholder="请输入标签名/备注" />
            </el-form-item>
            <el-form-item>
                <el-button size="small" type="primary" icon="Search"  plain @click="onSearch">搜索</el-button>
                <el-button size="small" type="warning" icon="Refresh" plain @click="onReset" >重置</el-button>
                <el-button size="small" :disabled="$hasPerm('btn.tag.add')" type="success" icon="Plus"  plain @click="handleAdd({})">新增</el-button>
            </el-form-item>
        </el-form>
    </div>

    <el-table :data="tableData" :style="{ width: '100%' }" align="center">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="name" label="标签名"  width="200"  />
        <el-table-column prop="articleCount" label="文章数量"  width="80" align="center" />
        <el-table-column prop="remark" label="备注"  width="200"  />
        <el-table-column  label="操作" width="150">
            <template #default="{row}">
                <el-button size="small" :disabled="$hasPerm('btn.tag.update')" @click="handleEdit(row)" type="primary" icon="Edit"   circle plain ></el-button>
                <el-popconfirm :title="`你确定要删除${row.name}吗`" @confirm="removeRole(row.id)" width="250px" icon="WarnTriangleFilled">
                <template #reference>
                    <el-button size="small" :disabled="$hasPerm('btn.tag.remove')" type="danger" icon="Delete"  circle plain/>
                </template>
                </el-popconfirm>
            </template>
        </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
        <el-pagination
			v-model:current-page="params.pageNum"
			v-model:page-size="params.pageSize"
			:page-sizes="[2,3,5,7]"
			:small="true"
			:disabled="false"
			:background="false"
			layout="total, sizes, prev, pager, next"
			:total="total"
			@size-change="onSizeChange"
			@current-change="onCurrentChange"
			/>
        </div>

        <el-dialog v-model="dialogVisible" :title="title" width="30%">
            <el-form ref="ruleFormRef" :model="formModel" :rules="rules" label-width="120px" class="demo-ruleForm"
                status-icon>
                <el-form-item label="标签名称" prop="name">
                    <el-input placeholder="请输入标签名称" v-model="formModel.name" />
                </el-form-item>

                <el-form-item label="标签备注" prop="remark">
                    <el-input placeholder="请输入标签备注" v-model="formModel.remark" />
                </el-form-item>

            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button size="small" @click="confirm">确认</el-button>
                    <el-button size="small" type="primary" @click="dialogVisible = false">
                        取消
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue';
import { addApi, listApi, modifyApi, removeApi } from '@/api/contag';
import { ElMessage } from 'element-plus';

const searchData = ref({})

onMounted(()=>{
    console.log('tag组件已挂载......')
})


const tableData = ref([])

const params = ref({
    pageNum:1,
    pageSize:10
})

const total = ref(null)

// t_tag_request：标签列表请求
const render = async() => {
    const res = await listApi(params.value.pageNum,params.value.pageSize,searchData.value)
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


const ruleFormRef = ref(null)
const dialogVisible = ref(false)

const formModel = ref({})
const title = ref('')

const rules = {
    name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }]
}

const handleAdd = async() => {
    dialogVisible.value = true
    title.value = '新增标签'
    // 等待对话框渲染完成
    await nextTick()
    ruleFormRef.value.clearValidate('name')
    formModel.value = {}

}

const handleEdit = async(row) => {
    dialogVisible.value = true
    title.value = '编辑标签'
    // 等待对话框渲染完成
    await nextTick()
    ruleFormRef.value.clearValidate('name')
    formModel.value = {...row}
}


// t_tag_request：新增标签请求
const addTag = async() => {
   await addApi(formModel.value)
   ElMessage.success('新增成功')
   params.value.pageNum = 1
   render()
}

// t_tag_request：修改标签请求
const modifyTag = async() => {
   await modifyApi(formModel.value)
   ElMessage.success('修改成功')
   render()
}

const confirm = async () => {
    await ruleFormRef.value.validate()
    if(!formModel.value.id){
        addTag()
    }else modifyTag()
    dialogVisible.value = false
}

const removeRole = async(id) => {
    await removeApi(id)
    ElMessage.success('删除成功')
    render()
}

</script>

<style lang="scss" scoped>
.tag-page {
    padding-top: 16px;
}

.toolbar {
    @include flex(center,center,null)
}

.pagination-wrapper {
    @include flex(center,center,null);
    margin-top: 16px;
}
</style>