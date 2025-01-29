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
        <el-input :ref="setInputRef(data.id)" v-if="data.flag" 
        @blur="handleBlur(node, data)" v-model="category[data.id]"
        @input="handleInput(node,data)"
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
        <el-button v-if="!isEdit && data.isSave && isLastChild(node, data)" 
          style="margin-left: 8px"
        :icon="Plus"
        type="primary" circle plain size="small"
        @click="batchAdd(node, data)" />


        <!-- 确定按钮：提交服务器 -->
        <!-- 
            如果是新增模式：
              data.isSave && isLastChild(node,data)
              确定按钮的显示，是否为最后一个子节点
            如果是编辑模式(两个条件之一满足就显示)：
              data.isSave && currentEditID === data.id
              data.isSave && isLast === data.id
              确定按钮的显示，是否是当前编辑行
           -->
        <el-button 
        style="margin-left: 8px"
        v-if="!isEdit ? data.isSave && isLastChild(node, data) : 
        (data.isSave && currentEditID === data.id) ||(data.isSave && isLast === data.id) "
        :disabled="!isEdit?false:handleDisabled(data)"
        :icon="Check"
        type="success" circle plain size="small"
          @click="handleSave($event, node, data)" />


        <!-- 虚拟按钮：修改 -->

        <el-button v-if="data.isCheck" 
        :icon="Edit"
        style="margin-left: 8px"
        type="warning" circle plain size="small"
        @click="handleCheck(data)" />

        <!-- 虚拟按钮：恢复 -->
          <!-- 
            如果是新增模式：data.isReset
            如果是编辑模式：data.isReset  && handleInclude(data.id)
          -->

        <el-button 
        v-if="!isEdit?data.isReset:(data.isReset  && handleInclude(data.id))" 
        :icon="!isEdit?Close:Refresh"
        color="#626aef"
        circle plain size="small"
        @click="handleRevert($event,node, data)" />

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
import { Plus, Delete, WarnTriangleFilled, Edit,Check,Close,Refresh } from '@element-plus/icons-vue'
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

  nextTick(()=>{
    focusInput(newId)
  })

  category[newId] = ""
}
// 当前编辑行
const currentEditID = ref(null)
// 控制当前是否在编辑
const isEdit = ref(false)
// 数组中的最后一个元素
const isLast = ref(null)

// blur事件触发的时候存储differentArr和sameArr，等到点击撤销按钮的时候校验
// 输入框不相同的分类名字，存储到这里
const differentArr = []

// 输入框相同的分类名字，存储到这里
// const sameArr = []

