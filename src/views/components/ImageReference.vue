<!-- src/views/components/ImageReference.vue -->
<template>
  <div class="image-reference">
    <div class="image-reference-header">
      <span class="image-reference-title">{{ title }}</span>
      <el-button 
        v-if="showClear" 
        size="small" 
        type="danger" 
        link
        @click="handleClear"
      >
        清空
      </el-button>
    </div>

    <el-form label-width="auto">
      <el-form-item :label="searchLabel">
        <SmartAutoComplete
          v-model="selectedArticle"
          :fetch-suggestions-api="fetchArticleForImage"
          :placeholder="searchPlaceholder"
          :max="1"
          :debounce-delay="300"
          :min-search-length="1"
          :multiple-id-mode="true"
          :auto-search-on-enter="true"
          @select-multiple-ids="handleArticleSelect"
          @tag-removed="handleArticleRemoved"
          :style="{ width: searchWidth}"
        />
      </el-form-item>

      <!-- 图片类型选择器 -->
      <el-form-item v-if="selectedArticle.length > 0 && !loading && props.showImageTypeSwitch" label="图片类型">
        <el-radio-group v-model="currentImageType" @change="handleImageTypeChange" size="small">
          <el-radio-button value="all">全部图片</el-radio-button>
          <el-radio-button value="cover">仅封面</el-radio-button>
          <el-radio-button value="content">仅内容图</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- 加载状态 -->
      <el-form-item v-if="loading" label=" ">
        <div class="image-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载图片中...</span>
        </div>
      </el-form-item>

      <!-- 图片列表 -->
      <el-form-item v-else-if="filteredImageList.length > 0" label=" ">
        <!-- 统一容器，通过 layout prop 切换类 -->
        <div 
        class="image-container"
        :class="layout === 'horizontal' ? 'layout-horizontal' : 'layout-vertical'"
        >
        <div 
            v-for="(img, index) in filteredImageList" 
            :key="img.id || index"
            class="image-item"
            :class="{ 
            'image-selected': selectedIndex === index,
            'image-disabled': disabled
            }"
            @click="!disabled && selectImage(index)"
            @dblclick="!disabled && handleInsert(img)"
        >
            <el-image 
            :src="img.img || img.url" 
            :fit="'cover'"
            loading="lazy"
            >
            <template #error>
                <div class="image-placeholder">
                <el-icon><Picture /></el-icon>
                <span>加载失败</span>
                </div>
            </template>
            </el-image>
            
            <div class="image-info">
            <span class="image-id">
              {{ displayField === 'uuid' ? img.uuid : (img.targetId || img.id) }}
            </span>
            <span class="image-type">{{ getTypeLabel(img.fileType) }}</span>
            </div>

            <div v-if="selectedIndex === index" class="image-check">
            <el-icon><Check /></el-icon>
            </div>

            <el-button 
            v-if="!disabled"
            class="image-insert-btn"
            size="small" 
            type="primary"
            @click.stop="handleInsert(img)"
            >
            <el-icon><Plus /></el-icon> 插入
            </el-button>
        </div>
        </div>
      </el-form-item>

      <!-- 空状态 -->
      <el-form-item v-else-if="selectedArticle.length > 0" label=" ">
        <el-empty 
          :description="emptyText" 
          :image-size="60" 
        />
      </el-form-item>

      <!-- 提示信息 -->
      <el-form-item v-if="showHint && selectedArticle.length === 0" label=" ">
        <div class="image-hint">
          <el-icon><InfoFilled /></el-icon>
          <span>{{ hintText }}</span>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Check, Plus, Loading, Picture, InfoFilled } from '@element-plus/icons-vue';
import SmartAutoComplete from '@/views/components/SmartAutoComplete.vue';
import PinyinMatch from 'pinyin-match';

// ==================== Props ====================

