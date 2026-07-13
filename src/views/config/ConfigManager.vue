<template>
  <div class="config-management" :class="userConfigStore.isDarkEnabled ? 'dark-mode' : 'light-mode'">
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
            <!-- 系统预设配置标识 -->
            <el-tag v-if="row.isSystem" type="danger" size="small" effect="plain" style="margin-left: 8px">系统</el-tag>
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
            <!-- 删除按钮：对象有子节点 或 系统预设配置 时禁用 -->
            <el-button type="danger" link size="small" @click="handleDelete(row)" :disabled="(row.isObject && hasChildren(row)) || row.isSystem">
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
          :min="addForm.min !== null ? addForm.min : undefined"
          :max="addForm.max !== null ? addForm.max : undefined"
          />
          <el-switch v-else-if="addForm.type === 'boolean'" v-model="addForm.value" />
        </el-form-item>
        
        <!-- 阈值设置开关 -->
        <el-form-item v-if="addForm.type === 'number'">
          <el-checkbox v-model="addForm.enableThreshold">
            设置数值范围限制
          </el-checkbox>
          <div class="form-tip">不设置则使用系统默认配置</div>
        </el-form-item>
        
        <!-- 阈值设置区域（仅在开启时显示） -->
        <template v-if="addForm.type === 'number' && addForm.enableThreshold">
          <el-form-item label="最小值">
            <el-input-number 
              v-model="addForm.min" 
              :min="-Infinity" 
              :max="addForm.max !== null ? addForm.max : Infinity"
            />
          </el-form-item>
          <el-form-item label="最大值">
            <el-input-number 
              v-model="addForm.max" 
              :min="addForm.min !== null ? addForm.min : -Infinity"
              :max="Infinity"
            />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessageBox } from 'element-plus'
import msg from '@/components/msg'
import { Plus, Edit, Delete, Check, Close, Document, Folder, RefreshRight } from '@element-plus/icons-vue'
import { useConfigStore } from '@/store/config'
import { useUserConfigStore } from '@/store/userConfig'
import { updateAllConfigApi, getConfigApi, updateConfigValueApi, deleteConfigValueApi } from '@/api/config'

const configStore = useConfigStore()
const userConfigStore = useUserConfigStore()

// 表格数据
const tableData = ref([])
const addDialogVisible = ref(false)
const addFormRef = ref(null)

