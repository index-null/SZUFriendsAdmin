<template>
  <el-card shadow="never" class="table-card">
    <template #header>
      <div class="card-header">
        <span>操作日志</span>
        <el-button
          type="primary"
          :icon="Download"
          size="small"
          @click="handleExport"
        >
          导出
        </el-button>
      </div>
    </template>

    <el-table
      v-loading="loading"
      :data="tableData"
      stripe
      border
      style="width: 100%"
    >
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="expand-content">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="操作IP">
                {{ row.operatorIp || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="操作地点">
                {{ row.operatorLocation || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="设备类型">
                {{ row.deviceType || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="设备名称">
                {{ row.deviceName || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="请求URL" :span="2">
                <el-text type="info" size="small" style="word-break: break-all">
                  {{ row.requestUrl || '-' }}
                </el-text>
              </el-descriptions-item>
              <el-descriptions-item label="请求方式">
                <el-tag
                  v-if="row.requestMethod"
                  :type="getMethodTagType(row.requestMethod)"
                  size="small"
                >
                  {{ row.requestMethod }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="耗时">
                <el-tag :type="getCostTimeTagType(row.costTime)" size="small">
                  {{ row.costTime || 0 }}ms
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item
                v-if="row.requestParams"
                label="请求参数"
                :span="2"
              >
                <el-text
                  type="info"
                  size="small"
                  style="
                    word-break: break-all;
                    white-space: pre-wrap;
                    font-family: monospace;
                  "
                >
                  {{ formatJson(row.requestParams) }}
                </el-text>
              </el-descriptions-item>
              <el-descriptions-item
                v-if="row.responseResult"
                label="响应结果"
                :span="2"
              >
                <el-text
                  type="info"
                  size="small"
                  style="
                    word-break: break-all;
                    white-space: pre-wrap;
                    font-family: monospace;
                  "
                >
                  {{ formatJson(row.responseResult) }}
                </el-text>
              </el-descriptions-item>
              <el-descriptions-item
                v-if="row.errorMsg"
                label="错误信息"
                :span="2"
              >
                <el-text type="danger" size="small">
                  {{ row.errorMsg }}
                </el-text>
              </el-descriptions-item>
              <el-descriptions-item label="User-Agent" :span="2">
                <el-text type="info" size="small" style="word-break: break-all">
                  {{ row.userAgent || '-' }}
                </el-text>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="id" label="ID" width="80" align="center" />

      <el-table-column prop="module" label="模块" width="120">
        <template #default="{ row }">
          <el-tag type="info" size="small">{{ row.module }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="action" label="操作类型" width="100">
        <template #default="{ row }">
          <el-tag :type="getActionTagType(row.action)" size="small">
            {{ row.action }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        prop="description"
        label="操作描述"
        min-width="200"
        show-overflow-tooltip
      />

      <el-table-column prop="operatorName" label="操作人" width="120" />

      <el-table-column label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        prop="createTime"
        label="操作时间"
        width="160"
        show-overflow-tooltip
      />

      <el-table-column label="操作" width="100" align="center" fixed="right">
        <template #default="{ row }">
          <el-button
            type="primary"
            link
            size="small"
            :icon="View"
            @click="emit('view-detail', row)"
          >
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="paginationData.current"
      v-model:page-size="paginationData.size"
      :total="paginationData.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      class="pagination"
      @size-change="emit('size-change')"
      @current-change="emit('current-change')"
    />
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, View } from '@element-plus/icons-vue'
import type { OperationLogEntity } from '@/api/generated/.ts.schemas'
import { useLogHelpers } from '../composables/useLogHelpers.ts'

interface Pagination {
  current: number
  size: number
  total: number
}

interface Props {
  tableData: OperationLogEntity[]
  loading: boolean
  pagination: Pagination
}

interface Emits {
  (e: 'update:pagination', value: Pagination): void
  (e: 'view-detail', row: OperationLogEntity): void
  (e: 'size-change'): void
  (e: 'current-change'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const paginationData = computed({
  get: () => props.pagination,
  set: (value) => emit('update:pagination', value),
})

const {
  formatJson,
  getActionTagType,
  getMethodTagType,
  getCostTimeTagType,
  getStatusTagType,
  getStatusText,
} = useLogHelpers()

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}
</script>

<style scoped>
.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.expand-content {
  padding: 16px 24px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
