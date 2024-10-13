<template>
        <el-button @click="toggleSelection()">清空表格</el-button>
        <el-button color="#626aef" :dark="isDark" @click="deleteSelectRows()">批量删除</el-button>
<el-form
    inline
    class="demo-ruleForm"
    :size="formSize"
    status-icon
    >
    <el-form-item label="用户搜索">
      <el-input :prefix-icon="User"  placeholder="请输入用户名 | 呢称 | 手机号" v-model="searchData.keyword"/><br>
    </el-form-item>

    <el-form-item label="用户类型">
        <UserTypeSelect v-model="searchData.type"></UserTypeSelect>
    </el-form-item>

    <el-form-item>
      <el-button @click="onSearch" type="primary">搜索</el-button>
      <el-button :icon="Refresh" size="mini" @click="onReset">重置</el-button>
    </el-form-item>
  </el-form>

    <MainContainer title="用户管理">
        <template #right>
            <el-button type="primary" @click="addDialog">新增用户</el-button>
        </template>
        <!-- 表格 -->
        <el-table :data="tableData" style="width: 100%"
        ref="multipleTableRef"
        @selection-change="removeMultiple"
        >
            <el-table-column type="selection" :selectable="selectable" width="55" />
            <el-table-column type="index" label="序号" width="100" />
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="nickname" label="呢称" />
            <el-table-column prop="phone" label="手机" />
            <el-table-column label="类型">
                <template #default="{row}">
                    {{ row.type === 1 ? '后台用户':'前台用户' }}
                </template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
                <template #default="{row}">
                    <el-switch v-model="row.status"  :active-value="1" :inactive-value="0" @change="modifySwitch(row)"/>
                </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" />
            <el-table-column label="操作" width="100">
                <template #default="{row,$index}">
                <el-button type="primary" :icon="Edit" @click="editDialog(row)" circle plain/>
                <el-button type="danger" :icon="Delete" @click="removeUsers(row.id)"  circle plain/>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog v-model="dialogVisible" :title="title" width="30%">
            <el-form ref="ruleFormRef" :model="formData" :rules="rules"  class="demo-ruleForm"
                :size="formSize" status-icon label-width="100px" style="padding-right: 35px;">
                <el-form-item label="用户名" prop="username">
                    <el-input :prefix-icon="User" placeholder="请输入用户名" v-model="formData.username" />
                </el-form-item>

                <el-form-item label="呢称" prop="nickname">
                    <el-input :prefix-icon="User" placeholder="请输入呢称" v-model="formData.nickname" />
                </el-form-item>

                <el-form-item label="手机号" prop="phone">
                    <el-input :prefix-icon="User" placeholder="请输入手机号" v-model="formData.phone" />
                </el-form-item>

                <el-form-item label="邮箱" prop="email">
                    <el-input :prefix-icon="User" placeholder="请输入邮箱" v-model="formData.email" />
                </el-form-item>

                <el-form-item label="用户类型">
                    <UserTypeSelect v-model="formData.type" style="width: 100%;"></UserTypeSelect>
                </el-form-item>

            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="title==='新增用户'?addUser():modifyUser()">确认</el-button>
                    <el-button type="primary" @click="dialogVisible = false">
                        取消
                    </el-button>
                </span>
            </template>
        </el-dialog>
 
        <!-- 分页 -->
        <el-pagination
		v-model:current-page="params.pageNum"
		v-model:page-size="params.pageSize"
		:page-sizes="[2,3,5,10]"
		:small="false"
		:disabled="false"
		:background="false"
		layout="jumper, total, sizes, prev, pager, next"
		:total="total"
		@size-change="onSizeChange"
		@current-change="onCurrentChange"
        style="margin-top: 20px; justify-content: flex-end;"
		/>

    </MainContainer>
</template>

