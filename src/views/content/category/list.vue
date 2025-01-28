<template>
  <div>
    <p>分类管理</p>
  </div>

  <!-- table树形展示 -->
  <!-- <el-table :data="cateData" :style="{ width: '100%' }" row-key="id">
        <el-table-column prop="name" label="分类名"  />
    </el-table> -->

  <!-- 树形展示 -->
  <el-tree style="max-width: 600px" :data="cateData" :props="defaultProps" show-checkbox node-key="id"
    :expand-on-click-node="false" @node-click="handleNodeClick" :default-expanded-keys="expandKey">
    <template #default="{ node, data }">
      <span class="custom-tree-node">
        <el-input :ref="setInputRef(data.id)" v-if="data.flag" @blur="handleBlur(node, data)" v-model="category[data.id]"
          placeholder="请输入子分类名，按回车保存" size="small" @keyup.enter="confirm" />
        <span v-else>{{ node.label }}</span>
        <!-- <span else>{{ node.label }}</span> -->
        <!-- 新增 -->
        <el-button style="margin-left: 8px" v-if="node.level <= 1 && allShow" @click="append(node, data)" :icon="Plus"
          type="primary" circle plain size="small" />


        <!-- 批量添加按钮显示 -->
        <!-- 
            只有以下3个条件满足才显示
              只有是新增模式
              确定按钮显示
              最后一个子节点
           -->
        <el-button v-if="!isEdit && data.isSave && isLastChild(node, data)" @click="batchAdd(node, data)">添加</el-button>


        <!-- 确定按钮：提交服务器 -->
        <!-- 
            如果是新增模式：
              data.isSave && isLastChild(node,data)
              确定按钮的显示，是否为最后一个子节点
            如果是编辑模式：
              data.isSave && currentEditID === data.id
              确定按钮的显示，是否是当前编辑行
           -->
        <el-button v-if="!isEdit ? data.isSave && isLastChild(node, data) : data.isSave && currentEditID === data.id"
          @click="handleSave($event, node, data)">确定</el-button>



        <el-button v-if="data.isCheck" @click="handleCheck(data)">修改</el-button>

        <el-button v-if="data.isReset" @click="cancelCheck(node, data)">关闭</el-button>

        <!-- 编辑 -->
        <!-- 
            如果是新增模式，则allShow
            如果是编辑模式，则isEdit和data.isEdit 
              关于data.isEdit 
               默认data.isEdit为false(这里一定要false，因为属性没有，默认是false)，如果点中的是当前编辑行则为true
               即点中哪个编辑项，哪个编辑项隐藏 
         -->
        <el-button v-if="!isEdit ? allShow : (isEdit && !data.isEdit)" style="margin-left: 8px"
          @click="handleEdit(node, data)" :icon="Edit" type="primary" circle plain size="small" />
        <!-- 删除 -->
        <el-popconfirm v-if="(data.children === null || data.children.length === 0) && allShow"
          @confirm="remove(node, data)" :title="`你确定要删除 ${data.name} 吗`" width="250px" :icon="WarnTriangleFilled">
          <template #reference>
            <el-button style="margin-left: 8px" type="danger" circle plain size="small" :icon="Delete" />
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
import { Plus, Delete, WarnTriangleFilled, Edit } from '@element-plus/icons-vue'
import { addApi, listApi, modifyApi } from '@/api/concategory';
import { nextTick, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';

defineOptions({
  name: 'Category'
})

const cateData = ref([])

const subData = ref([])

const inputRefs = ref({})

// 设置ref的函数
const setInputRef = (id) => {
  return (el) => {
    if(el){
      inputRefs.value[id] = el
    }
  }
}

const defaultProps = {
  children: 'children',
  label: 'name',
}

let nativeData = []

const render = async () => {
  const res = await listApi()
  cateData.value = res.data
  // 同一个地址
  // nativeData = [ ...res.data ]

  // 不同的地址
  nativeData = JSON.parse(JSON.stringify(res.data))
  console.log(nativeData)

  // 结束编辑
  isEdit.value = false

  // 重置数据
  if(Reflect.ownKeys(category).length >0){
    for(const k in category){
        delete category[k]
    }
  }
}

render()

const category = reactive({
})

let beforeCount = 0

const append = (node, data) => {


  beforeCount = data.children.length
  console.log('beforeCount',beforeCount)

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
    isCheck: false,
    isReset: false
  })

  subData.value.push({
    subId: newId,
    name: '',
    pid: data.id
  })

  category[newId] = ""
}
// 当前编辑行
const currentEditID = ref(null)
// 控制当前是否在编辑
const isEdit = ref(false)