const handleBlur = (node, data) => {
  // console.log(node, data)
  // currentEditID.value = data.id

  /*     console.log(data)
      console.log(category) */

  /*  if(!category[data.id]){
       category[data.id] = ''
   } */

  // 非法判断1
  console.log('blur事件',category[data.id])
  if (category[data.id]?.trim() === '') {
    console.log('空值处理')
    if (isEdit.value) {
      // 编辑事件的空值处理
      const nativeName = revertData(node.level, data)
      data.name = nativeName
      category[data.id] = nativeName
      if(differentArr.length === 0){
        allShow.value = true
      }else {
        differentArr.forEach((item,index) => {
          if(index === differentArr.length -1) {
            isLast.value = item
            console.log('最后一个元素到底是谁',item)
          }
        })
      }
      ElMessage.error('分类名不能重复')
      data.isEdit = false
      data.flag = false
      data.isSave = false
      data.isCheck = false
      data.isReset = false
      delete category[data.id]
      return;
    } else {
      // 新增事件的空值处理
      // console.log('输入为空')
      ElMessage.error('请输入内容')
      // 移除新增的子节点
      const afterCount = removeElement(node,data)
      if(beforeCount === afterCount){
        allShow.value = true
      }
      return;
    }
  }


  // 非法判断2
  // 编辑事件的处理(存储数据)
  // 新增事件的处理(判断名字是否重复)
  if (isEdit.value) {

    const name = revertData(node.level, data)

    // 不重复的逻辑
    if (name != category[data.id]) {
      let isRepeat;
      if(differentArr.length > 0 ){
        isRepeat = differentArr.find(item => item === data.id)
      }
      // if(!isRepeat && currentRevertId.value != data.id ) differentArr.push(data.id)
      if(!isRepeat ) differentArr.push(data.id)

    }else {
      // 重复的逻辑
      if(differentArr.length === 0){
        allShow.value = true
      }else {
        differentArr.forEach((item,index) => {
          if(index === differentArr.length -1) {
            isLast.value = item
            console.log('最后一个元素到底是谁',item)
          }
        })
      }
      ElMessage.error('分类名不能重复')
      data.isEdit = false
      data.flag = false
      data.isSave = false
      data.isCheck = false
      data.isReset = false
      delete category[data.id]
      return;
    }
    
    
    /* else {
      let isRepeat;
      if(sameArr.length > 0){
        isRepeat = sameArr.find(item => item === data.id)
      }
      if(!isRepeat && currentRevertId.value != data.id)  {
        sameArr.push(data.id)
      }
    } */

    console.log('push',differentArr)
    // console.log('push',sameArr)

  } else {
    console.log(node.parent.data.children)
    // 排除名字相同的子分类
    const isDuplicate = node.parent.data.children.find(item => {
      // 把自己排除
      if (data.id != item.id) {
        return item.name === category[data.id]
      }

    })

    // console.log(isDuplicate)
    let afterCount;
    if (isDuplicate) {
        afterCount = removeElement(node,data)
        ElMessage.error('分类名不能重复')
    }

      // console.log(data)
        // 如果一开始的长度跟后面新增的长度一致，说明没有新增的元素，则显示全部按钮
        if (beforeCount === afterCount) {
          console.log('没有新增的元素')
          allShow.value = true
          return;
        }
  }


  // 更新子分类名称(针对新增模式，往 subData 数据赋值，提交服务器)
  data.name = category[data.id]
  const subItem = subData.value.find(item => item.subId === data.id)
  if (subItem) {
    subItem.name = data.name
  }




    setTimeout(() => {
      // 隐藏输入框
      data.flag = false
      // 显示确定按钮
      data.isSave = true
      // 显示虚拟修改按钮
      data.isCheck = true
      // 显示虚拟恢复按钮
      data.isReset = true
    }, 200);
}

const handleInclude = (id) => {
  return differentArr.some(item => item=== id)
}

const removeElement = (node,data,specific=false) => {
  let afterCount
  const childList = node.parent.data.children
  const index = childList.indexOf(data)
  if(index > -1){
    // 删除为空和重复的非法元素
    afterCount = childList.length-1
    !specific?subData.value.pop():removeSpecificElement(data)
    childList.splice(index,1)
    delete category[data.id]
    return afterCount
  }
}

// 删除 subData 指定的元素，针对handleRevert
const removeSpecificElement = (data) => {
  const subCate = subData.value.find(item => item.subId === data.id)
  const index = subData.value.indexOf(subCate)
  if(index > -1){
    subData.value.splice(index,1)
  }
}



// 还原原始数据的方法
const revertData = (level, data) => {
  if (level === 1 || level === true) {
    const cate = nativeData.find(item => item.id === (level === true ? data : data.id))
    return cate.name
  } else {
    // console.log(level, data)
    // console.log('还原子分类')
    /* console.log(level)
    console.log(data) */
    if (level === false) {
      for (const item of nativeData) {
        if (item.children && item.children.length > 0) {
          const subCate = item.children.find(child => child.id === data);
          if (subCate) {
            // console.log('子分类对象', subCate);
            return subCate.name; // 这里的 return 会终止 revertData 函数
          }
        }
      }
    } else {
      const cate = nativeData.find(item => item.id === (level === false ? data : data.pid))
      // console.log('找不到的', cate)
      // console.log(cate)
      if (cate?.children != null && cate.children.length > 0) {
        const subCate = cate.children.find(item => item.id === (level === false ? data : data.id))
        // console.log(subCate.name)
        return subCate?.name
      }
    }
  }
}


