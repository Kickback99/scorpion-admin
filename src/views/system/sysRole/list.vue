<template>
    <div class="layout">
        <el-form
        inline
        :model="formData"
        label-width="120px"
        class="demo-ruleForm"
        :size="formSize"
        status-icon
        >
        <el-form-item  prop="roleName">
        <el-input :prefix-icon="User"  placeholder="请输入角色名 | 角色编码" v-model="searchData.roleName"/><br>
        </el-form-item>


        <el-form-item>
        <el-button :icon="Search" @click="onSearch" type="primary" plain>搜索</el-button>
        <el-button :icon="Refresh" size="mini" @click="onReset" type="warning" plain >重置</el-button>
        </el-form-item>
        </el-form>
        <div class="right">
            <el-button :icon="Plus" type="success" @click="addDialog" plain>新增</el-button>
        </div>
    </div>

    <!-- 表格 -->
    <el-table :data="tableData" style="width: 100%" border stripe>
        <el-table-column type="index" label="序号" width="100" />
        <el-table-column prop="roleName" label="角色名称" />
        <el-table-column prop="roleCode" label="角色编码" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" width="110">
            <template #default="{row,$index}">
            <el-button type="primary" :icon="Edit" @click="editDialog(row)" circle plain/>
            <el-button type="danger" :icon="Delete" @click="removeRole(row)"  circle plain/>
            </template>
        </el-table-column>
    </el-table>

    <!-- 弹层 -->
    <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="30%"
    >
        <!-- 弹层内容 -->
        <el-form 
        :model="dialogData" 
        label-width="120px" 
        ref="ruleFormRef"  
        :rules="rules" style="padding-right: 40px;">
            <el-form-item label="角色名称" prop="roleName">
                <el-input v-model="dialogData.roleName" placeholder="请输入角色名称"/>
            </el-form-item>
            <el-form-item label="角色编码" prop="roleCode">
                <el-input v-model="dialogData.roleCode" placeholder="请输入角色编码"/>
            </el-form-item>
        </el-form>

        <template #footer>
            <span class="dialog-footer">
                <el-button @click="title === '新增角色'?addRole():modifyRole()">确认</el-button>
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
        
</template>

<script setup>
import {Edit,Delete,Refresh,User,Search,Plus} from '@element-plus/icons-vue'
import { ref } from 'vue';
import {listApi,addApi,modifyApi,removeApi} from '@/api/sysrole'
import { ElMessage} from 'element-plus';
const tableData = ref([])

const searchData = ref({})
// 分页相关
const params = ref({
    pageNum:1,
    pageSize:5,
})

const total = ref(null)


//角色分页列表
const render = async() => {
    const res = await listApi(params.value.pageNum,params.value.pageSize,searchData.value)
    tableData.value = res.data.items
    console.log(res.data.items)
    console.log('表格数据')
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

const removeRole = async(row) =>{
    await ElMessageBox.confirm('你确认要进行删除么','温馨提示', {
      type: 'warning',
      confirmButtonText: '确认',
      cancelButtonText: '取消'
    })
    await removeApi(row.id)
    ElMessage.success('删除成功')
    //重新渲染
    render()

}


// 参数搜索
const onSearch = () => {
    params.value.pageNum = 1
    render()
}

//重置
const onReset = () => {
    searchData.value.roleName = ''
    render()
}

// 弹层相关

    const dialogVisible = ref(false)
    const dialogData = ref({})
    const title = ref('')

    // 新增角色弹层

    const addDialog = () => {
        dialogVisible.value = true
        title.value = '新增角色'
        dialogData.value = {}
    }

    // 修改角色弹层
    const editDialog = (row) => {
        dialogVisible.value = true
        title.value = '编辑角色'
        dialogData.value = {...row}
    }


    // 新增角色请求
    const addRole = async() => {
        await ruleFormRef.value.validate()
        const res = await addApi(dialogData.value)
        console.log('增加请求')
        console.log(res)
        ElMessage.success('添加成功')
        render()
        dialogVisible.value = false

    }

    // 修改角色请求
    const modifyRole = async() =>{
        await ruleFormRef.value.validate()
        await modifyApi(dialogData.value)
        ElMessage.success('修改成功')
        render()
        dialogVisible.value = false

    }

    // 校验相关
    const ruleFormRef = ref(null)

    // 绑定表单校验规则
    const rules = {
        roleName : [    
        { required: true, message: '请输入角色名称', trigger: 'blur' },
        {pattern:/^\S{1,7}$/, message: '角色名必须是 1- 7 位非空字符', trigger: 'blur' },
    ],
        roleCode : [
        { required: true, message: '请输入角色编码', trigger: 'blur' },
        { pattern:/^[a-zA-Z0-9]{1,10}$/,message:'角色编码 必须是 1-10 位的字母或数字',trigger:'blur'}
        ],
    }




</script>

<style lang="scss" scoped>
.layout {
    display: flex;
    justify-content: space-between
}
</style>