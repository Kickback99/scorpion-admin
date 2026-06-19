<template>
  <div>
    <h3>标签输入（后端数据）</h3>
    <SmartAutoComplete
      v-model="tags"
      :fetch-suggestions-api="fetchTags"
      placeholder="请输入标签名称"
      :max="10"
      :debounce-delay="300"
      :min-search-length="1"
      @tag-add="handleTagAdd"
      @tag-remove="handleTagRemove"
    />
    
    <div style="margin-top: 20px;">
      <p>已选标签: {{ tags.join(', ') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { listApi } from '@/api/contag'
import SmartAutoComplete from '../components/SmartAutoComplete.vue'


const tags = ref([])

// API 请求函数：接收 { keyword: '搜索词' }
const fetchTags = async (params) => {
  const query = params.keyword || ''
  const res = await listApi(1, 999, { keyword: query })

    // 🔥 关键打印1：看 res.data 是什么
   console.log('fetchTags 返回:', res.data)
  
  // ✅ 直接返回处理好的数组
  const items = res.data?.items || []
  const result = items.map(item => ({
    value: item.name,
    id: item.id,
    remark: item.remark
  }))

    // 🔥 关键打印2：看处理后的数据
  console.log('fetchTags 处理后:', result)

  return result

}

const handleTagAdd = (tag) => {
  console.log('添加标签:', tag)
}

const handleTagRemove = (tag, index) => {
  console.log('移除标签:', tag, index)
}
</script>