<script setup>
import {Edit,Delete,Refresh} from '@element-plus/icons-vue'
import {listApi,addApi,removeApi,modifyApi,statusApi} from '@/api/sysuser'
import UserTypeSelect from '@/views/components/UserTypeSelect.vue';
import { ref } from 'vue';

const params = ref({
    pageNum :1,
    pageSize : 10
})

const total = ref(null)


//搜索相关
const searchData = ref({
    
})


const onSearch = () =>{
    params.value.pageNum = 1
    render()
}

//重置
const onReset = () => {
    params.value.pageNum = 1
    searchData.value = {}
    render()
}

const tableData = ref([])

// t_user_request：用户列表请求
const render = async() =>{
    const res =  await listApi(params.value.pageNum,params.value.pageSize,searchData.value)
    console.log('请求用户列表')
    console.log(res.data)
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
    //console.log(`onCurrentChange：当前第${size}页`)
    //更新当前页
    params.value.pageNum = page
    //重新渲染
    render()
}

// 批量删除相关
const multipleTableRef = ref()
const multipleSelection = ref([])

const removeMultiple = (raw) =>{
    console.log(raw)
    multipleSelection.value = raw
    // console.log(multipleSelection.value)
}

// 清空表格
const toggleSelection = (rows) => {
  if (rows) {
    rows.forEach((row) => {
      // TODO: improvement typing when refactor table
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      multipleTableRef.value.toggleRowSelection(row, undefined)
    })
  } else {
    multipleTableRef.value.clearSelection()
  }
}

// 批量删除
const deleteSelectRows = () => {
    if(multipleSelection.value.length === 0){
        ElMessage.error('请先勾选要删除的行')
        return
    }
    const rowIds = multipleSelection.value.map(row => row.id)
    removeUsers(rowIds)

}

// t_user_request：用户删除请求
const removeUsers = async(ids) =>{
    await ElMessageBox.confirm('你确认要进行删除么','温馨提示', {
      type: 'warning',
      confirmButtonText: '确认',
      cancelButtonText: '取消'
    })
    await removeApi(ids)
    ElMessage.success('删除成功')
    render()
}

//用户状态
const modifySwitch = async(row) =>{
    await statusApi(row.id,row.status)
    ElMessage.success('更改成功')
    render()
}


//弹层相关
const dialogVisible = ref(false)

const defaultData = {
    username:'',
    nickname:'',
    phone:'',
    email:'',
    type:"1"
}

const formData = ref({

})

const title = ref('')

    //新增弹层
const addDialog = () =>{
    dialogVisible.value = true
    title.value = '新增用户'
    formData.value = {...defaultData}
}

    //修改用户
const editDialog = (row) =>{
    dialogVisible.value = true
    title.value = '编辑用户'
    formData.value = {...row,type:row.type.toString()}

}

// t_user_request：用户添加请求
const addUser = async() =>{
    await ruleFormRef.value.validate()
    await addApi(formData.value)
    dialogVisible.value = false
    ElMessage.success('添加成功')
    render()

}

// t_user_request：用户修改请求
const modifyUser = async() => {
    await ruleFormRef.value.validate()
    await modifyApi(formData.value)
    dialogVisible.value = false
    ElMessage.success('修改成功')
    render()
}



    //校验相关
const ruleFormRef = ref(null)

// 绑定表单校验规则
const rules = {
    username : [    
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 10, message: '用户名必须是 3-5位 的字符', trigger: 'blur' },
  ],
    nickname : [
      { required: false, trigger: 'blur' },
      { pattern:/^\S{2,15}$/,message:'呢称必须是 2-15位 的非空字符',trigger:'blur'}
    ],

    phone : [
      { required: false, trigger: 'blur' },
      { pattern:/^(?:(?:\+|00)86)?1[3-9]\d{9}$/,message:'手机号码格式错误',trigger:'blur'}
    ],

    email : [
      { required: false, trigger: 'blur' },
      { pattern:/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,message:'邮箱格式错误',trigger:'blur'}
    ],
  }




</script>

<style lang="scss" scoped>

</style>