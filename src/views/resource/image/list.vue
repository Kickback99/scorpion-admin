<template>
  <div class="image-management">
    <!-- 头部：标题 + 搜索 -->
    <div class="management-header">
      <div class="search-area">
        <SmartAutoComplete
          v-model="selectedSearch"
          :fetch-suggestions-api="fetchBusinessData"
          placeholder="搜索文章/用户/轮播标题"
          :max="1"
          :debounce-delay="300"
          :min-search-length="1"
          :multiple-id-mode="true"
          :auto-search-on-enter="true"
          @select-multiple-ids="handleSearchSelect"
          @tag-removed="handleSearchRemoved"
          style="width: 320px"
        />
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-toolbar">
      <!-- 图片类型切换 -->
      <el-radio-group v-model="currentImageType" @change="handleTypeChange" size="small">
        <el-radio-button value="all">全部图片</el-radio-button>
        <el-radio-button value="cover">封面</el-radio-button>
        <el-radio-button value="content">内容图</el-radio-button>
        <el-radio-button value="carousel">轮播</el-radio-button>
        <el-radio-button value="avatar">头像</el-radio-button>
      </el-radio-group>

      <!-- 原始上传筛选 -->
      <el-checkbox v-model="filterOriginal" @change="handleFilterChange" size="small">
        仅原始上传
      </el-checkbox>

      <!-- 显示字段切换 -->
      <el-radio-group v-model="displayField" size="small" style="margin-left: 16px;">
        <el-radio-button value="id">ID</el-radio-button>
        <el-radio-button value="uuid">UUID</el-radio-button>
        <el-radio-button value="title">标题</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 图片列表 -->
    <div class="image-grid" v-loading="loading">
      <div
        v-for="img in imageList"
        :key="img.id"
        class="image-card"
        @mouseenter="hoveredId = img.id"
        @mouseleave="hoveredId = null"
      >
        <el-image
          :src="img.img"
          :fit="'cover'"
          class="image-preview"
          loading="lazy"
        >
          <template #error>
            <div class="image-placeholder">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-image>

        <!-- 悬浮操作 -->
        <div v-show="hoveredId === img.id" class="image-actions">
          <el-button size="small" type="primary" plain @click="handleCopy(img)">
            <el-icon><CopyDocument /></el-icon> 复制
          </el-button>
        </div>

        <!-- 图片信息 -->
        <div class="image-footer">
          <span class="image-info-text">
            {{ displayField === 'id' ? `ID: ${img.id}` : '' }}
            {{ displayField === 'uuid' ? `UUID: ${img.uuid}` : '' }}
            {{ displayField === 'title' ? `标题: ${img.title || '-'}` : '' }}
          </span>
          <el-tag :type="getFileTypeTag(img.fileType)" size="small">
            {{ getFileTypeLabel(img.fileType) }}
            <span v-if="img.isOriginal === 1" class="original-badge">原</span>
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty v-if="!loading && imageList.length === 0" description="暂无图片" :image-size="80" />

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[12, 24, 48, 96]"
        layout="total, sizes, prev, pager, next"
        background
        small
        @current-change="onPageChange"
        @size-change="onSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Picture, CopyDocument } from '@element-plus/icons-vue';
import { fileMetaListApi, getAllBusinessDataApi } from '@/api/resfilemeta';
import SmartAutoComplete from '@/views/components/SmartAutoComplete.vue';
import PinyinMatch from 'pinyin-match';

// ==================== 常量配置 ====================

// 显示字段常量：'id' | 'uuid' | 'title'
const DISPLAY_FIELD = 'id';

// 复制内容格式：'uuid' | 'markdown'
const COPY_FORMAT = 'markdown';

// 是否默认勾选"仅原始上传"
const DEFAULT_ORIGINAL_FILTER = false;

// ==================== 数据 ====================

const loading = ref(false);
const imageList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(24);
const hoveredId = ref(null);

// 筛选条件
const currentImageType = ref('all');
const filterOriginal = ref(DEFAULT_ORIGINAL_FILTER);
const displayField = ref(DISPLAY_FIELD);
const selectedSearch = ref([]);
const searchIds = ref('');

// 缓存业务数据
const businessDataCache = ref([]);

// ==================== 工具函数 ====================

const getFileTypeLabel = (type) => {
  const map = {
    'avatar': '头像',
    'cover': '封面',
    'carousel': '轮播图',
    'content': '内容'
  };
  return map[type] || type;
};

const getFileTypeTag = (type) => {
  const map = {
    'avatar': 'primary',
    'cover': 'success',
    'carousel': 'warning',
    'content': 'info'
  };
  return map[type] || '';
};

