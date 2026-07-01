<!-- src/components/SmartAutoComplete.vue -->
<template>
  <div class="smart-input-tag" ref="containerRef">
    <!-- el-input-tag 基础组件 -->
    <el-input-tag
      ref="inputTagRef"
      v-model="modelValue"
      :placeholder="placeholder"
      :max="max"
      :disabled="disabled"
      :size="size"
      :readonly="readonly"
      :clearable="clearable"
      :trigger="null"
      tag-type="primary"
      @remove-tag="handleTagRemove"
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
        :class="{ 
          'suggestion-active': activeIndex === index,
          'suggestion-hover': hoverIndex === index && activeIndex !== index
        }"
        @mousedown="handleSuggestionMouseDown($event, item)"
        @mouseenter="handleMouseEnter(index)"
        @mouseleave="hoverIndex = -1"
      >
        <span v-html="highlightMatch(item.value)"></span>
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import PinyinMatch from 'pinyin-match'

// ==================== 双向绑定 ====================
const modelValue = defineModel({
  type: Array,
  default: () => []
})

// ==================== Props ====================
const props = defineProps({
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
  },
  // 自定义分隔符（通过 Props 传递）
  separators: {
    type: RegExp,
    default: /[\s\-_\.\/]+/
  },
  // 是否允许自定义输入（不在联想列表中的值）
  allowCustom: {
    type: Boolean,
    default: true
  },
  // 自定义输入被禁止时的提示消息
  customDisabledMessage: {
    type: String,
    default: '请输入已存在的选项'
  }
})

// ==================== Refs ====================
const containerRef = ref(null)
const inputTagRef = ref(null)
const suggestionsRef = ref(null)
const currentInput = ref('')
const showDropdown = ref(false)
const activeIndex = ref(-1)
const loading = ref(false)
const inputRect = ref({})
let debounceTimer = null
let isComposing = false

// 建议数据（存储所有标签）
const suggestions = ref([])

const hoverIndex = ref(-1)
const isKeyboardMode = ref(false)
const keyboardTimer = ref(null)

// 过滤后的建议（排除已选择的 + 拼音匹配）
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
  return modelValue.value.includes(value)
}

// 高亮匹配
const highlightMatch = (text) => {
  const query = currentInput.value

  // 🔥 调试日志
  console.log('highlightMatch 调用:', { query, text, queryLength: query?.length })

  if (!query || !query.trim() || !text) return text
  
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  
  // 1. 英文直接匹配（优先）
  const index = lowerText.indexOf(lowerQuery)
  if (index !== -1) {
    const before = text.substring(0, index)
    const match = text.substring(index, index + query.length)
    const after = text.substring(index + query.length)
    return `${before}<strong>${match}</strong>${after}`
  }
  
  // 2. PinyinMatch（中文拼音）
  const pinyinResult = PinyinMatch.match(text, query)
  if (pinyinResult) {
    const indices = Array.isArray(pinyinResult) ? pinyinResult : [pinyinResult]
    const uniqueIndices = [...new Set(indices)]
    
    let isContinuous = true
    for (let i = 1; i < uniqueIndices.length; i++) {
      if (uniqueIndices[i] !== uniqueIndices[i - 1] + 1) {
        isContinuous = false
        break
      }
    }
    
    const highlightIndices = isContinuous ? uniqueIndices : [uniqueIndices[0]]
    
    let html = ''
    let lastIndex = 0
    for (let i = 0; i < highlightIndices.length; i++) {
      const index = highlightIndices[i]
      if (index > lastIndex) {
        html += text.substring(lastIndex, index)
      }
      html += `<strong>${text[index]}</strong>`
      lastIndex = index + 1
    }
    if (lastIndex < text.length) {
      html += text.substring(lastIndex)
    }
    return html
  }
  
  // 3. 复合词首字母匹配（使用 props.separators）
  const words = text.split(props.separators)
  if (words.length > 1) {
    const initials = words.map(word => word[0]).join('')
    if (initials.toLowerCase().includes(lowerQuery)) {
      let html = ''
      let currentPos = 0
      const queryChars = lowerQuery.split('')
      let queryIndex = 0
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i]
        if (i > 0) {
          const sepMatch = text.substring(currentPos).match(props.separators)
          if (sepMatch) {
            const separator = sepMatch[0]
            html += separator
            currentPos += separator.length
          }
        }
        
        if (queryIndex < queryChars.length && word[0].toLowerCase() === queryChars[queryIndex]) {
          html += `<strong>${word[0]}</strong>`
          html += word.substring(1)
          queryIndex++
        } else {
          html += word
        }
        currentPos += word.length
      }
      return html
    }
  }
  
  // 4. 单词内字符匹配（使用 props.separators）
  if (lowerQuery.length > 1) {
    let html = ''
    let lastIndex = 0
    let queryIndex = 0
    
    for (let i = 0; i < text.length && queryIndex < lowerQuery.length; i++) {
      if (text[i].toLowerCase() === lowerQuery[queryIndex]) {
        if (i > lastIndex) {
          html += text.substring(lastIndex, i)
        }
        html += `<strong>${text[i]}</strong>`
        lastIndex = i + 1
        queryIndex++
      }
    }
    
    if (queryIndex === lowerQuery.length) {
      if (lastIndex < text.length) {
        html += text.substring(lastIndex)
      }
      return html
    }
  }
  
  return text
}