// blur事件触发的时候存储differentArr和sameArr，等到点击撤销按钮的时候校验
// 输入框不相同的分类名字，存储到这里
const differentArr = []

// 输入框相同的分类名字，存储到这里
const sameArr = []

const handleBlur = (node, data) => {
  // console.log(node, data)
  // currentEditID.value = data.id

  /*     console.log(data)
      console.log(category) */

  /*  if(!category[data.id]){
       category[data.id] = ''
   } */

  // 非法判断1
  if (category[data.id].trim() === '') {
    if (isEdit.value) {
      // 编辑事件的空值处理
      const nativeName = revertData(node.level, data)
      data.name = nativeName
      category[data.id] = nativeName
    } else {
      // 新增事件的空值处理
      console.log('输入为空')
      ElMessage.error('请输入内容')
      // 移除新增的子节点
      const index = node.parent.data.children.indexOf(data)
      if (index > -1) {
        node.parent.data.children.splice(index, 1)
        subData.value.pop()
      }

      delete category[data.id]

      allShow.value = true
      return;
    }
  }


  // 非法判断2
  // 编辑事件的处理(存储数据)
  // 新增事件的处理(判断名字是否重复)
  if (isEdit.value) {

    const name = revertData(node.level, data)

    if (name != category[data.id]) {
      differentArr.push(data.id)
    } else sameArr.push(data.id)

    /* console.log(differentArr)
    console.log(sameArr) */

  } else {
    console.log(node.parent.data.children)
    // t_current：排除名字相同的子分类
    const isDuplicate = node.parent.data.children.find(item => {
      // 把自己排除
      if (data.id != item.id) {
        return item.name === category[data.id]
      }

    })

    // console.log(isDuplicate)

    let afterCount;
    if (isDuplicate) {
      const index = node.parent.data.children.indexOf(data)
      if(index > -1 ) {
        afterCount = node.parent.data.children.length -1
        console.log(afterCount)
        node.parent.data.children.splice(index,1)
        subData.value.pop()
        ElMessage.error('分类名不能重复')
        delete category[data.id]
      }
    }

      // console.log(data)
        // 如果一开始的长度跟后面新增的长度一致，说明没有新增的元素，则显示全部按钮
        if (beforeCount === afterCount) {
          console.log('没有新增的元素')
          allShow.value = true
          return;
        }
  }


  // 更新子分类名称
  data.name = category[data.id]
  const subItem = subData.value.find(item => item.subId === data.id)
  if (subItem) {
    subItem.name = data.name
  }



  // 隐藏输入框
  setTimeout(() => {
    data.flag = false
    data.isSave = true
    data.isCheck = true
    data.isReset = true
  }, 200);


}

// 还原原始数据的方法
const revertData = (level, data) => {
  if (level === 1 || level === true) {
    const cate = nativeData.find(item => item.id === (level === true ? data : data.id))
    return cate.name
  } else {
    console.log(level, data)
    console.log('还原子分类')
    /* console.log(level)
    console.log(data) */
    if (level === false) {
      for (const item of nativeData) {
        if (item.children && item.children.length > 0) {
          const subCate = item.children.find(child => child.id === data);
          if (subCate) {
            console.log('子分类对象', subCate);
            return subCate.name; // 这里的 return 会终止 revertData 函数
          }
        }
      }
    } else {
      const cate = nativeData.find(item => item.id === (level === false ? data : data.pid))
      console.log('找不到的', cate)
      // console.log(cate)
      if (cate?.children != null && cate.children.length > 0) {
        const subCate = cate.children.find(item => item.id === (level === false ? data : data.id))
        // console.log(subCate.name)
        return subCate?.name
      }
    }
  }
}



const confirm = async (event) => {
  event.stopPropagation()
  console.log(category.value)
  await addApi(category.value)
  render()
  expandKey.value = [category.value.pid]
}

const expandKey = ref([])

const remove = (node, data) => {
  console.log(node, data)
  render()
  expandKey.value = [node.parent.data.id]
}



const handleEdit = (node, data) => {
  currentEditID.value = data.id
  isEdit.value = true
  data.flag = true
  data.isSave = true
  data.isReset = true
  data.isEdit = false
  if (currentEditID.value == data.id) {
    data.isEdit = true
  }
  console.log(node, data)
  allShow.value = false
  category[data.id] = data.name
}

