<template>
  <div class="config-management" :class="colorStore.isDark ? 'dark-mode' : 'light-mode'">
    <div class="header-actions">
      <el-button type="primary" @click="handleAddRoot">
        <el-icon><Plus /></el-icon>
        新增配置
      </el-button>
      <el-button @click="handleReset">
        <el-icon><RefreshRight /></el-icon>
        重置
      </el-button>
    </div>

    <el-table
      :data="tableData"
      row-key="id"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      border
      stripe
      class="config-table"
    >
      <el-table-column prop="key" label="配置项" min-width="250">
        <template #default="{ row }">
          <span class="config-key">
            <el-icon v-if="row.isObject" class="object-icon"><Folder /></el-icon>
            <el-icon v-else class="field-icon"><Document /></el-icon>
            {{ row.displayKey }}
          </span>
        </template>
      </el-table-column>

      <el-table-column prop="value" label="值" min-width="200">
        <template #default="{ row }">
          <template v-if="row.isEditing">
            <!-- 编辑模式 -->
            <el-input
              v-if="row.type === 'string'"
              v-model="row.editValue"
              size="small"
              style="width: 100%"
            />
            <el-input-number
              v-else-if="row.type === 'number'"
              v-model="row.editValue"
              :min="row.min !== undefined ? row.min : -Infinity"
              :max="row.max !== undefined ? row.max : Infinity"
              size="small"
              style="width: 100%"
            />
            <el-switch
              v-else-if="row.type === 'boolean'"
              v-model="row.editValue"
              size="small"
            />
            <el-input
              v-else
              v-model="row.editValue"
              size="small"
              style="width: 100%"
            />
          </template>
          <template v-else>
            <!-- 展示模式 -->
            <span v-if="row.isObject" class="object-value">对象</span>
            <el-switch
              v-else-if="row.type === 'boolean'"
              v-model="row.value"
              disabled
              size="small"
            />
            <el-tag v-else-if="row.type === 'number'" type="info" size="small">
              {{ row.value }}
            </el-tag>
            <span v-else>{{ row.value }}</span>
          </template>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <template v-if="row.isEditing">
            <el-button type="primary" link size="small" @click="handleSave(row)">
              <el-icon><Check /></el-icon> 保存
            </el-button>
            <el-button type="info" link size="small" @click="handleCancel(row)">
              <el-icon><Close /></el-icon> 取消
            </el-button>
          </template>
          <template v-else>
            <el-button type="primary" link size="small" @click="handleEdit(row)" :disabled="row.isObject">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)" :disabled="row.isObject">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
            <el-button type="success" link size="small" @click="handleAddChild(row)" v-if="row.isObject">
              <el-icon><Plus /></el-icon> 新增子项
            </el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增配置对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="新增配置"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
        <el-form-item label="配置项名称" prop="key">
          <el-input
            v-model="addForm.key"
            placeholder="请输入配置项名称（如：newConfig）"
          />
          <div class="form-tip">支持字母、数字、下划线，不能以数字开头</div>
        </el-form-item>
        <el-form-item label="配置项类型" prop="type">
          <el-radio-group v-model="addForm.type">
            <el-radio value="string">字符串</el-radio>
            <el-radio value="number">数字</el-radio>
            <el-radio value="boolean">布尔值</el-radio>
            <el-radio value="object">对象</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="默认值" v-if="addForm.type !== 'object'">
          <el-input
            v-if="addForm.type === 'string'"
            v-model="addForm.value"
            placeholder="请输入默认值"
          />
          <el-input-number
            v-else-if="addForm.type === 'number'"
            v-model="addForm.value"
            :min="addForm.min"
            :max="addForm.max"
          />
          <el-switch v-else-if="addForm.type === 'boolean'" v-model="addForm.value" />
        </el-form-item>
        <el-form-item label="最小值" v-if="addForm.type === 'number'">
          <el-input-number v-model="addForm.min" :min="-Infinity" />
        </el-form-item>
        <el-form-item label="最大值" v-if="addForm.type === 'number'">
          <el-input-number v-model="addForm.max" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Check, Close, Document, Folder, RefreshRight } from '@element-plus/icons-vue'
import { useConfigStore } from '@/store/config'
import { useColorStore } from '@/store/color'
import { updateAllConfigApi, getConfigApi, updateConfigValueApi, deleteConfigValueApi } from '@/api/config'

const configStore = useConfigStore()
const colorStore = useColorStore()

