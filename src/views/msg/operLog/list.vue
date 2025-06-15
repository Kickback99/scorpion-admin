<template>
        <el-form label-width="auto" inline> 
            <el-form-item>
                <el-input v-model="searchData.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item>
            <el-select v-model="searchData.module" placeholder="请选择模块类型">
                <el-option
                v-for="item in enumOptions.modules"
                :key="item.value"
                :label="displayMode === 'label' ? item.label : item.value"
                :value="item.value"
                />
            </el-select>
            </el-form-item>
            <el-form-item>
                <el-select v-model="searchData.type" placeholder="请选择操作类型">
                <el-option
                v-for="item in enumOptions.types"
                :key="item.value"
                :label="displayMode === 'label' ? item.label : item.value"
                :value="item.value"
                />
                </el-select>
            </el-form-item>
                        <el-form-item>
                <el-date-picker
                    v-model="searchData.createTimeBegin"
                    type="date"
                    placeholder="开始日期"
                    value-format="YYYY-MM-DD"
                    :disabled-date="(date) => searchData.createTimeEnd ? date > new Date(searchData.createTimeEnd) : false"
                />
                <span style="margin: 0 8px">至</span>
                <el-date-picker
                    v-model="searchData.createTimeEnd"
                    type="date"
                    placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                    :disabled-date="(date) => searchData.createTimeBegin ? date < new Date(searchData.createTimeBegin) : false"
                />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" :icon="Search"  plain @click="onSearch">搜索</el-button>
                <el-button type="warning" :icon="Refresh" plain @click="onReset" >重置</el-button>
                <el-button plain color="#626aef" :dark="isDark"  @click="deleteSelectRows()">批量删除</el-button>
            </el-form-item>
            <el-form-item>
            <el-form-item label="显示模式">
                <el-radio-group v-model="displayMode" size="small">
                    <el-radio label="value">显示编码</el-radio>
                    <el-radio label="label">显示中文</el-radio>
                </el-radio-group>
            </el-form-item>
            </el-form-item>
        </el-form>
        <el-table :data="tableData" :style="{ width: '100%' }" >
            <el-table-column type="index" label="序号"  width="60"/>
            <el-table-column prop="username" label="操作用户"  />
            <el-table-column  label="操作模块">
                <template #default="{row}">
                    {{ displayMode === 'label' ? row.moduleLabel : row.module }}
                </template>
            </el-table-column>
            <el-table-column label="操作类型">
                <template #default="{row}">
                    {{ displayMode === 'label' ? row.typeLabel : row.type  }}
                </template>
            </el-table-column>
            <el-table-column prop="reqMode" label="请求方式" />
            <el-table-column prop="ipaddr" label="请求地址" />
            <el-table-column prop="createTime" label="操作时间" />
            <el-table-column width="150">
                <template #default="{row}">
                    <el-button @click="onDetail(row)" type="primary" :icon="MoreFilled"  circle plain/>
                    <el-popconfirm :title="`你确定要删除这条数据吗`" @confirm="removeRow(row.id)" width="250px" :icon="WarnTriangleFilled">
                        <template #reference>
                    <el-button type="danger" :icon="Delete"  circle plain/>
                        </template>
                    </el-popconfirm>
                </template>
                
            </el-table-column>
        </el-table>

        <el-pagination
		v-model:current-page="params.pageNum"
		v-model:page-size="params.pageSize"
		:page-sizes="[2,3,5,7]"
		:small="false"
		:disabled="false"
		:background="false"
		layout="jumper, total, sizes, prev, pager, next"
		:total="总页数"
		@size-change="onSizeChange"
		@current-change="onCurrentChange"
		/>

        <el-dialog v-model="dialogVisible" title="查看日志详情" width="50%">
          <!--   <el-form  :model="formModel" :rules="rules" label-width="120px" class="demo-ruleForm"
                :size="formSize" status-icon>
                <el-form-item label="IP地址" >
                    <el-input  v-model="formModel.ipaddr" />
                </el-form-item>

                <el-form-item label="请求路径" >
                    <el-input  v-model="formModel.reqUrl" />
                </el-form-item>

                <el-form-item label="方法名称" >
                    <el-input  v-model="formModel.method" />
                </el-form-item>

                <el-form-item label="请求参数" >
                    <el-input  v-model="formModel.reqParam" />
                </el-form-item>

                <el-form-item label="响应数据" >
                    <el-input  v-model="formModel.resData" />
                </el-form-item>
            </el-form> -->

              <el-tabs type="border-card">
                <!-- 基础信息 -->
                <el-tab-pane label="基础信息">
                <el-descriptions :column="1" border>
                    <el-descriptions-item label="IP地址">{{ formModel.ipaddr }}</el-descriptions-item>
                    <el-descriptions-item label="请求路径">{{ formModel.reqUrl }}</el-descriptions-item>
                    <el-descriptions-item label="方法名称">{{ formModel.method }}</el-descriptions-item>
                </el-descriptions>
                </el-tab-pane>

                <!-- 请求参数 -->
                <el-tab-pane label="请求参数">
                <v-md-editor 
                    :model-value="formatJson(formModel.reqParam)" 
                    mode="preview"
                    height="400px"
                    @copy-code-success="handleCopySuccess"
                />
                </el-tab-pane>

                <!-- 响应数据 -->
                <el-tab-pane label="响应数据">
                <v-md-editor 
                    :model-value="formatJson(formModel.resData)" 
                    mode="preview"
                    height="400px"
                    @copy-code-success="handleCopySuccess"
                />
                </el-tab-pane>
            </el-tabs>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">关闭</el-button>
                </span>
            </template>
        </el-dialog>
