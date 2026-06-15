<template>

    <div class="flex justify-between items-center">
        <el-form ref="formRef" :model="searchModel" label-width="auto" inline> 
            <el-form-item >
                <el-input v-model="searchModel.keyword" placeholder="请输入名字/描述"/>
            </el-form-item>
            <el-form-item style="width: 200px">
                <SmartSelector v-model="searchModel.status" :data="fields" placeholder="请选择审核状态"></SmartSelector>
            </el-form-item>
             <el-form-item >
                <el-button icon="Search" @click="onSearch" type="primary" plain>搜索</el-button>
                <el-button icon="Refresh" type="warning" size="mini" @click="onReset" plain>重置</el-button>
             </el-form-item>
        </el-form>

        <div>
            <el-button size="small" type="primary" icon="Plus"  @click="handleAdd">新增友链</el-button>
            <el-button size="small" icon="Delete" color="#626aef" :dark="isDark" @click="deleteSelectRows()">批量删除</el-button>
        </div>
    </div>

    <el-table :data="tableData" style="width: 100%" ref="multipleTableRef" @selection-change="handleMultiple">
        <el-table-column type="selection" :selectable="selectable" width="55" />
        <el-table-column prop="name" label="名字" />
        <el-table-column label="logo">
            <template #default="{row}">
                <el-image style="width: 100px" :src="row.logo" :fit="fit" />
            </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="address" label="地址" />
        <el-table-column label="状态">
            <template #default="{row}">
                <el-button size="small" type="primary" v-if="row.status === '0'">已通过</el-button>
                <el-button size="small" type="danger"  v-if="row.status === '1'">已驳回</el-button>
                <el-button size="small" type="warning" v-if="row.status === '2'">待审核</el-button>
            </template>
        </el-table-column>

        <el-table-column label="操作">
            <template #default="{row}">
                <el-button @click="handleEdit(row)" size="small" type="warning" icon="Edit" circle></el-button>
                <el-popconfirm :title="`你确定要删除${row.name}吗`" @confirm="handleDelete(row.id)" width="250px" icon="WarnTriangleFilled">
                    <template #reference>
                        <el-button size="small" type="danger" icon="Delete" circle></el-button>
                    </template>
                </el-popconfirm>
            </template>
        </el-table-column>
    </el-table>

    <el-pagination
		v-model:current-page="pagination.pageNum"
		v-model:page-size="pagination.pageSize"
		:page-sizes="[2,3,5,7]"
		:small="false"
		:disabled="false"
		:background="false"
		layout="jumper, total, sizes, prev, pager, next"
		:total="total"
		@size-change="onSizeChange"
		@current-change="onCurrentChange"
    />

        <el-dialog v-model="dialogVisible" :title="title" width="30%">
            <el-form ref="ruleFormRef" :model="formModel" :rules="rules" label-width="auto"
                 status-icon>
                <el-form-item  prop="name">
                    <el-input :prefix-icon="User" placeholder="请输入名字" v-model="formModel.name" />
                </el-form-item>

                <el-form-item prop="description">
                    <el-input :prefix-icon="User" placeholder="请输入描述" v-model="formModel.description" />
                </el-form-item>

                <el-form-item prop="logo">
                    <el-input :prefix-icon="User" placeholder="请输入logo地址" v-model="formModel.logo" />
                </el-form-item>

                <el-form-item prop="address">
                    <el-input :prefix-icon="User" placeholder="请输入网站地址" v-model="formModel.address" />
                </el-form-item>

                <el-form-item style="width: 200px">
                    <SmartSelector v-model="formModel.status" :data="fields" placeholder="请选择审核状态"></SmartSelector>
                </el-form-item>
                

            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="handleConfirm">确认</el-button>
                    <el-button type="primary" @click="dialogVisible = false">
                        取消
                    </el-button>
                </span>
            </template>
        </el-dialog>
</template>