// t_handle: 键盘事件
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
  // 重置：只要点击编辑，就禁用确定按钮
  isDisabled.value = true
  isLast.value  = null
  isEdit.value = true
  data.flag = true
  data.isSave = true
  data.isReset = false
  data.isEdit = false
  //视图数据 点击了哪个编辑按钮，就隐藏哪个编辑按钮，
  if (currentEditID.value == data.id) {
    data.isEdit = true
  }
  nextTick(()=>{
    focusInput(data.id)
  })
  // console.log(node, data)
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
      // t_handle:待删除(重复的查找)
      /* const flag = nativeData.find(item => item.id === prop * 1)
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
      } */
      
      cateNames.push({
        id: prop,
        name: category[prop]
      })
    }
    console.log(cateNames)
    await modifyApi(cateNames)
    ElMessage.success('修改成功')
    render()
    const arr = handleExpand(node, data)
    expandKey.value = [...arr]
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
  data.isReset = false
  data.isSave = true
  currentEditID.value = data.id
  isLast.value = null 
  differentArr.forEach((item, index) => {
      if (item === data.id) {
        // 点击修改，激活确定按钮
        isDisabled.value = false
        differentArr.splice(index, 1)
      }
    })
    console.log('删除后',differentArr)
  nextTick(()=>{
    focusInput(data.id)
  })
}

// 聚焦输入框的函数
const focusInput = (id) => {
  if(inputRefs.value[id]){
    inputRefs.value[id].focus()
  }
}


const currentRevertId = ref(null)

const handleRevert = (e,node, data) => {
  e.stopPropagation()
  // 编辑还原数据的事件
  if (isEdit.value) {
    currentEditID.value = data.id
    isLast.value = null
    data.isCheck = false
    // data.isReset = false
    data.flag = true
    nextTick(()=>{
          console.log(456)
          focusInput(data.id)
        })
    differentArr.forEach((item, index) => {
      if (item === data.id) {
        const nativeName = revertData(node.level, data)
        data.name = nativeName
        category[data.id] = nativeName
        // 点击恢复按钮，禁用确定按钮
        isDisabled.value = true
        ElMessage.success('数据恢复成功')
        differentArr.splice(index, 1)
      }
    })

    /* sameArr.forEach((item, index) => {
      console.log('重复数据？')
      if (item === data.id) {
        ElMessage.success('数据一致，撤销失败')
        sameArr.splice(index, 1)
      }
    })
    console.log('pop',sameArr) */

    console.log('pop',differentArr)

    // currentRevertId.value = data.id

    /* if (differentArr.length === 0 ) {
      ElMessage.success('已回到最初始的数据')
      render()
      currentRevertId.value = null
      allShow.value = true
      const arr = handleExpand(node)
      expandKey.value = [...arr]
    } */


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
  let afterCount
  afterCount = removeElement(node,data,true)

  // 如果一开始的长度跟后面新增的长度一致，说明没有新增的元素，则显示全部按钮
  if (beforeCount === afterCount) {
    console.log('没有新增的元素')
    allShow.value = true
  }
}

// t_current：控制按钮的禁用
const isDisabled = ref(true)

const handleDisabled = (data) => {
  if(data.flag === false){
    return false
  }else {
    if(isDisabled.value){
      return true
    }else {
      return false
    }
  }
}

// 定义延迟时间（毫秒）
const delay = 300

// 定义一个变量来存储定时器ID
let debounceTimer = null

const handleInput = (node,data) => {

     // 每次输入时，清除之前的定时器
     if (debounceTimer !== null) {
      clearTimeout(debounceTimer)
    }

  // 设置一个新的定时器
  debounceTimer = setTimeout(() => {
    // 在这里可以添加你需要执行的逻辑，例如发送请求
    console.log('延迟后的输入内容:', category[data.id])
    if (isEdit.value) {

      const name = revertData(node.level, data)
      if (name != category[data.id]) {
        // 如果名字不重复，就不禁用确定按钮
        isDisabled.value = false
      } else {
        // 如果名字重复，就禁用确定按钮
        isDisabled.value = true
      }
      if (!category[data.id].trim()) {
        // 如果输入为空，就禁用确定按钮
        isDisabled.value = true
      }
    }
    // 清除定时器ID
    debounceTimer = null
  }, delay)


  

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

  nextTick(()=>{
    focusInput(newId)
  })

  category[newId] = ""
}

</script>

<style lang="scss" scoped></style>