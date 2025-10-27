<template>
  <el-tabs
    v-model="activeTab"
    type="card"
    class="demo-tabs"
    closable
    @tab-remove="removeTab"
    @tab-click="clickTab"
  >
    <el-tab-pane
      v-for="item in tabs"
      :key="item.path"
      :label="item.title"
      :name="item.path"
    >
    </el-tab-pane>
  </el-tabs>
</template>

<script setup>
import { useTabStore } from '@/store/tabs';
import { ref,computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute()
const router = useRouter()
const tabStore = useTabStore()

const activeTab = ref('')


const tabs = computed(() => {
   return  tabStore.getTabs
})

const addTab = () => {
    console.log('routerouterouteroute')
    console.log(route)
    const {path,meta:{title}} = route
    /* console.log(route)
    console.log(path)
    console.log(title) */
    const itemTab = {
        path,
        title
    }
    tabStore.addTabs(itemTab)
}

//监听路由
watch(()=>route.path,()=>{
    setActiveTab()
    addTab()
})


// 点击选项卡
const clickTab = (tab) => {
    const {props} = tab
    router.push(props.name)
}

// 设置激活的选项卡
const setActiveTab = () => {
    activeTab.value = route.path
}

onMounted(()=>{
    setActiveTab()
    addTab()
})

// 删除选项卡
const removeTab = (targetName) => {
  // 获取当前所有的标签页列表
  const currentTabs = tabs.value  // 从计算属性获取标签页数组
  
  // 获取当前激活的标签页路径
  let activeName = activeTab.value
  
  // 检查要删除的是否是当前激活的标签页
  if (activeName === targetName) {
    // 如果是激活的标签页，需要找到下一个应该激活的标签页
    currentTabs.forEach((tab, index) => {
      // 找到要删除的标签页在数组中的位置
      if (tab.path === targetName) {
        // 优先找右边的标签页，如果没有就找左边的
        const nextTab = currentTabs[index + 1] || currentTabs[index - 1]
        if (nextTab) {
          // 设置新的激活标签页为找到的标签页路径
          activeName = nextTab.path
        }
      }
    })
  }
  
  // 更新激活的标签页状态
  activeTab.value = activeName
  
  // 从 store 中过滤掉被删除的标签页，更新标签页列表
  tabStore.tabList = currentTabs.filter((tab) => tab.path !== targetName)
}

</script>

<style scoped lang="scss">
:deep(.el-tabs__header){
    margin: Opx;
}
:deep(.el-tabs_item){
    height:26px !important;
    line-height:26px !important;
    text-align:center !important;
    border:1px solid #d8dce5 !important;
    margin:Opx 3px !important;
    color:#495060;
    font-size:12px important;
    padding:Opx 10px !important;
}
:deep(.el-tabs_nav){
    border:none important;
}
:deep(.is-active){
    border-bottom:1px solid transparent important;
    border:1px solid #42b983 !important;
    background-color:#42b983 !important;
    color:#fff !important;
}
:deep(.el-tabs_item:hover){
    color:#495060 important;
}
:deep(.is-active:hover){
    color:#fff !important;
}
:deep(.el-tabs_nav-next){
    line-height:26px important;
}
</style>