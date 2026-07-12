<template>
         <div class="toolbar">
            <el-button :disabled="$hasPerm('btn.sysMenu.add')" @click="addDir" icon="Plus" type="success" plain>新增</el-button>
            <!-- <el-button :disabled="$hasPerm('btn.sysMenu.remove')" @click="deleteSelectRows()" icon="delete" color="#626aef" :dark="isDark" plain>批量删除</el-button> -->
         </div>
        

        <!-- 表格 -->
        <el-table
        v-loading="loading" 
        :data="tableData" style="width: 100%;"
        row-key="id"
        :tree-props="treeProps"
        ref="multipleTableRef"
        border stripe
        >
        <el-table-column prop="name" label="菜单名称" width="160"/>
        <el-table-column label="图标" width="60">
          <template #default="{row}">
            <!-- <Icon icon="row.icon == null ? 'ep:user':row.icon" /> -->
             <el-icon><SingleIcon :icon="row.icon"></SingleIcon></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="perms" label="权限标识" width="160"/>
        <el-table-column prop="path" label="路由地址" width="120"/>
        <el-table-column prop="component" label="组件路径" width="180" show-overflow-tooltip/>
        <el-table-column prop="sortValue" label="排序" width="60"/>
        <el-table-column label="状态" width="80">
            <template #default="{row}">
                <!-- <el-switch v-model="row.status"  :active-value="1" :inactive-value="0" @change="modifySwitch(row)"/> -->
                 <el-button v-if="row.status === 0" type="success" plain size="small">启用</el-button>
                 <el-button v-else type="danger" plain size="small">禁用</el-button>
            </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160"/>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{row}">
            <el-button v-if="row.type !== 2 && row.component != 'list'" @click="addMenuButton(row)" :disabled="$hasPerm('btn.sysMenu.add')"  type="primary" plain size="small">新增</el-button>
            <el-button  @click="editMenu(row)" :disabled="$hasPerm('btn.sysMenu.update')"  type="warning" plain size="small">编辑</el-button>
            <el-popconfirm :title="`你确定要删除 ${row.name} 吗`" @confirm="removeMenu(row.id)" width="250px" icon="WarnTriangleFilled">
              <template #reference>
                <el-button :disabled="row.children.length > 0"  type="danger"  plain size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
    </el-table>

    <!-- 弹层 -->
    <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="30%"
    @close="onCancel"
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
<!--             <el-select v-model="formModel.icon" clearable>
              <el-option v-for="item in iconList" :key="item.class" :label="item.class" :value="item.class">
              <span style="float: left;">
               <i :class="item.class"></i>
              </span>
                <span style="padding-left: 6px;">{{ item.class }}</span>
              </el-option>
            </el-select> -->
            <!-- 菜单编辑时图标的显示问题，点击有图标在点击没有图标的菜单，图标不显示search(已解决) -->
            <IconSelect v-model="formModel.icon" ref="iconRef" class="w-[200px]" />
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
          <el-form-item prop="component" >
                <template #label>
                组件路径
                  <el-tooltip content="访问的组件路径，如：`system/user/index`，默认在`views`目录下" placement="top">
                    <el-icon>
                        <i-ep-questionFilled></i-ep-questionFilled>
                    </el-icon>
                  </el-tooltip>
                </template>
            <el-input v-model="formModel.component" :disabled="isComponentDisabled " placeholder="请输入组件路径" />
          </el-form-item>
          <el-form-item v-if="formModel.type === 2">
            <el-input v-model="formModel.perms" placeholder="请输入权限标识" maxlength="100"/>
            <template #label>
                权限字符
                  <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(hasAuthority('btn.sysUser.list'))" placement="top">
                  <el-icon>
                    <i-ep-questionFilled></i-ep-questionFilled>
                  </el-icon>
                  </el-tooltip>
            </template>
          </el-form-item>
          <el-form-item label="状态" prop="type">
            <el-radio-group v-model="formModel.status">
              <el-radio :label="0">正常</el-radio>
              <el-radio :label="1">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="addOrModify">确认</el-button>
        <el-button type="primary" @click="onCancel">
          取消
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { IconSelect } from "@/components/MyIcon";
import {listApi,addApi,modifyApi,removeApi} from '@/api/sysmenu'
const tableData = ref([])
import { isAllEmpty } from "@pureadmin/utils";
import { computed, nextTick,ref,watch } from 'vue';
const iconRef = ref()
import {useUserStore} from '@/store/user'
import { loadMenu } from '@/router';

const userStore = useUserStore()

// 默认关闭loading
const loading = ref(false)

// t_menu_request：菜单树形列表请求
const render = async() => {
     // 开启loading动效
     loading.value = true
     const res = await listApi()
     console.log(res)
     tableData.value = res.data
     // 关闭loading动效
     loading.value = false
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
// const multipleSelection = ref([])

const treeProps = reactive({
  checkStrictly: false,
})

/* const removeMultiple = (raw) =>{
    console.log(raw)
    multipleSelection.value = raw
    // console.log(multipleSelection.value)
} */

/* const selectable = (row) => {
      return !row.children.length > 0
} */

// 批量删除
//批量删除菜单问题
/* const deleteSelectRows = () => {
    if(multipleSelection.value.length === 0){
        ElMessage.error('请先勾选要删除的行')
        return
    }
    const rowIds = multipleSelection.value.map(row => row.id)
    removeMenu(rowIds)

} */

//  t_menu_request：更改菜单状态请求
/* const modifySwitch = async(row) =>{
    await statusApi(row.id,row.status)
    row.status === 1 ? ElMessage.success('菜单已激活'):ElMessage.error('菜单已禁用')
    //t_question：菜单状态被禁用了，强制刷新路由
    window.location.reload()
} */

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
    status: 0
  }