// 全部按钮的开关
// 除了编辑按钮额外处理，其他按钮的显示隐藏都依赖这个数据
const allShow = ref(true)

const handleSave = async (e, node, data) => {
  console.log('修改提交服务器', node, data)
  data.isSave = false
  e.stopPropagation()
  /* const newSubData = subData.value.map(item =>{
      delete item.subId
      return {...item}
  }) */

  //编辑事件的提交
  if (isEdit.value) {
    const cateNames = []
    for (const prop in category) {
      const flag = nativeData.find(item => item.id === prop * 1)
      let isDuplicate;

      if (flag) {
        isDuplicate = revertData(true, prop * 1)
      } else isDuplicate = revertData(false, prop * 1)

      if (isDuplicate === category[prop]) {
        ElMessage.error('有重复的数据，提交失败')
        allShow.value = true
        render()
        const arr = handleExpand(node, data)
        expandKey.value = [...arr]
        return;
      }

      cateNames.push({
        id: prop,
        name: category[prop]
      })
    }

    await modifyApi(cateNames)
    ElMessage.success('修改成功')
    allShow.value = true

  } //新增事件的提交
  else {
    if (subData.value.length > 0) {
      await addApi(subData.value)
      ElMessage.success('添加成功')
      allShow.value = true
      subData.value = []
    } else ElMessage.error('添加失败')
  }
  console.log('有没有到这里')
  render()
  const arr = handleExpand(node)
  expandKey.value = [...arr]


}

// 展开的处理
const handleExpand = (node) => {
  const arr = []
  let tree = node.store.nodesMap
  for (const k in tree) {
    if (tree[k].level <= 1 && tree[k].expanded === true) {
      arr.push(tree[k].data.id)
    }
  }
  if (arr.length === 0) {
    arr.push({})
  }
  return arr
}

const handleCheck = (data) => {
  data.flag = true
  data.isCheck = false
  data.isReset = true
  data.isSave = true
  currentEditID.value = data.id
}

const cancelCheck = (node, data) => {
  // 编辑还原数据的事件
  if (isEdit.value) {
    differentArr.forEach((item, index) => {
      if (item === data.id) {
        const nativeName = revertData(node.level, data)
        data.name = nativeName
        category[data.id] = nativeName
        ElMessage.success('数据恢复成功')
        differentArr.splice(index, 1)
      }
    })

    sameArr.forEach((item, index) => {
      if (item === data.id) {
        ElMessage.success('数据一致，撤销失败')
        sameArr.splice(index, 1)
      }
    })

    if (differentArr.length === 0 && sameArr.length === 0) {
      ElMessage.success('已回到最初始的数据')
      render()
      allShow.value = true
      const arr = handleExpand(node)
      expandKey.value = [...arr]
    }

    /* const nativeName = revertData(node.level,data)
    if(category[data.id] != nativeName){
      const nativeName = revertData(node.level, data)
      data.name = nativeName
      category[data.id] = nativeName
      ElMessage.success('数据恢复成功')
      return;
    }else {
      ElMessage.success('数据一致，撤销失败')
      render()
      const arr = handleExpand(node)
      expandKey.value = [...arr]
    } */
    return;
  }

  // 新增还原数据的事件
  // 移除新增的子节点
  const index = node.parent.data.children.indexOf(data)
  if (index > -1) {
    node.parent.data.children.splice(index, 1)
  }

  delete category[data.id]

  console.log(node.parent.data.children.length)

  // 如果一开始的长度跟后面新增的长度一致，说明没有新增的元素，则显示全部按钮
  if (beforeCount === node.parent.data.children.length) {
    console.log('没有新增的元素')
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
const batchAdd = (node, data) => {
  console.log(node)
  const newId = Date.now()

  // 向父节点的 children 数组中添加一个新的子节点
  node.parent.data.children.push({
    id: newId,
    name: '',
    children: null,
    // 控制span和输入框的切换
    flag: true,
    // 控制确定按钮的切换
    isSave: false,
    // 控制修改的切换
    isCheck: false,
    // 控制关闭的切换
    isReset: false
  })

  subData.value.push({
    subId: newId,
    name: '',
    pid: node.parent.data.id
  })

  category[newId] = ""
}

</script>

<style lang="scss" scoped></style>