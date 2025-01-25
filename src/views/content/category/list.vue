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
          <el-input v-if="data.flag" @blur="handleBlur(node,data)" v-model="category.name" placeholder="请输入子分类名，按回车保存" size="small" @keyup.enter="confirm" />
          <span v-else>{{ node.label }}</span>
          <!-- <span else>{{ node.label }}</span> -->
          <!-- 新增 -->
          <el-button  style="margin-left: 8px" v-if="node.level <= 1" @click="append(data)" :icon="Plus" type="primary" circle plain size="small" />
          
          <el-button  v-if="data.isSave && isLastChild(node,data) "  @click="handleSave($event,node,data)">确定</el-button>   
            
          <!-- 编辑 -->
          <el-button style="margin-left: 8px" @click="edit(data)"  :icon="Edit" type="primary" circle plain size="small" />
          <!-- 删除 -->
          <el-popconfirm v-if="data.children === null || data.children.length === 0" @confirm="remove(node, data)" :title="`你确定要删除 ${data.name} 吗`"  width="250px" :icon="WarnTriangleFilled">
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
import { ref } from 'vue';
import { data } from 'autoprefixer';
import { ElMessage } from 'element-plus';

defineOptions({
    name:'Category'
})

const cateData = ref([])



const defaultProps = {
  children: 'children',
  label: 'name',
}

const render = async() => {
    const res = await listApi()
    cateData.value = res.data
}

render()

const category = ref({
})

const append = (data) =>{
    console.log(data)
    category.value = { name : '', pid: null  }
    category.value.pid = data.id
    data.children.push({
        name:category.value.name,
        children:null,
        flag:true,
        isSave:true
    })
}

const handleBlur = (node,data) => {
    data.name  =  category.value.name
    // 非法判断
    if( !(data.name.trim()) ){
        node.parent.data.children.pop(1)
        ElMessage.error('请输入内容')
        return;
    }

   setTimeout(() => {
    data.flag = false
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

const handleSave = (e,node,data) => {
    data.isSave  = false
    e.stopPropagation()
    console.log(123)
    console.log(node,data)
}

// 判断当前节点是否为最后一个子节点
const isLastChild = (node, data) => {
  if (!node.parent) return false
  const children = node.parent.data.children
  if (!children) return false
  return children.indexOf(data) === children.length - 1
}

    
</script>

<style lang="scss" scoped>

</style>