// ==================== 数据请求 ====================

const fetchImages = async () => {
  loading.value = true;
  try {
    const params = {};
    
    // 类型筛选
    if (currentImageType.value !== 'all') {
      params.fileType = currentImageType.value;
    }
    
    // 原始上传筛选
    if (filterOriginal.value) {
      params.isOriginal = 1;
    }
    
    // 业务ID筛选
    if (searchIds.value) {
      params.targetIds = searchIds.value;
    }

    const res = await fileMetaListApi(currentPage.value, pageSize.value, params);
    if (res.code === 200) {
      imageList.value = res.data.items || [];
      total.value = res.data.total || 0;
    } else {
      ElMessage.error(res.msg || '查询失败');
    }
  } catch (error) {
    console.error('加载图片失败:', error);
    ElMessage.error('加载失败，请重试');
  } finally {
    loading.value = false;
  }
};

// ==================== 联想搜索 ====================

const loadBusinessData = async () => {
  try {
    const res = await getAllBusinessDataApi();
    if (res.code === 200) {
      businessDataCache.value = (res.data || []).map(item => ({
        value: item.title,
        id: item.id
      }));
    }
  } catch (error) {
    console.error('加载业务数据失败:', error);
  }
};

const fetchBusinessData = async (params) => {
  const query = params.keyword || '';
  
  if (businessDataCache.value.length === 0) {
    await loadBusinessData();
  }
  
  if (!query) {
    return businessDataCache.value;
  }
  
  const lowerQuery = query.toLowerCase();
  return businessDataCache.value.filter(item => {
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
};

const handleSearchSelect = (data) => {
  if (data.ids && data.ids.length > 0) {
    // 多ID模式：强制切换到 all
    if (data.ids.length > 1) {
      currentImageType.value = 'all';
    }
    searchIds.value = data.ids.join(',');
    currentPage.value = 1;
    fetchImages();
  }
};

const handleSearchRemoved = () => {
  searchIds.value = '';
  currentPage.value = 1;
  fetchImages();
};

// ==================== 事件处理 ====================

const handleTypeChange = () => {
  currentPage.value = 1;
  fetchImages();
};

const handleFilterChange = () => {
  currentPage.value = 1;
  fetchImages();
};

const onPageChange = (page) => {
  currentPage.value = page;
  fetchImages();
};

const onSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchImages();
};

// ==================== 复制功能 ====================

const handleCopy = async (img) => {
  let copyText = '';
  
  if (COPY_FORMAT === 'uuid') {
    copyText = img.uuid;
  } else {
    // markdown 格式
    const title = img.title || img.fileType || '图片';
    copyText = `![${title}](${img.img})`;
  }
  
  try {
    await navigator.clipboard.writeText(copyText);
    ElMessage.success('已复制到剪贴板');
  } catch (err) {
    // 降级方案
    const textarea = document.createElement('textarea');
    textarea.value = copyText;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    ElMessage.success('已复制到剪贴板');
  }
};

// ==================== 生命周期 ====================

onMounted(() => {
  loadBusinessData();
  fetchImages();
});
</script>

<style scoped lang="scss">
.image-management {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;

  h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.filter-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  flex-shrink: 0;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.image-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  align-content: start;
  overflow-y: auto;
  padding: 4px 0;
  min-height: 200px;

  // 滚动条
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
}

.image-card {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border-color: var(--el-color-primary);
  }
}

.image-preview {
  width: 100%;
  height: 100%;
  display: block;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 32px;
}

.image-actions {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.6);
  padding: 8px 16px;
  border-radius: 6px;
  backdrop-filter: blur(4px);

  .el-button {
    border: none;
    background: rgba(255, 255, 255, 0.15);
    color: #fff;

    &:hover {
      background: rgba(255, 255, 255, 0.25);
    }
  }
}

.image-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  gap: 8px;

  .image-info-text {
    font-size: 11px;
    color: #fff;
    opacity: 0.9;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  .el-tag {
    flex-shrink: 0;
    font-size: 10px;
    height: 20px;
    line-height: 18px;
    padding: 0 6px;

    .original-badge {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
      padding: 0 3px;
      margin-left: 2px;
      font-size: 9px;
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 8px 0 0;
  flex-shrink: 0;
  border-top: 1px solid var(--el-border-color-lighter);
}

:deep(.el-radio-group) {
  .el-radio-button__inner {
    padding: 6px 14px;
    font-size: 12px;
  }
}

:deep(.el-checkbox) {
  .el-checkbox__label {
    font-size: 12px;
  }
}
</style>