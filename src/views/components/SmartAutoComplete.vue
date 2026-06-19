<!-- src/components/SmartAutoComplete.vue -->
<template>
  <div class="smart-input-tag" ref="containerRef">
    <!-- el-input-tag 基础组件 -->
    <el-input-tag
      ref="inputTagRef"
      v-model="tags"
      :placeholder="placeholder"
      :max="max"
      :disabled="disabled"
      :size="size"
      :readonly="readonly"
      :clearable="clearable"
      @remove="handleTagRemove"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    />
    
    <!-- 自定义下拉建议框 -->
    <div 
      v-if="showDropdown && filteredSuggestions.length > 0" 
      class="suggestions-popover"
      :style="suggestionsStyle"
      ref="suggestionsRef"
    >
      <div 
        v-for="(item, index) in filteredSuggestions" 
        :key="index"
        class="suggestion-item"
        :class="{ 'suggestion-active': activeIndex === index }"
        @mousedown="handleSuggestionMouseDown($event, item)"
        @mouseenter="activeIndex = index"
      >
        <span>{{ item.value }}</span>
        <el-tag v-if="isTagSelected(item.value)" size="small" type="info">已添加</el-tag>
      </div>
      <div v-if="loading" class="suggestion-loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

// ==================== Props ====================
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: '请输入标签，按回车确认'
  },
  max: {
    type: Number,
    default: 10
  },
  disabled: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'default'
  },
  readonly: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: false
  },
  // ===== 自动补全相关 =====
  // 获取联想数据的 API 函数（必须返回 Promise）
  fetchSuggestionsApi: {
    type: Function,
    required: true
  },
  // 防抖延迟（ms）
  debounceDelay: {
    type: Number,
    default: 300
  },
  // 最小搜索字符数
  minSearchLength: {
    type: Number,
    default: 1
  }
})

// ==================== Emits ====================
const emit = defineEmits([
  'update:modelValue',
  'tag-add',
  'tag-remove',
  'input-change'
])

// ==================== Refs ====================
const containerRef = ref(null)
const inputTagRef = ref(null)
const suggestionsRef = ref(null)
const tags = ref([...props.modelValue])
const currentInput = ref('')
const showDropdown = ref(false)
const activeIndex = ref(-1)
const loading = ref(false)
const inputRect = ref({})
let debounceTimer = null
let isComposing = false

// 建议数据
const suggestions = ref([])

// 过滤后的建议（排除已选择的）
const filteredSuggestions = computed(() => {
  return suggestions.value.filter(item => 
    !isTagSelected(item.value)
  )
})

// ==================== 方法 ====================

// 获取当前输入框的真实值
const getCurrentInputValue = () => {
  const inputElement = inputTagRef.value?.$el?.querySelector('input')
  return inputElement ? inputElement.value : ''
}

// 检查标签是否已选择
const isTagSelected = (value) => {
  return tags.value.includes(value)
}

// 更新输入框值
const updateCurrentInput = () => {
  currentInput.value = getCurrentInputValue()
  emit('input-change', currentInput.value)
  
  // 如果输入内容变化，触发搜索
  if (currentInput.value && currentInput.value.length >= props.minSearchLength) {
    debounceSearch(currentInput.value)
  } else {
    // 输入为空或太短，隐藏下拉
    showDropdown.value = false
    suggestions.value = []
  }
}

// 防抖搜索
const debounceSearch = (query) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    await fetchSuggestions(query)
  }, props.debounceDelay)
}

// 获取联想数据
const fetchSuggestions = async (query) => {
  if (!props.fetchSuggestionsApi) return
  
  loading.value = true
  
  try {
    const result = await props.fetchSuggestionsApi({ keyword: query })

    // 🔥 关键打印3：组件接收到的数据
    console.log('组件接收 result:', result)
    console.log('是否是数组:', Array.isArray(result))
    
    // ✅ 直接使用，假设 result 已经是数组
    const data = Array.isArray(result) ? result : []
    
    suggestions.value = data
    showDropdown.value = suggestions.value.length > 0
    activeIndex.value = -1
    updateSuggestionsPosition()
    
  } catch (error) {
    console.error('获取建议失败:', error)
    suggestions.value = []
    showDropdown.value = false
  } finally {
    loading.value = false
  }
}

