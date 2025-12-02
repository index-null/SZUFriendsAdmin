<template>
  <div class="operation-log-statistics">
    <!-- 统计卡片 -->
    <StatisticsCards :statistics="statistics" />

    <!-- 筛选表单 -->
    <FilterForm
      v-model:filter-form="filterForm"
      v-model:date-range="dateRange"
      :module-options="moduleOptions"
      :action-options="actionOptions"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 图表面板 -->
    <ChartsPanel v-model:trend-type="trendType" :table-data="tableData" />

    <!-- 日志列表 -->
    <LogTable
      v-model:pagination="pagination"
      :table-data="tableData"
      :loading="loading"
      @view-detail="handleViewDetail"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 详情对话框 -->
    <LogDetailDialog v-model="detailDialogVisible" :log="currentLog" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StatisticsCards from './components/StatisticsCards.vue'
import FilterForm from './components/FilterForm.vue'
import ChartsPanel from './components/ChartsPanel.vue'
import LogTable from './components/LogTable.vue'
import LogDetailDialog from './components/LogDetailDialog.vue'
import { useOperationLog } from './composables/useOperationLog.ts'
import type { OperationLogEntity } from '@/api/generated/.ts.schemas'

// 使用组合式函数管理数据
const {
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
} = useOperationLog()

// 图表类型
const trendType = ref<'hour' | 'day' | 'week'>('day')

// 详情对话框
const detailDialogVisible = ref(false)
const currentLog = ref<OperationLogEntity | null>(null)

// 查看详情
const handleViewDetail = async (row: OperationLogEntity) => {
  if (!row.id) return
  const detail = await fetchLogDetail(row.id)
  if (detail) {
    currentLog.value = detail
    detailDialogVisible.value = true
  }
}

// 分页变化
const handleSizeChange = () => {
  pagination.current = 1
  fetchLogList()
}

const handleCurrentChange = () => {
  fetchLogList()
}

// 组件挂载
onMounted(() => {
  initDefaultDateRange()
  fetchLogList()
})
</script>

<style scoped>
.operation-log-statistics {
  padding: 20px;
}
</style>