<script setup>
import { friendLinkAddApi, friendLinkListApi, friendLinkModifyApi, friendLinkRemoveApi } from '@/api/confriendlink';
import SmartSelector from '@/views/components/SmartSelector.vue';
import { ElMessage } from 'element-plus';
import { reactive, ref } from 'vue';

const tableData = ref([])

const total = ref(null)

const pagination = reactive({
    pageNum:1,
    pageSize:5
})

const searchModel = reactive({})

const renderFriendLink = async() => {
    const res = await friendLinkListApi(pagination.pageNum,pagination.pageSize,searchModel)
    tableData.value = res.data.items
    total.value = res.data.total
}

renderFriendLink()

//点击分页事件
const onSizeChange = (size) => {
    //console.log(`onSizeChange：每页显示${size}条`)
    //每页条数发生变化时，重新从第一页渲染
    pagination.pageNum = 1
    //更新每页条数
    pagination.pageSize = size
    //重新渲染
    renderFriendLink()
}

const onCurrentChange = (page) => {
    //console.log(`onCurrentChange：当前第${page}页`)
    //更新当前页
    pagination.pageNum = page
    //重新渲染
    renderFriendLink()
}

const fields = [
    {label:'请选择审核状态', value:''},
    {label:'已通过', value:'0'},
    {label:'已驳回', value:'1'},
    {label:'待审核', value:'2'},
]

const onSearch = () =>{
    pagination.pageNum = 1
    renderFriendLink()
}

//重置
const onReset = () => {
    pagination.pageNum = 1
    Object.assign(searchModel,{id:null,keyword:'',status:''})
    renderFriendLink()
}

const dialogVisible = ref(false)
const title = ref('')

const formModel = reactive({})
const ruleFormRef = ref(null)


const handleAdd = async() => {
    dialogVisible.value = true
    title.value = '新增友链'
    // 等待对话框渲染完成
    await nextTick()
    ruleFormRef.value?.resetFields()
    Object.assign(formModel,{
        id:null,
        name:'',
        description:'', 
        logo:'',
        address:'',
        status:'0'
    })
}

const handleEdit = async(row) => {
    dialogVisible.value = true
    title.value = '编辑友链'
    // 等待对话框渲染完成
    await nextTick()
    // 重置表单校验状态
    ruleFormRef.value?.resetFields()
    Object.assign(formModel,row)
}


const handleConfirm = async() => {
    await ruleFormRef.value.validate()
    try {
        if(!formModel.id){
            await friendLinkAddApi(formModel)
        }else {
            await friendLinkModifyApi(formModel)
        }
        ElMessage.success('操作成功')
        dialogVisible.value = false
        renderFriendLink()
    } catch (error) {
        ElMessage.error('操作失败')
        dialogVisible.value = false
    }
}

const multipleSelection = ref([])

const handleMultiple = (raw) => {
    console.log(raw)
    multipleSelection.value = raw
}

// 批量删除
const deleteSelectRows = async() => {
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
    await handleDelete(rowIds)

}

const handleDelete = async(id) =>{
       await friendLinkRemoveApi(id) 
       ElMessage.success('操作成功')
       renderFriendLink()
}

const rules = {
    name:[
      { required: true, message: '请输入名字', trigger: 'blur' },
      {pattern:/^\S{2,20}$/,message:'名字必须是 2-20 位的非空字符',trigger:'blur' },
    ],
    description:[
        { required: true, message: '请输入描述', trigger: 'blur' },
        { pattern: /^\S{2,50}$/, message: '描述必须是 2-50 位的非空字符', trigger: 'blur' },
    ],
    logo:[
        { required: true, message: '请输入logo地址', trigger: 'blur' },
        {pattern:/^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/,
            message:'非法网址',
            trigger: 'blur'
        }
    ],
    address:[
        { required: true, message: '请输入网站地址', trigger: 'blur' },
        {pattern:/^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/,
            message:'非法网址',
            trigger: 'blur'
        } 
    ]
}


</script>

<style scoped lang="scss">

</style>