// 新增表单
const addForm = reactive({
  key: '',
  type: 'string',
  value: '',
  min: null,           // 默认为 null，表示不设置
  max: null,           // 默认为 null，表示不设置
  enableThreshold: false,  // 是否启用阈值设置
  parentPath: ''
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

// 检查是否为系统预设配置（使用 store 的 isSystemConfig 方法）
const isSystemField = (key) => {
  return configStore.isSystemConfig(key)
}

// 获取字段的最小值限制（统一从 numberLimits 读取）
const getFieldMin = (key) => {
  const limit = configStore.getLimitMin(key)
  return limit !== undefined ? limit : -Infinity
}

// 获取字段的最大值限制（统一从 numberLimits 读取）
const getFieldMax = (key) => {
  const limit = configStore.getLimitMax(key)
  return limit !== undefined ? limit : Infinity
}

// 将配置对象转换为树形表格数据
const convertToTreeData = (obj, parentPath = '') => {
  const result = []
  
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = parentPath ? `${parentPath}.${key}` : key
    const isObject = value !== null && typeof value === 'object' && !Array.isArray(value)

    // 获取该字段的限制（统一从 numberLimits 读取）
    const min = getFieldMin(fullPath)
    const max = getFieldMax(fullPath)
    
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
      min: isFinite(min) ? min : undefined,
      max: isFinite(max) ? max : undefined,
      // 动态判断是否为系统预设配置
      isSystem: isSystemField(fullPath)
    }
    
    if (isObject && value !== null) {
      node.children = convertToTreeData(value, fullPath)
    }
    
    result.push(node)
  }
  
  return result
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
    msg.error('加载配置失败')
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
    msg.primary('已重置')
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
        msg.error('请输入有效的数字')
        return
      }

      // 检查数值范围（使用当前的 min/max）
      const currentMin = row.min !== undefined ? row.min : -Infinity
      const currentMax = row.max !== undefined ? row.max : Infinity
      if (newValue < currentMin) {
        msg.error(`值不能小于 ${currentMin}`)
        return
      }
      if (newValue > currentMax) {
        msg.error(`值不能大于 ${currentMax}`)
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
      msg.primary('保存成功')
      // 同步更新 store
      await syncStoreValue(row.key, newValue)
    } else {
      msg.error(res.message || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    msg.error('保存失败')
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

// 判断节点是否有子节点（非空对象）
const hasChildren = (row) => {
  if (!row.isObject) return false
  // 如果 children 数组存在且有内容，返回 true
  return row.children && row.children.length > 0
}

// 删除配置
const handleDelete = async (row) => {

  // 系统预设配置不允许删除（系统预设配置按钮已禁用，此方法不会执行，但保留逻辑）
  if (row.isSystem) {
    msg.warning('系统预设配置不可删除')
    return
  }

  // 检查是否为已定义的配置项（存在于 CONFIG_DEFINITIONS）
  const isDefined = !!configStore.getConfigDefinition(row.key)

  let confirmMessage = ''
  if (isDefined) {
    confirmMessage = `配置项 "${row.displayKey}" 是已定义的配置项，删除后需要在 CONFIG_DEFINITIONS 源码中删除该项。确定要删除吗？`
  } else {
    confirmMessage = `确定要删除配置项 "${row.displayKey}" 吗？此操作不可恢复！`
  }


  try {
    await ElMessageBox.confirm(
      confirmMessage,
      '提示',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    // 如果是数字类型，移除 store 中的限制
    if (row.type === 'number') {
      configStore.removeNumberLimit(row.key)
    }
    
    const res = await deleteConfigValueApi(row.key)
    if (res.code === 200) {
      msg.primary('删除成功')
      await configStore.loadConfig()
      await loadConfigData()
    } else {
      msg.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      msg.error('删除失败')
    }
  }
}

// 重置新增表单
const resetAddForm = () => {
  addForm.key = ''
  addForm.type = 'string'
  addForm.value = ''
  addForm.min = null
  addForm.max = null
  addForm.enableThreshold = false
  
  // 清除表单校验状态和错误信息
  if (addFormRef.value) {
    addFormRef.value.resetFields()
  }
}

// 新增根配置
const handleAddRoot = () => {
  resetAddForm()
  addForm.parentPath = ''
  addDialogVisible.value = true
}

// 新增子配置
const handleAddChild = (row) => {
  resetAddForm()
  addForm.parentPath = row.key
  addDialogVisible.value = true
}

// 确认新增
const handleConfirmAdd = async () => {
  if (!addFormRef.value) return
  
  await addFormRef.value.validate(async (valid) => {
    if (valid) {
      try {        
        const fullKey = addForm.parentPath ? `${addForm.parentPath}.${addForm.key}` : addForm.key

        // 检查是否在 CONFIG_DEFINITIONS 中已存在
        if (configStore.getConfigDefinition(fullKey)) {
          msg.warning(`配置项 "${addForm.key}" 已在 CONFIG_DEFINITIONS 源码中定义，不能重复添加`)
          return
        }
        
        const fullConfig = buildFullConfig()
        
        let targetObj = fullConfig
        
        if (addForm.parentPath) {
          targetObj = getNestedObject(fullConfig, addForm.parentPath.split('.'))
          if (!targetObj) {
            msg.error('父路径不存在')
            return
          }
        }
        
        // 检查key是否已存在
        if (addForm.key in targetObj) {
          msg.error(`配置项 "${addForm.key}" 已存在`)
          return
        }
        
        // 设置新值
        let value = addForm.value

        if (addForm.type === 'number') {
          value = Number(value)

          // 只有在用户启用了阈值设置且设置了有效值时，才保存到 numberLimits
          if (addForm.enableThreshold) {
            const minToSave = addForm.min !== null ? addForm.min : undefined
            const maxToSave = addForm.max !== null ? addForm.max : undefined
            if (minToSave !== undefined || maxToSave !== undefined) {
              configStore.setNumberLimit(fullKey, minToSave, maxToSave)
            }
          }
          // 如果用户没有启用阈值设置，不保存任何限制（使用 CONFIG_DEFINITIONS 的配置）
        } else if (addForm.type === 'boolean') {
          value = Boolean(value)
        } else if (addForm.type === 'object') {
          value = {}
        }
        
        targetObj[addForm.key] = value
        
        const res = await updateAllConfigApi(fullConfig)
        if (res.code === 200) {
          msg.primary('新增成功')
          addDialogVisible.value = false
          await configStore.loadConfig()
          await loadConfigData()
        } else {
          msg.error(res.message || '新增失败')
        }
      } catch (error) {
        console.error('新增失败:', error)
        msg.error('新增失败')
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
  configStore.initNumberLimits()
  loadConfigData()
})

// 调整默认值使其在范围内
const adjustValueToRange = () => {
  if (addForm.type !== 'number') return
  if (!addForm.enableThreshold) return  // 未启用阈值时，不调整
  
  let currentValue = addForm.value
  let min = addForm.min
  let max = addForm.max
  
  // 注意：min 和 max 可能为 null，需要处理
  if (min !== null && currentValue < min) {
    addForm.value = min
  }
  if (max !== null && currentValue > max) {
    addForm.value = max
  }
}

// 监听 min 变化
watch(() => addForm.min, () => {
  adjustValueToRange()
})

// 监听 max 变化
watch(() => addForm.max, () => {
  adjustValueToRange()
})

// 监听类型变化
watch(() => addForm.type, (newType) => {
    if (newType === 'number') {
    // 重置数值相关字段
    addForm.value = 0
    addForm.min = null
    addForm.max = null
    addForm.enableThreshold = false
    // 未启用阈值，不调整范围
  }else if (newType === 'boolean') {
    addForm.value = true
  } else if (newType === 'string') {
    addForm.value = ''
  }
})

// 监听启用阈值开关变化
watch(() => addForm.enableThreshold, (enabled) => {
  if (!enabled) {
    // 关闭时清空 min/max
    addForm.min = null
    addForm.max = null
  } else {
    // 开启时设置默认值
    if (addForm.min === null) addForm.min = 0
    if (addForm.max === null) addForm.max = 100
    adjustValueToRange()
  }
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