const typeDisabled = ref(false) //控制以下是否全部禁用
const type0Disabled = ref(false) //目录
const type1Disabled = ref(false) //菜单
const type2Disabled = ref(false) //按钮

const formModel = ref({
    ...defaultForm
})


const AuthFields = ['Layout','ParentView','list']

const isComponentDisabled  = ref(false)



// 在工具条点击的添加按钮的事件
const addDir = () =>{
    // 添加为目录或菜单
    title.value = '添加目录/菜单'
    dialogVisible.value = true
    
    // 重置数据
    formModel.value = {...defaultForm}
    formModel.value.parentId = 0
    formModel.value.parentName = ''
    
    // 不禁用任何类型，让用户可以选择目录或菜单，只禁用按钮
    typeDisabled.value = false
    type0Disabled.value = false
    type1Disabled.value = false
    type2Disabled.value = true  // 禁用按钮选项
    
    // 默认选中目录类型
    formModel.value.type = 0
    formModel.value.component = 'Layout'  // 目录默认组件为Layout

    // 标记为工具条新增模式
    formModel.value._isToolbarAdd = true
    isComponentDisabled.value = true
}

// 监听类型变化
watch(
    () => formModel.value.type,
    (newType) => {
        // 仅在工具条新增模式且没有id（新增）且父级为0时执行
        if (formModel.value._isToolbarAdd && !formModel.value.id && formModel.value.parentId === 0) {
            formModel.value.component = newType === 0 ? 'Layout' : 'list'
            formModel.value.type = newType ===0 ? 0 : 1
            isComponentDisabled .value  = true
        }
    }
)

// 在表格中点击添加按钮的事件
const addMenuButton = (row) => {
    console.log(row)
    // 重置数据
    formModel.value = {...defaultForm}

    formModel.value.parentName = row.name 
    formModel.value.parentId = row.id
    dialogVisible.value = true
    title.value = '添加下级节点'
    isComponentDisabled .value = false
    
    if(row.type === 0){
        // 在目录中点击的添加，可以添加目录或菜单
        type2Disabled.value = true  // 禁用按钮
        typeDisabled.value = false   // 不禁用类型选择
        
        // 默认选中菜单类型
        formModel.value.type = 1
        formModel.value._isChildAdd = true  // 标记为子节点添加
    } else {
        // 在菜单中点击的添加，只能添加按钮
        typeDisabled.value = true
        formModel.value.type = 2
        formModel.value._isChildAdd = true // 标记为子节点添加
    }
}

// 添加监听处理子节点添加的类型变化
watch(() => formModel.value.type, (newType) => {
    // 子节点添加模式下的自动填充
    if (formModel.value._isChildAdd && !formModel.value.id) {
        if (newType === 0) {
            // 选择目录
            formModel.value.component = 'ParentView'
            isComponentDisabled .value  = true
        } else if (newType === 1) {
            // 选择菜单
            formModel.value.component = ''
            isComponentDisabled .value  = false
        } else if (newType === 2) {
            // 选择按钮
            formModel.value.component = ''
            isComponentDisabled .value  = false
        }
    }
})

// let baseIcon;

const editMenu = (row) =>{
    if (row.type === 0 || AuthFields.includes(row.component)){
      isComponentDisabled.value = true
    }else {
      isComponentDisabled.value = false
    }
    title.value = '修改菜单'
    dialogVisible.value = true
    console.log(row.type)
    nextTick(()=>{
      if(row.type != 2 && isAllEmpty(row.icon)){
      iconRef.value.removeIcon()
      // console.log(iconRef.value)
    }
    })
    console.log(row.icon)
    // baseIcon =  row.icon
    formModel.value =  {...row}
    typeDisabled.value = true
}

// 弹层取消事件
const onCancel = () => {
  dialogVisible.value = false
  delete formModel.value._isToolbarAdd
  delete formModel.value._isChildAdd
  isComponentDisabled.value = false  // 重置状态
  // formModel.value.icon = baseIcon
}

// 弹层确认事件：添加或修改
const addOrModify = () =>{
    delete formModel.value._isToolbarAdd
    delete formModel.value._isChildAdd
    isComponentDisabled.value = false  // 重置状态

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
    loadMenu(false)
    render()
}

// t_menu_request：菜单修改请求

const modifyMenu = async() => {
    await modifyApi(formModel.value)
    dialogVisible.value = false
    ElMessage.success('修改成功')
    render()
    // 清空路由
    // clearRoute(userStore.userMenu)
    // 重新加载路由配置文件和pinia数据
    loadMenu(false)
}
</script>

<style lang="scss" scoped>
    .toolbar {
        display: flex;
        margin-bottom: 20px;
    }
</style>