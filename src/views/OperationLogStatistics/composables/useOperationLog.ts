import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { get as getOperationLogApi } from '@/api/generated/操作日志管理/操作日志管理'
import type {
  OperationLogEntity,
  OperationLogQueryRequest,
} from '@/api/generated/.ts.schemas'

/**
 * 操作日志数据管理
 */
export function useOperationLog() {
  const operationLogApi = getOperationLogApi()

  // 表格数据
  const tableData = ref<OperationLogEntity[]>([])
  const loading = ref(false)

  // 分页
  const pagination = reactive({
    current: 1,
    size: 20,
    total: 0,
  })

  // 筛选表单
  const filterForm = reactive<Partial<OperationLogQueryRequest>>({
    module: undefined,
    action: undefined,
    status: undefined,
    operatorName: '',
  })

  const dateRange = ref<[string, string] | []>([])

  // 模块和操作类型选项
  const moduleOptions = ref<string[]>([])
  const actionOptions = ref<string[]>([])

  // 统计数据
  const statistics = reactive({
    total: 0,
    successRate: 0,
    failedCount: 0,
    avgCostTime: 0,
  })

  /**
   * 提取模块和操作类型选项
   */
  const extractOptions = (logs: OperationLogEntity[]) => {
    const modules = new Set<string>()
    const actions = new Set<string>()

    logs.forEach((log) => {
      if (log.module) modules.add(log.module)
      if (log.action) actions.add(log.action)
    })

    moduleOptions.value = Array.from(modules)
    actionOptions.value = Array.from(actions)
  }

  /**
   * 更新统计数据
   */
  const updateStatistics = () => {
    const total = tableData.value.length
    const successCount = tableData.value.filter(
      (log) => log.status === 1,
    ).length
    const failedCount = total - successCount
    const totalCostTime = tableData.value.reduce(
      (sum, log) => sum + (log.costTime || 0),
      0,
    )

    statistics.total = pagination.total
    statistics.successRate =
      total > 0 ? Math.round((successCount / total) * 100) : 0
    statistics.failedCount = failedCount
    statistics.avgCostTime = total > 0 ? Math.round(totalCostTime / total) : 0
  }

  /**
   * 获取日志列表
   */
  const fetchLogList = async () => {
    loading.value = true
    try {
      const params: OperationLogQueryRequest = {
        current: pagination.current,
        size: pagination.size,
        ...filterForm,
      }

      if (dateRange.value && dateRange.value.length === 2) {
        params.startTime = dateRange.value[0]
        params.endTime = dateRange.value[1]
      }

      const response =
        await operationLogApi.postManagerOperationLogPages(params)

      if (response) {
        tableData.value = response.records || []
        pagination.total = response.total || 0

        // 提取选项
        extractOptions(tableData.value)

        // 更新统计
        updateStatistics()
      }
    } catch (error) {
      console.error('获取操作日志失败:', error)
      ElMessage.error('获取操作日志失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取日志详情
   */
  const fetchLogDetail = async (id: number) => {
    try {
      const detail = await operationLogApi.getManagerOperationLogId(id)
      return detail
    } catch (error) {
      console.error('获取日志详情失败:', error)
      ElMessage.error('获取日志详情失败')
      return null
    }
  }

  /**
   * 搜索
   */
  const handleSearch = () => {
    pagination.current = 1
    fetchLogList()
  }

  /**
   * 重置
   */
  const handleReset = () => {
    dateRange.value = []
    filterForm.module = undefined
    filterForm.action = undefined
    filterForm.status = undefined
    filterForm.operatorName = ''
    pagination.current = 1
    fetchLogList()
  }

  /**
   * 初始化默认时间范围
   */
  const initDefaultDateRange = () => {
    const end = new Date()
    const start = new Date()
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
    dateRange.value = [
      start.toISOString().slice(0, 19).replace('T', ' '),
      end.toISOString().slice(0, 19).replace('T', ' '),
    ]
  }

  return {
    tableData,
    loading,
    pagination,
    filterForm,
    dateRange,
    moduleOptions,
    actionOptions,
    statistics,
    fetchLogList,
    fetchLogDetail,
    handleSearch,
    handleReset,
    initDefaultDateRange,
  }
}
