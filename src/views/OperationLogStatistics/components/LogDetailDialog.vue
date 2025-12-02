<template>
  <el-dialog
    v-model="visible"
    title="操作日志详情"
    width="800px"
    :close-on-click-modal="false"
  >
    <el-descriptions v-if="log" :column="2" border>
      <el-descriptions-item label="ID">
        {{ log.id }}
      </el-descriptions-item>
      <el-descriptions-item label="操作时间">
        {{ log.createTime }}
      </el-descriptions-item>
      <el-descriptions-item label="功能模块">
        <el-tag type="info">{{ log.module }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="操作类型">
        <el-tag :type="getActionTagType(log.action)">
          {{ log.action }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="操作描述" :span="2">
        {{ log.description }}
      </el-descriptions-item>
      <el-descriptions-item label="操作人ID">
        {{ log.operatorId }}
      </el-descriptions-item>
      <el-descriptions-item label="操作人">
        {{ log.operatorName }}
      </el-descriptions-item>
      <el-descriptions-item label="操作IP">
        {{ log.operatorIp }}
      </el-descriptions-item>
      <el-descriptions-item label="操作地点">
        {{ log.operatorLocation || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="设备类型">
        {{ log.deviceType }}
      </el-descriptions-item>
      <el-descriptions-item label="设备名称">
        {{ log.deviceName }}
      </el-descriptions-item>
      <el-descriptions-item label="请求URL" :span="2">
        {{ log.requestUrl }}
      </el-descriptions-item>
      <el-descriptions-item label="请求方式">
        <el-tag :type="getMethodTagType(log.requestMethod)" size="small">
          {{ log.requestMethod }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="getStatusTagType(log.status)" size="small">
          {{ getStatusText(log.status) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="耗时" :span="2">
        <el-tag :type="getCostTimeTagType(log.costTime)" size="small">
          {{ log.costTime }}ms
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item v-if="log.requestParams" label="请求参数" :span="2">
        <pre class="json-content">{{ formatJson(log.requestParams) }}</pre>
      </el-descriptions-item>
      <el-descriptions-item
        v-if="log.responseResult"
        label="响应结果"
        :span="2"
      >
        <pre class="json-content">{{ formatJson(log.responseResult) }}</pre>
      </el-descriptions-item>
      <el-descriptions-item v-if="log.errorMsg" label="错误信息" :span="2">
        <el-text type="danger">{{ log.errorMsg }}</el-text>
      </el-descriptions-item>
      <el-descriptions-item label="User-Agent" :span="2">
        {{ log.userAgent }}
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { OperationLogEntity } from '@/api/generated/.ts.schemas'
import { useLogHelpers } from '../composables/useLogHelpers.ts'

interface Props {
  modelValue: boolean
  log: OperationLogEntity | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const {
  formatJson,
  getActionTagType,
  getMethodTagType,
  getCostTimeTagType,
  getStatusTagType,
  getStatusText,
} = useLogHelpers()
</script>

<style scoped>
.json-content {
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.6;
  max-height: 300px;
  overflow-y: auto;
  font-family: 'Courier New', Courier, monospace;
}

html.dark .json-content {
  background-color: #262727;
  color: #e5eaf3;
}
</style>