// 表格数据
const tableData = ref([])
const addDialogVisible = ref(false)
const addFormRef = ref(null)

// 新增表单
const addForm = reactive({
  key: '',
  type: 'string',
  value: '',
  min: 0,
  max: 100
})

// 表单验证规则
const addRules = {
  key: [
    { required: true, message: '请输入配置项名称', trigger: 'blur' },
    { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '配置项名称必须以字母或下划线开头，只能包含字母、数字、下划线', trigger: 'blur' }
  ],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

let nextId = 100

// 将配置对象转换为树形表格数据
const convertToTreeData = (obj, parentPath = '') => {
  const result = []
  
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = parentPath ? `${parentPath}.${key}` : key
    const isObject = value !== null && typeof value === 'object' && !Array.isArray(value)
    
    const node = {
      id: nextId++,
      key: fullPath,
      displayKey: key,
      originalKey: key,
      value: isObject ? null : value,
      type: isObject ? 'object' : typeof value,
      isObject: isObject,
      isEditing: false,
      editValue: isObject ? null : value,
      children: [],
      parentPath: parentPath,
      min: getMinValue(key, fullPath),
      max: getMaxValue(key, fullPath)
    }
    
    if (isObject && value !== null) {
      node.children = convertToTreeData(value, fullPath)
    }
    
    result.push(node)
  }
  
  return result
}

// 获取字段的数值范围限制（从原有配置定义中获取）
const getMinValue = (key, fullPath) => {
  const limits = {
    articleTopLimit: { min: 1, max: 99 },
    carouselLimit: { min: 0, max: 99 },
    childCommentLimit: { min: 0, max: 20 },
    childPageSize: { min: 5, max: 50 },
  }
  return limits[key]?.min ?? limits[fullPath]?.min
}

const getMaxValue = (key, fullPath) => {
  const limits = {
    articleTopLimit: { min: 1, max: 99 },
    carouselLimit: { min: 0, max: 99 },
    childCommentLimit: { min: 0, max: 20 },
    childPageSize: { min: 5, max: 50 }
  }
  return limits[key]?.max ?? limits[fullPath]?.max
}

// 加载配置数据
const loadConfigData = async () => {
  try {
    const res = await getConfigApi()
    if (res.code === 200 && res.data) {
      nextId = 100
      tableData.value = convertToTreeData(res.data)
    }
  } catch (error) {
    console.error('加载配置失败:', error)
    ElMessage.error('加载配置失败')
  }
}

