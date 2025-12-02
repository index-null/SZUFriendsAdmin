<template>
  <el-row :gutter="20" class="charts-area">
    <el-col :xs="24" :lg="12">
      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="card-header">
            <span>操作趋势</span>
            <el-radio-group v-model="trendTypeValue" size="small">
              <el-radio-button label="hour">小时</el-radio-button>
              <el-radio-button label="day">天</el-radio-button>
              <el-radio-button label="week">周</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div ref="trendChartRef" class="chart-container"></div>
      </el-card>
    </el-col>

    <el-col :xs="24" :lg="12">
      <el-card shadow="never" class="chart-card">
        <template #header>
          <span>模块分布</span>
        </template>
        <div ref="moduleChartRef" class="chart-container"></div>
      </el-card>
    </el-col>

    <el-col :xs="24" :lg="12">
      <el-card shadow="never" class="chart-card">
        <template #header>
          <span>操作类型分布</span>
        </template>
        <div ref="actionChartRef" class="chart-container"></div>
      </el-card>
    </el-col>

    <el-col :xs="24" :lg="12">
      <el-card shadow="never" class="chart-card">
        <template #header>
          <span>成功率趋势</span>
        </template>
        <div ref="successRateChartRef" class="chart-container"></div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { OperationLogEntity } from '@/api/generated/.ts.schemas'
import { useCharts } from '../composables/useCharts.ts'

interface Props {
  tableData: OperationLogEntity[]
  trendType: 'hour' | 'day' | 'week'
}

interface Emits {
  (e: 'update:trendType', value: 'hour' | 'day' | 'week'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const trendTypeValue = computed({
  get: () => props.trendType,
  set: (value) => emit('update:trendType', value),
})

const trendChartRef = ref<HTMLDivElement>()
const moduleChartRef = ref<HTMLDivElement>()
const actionChartRef = ref<HTMLDivElement>()
const successRateChartRef = ref<HTMLDivElement>()

let trendChart: echarts.ECharts | null = null
let moduleChart: echarts.ECharts | null = null
let actionChart: echarts.ECharts | null = null
let successRateChart: echarts.ECharts | null = null

const {
  generateTrendChartOption,
  generateModuleChartOption,
  generateActionChartOption,
  generateSuccessRateChartOption,
} = useCharts()

const initCharts = () => {
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
  }
  if (moduleChartRef.value) {
    moduleChart = echarts.init(moduleChartRef.value)
  }
  if (actionChartRef.value) {
    actionChart = echarts.init(actionChartRef.value)
  }
  if (successRateChartRef.value) {
    successRateChart = echarts.init(successRateChartRef.value)
  }

  window.addEventListener('resize', handleResize)
}

const updateCharts = () => {
  if (trendChart) {
    const option = generateTrendChartOption(props.trendType)
    trendChart.setOption(option)
  }

  if (moduleChart) {
    const option = generateModuleChartOption(props.tableData)
    moduleChart.setOption(option)
  }

  if (actionChart) {
    const option = generateActionChartOption(props.tableData)
    actionChart.setOption(option)
  }

  if (successRateChart) {
    const option = generateSuccessRateChartOption()
    successRateChart.setOption(option)
  }
}

const handleResize = () => {
  trendChart?.resize()
  moduleChart?.resize()
  actionChart?.resize()
  successRateChart?.resize()
}

// 监听数据变化，更新图表
watch(
  () => [props.tableData, props.trendType],
  () => {
    updateCharts()
  },
  { deep: true },
)

onMounted(() => {
  initCharts()
  updateCharts()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  moduleChart?.dispose()
  actionChart?.dispose()
  successRateChart?.dispose()
})

defineExpose({
  updateCharts,
})
</script>

<style scoped>
.charts-area {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  height: 360px;
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

@media (max-width: 768px) {
  .chart-container {
    height: 280px;
  }
}
</style>