// 更新输入框值
const updateCurrentInput = () => {
  const inputValue = getCurrentInputValue()
  currentInput.value = inputValue
  // emit('input-change', inputValue)
  
  // 🔥 如果输入框为空，立即清空所有状态
  if (!inputValue || inputValue.length === 0) {
    showDropdown.value = false
    suggestions.value = []
    activeIndex.value = -1
    clearTimeout(debounceTimer)
    return
  }
  
  // 如果输入内容长度达到最小搜索长度，触发搜索
  if (inputValue.length >= props.minSearchLength) {
    debounceSearch(inputValue)
  } else {
    // 输入太短，隐藏下拉
    showDropdown.value = false
    suggestions.value = []
    activeIndex.value = -1
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
    // 调用父组件的搜索函数（内部使用 pinyin-match）
    const result = await props.fetchSuggestionsApi({ keyword: query })
    
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
         // 没有内容或只有空白，清空输入框
        immediateClearInput()
        // 没有输入内容，关闭下拉
        showDropdown.value = false
      }
    }
  }, 200)
}

// 滚动到高亮项（平滑滚动）
const scrollToHighlighted = (index) => {
  requestAnimationFrame(() => {
    nextTick(() => {
      if (!suggestionsRef.value) return
      
      const items = suggestionsRef.value.querySelectorAll('.suggestion-item')
      if (!items.length || index < 0 || index >= items.length) return
      
      const targetItem = items[index]
      
      // 瞬间滚动到可视区域，无动画
      targetItem.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      })
    })
  })
}

const handleMouseEnter = (index) => {
  if (isKeyboardMode.value) return
  activeIndex.value = index
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
        isKeyboardMode.value = true
        hoverIndex.value = -1  // 排它(排除鼠标经过高亮)
        // 更新索引
        const newIndex = Math.min(activeIndex.value + 1, filteredSuggestions.value.length - 1)
        activeIndex.value = newIndex
        // 滚动到高亮项
        nextTick(()=>{
          scrollToHighlighted(newIndex)
        })
        // 滚动结束后退出键盘模式（比滚动延迟稍长）
        clearTimeout(keyboardTimer.value)
        keyboardTimer.value = setTimeout(() => {
          isKeyboardMode.value = false
        }, 200)
      }
      break
      
    case 'ArrowUp':
      if (showDropdown.value) {
        event.preventDefault()
        isKeyboardMode.value = true
        hoverIndex.value = -1  // 排它(排除鼠标经过高亮)
        event.preventDefault()
        // 更新索引
        const newIndex = Math.max(activeIndex.value - 1, 0)
        activeIndex.value = newIndex
        // 滚动到高亮项
        nextTick(()=>{
          scrollToHighlighted(newIndex)
        })
        // 滚动结束后退出键盘模式（比滚动延迟稍长）
        clearTimeout(keyboardTimer.value)
        keyboardTimer.value = setTimeout(() => {
          isKeyboardMode.value = false
        }, 200)
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
  
  if (modelValue.value.includes(trimmedValue)) {
    ElMessage.warning(`标签 "${trimmedValue}" 已存在`)
    clearInput()
    showDropdown.value = false
    return
  }
  
  if (modelValue.value.length >= props.max) {
    ElMessage.warning(`最多只能添加 ${props.max} 个标签`)
    return
  }
  
  // 添加标签
  modelValue.value = [...modelValue.value, trimmedValue]
  
  // 清空输入和下拉
  immediateClearInput()
  showDropdown.value = false
  suggestions.value = []
  activeIndex.value = -1
}