const props = defineProps({
  // 布局模式：'vertical'（竖排网格） | 'horizontal'（横排滚动）
  layout: {
    type: String,
    default: 'vertical',
    validator: (val) => ['vertical', 'horizontal'].includes(val)
  },
  // 标题
  title: {
    type: String,
    default: '引用图片'
  },
  // 搜索框标签
  searchLabel: {
    type: String,
    default: '搜索文章'
  },
  // 搜索框占位符
  searchPlaceholder: {
    type: String,
    default: '请输入文章标题搜索已上传的图片'
  },
  // 搜索框宽度
  searchWidth: {
    type: String,
    default: '400px'
  },
  // 空状态文案
  emptyText: {
    type: String,
    default: '该文章暂无可用图片'
  },
  // 提示文案
  hintText: {
    type: String,
    default: '请搜索并选择一篇文章，将显示该文章关联的图片'
  },
  // 是否显示提示
  showHint: {
    type: Boolean,
    default: true
  },
  // 是否显示清空按钮
  showClear: {
    type: Boolean,
    default: true
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 预选的文章ID（用于回显）
  articleId: {
    type: Number,
    default: null
  },
  // 自定义获取文章列表的 API
  fetchArticlesApi: {
    type: Function,
    default: null
  },
  // 自定义获取图片列表的 API
  fetchImagesApi: {
    type: Function,
    default: null
  },
  // 图片类型：'all' | 'cover' | 'content'
  imageType: {
    type: String,
    default: 'all',
    validator: (val) => ['all', 'cover', 'content'].includes(val)
  },
  // 是否显示图片类型切换器
  showImageTypeSwitch: {
    type: Boolean,
    default: true
  },
   // 图片信息显示字段：'id' | 'uuid'
  displayField: {
    type: String,
    default: 'id',
    validator: (val) => ['id', 'uuid'].includes(val)
  },
  // 文章标题，用于编辑回显
  articleTitle: {
    type: String,
    default: ''
  }
});

// ==================== Emits ====================

const emit = defineEmits([
  'select-article',   // 选择文章时触发
  'remove-article',   // 移除文章时触发
  'select-image',     // 选择图片时触发
  'insert-image',     // 插入图片时触发
  'clear',            // 清空时触发
  'image-type-change'  // 图片类型切换事件
]);

// ==================== 数据 ====================

const selectedArticle = ref([]);
const imageList = ref([]);
const selectedIndex = ref(-1);
const loading = ref(false);
const articleCache = ref([]);
// 当前选中的图片类型
const currentImageType = ref(props.imageType);

// ==================== 计算属性 ====================

/**
 * 过滤后的图片列表
 */
const filteredImageList = computed(() => {
  if (currentImageType.value === 'all') {
    return imageList.value;
  }
  return imageList.value.filter(img => img.fileType === currentImageType.value);
});

// ==================== 方法 ====================

/**
 * 获取文件类型标签
 */
const getTypeLabel = (type) => {
  const map = {
    'cover': '封面',
    'content': '内容图',
    'carousel': '轮播图',
    'avatar': '头像'
  };
  return map[type] || type || '未知';
};

/**
 * 加载文章关联的图片
 */
const loadImages = async (articleId) => {
  if (!articleId) {
    imageList.value = [];
    return;
  }

  loading.value = true;
  try {
    if (props.fetchImagesApi) {
      const result = await props.fetchImagesApi(articleId);
      imageList.value = Array.isArray(result) ? result : [];
    } else {
      const { fileMetaListApi } = await import('@/api/resfilemeta');
      const res = await fileMetaListApi(1, 100, {
        targetIds: articleId,
        fileType: ''
      });
      if (res.code === 200) {
        // 根据 imageType 过滤
        const allowedTypes = currentImageType.value === 'all' 
          ? ['cover', 'content'] 
          : [currentImageType.value];
        imageList.value = (res.data.items || []).filter(item => 
          allowedTypes.includes(item.fileType) && item.img
        );
      } else {
        imageList.value = [];
      }
    }
    console.log('加载文章图片:', imageList.value.length, '张');
  } catch (error) {
    console.error('加载文章图片失败:', error);
    imageList.value = [];
    ElMessage.warning('加载图片失败，请重试');
  } finally {
    loading.value = false;
  }
};

/**
 * 处理图片类型切换
 */
const handleImageTypeChange = (val) => {
  // 重新加载图片
  if (selectedArticle.value.length > 0) {
    const articleId = props.articleId || getCurrentArticleId();
    if (articleId) {
      loadImages(articleId);
    }
  }
  // 重置选中状态
  selectedIndex.value = -1;
  emit('image-type-change', val);
};

/**
 * 获取当前选中的文章ID
 */
const getCurrentArticleId = () => {
  if (selectedArticle.value.length === 0) return null;
  const title = selectedArticle.value[0];
  const found = articleCache.value.find(item => item.value === title);
  return found ? found.id : null;
};

/**
 * 搜索文章
 */
const fetchArticleForImage = async (params) => {
  const query = params.keyword || '';

  try {
    let data = [];
    
    if (props.fetchArticlesApi) {
      const result = await props.fetchArticlesApi(query);
      data = result.map(item => ({
        value: item.title || item.value,
        id: item.id
      }));
    } else {
      const { getArticleBusinessDataApi } = await import('@/api/business');
      const res = await getArticleBusinessDataApi();
      if (res.code === 200) {
        data = (res.data || []).map(item => ({
          value: item.title,
          id: item.id
        }));
      }
    }

    articleCache.value = data;

    if (!query) {
      return data;
    }

    const lowerQuery = query.toLowerCase();
    return data.filter(item => {
      const text = item.value;
      const lowerText = text.toLowerCase();

      if (lowerText.includes(lowerQuery)) return true;
      if (PinyinMatch.match(text, query)) return true;

      const words = lowerText.split(/[\s\-_]+/);
      for (const word of words) {
        if (word.startsWith(lowerQuery)) return true;
      }

      if (words.length > 1) {
        const initials = words.map(w => w[0]).join('');
        if (initials.includes(lowerQuery)) return true;
      }

      return false;
    });
  } catch (error) {
    console.error('搜索文章失败:', error);
    return [];
  }
};

/**
 * 处理文章选择
 */
const handleArticleSelect = (data) => {
  console.log('选中的文章:', data.title, 'ID:', data.ids);
  
  if (data.ids && data.ids.length > 0) {
    const articleId = data.ids[0];
    loadImages(articleId);
    emit('select-article', { id: articleId, title: data.title });
  } else {
    imageList.value = [];
    emit('select-article', null);
  }
};

/**
 * 处理文章移除
 */
const handleArticleRemoved = () => {
  imageList.value = [];
  selectedIndex.value = -1;
  // 重置图片类型
  currentImageType.value = props.imageType;
  emit('remove-article');
};

/**
 * 选择图片
 */
const selectImage = (index) => {
  if (props.disabled) return;
  selectedIndex.value = index;
  const img = filteredImageList.value[index];
  emit('select-image', { ...img, index });
};

/**
 * 插入图片
 */
const handleInsert = (img) => {
  if (props.disabled) return;
  
  if (!img || !(img.img || img.url)) {
    ElMessage.warning('图片地址无效');
    return;
  }

  const imageUrl = img.img || img.url;
  const title = img.title || img.fileType || '图片';
  
  emit('insert-image', {
    ...img,
    url: imageUrl,
    markdown: `![${title}](${imageUrl})`
  });
};

/**
 * 清空
 */
const handleClear = () => {
  selectedArticle.value = [];
  imageList.value = [];
  selectedIndex.value = -1;
  // 重置图片类型
  currentImageType.value = props.imageType;
  emit('clear');
};

/**
 * 重置选中状态
 */
const resetSelection = () => {
  selectedIndex.value = -1;
};

/**
 * 手动加载指定文章的图片
 */
const loadByArticleId = async (id) => {
  if (id) {
    // 注意：编辑文章回显的时候，这里的 found 可能为空
    const found = articleCache.value.find(item => item.id === id);
    if (found) {
      selectedArticle.value = [props.articleTitle || found.value ];
    } else {
      selectedArticle.value = [props.articleTitle || `ID: ${id}`];
    }
    await loadImages(id);
  }
};

// ==================== Watch ====================

// 监听外部传入的 articleId
watch(() => props.articleId, (newVal) => {
  if (newVal) {
    loadByArticleId(newVal);
  }
}, { immediate: true });

// ==================== 暴露方法 ====================

defineExpose({
  loadImages,
  loadByArticleId,
  resetSelection,
  clear: handleClear,
  getSelectedArticle: () => selectedArticle.value,
  getImageList: () => imageList.value,
  getFilteredImageList: () => filteredImageList.value,
  getSelectedImage: () => filteredImageList.value[selectedIndex.value] || null,
  //  切换图片类型
  setImageType: (type) => {
    if (['all', 'cover', 'content'].includes(type)) {
      currentImageType.value = type;
      if (selectedArticle.value.length > 0) {
        const articleId = getCurrentArticleId();
        if (articleId) {
          loadImages(articleId);
        }
      }
    }
  },
  getImageType: () => currentImageType.value
});

// 在子组件中
/* onMounted(() => {
  // 模拟加载多张图片测试横排滚动
  imageList.value = [
    { id: 1, img: 'https://picsum.photos/220/124?random=1', fileType: 'content' },
    { id: 2, img: 'https://picsum.photos/220/124?random=2', fileType: 'cover' },
    { id: 3, img: 'https://picsum.photos/220/124?random=3', fileType: 'content' },
    { id: 4, img: 'https://picsum.photos/220/124?random=4', fileType: 'content' },
    { id: 5, img: 'https://picsum.photos/220/124?random=5', fileType: 'cover' },
    { id: 6, img: 'https://picsum.photos/220/124?random=6', fileType: 'content' },
    { id: 6, img: 'https://picsum.photos/220/124?random=6', fileType: 'content' },
    { id: 6, img: 'https://picsum.photos/220/124?random=6', fileType: 'content' },
    { id: 6, img: 'https://picsum.photos/220/124?random=6', fileType: 'content' },
    { id: 6, img: 'https://picsum.photos/220/124?random=6', fileType: 'content' },
    { id: 6, img: 'https://picsum.photos/220/124?random=6', fileType: 'content' },
  ];
  // 模拟选中文章
  selectedArticle.value = ['测试文章'];
}); */

</script>

<style scoped lang="scss">
.image-reference {
  padding: 12px 0;

  .image-reference-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .image-reference-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
  }

  .image-loading {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--el-text-color-secondary);
    font-size: 13px;

    .el-icon {
      font-size: 18px;
    }
  }

  .image-hint {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--el-text-color-secondary);
    font-size: 13px;

    .el-icon {
      font-size: 16px;
      color: var(--el-color-info);
    }
  }

  // ========================================
  // 统一图片容器（横排/竖排共用）
  // ========================================
  .image-container {
    display: flex;
    gap: 12px;
    padding: 4px;
    max-height: 380px;

    // 竖排模式：flex-direction: column，从上到下排列
    &.layout-vertical {
      flex-direction: column;
      overflow-x: visible;
      overflow-y: auto;
      align-items: stretch;
      flex-shrink: 0;          // 防止被父级压缩

      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-track {
        background: var(--el-fill-color);
        border-radius: 2px;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--el-border-color);
        border-radius: 2px;
      }

      .image-item {
        flex: 0 0 160px;
        aspect-ratio: 16 / 9;
        width: 100%;
        max-width: 280px;
      }
    }

    // 横排模式：flex-direction: row，从左到右滚动
    &.layout-horizontal {
      flex-direction: row;
      flex-wrap: nowrap;
      overflow-x: auto;
      overflow-y: hidden;
      display: flex;
      padding: 20px;
      flex-shrink: 0;          // 🔶 防止被父级压缩
      width: 100%;             // 🔶 占满父级宽度
  
  // 覆盖父级可能的样式干扰
  align-items: stretch;    // 🔶 覆盖父级 align-items: center

      &::-webkit-scrollbar {
        height: 5px;
      }

      &::-webkit-scrollbar-track {
        background: var(--el-fill-color);
        border-radius: 2px;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--el-border-color);
        border-radius: 2px;
      }

      .image-item {
        flex: 0 0 220px;
        aspect-ratio: 16 / 9;
      }
    }


    // ========================================
    // 图片卡片（横排/竖排共用）
    // ========================================
    .image-item {
      position: relative;
      border-radius: 8px;
      border: 2px solid var(--el-border-color-lighter);
      overflow: hidden;
      cursor: pointer;
      transition: all 0.25s ease;
      background: var(--el-bg-color);

      &:hover:not(.image-disabled) {
        border-color: var(--el-color-primary-light-5);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }

      &.image-selected {
        border-color: var(--el-color-primary);
        box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
      }

      &.image-disabled {
        cursor: not-allowed;
        opacity: 0.7;
      }

      // 图片
      .el-image {
        width: 100%;
        height: 100%;
        border-radius: 4px;
      }

      // 图片信息（底部遮罩）
      .image-info {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 8px;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
        color: #fff;
        font-size: 11px;

        .image-id {
          opacity: 0.85;
          font-size: 10px;
        }

        .image-type {
          background: rgba(255, 255, 255, 0.2);
          padding: 0 6px;
          border-radius: 3px;
          font-size: 10px;
        }
      }

      // 选中对勾
      .image-check {
        position: absolute;
        top: 6px;
        right: 6px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: var(--el-color-primary);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      }

      // 插入按钮（hover 显示）
      .image-insert-btn {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 0;
        transition: all 0.25s ease;

        .el-icon {
          margin-right: 2px;
          font-size: 12px;
        }
      }

      &:hover:not(.image-disabled) .image-insert-btn {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }
  }

  // 图片占位（加载失败）
  .image-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    width: 100%;
    height: 100%;
    background: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
    font-size: 12px;

    .el-icon {
      font-size: 24px;
      opacity: 0.5;
    }
  }

  // 空状态
  :deep(.el-empty) {
    padding: 20px 0;
  }

}
</style>