</template>

<script setup>
import { operlogEnumsListApi, operlogListApi } from '@/api/msglog';
import {MoreFilled,Delete,WarnTriangleFilled} from '@element-plus/icons-vue'
import { reactive, ref } from 'vue';

const tableData = ref([])

const params = reactive({
    pageNum: 1,
    pageSize: 10
})

const displayMode = ref('label')

const total = ref(null)

const searchData = reactive({})

const render = async() => {
    const res = await operlogListApi(params.pageNum,params.pageSize,searchData)
    tableData.value = res.data.items
    total.value = res.data.total
}

render()

//点击分页事件
const onSizeChange = (size) => {
    //console.log(`onSizeChange：每页显示${size}条`)
    //每页条数发生变化时，重新从第一页渲染
    params.pageNum = 1
    //更新每页条数
    params.pageSize = size
    //重新渲染
    render()
}

const onCurrentChange = (page) => {
    //console.log(`onCurrentChange：当前第${page}页`)
    //更新当前页
    params.pageNum = page
    //重新渲染
    render()
}

const enumOptions = ref({
  modules: [],
  types: []
})

// 获取枚举值
const loadEnums = async () => {
    const res = await operlogEnumsListApi()
    enumOptions.value = {
      modules: res.data.modules, // 已经是[{value, label}]格式
      types: res.data.types      // 已经是[{value, label}]格式
    }
}

loadEnums()

const onSearch = () => {
    params.pageNum = 1
    render()
}

const onReset = () => {
    params.pageNum = 1
    Object.assign(searchData,{username:'',module:'',type:'',createTimeBegin:'',createTimeEnd:''})
    render()
}

const dialogVisible = ref(false)
const formModel = reactive({})

const onDetail = (row) => {
    dialogVisible.value = true
    Object.assign(formModel,{...row})
}

// JSON格式化（添加Markdown代码块语法）
const formatJson = (str) => {
  try {
    const parsed = JSON.parse(str)
    return '```json\n' + JSON.stringify(parsed, null, 2) + '\n```'
  } catch {
    return str // 非JSON数据保持原样
  }
}


const handleCopySuccess = () => {
  // 获取所有复制按钮
  const copyButtons = document.querySelectorAll('.v-md-copy-code-btn')
  
  copyButtons.forEach(btn => {
    // 保存原始SVG
    const originalSvg = btn.innerHTML
    
    // 替换为成功图标
    btn.innerHTML = `
      <i>
        <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="#67c23a">
          <path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"/>
        </svg>
      </i>
    `
    
    // 1.5秒后恢复
    setTimeout(() => {
      btn.innerHTML = originalSvg
    }, 1500)
  })
}

</script>

<style scoped lang="scss">
/* 调整编辑器内边距 */
.v-md-editor-preview {
  padding: 0 16px;
}

/* 标签页高度控制 */
.el-tabs {
  max-height: 50vh;
  overflow: auto;
}

/* 基础信息描述列表样式 */
.el-descriptions {
  margin-top: 10px;
}
</style>