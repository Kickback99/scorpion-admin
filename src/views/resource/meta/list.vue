<template>
    <div class="file-meta-container">
        <!-- 搜索区域 -->
        <div class="flex justify-between items-center mb-4">
            <el-form ref="formRef" :model="searchModel" label-width="auto" inline>
                <el-form-item label="文件UUID">
                    <el-input 
                        v-model="searchModel.uuid" 
                        placeholder="请输入文件UUID" 
                        clearable
                        style="width: 200px"
                    />
                </el-form-item>
                
                <el-form-item label="文件类型">
                    <SmartSelector 
                        v-model="searchModel.fileType" 
                        :data="fileTypeOptions" 
                        placeholder="请选择文件类型"
                        style="width: 160px"
                    />
                </el-form-item>
                
                <el-form-item label="业务ID">
                    <el-input 
                        v-model.number="searchModel.targetId" 
                        placeholder="请输入业务主键ID" 
                        clearable
                        style="width: 180px"
                    />
                </el-form-item>
                
                <el-form-item label="删除状态">
                    <SmartSelector 
                        v-model="searchModel.isDeleted" 
                        :data="deleteStatusOptions" 
                        placeholder="请选择删除状态"
                        style="width: 160px"
                    />
                </el-form-item>
                
                <el-form-item>
                    <el-button icon="Search" @click="onSearch" type="primary" plain>搜索</el-button>
                    <el-button icon="Refresh" type="warning" @click="onReset" plain>重置</el-button>
                </el-form-item>
            </el-form>
        </div>

        <!-- 表格区域 -->
        <el-table 
            :data="tableData" 
            style="width: 100%" 
            border
            v-loading="loading"
        >
            <el-table-column prop="id" label="ID" width="80" align="center" />
            
            <el-table-column label="图片" width="200" align="center">
                <template #default="{ row }">
                    <div style="width: 100px; aspect-ratio: 16/9; border-radius: 4px; overflow: hidden; border: 1px solid #ebeef5; margin: 4px auto;">
                        <el-image 
                            :src="row.img"
                            :fit="'cover'"
                            style="width: 100%; height: 100%; cursor: pointer;"
                            :preview-src-list="[row.img]"
                            preview-teleported
                            loading="lazy"
                        />
                    </div>
                </template>
            </el-table-column>
            
            <el-table-column prop="uuid" label="文件UUID" width="200" show-overflow-tooltip />
            
            <el-table-column prop="ossPath" label="OSS路径" min-width="250" show-overflow-tooltip />
            
            <el-table-column prop="fileType" label="文件类型" width="120" align="center">
                <template #default="{ row }">
                    <el-tag :type="getFileTypeTag(row.fileType)" size="small">
                        {{ getFileTypeLabel(row.fileType) }}
                    </el-tag>
                </template>
            </el-table-column>
            
            <el-table-column prop="targetId" label="业务ID" width="120" align="center">
                <template #default="{ row }">
                    <span v-if="row.targetId === 0">-</span>
                    <span v-else>{{ row.targetId }}</span>
                </template>
            </el-table-column>
            
            <el-table-column prop="createTime" label="创建时间" width="200" align="center">
                <template #default="{ row }">
                    {{ row.createTime }}
                </template>
            </el-table-column>
            
            <el-table-column prop="updateTime" label="更新时间" width="200" align="center">
                <template #default="{ row }">
                    {{ row.updateTime }}
                </template>
            </el-table-column>
            
            <el-table-column prop="isDeleted" label="删除状态" width="100" align="center">
                <template #default="{ row }">
                    <el-tag :type="row.isDeleted === 0 ? 'success' : 'danger'" size="small">
                        {{ row.isDeleted === 0 ? '正常' : '已删除' }}
                    </el-tag>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页区域 -->
        <el-pagination
            v-model:current-page="pagination.pageNum"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 30, 50]"
            :small="false"
            :disabled="false"
            :background="true"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="onSizeChange"
            @current-change="onCurrentChange"
            class="mt-4"
        />
    </div>
</template>

<script setup>
import { fileMetaListApi } from '@/api/resfilemeta';
import SmartSelector from '@/views/components/SmartSelector.vue';
import { reactive, ref, nextTick } from 'vue';
import { ElMessage } from 'element-plus';

// ==================== 数据定义 ====================

const tableData = ref([]);
const total = ref(0);
const loading = ref(false);

// 分页参数
const pagination = reactive({
    pageNum: 1,
    pageSize: 10
});

// 搜索模型
const searchModel = reactive({
    uuid: '',
    fileType: '',
    targetId: null,
    isDeleted: null
});

// ==================== 下拉选项配置 ====================

// 文件类型选项
const fileTypeOptions = [
    { label: '全部', value: '' },
    { label: '头像', value: 'avatar' },
    { label: '封面', value: 'cover' },
    { label: '轮播图', value: 'carousel' },
    { label: '内容', value: 'content' }
];

// 删除状态选项
const deleteStatusOptions = [
    { label: '全部（绕过逻辑删除）', value: null },
    { label: '正常', value: 0 },
    { label: '已删除', value: 1 }
];

// ==================== 工具函数 ====================

/**
 * 获取文件类型标签
 */
const getFileTypeLabel = (type) => {
    const map = {
        'avatar': '头像',
        'cover': '封面',
        'carousel': '轮播图',
        'content': '内容'
    };
    return map[type] || type;
};

/**
 * 获取文件类型标签颜色
 */
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

/**
 * 渲染表格数据
 */
const renderFileMeta = async () => {
    loading.value = true;
    try {
        // 过滤空值参数
        const params = {};
        if (searchModel.uuid) params.uuid = searchModel.uuid;
        if (searchModel.fileType) params.fileType = searchModel.fileType;
        if (searchModel.targetId) params.targetId = searchModel.targetId;
        if (searchModel.isDeleted !== null && searchModel.isDeleted !== '') {
            params.isDeleted = searchModel.isDeleted;
        }

        const res = await fileMetaListApi(
            pagination.pageNum, 
            pagination.pageSize, 
            params
        );
        
        if (res.code === 200) {
            tableData.value = res.data.items || [];
            console.log("==================== res ====================",res)
            total.value = res.data.total || 0;
        } else {
            ElMessage.error(res.msg || '查询失败');
        }
    } catch (error) {
        console.error('查询文件元数据失败:', error);
        ElMessage.error('查询失败，请稍后重试');
    } finally {
        loading.value = false;
    }
};

// 初始加载
renderFileMeta();

// ==================== 事件处理 ====================

/**
 * 页码变化
 */
const onCurrentChange = (page) => {
    pagination.pageNum = page;
    renderFileMeta();
};

/**
 * 每页条数变化
 */
const onSizeChange = (size) => {
    pagination.pageNum = 1;
    pagination.pageSize = size;
    renderFileMeta();
};

/**
 * 搜索
 */
const onSearch = () => {
    pagination.pageNum = 1;
    renderFileMeta();
};

/**
 * 重置
 */
const onReset = () => {
    pagination.pageNum = 1;
    Object.assign(searchModel, {
        uuid: '',
        fileType: '',
        targetId: null,
        isDeleted: null
    });
    renderFileMeta();
};
</script>

<style scoped lang="scss">

</style>