// 重置配置
const handleReset = async () => {
  try {
    await ElMessageBox.confirm('重置将放弃所有未保存的修改，确定要重置吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await loadConfigData()
    ElMessage.success('已重置')
  } catch {
    // 取消操作
  }
}

// 编辑配置
const handleEdit = (row) => {
  row.isEditing = true
  row.editValue = cloneValue(row.value)
}

// 克隆值
const cloneValue = (value) => {
  if (typeof value === 'object' && value !== null) {
    return JSON.parse(JSON.stringify(value))
  }
  return value
}

// 保存配置
const handleSave = async (row) => {
  try {
    // 验证输入值类型
    let newValue = row.editValue
    if (row.type === 'number') {
      newValue = Number(newValue)
      if (isNaN(newValue)) {
        ElMessage.error('请输入有效的数字')
        return
      }
      // 检查数值范围
      if (row.min !== undefined && newValue < row.min) {
        ElMessage.error(`值不能小于 ${row.min}`)
        return
      }
      if (row.max !== undefined && newValue > row.max) {
        ElMessage.error(`值不能大于 ${row.max}`)
        return
      }
    } else if (row.type === 'boolean') {
      newValue = row.editValue === true || row.editValue === 'true'
    }
    
    // 调用单个配置更新接口
    const res = await updateConfigValueApi(row.key, newValue)
    if (res.code === 200) {
      row.value = cloneValue(newValue)
      row.isEditing = false
      ElMessage.success('保存成功')
      // 同步更新 store
      await syncStoreValue(row.key, newValue)
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  }
}

// 同步 store 中的值
const syncStoreValue = async (key, value) => {
  if (key.includes('.')) {
    const parts = key.split('.')
    if (parts.length === 2 && configStore[parts[0]]) {
      configStore[parts[0]][parts[1]] = value
    }
  } else if (key in configStore) {
    configStore[key] = value
  }
  // 触发配置变更后的回调
  configStore.executeInit()
}

// 取消编辑
const handleCancel = (row) => {
  row.isEditing = false
  row.editValue = cloneValue(row.value)
}

// 删除配置
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除配置项 "${row.displayKey}" 吗？此操作不可恢复！`,
      '提示',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    const res = await deleteConfigValueApi(row.key)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      await configStore.loadConfig()
      await loadConfigData()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 新增根配置
const handleAddRoot = () => {
  addForm.key = ''
  addForm.type = 'string'
  addForm.value = ''
  addForm.min = 0
  addForm.max = 100
  addDialogVisible.value = true
  addForm.parentPath = ''
}

// 新增子配置
const handleAddChild = (row) => {
  addForm.key = ''
  addForm.type = 'string'
  addForm.value = ''
  addForm.min = 0
  addForm.max = 100
  addForm.parentPath = row.key
  addDialogVisible.value = true
}

// 确认新增
const handleConfirmAdd = async () => {
  if (!addFormRef.value) return
  
  await addFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const fullConfig = buildFullConfig()
        let targetObj = fullConfig
        
        if (addForm.parentPath) {
          targetObj = getNestedObject(fullConfig, addForm.parentPath.split('.'))
          if (!targetObj) {
            ElMessage.error('父路径不存在')
            return
          }
        }
        
        // 检查key是否已存在
        if (addForm.key in targetObj) {
          ElMessage.error(`配置项 "${addForm.key}" 已存在`)
          return
        }
        
        // 设置新值
        let value = addForm.value
        if (addForm.type === 'number') {
          value = Number(value)
        } else if (addForm.type === 'boolean') {
          value = Boolean(value)
        } else if (addForm.type === 'object') {
          value = {}
        }
        
        targetObj[addForm.key] = value
        
        const res = await updateAllConfigApi(fullConfig)
        if (res.code === 200) {
          ElMessage.success('新增成功')
          addDialogVisible.value = false
          await configStore.loadConfig()
          await loadConfigData()
        } else {
          ElMessage.error(res.message || '新增失败')
        }
      } catch (error) {
        console.error('新增失败:', error)
        ElMessage.error('新增失败')
      }
    }
  })
}

// 构建完整的配置对象（从当前表格数据）
const buildFullConfig = () => {
  const config = {}
  for (const node of tableData.value) {
    buildConfigFromNode(config, node)
  }
  return config
}

// 从节点构建配置对象
const buildConfigFromNode = (parent, node) => {
  if (node.isObject) {
    parent[node.originalKey] = {}
    if (node.children) {
      for (const child of node.children) {
        buildConfigFromNode(parent[node.originalKey], child)
      }
    }
  } else {
    parent[node.originalKey] = node.value
  }
}

// 获取嵌套对象
const getNestedObject = (obj, pathParts) => {
  let current = obj
  for (const part of pathParts) {
    if (current[part] === undefined) {
      return null
    }
    current = current[part]
  }
  return current
}

// 更新嵌套值
const updateNestedValue = (obj, pathParts, value) => {
  let current = obj
  for (let i = 0; i < pathParts.length - 1; i++) {
    if (current[pathParts[i]] === undefined) {
      current[pathParts[i]] = {}
    }
    current = current[pathParts[i]]
  }
  current[pathParts[pathParts.length - 1]] = value
}

// 监听配置store变化，同步表格数据
onMounted(() => {
  loadConfigData()
})
</script>

<style scoped>
.config-management {
  padding: 20px;
  min-height: 100%;
}

.config-management.light-mode {
  background-color: #f5f7fa;
}

.config-management.dark-mode {
  background-color: #1a1a1a;
}

.header-actions {
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
}

.config-table {
  width: 100%;
}

.config-key {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.object-icon {
  color: #e6a23c;
}

.field-icon {
  color: #409eff;
}

.object-value {
  color: #909399;
  font-style: italic;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

:deep(.el-table__row) {
  cursor: default;
}

:deep(.el-table .cell) {
  line-height: 32px;
}

.dark-mode :deep(.el-table) {
  --el-table-bg-color: #1e1e1e;
  --el-table-tr-bg-color: #1e1e1e;
  --el-table-header-bg-color: #2d2d2d;
  --el-table-row-hover-bg-color: #2d2d2d;
  --el-table-border-color: #3a3a3a;
  color: #e0e0e0;
}

.dark-mode :deep(.el-tag--info) {
  background-color: #3a3a3a;
  border-color: #4a4a4a;
  color: #e0e0e0;
}
</style>