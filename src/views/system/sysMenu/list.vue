<template>
        <SvgIcon icon="tag" color="green"></SvgIcon>
         <div class="toolbar">
            <el-button :disabled="$hasPerm('bnt.sysMenu.add')" @click="addDir" :icon="Plus" type="success" plain>新增</el-button>
            <el-button :disabled="$hasPerm('bnt.sysMenu.remove')" @click="deleteSelectRows()" :icon="delete" color="#626aef" :dark="isDark" plain>批量删除</el-button>
         </div>
        

        <!-- 表格 -->
        <el-table :data="tableData" style="width: 100%;" border stripe
        row-key="id"
        :default-expand-all="true"
        :tree-props="treeProps"
        ref="multipleTableRef"
        @selection-change="removeMultiple"
        >
        <el-table-column type="selection" :selectable="selectable" width="55" />
        <el-table-column prop="name" label="菜单名称" width="160"/>
        <el-table-column label="图标">
          <template #default="{row}">
            <Icon :icon="row.icon == null ? 'ep:user':row.icon" />
          </template>
        </el-table-column>
        <el-table-column prop="perms" label="权限标识" width="160"/>
        <el-table-column prop="path" label="路由地址" width="120"/>
        <el-table-column prop="component" label="组件路径" width="160"/>
        <el-table-column prop="sortValue" label="排序" width="60"/>
        <el-table-column label="状态" width="80">
            <template #default="{row}">
                <el-switch v-model="row.status"  :active-value="1" :inactive-value="0" @change="modifySwitch(row)"/>
            </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160"/>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{row}">
            <el-button v-if="row.type !== 2" @click="addMenuButton(row)" :disabled="$hasPerm('bnt.sysMenu.add')"  type="success" circle plain  :icon="Plus" size="mini"/>
            <el-button  @click="editMenu(row)" :disabled="$hasPerm('bnt.sysMenu.update')"  type="primary" circle plain  :icon="Edit" size="mini" />
            <el-button @click="removeMenu(row.id)" :disabled="row.children.length > 0"  type="danger"  circle plain :icon="Delete" size="mini" title="删除" />
          </template>
        </el-table-column>
    </el-table>

    <!-- 弹层 -->
    <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="30%"
  >
  <el-form ref="dataForm" :model="formModel" label-width="150px" size="small" style="padding-right: 40px;">
          <el-form-item label="所属上级" v-if="formModel.parentName">
            <el-input v-model="formModel.parentName" disabled="true"/>
          </el-form-item>
          <el-form-item label="菜单类型" prop="type">
            <el-radio-group v-model="formModel.type" :disabled="typeDisabled">
              <el-radio :label="0" :disabled="type0Disabled">目录</el-radio>
              <el-radio :label="1" :disabled="type1Disabled">菜单</el-radio>
              <el-radio :label="2" :disabled="type2Disabled">按钮</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="菜单名称" prop="name">
            <el-input v-model="formModel.name"/>
          </el-form-item>
          <el-form-item label="图标" prop="icon" v-if="formModel.type !== 2">
            <el-select v-model="formModel.icon" clearable>
              <el-option v-for="item in iconList" :key="item.class" :label="item.class" :value="item.class">
              <span style="float: left;">
               <i :class="item.class"></i>  <!-- 如果动态显示图标，这里添加判断 -->
              </span>
                <span style="padding-left: 6px;">{{ item.class }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="formModel.sortValue" controls-position="right" :min="0" />
          </el-form-item>
          <el-form-item prop="path">
                <template #label>
                路由地址
                  <el-tooltip content="访问的路由地址，如：`sysUser`" placement="top">
                    <el-icon>
                        <i-ep-questionFilled></i-ep-questionFilled>
                    </el-icon>
                  </el-tooltip>
                </template>
            <el-input v-model="formModel.path" placeholder="请输入路由地址" />
          </el-form-item>
          <el-form-item prop="component" v-if="formModel.type !== 0">
                <template #label>
                组件路径
                  <el-tooltip content="访问的组件路径，如：`system/user/index`，默认在`views`目录下" placement="top">
                    <el-icon>
                        <i-ep-questionFilled></i-ep-questionFilled>
                    </el-icon>
                  </el-tooltip>
                </template>
            <el-input v-model="formModel.component" placeholder="请输入组件路径" />
          </el-form-item>
          <el-form-item v-if="formModel.type === 2">
            <el-input v-model="formModel.perms" placeholder="请输入权限标识" maxlength="100"/>
            <template #label>
                权限字符
                  <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(hasAuthority('bnt.sysRole.list'))" placement="top">
                  <el-icon>
                    <i-ep-questionFilled></i-ep-questionFilled>
                  </el-icon>
                  </el-tooltip>
            </template>
          </el-form-item>
          <el-form-item label="状态" prop="type">
            <el-radio-group v-model="formModel.status">
              <el-radio :label="1">正常</el-radio>
              <el-radio :label="0">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="addOrModify">确认</el-button>
        <el-button type="primary" @click="dialogVisible = false">
          取消
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import {useRenderIcon} from '@/components/MyIcon/src/hook'
import {Edit,Delete,Refresh,User,Search,Plus} from '@element-plus/icons-vue'
import {listApi,addApi,modifyApi,removeApi,statusApi} from '@/api/sysmenu'

const tableData = ref([])

// t_menu_request：菜单树形列表请求
const render = async() => {
     const res = await listApi()
     console.log(res)
     tableData.value = res.data
}

render()

// t_menu_request：删除菜单请求
const removeMenu = async(id) =>{
    await ElMessageBox.confirm('你确认要进行删除么','温馨提示', {
      type: 'warning',
      confirmButtonText: '确认',
      cancelButtonText: '取消'
    })
    await removeApi(id)
    ElMessage.success('删除成功')
    render()
}

// 批量删除相关
const multipleTableRef = ref()
const multipleSelection = ref([])

const treeProps = reactive({
  checkStrictly: false,
})

const removeMultiple = (raw) =>{
    console.log(raw)
    multipleSelection.value = raw
    // console.log(multipleSelection.value)
}

const selectable = (row) => {
      return !row.children.length > 0
}

// 批量删除
//t_question：批量删除菜单问题
const deleteSelectRows = () => {
    if(multipleSelection.value.length === 0){
        ElMessage.error('请先勾选要删除的行')
        return
    }
    const rowIds = multipleSelection.value.map(row => row.id)
    removeMenu(rowIds)

}

//  t_menu_request：更改菜单状态请求
const modifySwitch = async(row) =>{
    await statusApi(row.id,row.status)
    row.status === 1 ? ElMessage.success('菜单已激活'):ElMessage.error('菜单已禁用')
    //t_question：菜单状态被禁用了，强制刷新路由
    window.location.reload()
}

// 弹层相关

const dialogVisible = ref(false)
const title = ref('')

const defaultForm = {
    id: '',
    parentId: '',
    name: '',
    type: 0,
    path: '',
    component: '',
    perms: '',
    icon: '',
    sortValue: 1,
    status: 1
  }


const typeDisabled = ref(false) //控制以下是否全部禁用
const type0Disabled = ref(false) //目录
const type1Disabled = ref(false) //菜单
const type2Disabled = ref(false) //按钮

const formModel = ref({
    ...defaultForm
})

// 在工具条点击的添加按钮的事件
const addDir = () =>{
    // 添加为目录
    title.value = '添加目录'
    dialogVisible.value = true
    typeDisabled.value = true

    // 重置数据
    formModel.value = {...defaultForm}

    formModel.value.component = 'Layout'
    formModel.value.parentId = 0
    formModel.value.type = 0
    formModel.value.parentName = ''
}

// 在表格中点击添加按钮的事件
const addMenuButton = (row) => {
    console.log(row.name)
    // 重置数据
    formModel.value = {...defaultForm}

    formModel.value.parentName = row.name 
    formModel.value.parentId = row.id
    dialogVisible.value = true
    title.value = '添加下级节点'
    if(row.type === 0){
        // 在目录中点击的添加，则添加目录或菜单
        type2Disabled.value = true
        formModel.value.type = 1
        typeDisabled.value = false
    }else {
        // 在菜单中点击的添加，则添加按钮
        typeDisabled.value = true
        formModel.value.type = 2
        
    }
}

const editMenu = (row) =>{
    title.value = '修改菜单'
    dialogVisible.value = true
    formModel.value =  row
    typeDisabled.value = true
}

// 弹层确认事件：添加或修改
const addOrModify = () =>{
    if(formModel.value.type === 0 && formModel.value.parentId != 0){
        formModel.value.component = 'ParentView'
    }
    if(!formModel.value.id){
        addMenu()
    }else modifyMenu()
}

// t_menu_request：菜单新增请求
const addMenu = async() => {
    await addApi(formModel.value)
    dialogVisible.value = false
    ElMessage.success('添加成功')
    render()
}

// t_menu_request：菜单修改请求

const modifyMenu = async() => {
    await modifyApi(formModel.value)
    dialogVisible.value = false
    ElMessage.success('修改成功')
    render()
}
</script>

<style lang="scss" scoped>
    .toolbar {
        display: flex;
        margin-bottom: 20px;
    }
</style>