// 更新建议框位置
const updateSuggestionsPosition = () => {
  nextTick(() => {
    const inputElement = inputTagRef.value?.$el?.querySelector('.el-input-tag')
    if (inputElement) {
      const rect = inputElement.getBoundingClientRect()
      inputRect.value = {
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      }
    }
  })
}

// 处理输入变化（监听 input 事件）
const handleInputChange = () => {
  if (isComposing) return
  updateCurrentInput()
}

// 处理焦点事件
const handleFocus = () => {
  // 聚焦时，如果有输入内容，显示下拉
  const value = getCurrentInputValue()
  if (value && value.length >= props.minSearchLength) {
    debounceSearch(value)
  }
}

// 处理失焦事件
const handleBlur = (event) => {
  // 延迟执行，让点击建议项先处理
  setTimeout(() => {
    // 检查是否点击了下拉框
    const isClickingSuggestion = suggestionsRef.value?.contains(document.activeElement)
    if (!isClickingSuggestion) {
      // 如果有输入内容，尝试添加为标签
      const value = getCurrentInputValue().trim()
      if (value) {
        addCurrentInputAsTag(value)
      } else {
        // 没有输入内容，关闭下拉
        showDropdown.value = false
      }
    }
  }, 200)
}

// 处理键盘事件
const handleKeydown = (event) => {
  // 处理中文输入法
  if (event.key === 'Process') {
    return
  }
  
  // 更新当前输入
  const value = getCurrentInputValue()
  currentInput.value = value
  
  switch (event.key) {
    case 'Enter':
      // 如果正在输入中文，不处理
      if (isComposing) return
      
      event.preventDefault()
      if (showDropdown.value && activeIndex.value >= 0 && activeIndex.value < filteredSuggestions.value.length) {
        // 选择高亮的建议项
        addTagFromSuggestion(filteredSuggestions.value[activeIndex.value].value)
      } else if (currentInput.value.trim()) {
        // 添加当前输入作为标签
        addCurrentInputAsTag(currentInput.value)
      }
      break
      
    case 'ArrowDown':
      if (showDropdown.value) {
        event.preventDefault()
        activeIndex.value = Math.min(activeIndex.value + 1, filteredSuggestions.value.length - 1)
      }
      break
      
    case 'ArrowUp':
      if (showDropdown.value) {
        event.preventDefault()
        activeIndex.value = Math.max(activeIndex.value - 1, -1)
      }
      break
      
    case 'Escape':
      if (showDropdown.value) {
        event.preventDefault()
        showDropdown.value = false
        suggestions.value = []
        activeIndex.value = -1
      }
      break
      
    case 'Tab':
      if (showDropdown.value && activeIndex.value >= 0 && activeIndex.value < filteredSuggestions.value.length) {
        event.preventDefault()
        addTagFromSuggestion(filteredSuggestions.value[activeIndex.value].value)
      }
      break
  }
}

// 处理建议点击
const handleSuggestionMouseDown = (event, item) => {
  event.preventDefault()
  addTagFromSuggestion(item.value)
}

// 从建议添加标签
const addTagFromSuggestion = (tagValue) => {
  const trimmedValue = tagValue.trim()
  
  if (!trimmedValue) return
  
  if (tags.value.includes(trimmedValue)) {
    ElMessage.warning(`标签 "${trimmedValue}" 已存在`)
    clearInput()
    showDropdown.value = false
    return
  }
  
  if (tags.value.length >= props.max) {
    ElMessage.warning(`最多只能添加 ${props.max} 个标签`)
    return
  }
  
  // 添加标签
  tags.value = [...tags.value, trimmedValue]
  emit('update:modelValue', tags.value)
  emit('tag-add', trimmedValue)
  
  // 清空输入和下拉
  clearInput()
  showDropdown.value = false
  suggestions.value = []
  activeIndex.value = -1
}

