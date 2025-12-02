<template>
  <el-card shadow="never" class="filter-card">
    <el-form :inline="true" :model="filterFormData" class="filter-form">
      <el-form-item label="时间范围">
        <el-date-picker
          v-model="dateRangeValue"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          :shortcuts="dateShortcuts"
          @change="handleDateChange"
        />
      </el-form-item>

      <el-form-item label="功能模块">
        <el-select
          v-model="filterFormData.module"
          placeholder="全部模块"
          clearable
          style="width: 150px"
        >
          <el-option
            v-for="module in moduleOptions"
            :key="module"
            :label="module"
            :value="module"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="操作类型">
        <el-select
          v-model="filterFormData.action"
          placeholder="全部类型"
          clearable
          style="width: 150px"
        >
          <el-option
            v-for="action in actionOptions"
            :key="action"
            :label="action"
            :value="action"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="状态">
        <el-select
          v-model="filterFormData.status"
          placeholder="全部状态"
          clearable
          style="width: 120px"
        >
          <el-option label="成功" :value="1" />
          <el-option label="失败" :value="0" />
        </el-select>
      </el-form-item>

      <el-form-item label="操作人">
        <el-input
          v-model="filterFormData.operatorName"
          placeholder="请输入操作人"
          clearable
          style="width: 150px"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleSearch">
          查询
        </el-button>
        <el-button :icon="RefreshRight" @click="handleReset"> 重置 </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Search, RefreshRight } from '@element-plus/icons-vue'
import type { OperationLogQueryRequest } from '@/api/generated/.ts.schemas'

interface Props {
  filterForm: Partial<OperationLogQueryRequest>
  dateRange: [string, string] | []
  moduleOptions: string[]
  actionOptions: string[]
}

interface Emits {
  (e: 'update:filterForm', value: Partial<OperationLogQueryRequest>): void
  (e: 'update:dateRange', value: [string, string] | []): void
  (e: 'search'): void
  (e: 'reset'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const filterFormData = computed({
  get: () => props.filterForm,
  set: (value) => emit('update:filterForm', value),
})

const dateRangeValue = computed({
  get: () => props.dateRange,
  set: (value) => emit('update:dateRange', value || []),
})

const dateShortcuts = [
  {
    text: '今天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      return [start, end]
    },
  },
  {
    text: '最近7天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '最近30天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
]

const handleDateChange = () => {
  emit('search')
}

const handleSearch = () => {
  emit('search')
}

const handleReset = () => {
  emit('reset')
}
</script>

<style scoped>
.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .filter-form :deep(.el-form-item) {
    width: 100%;
    margin-right: 0;
  }
}
</style>
