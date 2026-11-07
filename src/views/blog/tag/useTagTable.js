/**
 * 标签表格视图列表逻辑 — 分页（替换式），仅 TagTable 使用
 */
import { ref, onBeforeUnmount } from 'vue'
import { listApi } from '@/api/tag'
import { useTagEditor } from './useTagEditor'

export function useTagTable() {
  const searchData = ref({})
  const tableData = ref([])
  const params = ref({ pageNum: 1, pageSize: 10 })
  const total = ref(null)

  // 默认关闭 loading
  const loading = ref(false)

  const { registerReload } = useTagEditor()

  // ============================================================
  // 渲染
  // ============================================================
  // t_tag_request：标签列表请求
  // 新请求先中断上一次，避免翻页过快或关页后旧响应还写回数据
  let listController = null
  const render = async () => {
    listController?.abort()
    listController = new AbortController()
    const { signal } = listController
    // 开启 loading 动效
    loading.value = true
    try {
      const res = await listApi(params.value.pageNum, params.value.pageSize, searchData.value, signal)
      tableData.value = res.data.items
      total.value = res.data.total
    } catch (error) {
      if (!signal.aborted) console.error('获取标签列表失败:', error)
    } finally {
      // 已中断时 loading 归新请求管，这里不复位
      if (!signal.aborted) loading.value = false
    }
  }

  /** 回到第一页并刷新（增删改成功后、搜索、重置、每页条数变化时调用） */
  const reload = () => {
    params.value.pageNum = 1
    render()
  }

  // ============================================================
  // 分页
  // ============================================================
  const onSizeChange = (size) => {
    params.value.pageSize = size
    reload()
  }

  const onCurrentChange = (page) => {
    params.value.pageNum = page
    render()
  }

  // ============================================================
  // 搜索和重置
  // ============================================================
  const onSearch = () => { reload() }

  const onReset = () => {
    searchData.value = {}
    reload()
  }

  registerReload(reload)
  render()

  // 关闭当前标签页时中断在途请求
  onBeforeUnmount(() => listController?.abort())

  return {
    searchData, tableData, params, total, loading,
    onSizeChange, onCurrentChange, onSearch, onReset,
  }
}