// 添加当前输入作为标签
const addCurrentInputAsTag = (inputValue) => {
  const trimmedValue = inputValue.trim()
  if (!trimmedValue) return
  
  if (tags.value.includes(trimmedValue)) {
    ElMessage.warning(`标签 "${trimmedValue}" 已存在`)
    clearInput()
    showDropdown.value = false
    return
  }
  
  if (tags.value.length >= props.max) {
    ElMessage.warning(`最多只能添加 ${props.max} 个标签`)
    return
  }
  
  tags.value = [...tags.value, trimmedValue]
  emit('update:modelValue', tags.value)
  emit('tag-add', trimmedValue)
  
  clearInput()
  showDropdown.value = false
  suggestions.value = []
}

// 清空输入框
const clearInput = () => {
  nextTick(() => {
    const inputElement = inputTagRef.value?.$el?.querySelector('input')
    if (inputElement) {
      inputElement.value = ''
      currentInput.value = ''
      emit('input-change', '')
    }
  })
}

// 处理标签移除
const handleTagRemove = (tag, index) => {
  tags.value = tags.value.filter((_, i) => i !== index)
  emit('update:modelValue', tags.value)
  emit('tag-remove', tag, index)
}

// 计算建议框样式
const suggestionsStyle = computed(() => ({
  top: `${inputRect.value.top}px`,
  left: `${inputRect.value.left}px`,
  width: `${inputRect.value.width}px`,
  position: 'absolute'
}))

// 处理文档点击（关闭下拉）
const handleDocumentClick = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    showDropdown.value = false
    suggestions.value = []
    activeIndex.value = -1
  }
}

// 处理中文输入法
const handleCompositionStart = () => {
  isComposing = true
}

const handleCompositionEnd = () => {
  isComposing = false
  // 输入法结束后，触发搜索
  const value = getCurrentInputValue()
  if (value && value.length >= props.minSearchLength) {
    debounceSearch(value)
  }
}

// ==================== 生命周期 ====================

// 监听外部 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  tags.value = [...newVal]
}, { deep: true })

// 设置输入监听
onMounted(() => {
  // 添加文档点击监听
  document.addEventListener('click', handleDocumentClick)
  
  // 监听输入框的 input 事件
  nextTick(() => {
    const inputElement = inputTagRef.value?.$el?.querySelector('input')
    if (inputElement) {
      inputElement.addEventListener('input', handleInputChange)
      inputElement.addEventListener('compositionstart', handleCompositionStart)
      inputElement.addEventListener('compositionend', handleCompositionEnd)
    }
  })
})

// 清理
onUnmounted(() => {
  clearTimeout(debounceTimer)
  document.removeEventListener('click', handleDocumentClick)
  
  const inputElement = inputTagRef.value?.$el?.querySelector('input')
  if (inputElement) {
    inputElement.removeEventListener('input', handleInputChange)
    inputElement.removeEventListener('compositionstart', handleCompositionStart)
    inputElement.removeEventListener('compositionend', handleCompositionEnd)
  }
})

// 暴露方法
defineExpose({
  focus: () => {
    inputTagRef.value?.focus()
  },
  clear: () => {
    tags.value = []
    emit('update:modelValue', [])
    clearInput()
    showDropdown.value = false
    suggestions.value = []
  },
  getTags: () => tags.value,
  setTags: (newTags) => {
    tags.value = [...newTags]
    emit('update:modelValue', [...newTags])
  }
})
</script>

<style scoped>
.smart-input-tag {
  position: relative;
  width: 100%;
}

.suggestions-popover {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 2000;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
}

.suggestion-item {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background-color: #f5f7fa;
}

.suggestion-active {
  background-color: #ecf5ff;
}

.suggestion-item .el-tag {
  margin-left: 8px;
  flex-shrink: 0;
}

.suggestion-loading {
  padding: 12px;
  text-align: center;
  color: #909399;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.suggestion-loading .el-icon {
  font-size: 16px;
}
</style>