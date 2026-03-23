<template>
    <div class="layout">
        <el-form ref="formRef"  label-width="auto" inline> 
            <el-form-item>
                <el-input v-model="searchData.keyword" placeholder="请输入标题 | 内容" />
            </el-form-item>
            <el-form-item>
                <CateSelect v-model="searchData.categoryId"></CateSelect>
            </el-form-item>
            <el-form-item>
                    <el-select  style="width: 200px" v-model="searchData.isTop" placeholder="请选择置顶">
                        <el-option label="置顶" value="1" />
                        <el-option label="非置顶" value="0" />
                    </el-select>
            </el-form-item>
            <el-form-item>
                    <el-select  style="width: 200px" v-model="searchData.status" placeholder="请选择状态">
                        <el-option label="已发布" value="0" />
                        <el-option label="草稿" value="1" />
                    </el-select>
            </el-form-item>

            <el-form-item>
                <SmartSelector v-model="searchData.sortField" :data="fields" style="width: 255px;" placeholder="请选择排序(默认置顶+创建时间)">
                </SmartSelector>
            </el-form-item>

            <el-form-item>
                <el-button icon="Top" circle plain :type="searchData.sortOrder === 'ASC' ? 'primary' : ''"
                    @click="setSortOrder('ASC')" />
                <el-button icon="Bottom" circle plain :type="searchData.sortOrder === 'DESC' ? 'primary' : ''"
                    @click="setSortOrder('DESC')" />
            </el-form-item>
            

            <el-form-item>
                <el-select v-model="searchData.timeField" placeholder="请选择时间" style="width: 120px">
                    <el-option label="请选择时间" value="" :disabled="true"/>
                    <el-option label="创建时间" value="create_time" />
                    <el-option label="修改时间" value="update_time" />
                </el-select>
            </el-form-item>

            <el-form-item>
                <el-date-picker
                v-model="dataTimeRange"
                type="datetimerange"
                :shortcuts="shortcuts"
                range-separator="至"
                start-placeholder="开始日期时间"
                end-placeholder="结束日期时间"
                :popper-options="{
                    placement: 'bottom-start'
                }"
                :size="default"
                @change="updateDataTime"
                />
            </el-form-item>

            <el-form-item>
                <el-button type="primary" icon="Search"  plain @click="onSearch">搜索</el-button>
                <el-button type="warning" icon="Refresh" plain @click="onReset" >重置</el-button>
            </el-form-item>
        </el-form>
        <div class="right">
            <el-button :disabled="$hasPerm('btn.article.add')" type="success" icon="Plus"  plain @click="handleAdd({})">新增</el-button>
        </div>
    </div>

    <el-table :data="tableData" :style="{ width: '100%' }" >
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="title" label="标题" />
        <el-table-column label="封面">
            <template #default="{row}">
                <el-image style="width: 100px" :src="row.cover" :fit="cover" />
            </template>
        </el-table-column>
        <el-table-column prop="cateName" label="分类" />
        <el-table-column label="置顶">
            <template #default="{row}">
                <el-switch v-model="row.isTop"  active-value="1" inactive-value="0" @change="modifySwitch(row)"/>
            </template>
        </el-table-column>
        <el-table-column label="状态" >
              <template #default="{row}">
                    {{ row.status === "0" ? "已发布" : "草稿" }}
              </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建日期" />
        <el-table-column prop="updateTime" label="修改日期" />
        <el-table-column label="操作">
            <template #default="{row}">
                <el-button :disabled="$hasPerm('btn.article.update')" @click="handleEdit(row)" type="primary" icon="Edit"   circle plain ></el-button>
                <el-button :disabled="$hasPerm('btn.article.remove')" @click="handleDelete(row.id)" type="danger" icon="Delete" circle plain ></el-button>
            </template>
        </el-table-column>
    </el-table>

    <el-pagination
        v-model:current-page="params.pageNum"
        v-model:page-size="params.pageSize"
        :page-sizes="[2, 5, 7, 10]"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="onSizeChange"
        @current-change="onCurrentChange"
    />

    <ArticleEdit ref="maskRef" @reRender="render"></ArticleEdit>
   
</template>

<script setup>
import { isTopApi, listApi, removeApi } from '@/api/conarticle';
import CateSelect from '@/views/components/CateSelect.vue';
import { ref, watch } from 'vue';
import ArticleEdit from '@/views/components/ArticleEdit.vue';
import SmartSelector from '@/views/components/SmartSelector.vue';
import { dayjs} from 'element-plus';

//搜索相关
const searchData = ref({
        // sortField: 'create_time',  // 保留默认排序字段
        sortOrder: 'DESC',           // 保留默认排序方向
        timeField: 'create_time',  // 默认按创建时间筛选
})

const params = ref({
    pageNum :1,
    pageSize : 10
})

const total = ref(null)

const tableData = ref([])

// t_article_request：文章列表请求
const render = async() => {
    const res = await listApi(params.value.pageNum,params.value.pageSize,searchData.value)
    console.log(res)
    tableData.value = res.data.items
    total.value = res.data.total
}

