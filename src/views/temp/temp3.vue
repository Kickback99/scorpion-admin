<template>
  <div>
    <h3>标签输入（后端数据）</h3>
    <SmartAutoComplete
      v-model="tags"
      :fetch-suggestions-api="fetchTags"
      :separators="/[\s\-_\.\/:]+/"
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
import PinyinMatch from 'pinyin-match'


const tags = ref([])

// 🟢 存储所有标签数据
const tagList = ref([])

// 🟢 加载所有标签数据（一次性加载）
const loadAllTags = async () => {
  const res = await listApi(1, 999, {})
  const items = res.data?.items || []
  // 转换为组件需要的格式
  tagList.value = items.map(item => ({
    value: item.name.trim(),
    id: item.id,
    remark: item.remark
  }))
  console.log('加载所有标签:', tagList.value.length, '条')
}

// 🟢 前端搜索函数（使用 pinyin-match）
const fetchTags = async (params) => {
  const query = params.keyword || ''
  
  if (!query) {
    return tagList.value
  }
  
  const lowerQuery = query.toLowerCase()
  
  const matched = tagList.value.filter(item => {
    const text = item.value
    const lowerText = text.toLowerCase()
    
    // 1. 英文直接包含匹配
    if (lowerText.includes(lowerQuery)) {
      return true
    }
    
    // 2. PinyinMatch（中文拼音）
    if (PinyinMatch.match(text, query)) {
      return true
    }
    
    // 3. 单词前缀匹配（bed → bedroom）
    const words = lowerText.split(/[\s\-_]+/)
    for (const word of words) {
      if (word.startsWith(lowerQuery)) {
        return true
      }
    }
    
    // 4. 复合词首字母匹配（high school → hs）
    if (words.length > 1) {
      const initials = words.map(word => word[0]).join('')
      if (initials.includes(lowerQuery)) {
        return true
      }
    }
    
    // 5. 🟢 单词内字符匹配（bedroom → br）
    // 检查查询词的每个字符是否按顺序出现在单词中
    let charIndex = 0
    for (let i = 0; i < lowerText.length && charIndex < lowerQuery.length; i++) {
      if (lowerText[i] === lowerQuery[charIndex]) {
        charIndex++
      }
    }
    if (charIndex === lowerQuery.length) {
      return true
    }
    
    return false
  })
  
  console.log(`搜索 "${query}" 匹配到 ${matched.length} 条:`, matched.map(i => i.value))
  return matched
}

const handleTagAdd = (tag) => {
  console.log('添加标签:', tag)
}

const handleTagRemove = (tag, index) => {
  console.log('移除标签:', tag, index)
}

// 🟢 组件挂载时加载数据
onMounted(() => {
  loadAllTags()
})
</script>