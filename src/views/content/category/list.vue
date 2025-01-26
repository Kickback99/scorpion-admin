<template>
    <div>
        <p>分类管理</p>
    </div>

    <!-- table树形展示 -->
    <!-- <el-table :data="cateData" :style="{ width: '100%' }" row-key="id">
        <el-table-column prop="name" label="分类名"  />
    </el-table> -->

    <!-- 树形展示 -->
    <el-tree
    style="max-width: 600px"
    :data="cateData"
    :props="defaultProps"
    show-checkbox
    node-key="id"
    :expand-on-click-node="false"
    @node-click="handleNodeClick"
    :default-expanded-keys="expandKey"
  >
  <template #default="{ node, data }">
        <span class="custom-tree-node">
          <el-input v-if="data.flag" 
          @blur="handleBlur(node,data)"  
          v-model="category[data.id]" 
          placeholder="请输入子分类名，按回车保存" 
          size="small" @keyup.enter="confirm" />
          <span v-else>{{ node.label }}</span>
          <!-- <span else>{{ node.label }}</span> -->
          <!-- 新增 -->
          <el-button  style="margin-left: 8px" 
          v-if="node.level <= 1 && allShow" @click="append(node,data)" 
          :icon="Plus" type="primary" circle plain size="small" />
          

          <!-- 批量添加 -->
          <el-button v-if="data.isSave && isLastChild(node,data) " @click="batchAdd(node,data)">添加</el-button>

          <!-- 提交服务器 -->
          <el-button  v-if="data.isSave && isLastChild(node,data) "  @click="handleSave($event,node,data)">确定</el-button>   



          <el-button v-if="data.isCheck"
          @click="handleCheck(data)"
          >修改</el-button>
          <el-button v-if="data.isCheck" 
          @click="cancelCheck(node,data)">关闭</el-button>

          <!-- 编辑 -->
          <el-button v-if="allShow" style="margin-left: 8px" 
          @click="edit(data)"  :icon="Edit" 
          type="primary" circle plain size="small" />
          <!-- 删除 -->
          <el-popconfirm v-if="(data.children === null || data.children.length === 0) && allShow" @confirm="remove(node, data)" :title="`你确定要删除 ${data.name} 吗`"  width="250px" :icon="WarnTriangleFilled">
            <template #reference>
            <el-button style="margin-left: 8px" type="danger" circle plain size="small" :icon="Delete"/>
            </template>
          </el-popconfirm>

            <!-- <el-popconfirm v-if="data.children === null || data.children.length === 0" :title="`你确定要删除${row.roleName}吗`" @confirm="removeRole(row.id)" width="250px" :icon="WarnTriangleFilled">
                <template #reference>
                    <el-button :disabled="$hasPerm('bnt.sysRole.remove')" type="danger" :icon="Delete"  circle plain/>
                </template>
            </el-popconfirm> -->

        </span>
      </template>
  </el-tree>
  <el-button @click="confirm">确定</el-button>
</template>

<script setup>
import {Plus,Delete,WarnTriangleFilled,Edit} from '@element-plus/icons-vue'
import { addApi, listApi } from '@/api/concategory';
import { reactive, ref } from 'vue';
import { ElMessage} from 'element-plus';

defineOptions({
    name:'Category'
})

const cateData = ref([])

const subData = ref([])

const defaultProps = {
  children: 'children',
  label: 'name',
}

const render = async() => {
    const res = await listApi()
    cateData.value = res.data
}

render()

const category = reactive({
})

let beforeCount = 0

const append = (node,data) =>{


  beforeCount = data.children.length

  allShow.value = false
  // 初始化 category 对象
  node.expanded = true
  const newId = Date.now()

  // 向当前节点的 children 数组中添加一个新的子节点
  data.children.push({
    id: newId,
    name: '',
    children: null,
    flag: true,
    isSave: false,
    isCheck:false
  })

  subData.value.push({
    subId:newId,
    name:'',
    pid:data.id
  })

  category[newId] = ""
}

const handleBlur = (node,data) => {
/*     console.log(data)
    console.log(category) */

   /*  if(!category[data.id]){
        category[data.id] = ''
    } */

    // 非法判断
    if( category[data.id].trim() === ''){
        console.log('输入为空')
    ElMessage.error('请输入内容')
        // 移除新增的子节点
        const index = node.parent.data.children.indexOf(data)
        if (index > -1) {
        node.parent.data.children.splice(index, 1)
        }

        delete category[data.id]

        allShow.value = true

        return;
    }

      // 更新子分类名称
    data.name = category[data.id]
    const subItem = subData.value.find(item => item.subId === data.id)
    if(subItem) {
        subItem.name = data.name
    }

    

  // 隐藏输入框
   setTimeout(() => {
    data.flag = false
    data.isSave = true
    data.isCheck = true
   }, 200);


}

const confirm = async(event) => {
    event.stopPropagation()
    console.log(category.value)
    await addApi(category.value)
    render()
    expandKey.value = [category.value.pid]
}

const expandKey = ref([])

const remove = (node,data) => {
    console.log(node,data)
    render()
    expandKey.value = [node.parent.data.id]
}

const edit = (data) => {
    data.flag = true
    console.log(data)
}

// 全部按钮的开关
const allShow = ref(true)

const handleSave = async(e,node,data) => {
    data.isSave  = false
    e.stopPropagation()
    /* const newSubData = subData.value.map(item =>{
        delete item.subId
        return {...item}
    }) */

    if(subData.value.length >0){
      await addApi(subData.value)
      ElMessage.success('添加成功')
      subData.value = []
    }else ElMessage.error('添加失败')

    render()
    expandKey.value = [node.parent.data.id]

    
} 

const handleCheck = (data) => {
  data.flag = true
  data.isCheck = false
}

const cancelCheck = (node,data) => {
    
        // 移除新增的子节点
        const index = node.parent.data.children.indexOf(data)
        if (index > -1) {
        node.parent.data.children.splice(index, 1)
        }

        delete category[data.id]

        console.log(node.parent.data.children.length)

        // 如果一开始的长度跟后面新增的长度一致，说明没有新增的元素，则显示全部按钮
        if(beforeCount === node.parent.data.children.length){
          allShow.value = true
        }
}

// 判断当前节点是否为最后一个子节点
const isLastChild = (node, data) => {
  if (!node.parent) return false
  const children = node.parent.data.children
  if (!children) return false
  return children.indexOf(data) === children.length - 1
}


// 批量添加
const batchAdd = (node,data) =>{
  console.log(node)
  const newId = Date.now()

  // 向当前节点的 children 数组中添加一个新的子节点
  node.parent.data.children.push({
    id: newId,
    name: '',
    children: null,
    flag: true,
    isSave: false,
    isCheck:false
  })

  subData.value.push({
    subId:newId,
    name:'',
    pid:node.parent.data.id
  })

  category[newId] = ""
}
    
</script>

<style lang="scss" scoped>

</style>