render()

//点击分页事件
const onSizeChange = (size) => {
    //console.log(`onSizeChange：每页显示${size}条`)
    //每页条数发生变化时，重新从第一页渲染
    params.value.pageNum = 1
    //更新每页条数
    params.value.pageSize = size
    //重新渲染
    render()
}

const onCurrentChange = (page) => {
    //console.log(`onCurrentChange：当前第${page}页`)
    //更新当前页
    params.value.pageNum = page
    //重新渲染
    render()
}

const onSearch = () => {
    /* if(Boolean(searchData.value.sortField) != Boolean(searchData.value.sortOrder)){
        ElMessage.error(searchData.value.sortField?'请选择排序':'请选择排序字段')
    } */
    params.value.pageNum = 1
    render()
}

const onReset = () => {
    params.value.pageNum = 1
    searchData.value = {
        // sortField: 'create_time',  // 保留默认排序字段
        sortOrder: 'DESC',           // 保留默认排序方向
        timeField: 'create_time',  // 默认按创建时间筛选
    }
    dataTimeRange.value = []  // 清空日期范围
    render()
}

const maskRef = ref()

const handleAdd = (param) => {
    console.log('hello')
    maskRef.value.openMask()
    maskRef.value.handleToggle(param)
}

const handleEdit = (param) => {
    maskRef.value.openMask()
    maskRef.value.handleToggle(param)
}

// t_article_request：文章删除请求
const handleDelete = async(id) => {
    console.log(id)
    await removeApi(id)
    ElMessage.success('删除成功')
    render()
}

//  t_article_request：更改文章状态请求
const modifySwitch = async(row) =>{
    await isTopApi(row.id,row.isTop)
    row.isTop === "1" ? ElMessage.success('已置顶'):ElMessage.error('已取消置顶')
    render()
}

// 设置排序方向
const setSortOrder = (order) => {
  searchData.value.sortOrder = order
}

const fields = ref([
    {label:'请选择排序(默认置顶+创建时间)',value:''},
    {label:'文章标题',value:'title'},
    {label:'创建时间',value:'create_time'},
    {label:'修改时间',value:'update_time'},
])


// 监听 timeField 变化，重新生成时间参数
watch(() => searchData.value.timeField, () => {
    // 如果当前有日期范围，重新生成对应的时间参数
    if (dataTimeRange.value && dataTimeRange.value.length === 2) {
        regenerateTimeParams()
    }
})

const dataTimeRange = ref([])

const shortcuts = [
  {
    text: "今天",
    value: () => {
      const now = new Date()
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)
      return [start, now]
    }
  },
  {
    text: "昨天",
    value: () => {
      const end = new Date()
      end.setHours(0, 0, 0, 0)
      const start = new Date(end)
      start.setDate(start.getDate() - 1)
      return [start, end]
    }
  },
  {
    text: "最近一周",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 7)
      return [start, end]
    }
  },
    {
    text: "上周",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    }
  },
  {
    text: "上个月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    }
  },
  {
    text: "三个月前",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    }
  }
];

const updateDataTime = (range) => {
    if (!range || range.length !== 2) {
        // 清空日期时，清空所有时间参数
        searchData.value.createTimeBegin = null
        searchData.value.createTimeEnd = null
        searchData.value.updateTimeBegin = null
        searchData.value.updateTimeEnd = null
        return
    }
    
    // 根据当前 timeField 设置对应的时间参数
    const beginTime = dayjs(range[0]).format('YYYY-MM-DD HH:mm:ss')
    const endTime = dayjs(range[1]).format('YYYY-MM-DD HH:mm:ss')
    
    if (searchData.value.timeField === 'create_time') {
        searchData.value.createTimeBegin = beginTime
        searchData.value.createTimeEnd = endTime
        searchData.value.updateTimeBegin = null
        searchData.value.updateTimeEnd = null
    } else {
        searchData.value.updateTimeBegin = beginTime
        searchData.value.updateTimeEnd = endTime
        searchData.value.createTimeBegin = null
        searchData.value.createTimeEnd = null
    }
}


// 根据当前日期范围和 timeField 重新生成时间参数
const regenerateTimeParams = () => {
    const range = dataTimeRange.value
    if (!range || range.length !== 2) return
    
    const beginTime = dayjs(range[0]).format('YYYY-MM-DD HH:mm:ss')
    const endTime = dayjs(range[1]).format('YYYY-MM-DD HH:mm:ss')
    
    if (searchData.value.timeField === 'create_time') {
        searchData.value.createTimeBegin = beginTime
        searchData.value.createTimeEnd = endTime
        // 清空修改时间字段
        searchData.value.updateTimeBegin = null
        searchData.value.updateTimeEnd = null
    } else {
        searchData.value.updateTimeBegin = beginTime
        searchData.value.updateTimeEnd = endTime
        // 清空创建时间字段
        searchData.value.createTimeBegin = null
        searchData.value.createTimeEnd = null
    }
}

</script>

<style lang="scss" scoped>
.layout {
    @include flex(space-between,null,null)
}
</style>