// 添加当前输入作为标签
const addCurrentInputAsTag = (inputValue) => {
  const trimmedValue = inputValue.trim()
  if (!trimmedValue) return

   // 检查是否允许自定义输入
  if (!props.allowCustom) {
    // 检查输入的值是否在联想列表中
    const existsInSuggestions = suggestions.value.some(item => item.value === trimmedValue)
    if (!existsInSuggestions) {
      ElMessage.warning(props.customDisabledMessage)
      clearInput()
      showDropdown.value = false
      return
    }
  }

  
  if (modelValue.value.includes(trimmedValue)) {
    ElMessage.warning(`标签 "${trimmedValue}" 已存在`)
    clearInput()
    showDropdown.value = false
    return
  }
  
  if (modelValue.value.length >= props.max) {
    ElMessage.warning(`最多只能添加 ${props.max} 个标签`)
    return
  }
  
  modelValue.value = [...modelValue.value, trimmedValue]
  
  immediateClearInput()
  showDropdown.value = false
  suggestions.value = []
}

const immediateClearInput = () => {
  const inputElement = inputTagRef.value?.$el?.querySelector('input')
  if (inputElement) {
    inputElement.value = ''
    // 触发 input 事件，让组件知道值已改变
    const inputEvent = new Event('input', { bubbles: true, cancelable: true })
    inputElement.dispatchEvent(inputEvent)
    currentInput.value = ''
    // emit('input-change', '')
  }
}

// 清空输入框
const clearInput = () => {
  nextTick(() => {
    immediateClearInput()
  })
}

// 处理标签移除
const handleTagRemove = (tag, index) => {
  console.log("处理标签移除事件",tag)
  // modelValue.value = modelValue.value.filter((_, i) => i !== index)
  modelValue.value = modelValue.value.filter(item => item !== tag)
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
    modelValue.value = []
    clearInput()
    showDropdown.value = false
    suggestions.value = []
  },
  /* getTags: () => modelValue.value,
  setTags: (newTags) => {
    modelValue.value = [...newTags]
  } */
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
  /* 适配深浅主题 */
  background: var(--el-bg-color);
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
  /* 适配深浅主题 */
  color: var(--el-text-color-regular);
  font-size: var(--el-font-size-base);
}

/* 鼠标经过高亮适配深浅主题 */
.suggestion-hover {
  background-color: var(--el-fill-color-light);
}

/* 键盘事件高亮适配深浅主题 */
.suggestion-active {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-text-color-primary);
}

/* 鼠标和键盘高亮适配深浅主题 */
.suggestion-active.suggestion-hover {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-text-color-primary);
}

.suggestion-item .el-tag {
  margin-left: 8px;
  flex-shrink: 0;
}

/* 高亮样式 */
.suggestion-item :deep(strong) {
  color: var(--el-color-primary);
  font-weight: bold;
}

.suggestion-loading {
  padding: 12px;
  text-align: center;
  /* 适配深浅主题 */
  color: var(--el-text-color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.suggestion-loading .el-icon {
  font-size: 16px;
}

/* 滚动条样式 - 适配深浅主题 */
.suggestions-popover::-webkit-scrollbar {
  width: 4px;
}

.suggestions-popover::-webkit-scrollbar-track {
  background: var(--el-fill-color);
  border-radius: 3px;
}

.suggestions-popover::-webkit-scrollbar-thumb {
  background: var(--el-border-color);
  border-radius: 3px;
}

.suggestions-popover::-webkit-scrollbar-thumb:hover {
  background: var(--el-border-color-hover);
}
</style>