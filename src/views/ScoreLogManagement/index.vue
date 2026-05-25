<template>
  <div class="score-log-management">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户姓名">
          <el-input
            v-model="searchForm.realName"
            placeholder="请输入用户真实姓名"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input
            v-model="searchForm.phone"
            placeholder="请输入手机号"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="行为标识">
          <el-select
            v-model="searchForm.actionCode"
            placeholder="请选择行为标识"
            clearable
            filterable
            @change="handleSearch"
          >
            <el-option
              v-for="item in ruleDict"
              :key="item.actionCode"
              :label="item.actionName"
              :value="item.actionCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="流水类型">
          <el-select
            v-model="searchForm.logType"
            placeholder="请选择流水类型"
            clearable
            @change="handleSearch"
          >
            <el-option label="系统奖励" :value="1" />
            <el-option label="积分消耗" :value="2" />
            <el-option label="后台人工操作" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.timeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD HH:mm:ss"
            @change="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch"
            >搜索</el-button
          >
          <el-button :icon="RefreshRight" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <div class="table-header">
        <h3>积分流水记录</h3>
        <div class="table-stats">
          <el-tag type="info">共 {{ pagination.total }} 条记录</el-tag>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="80" align="center" />
        <el-table-column
          prop="userId"
          label="用户ID"
          width="100"
          align="center"
        />
        <el-table-column
          prop="realName"
          label="用户姓名"
          width="120"
          align="center"
        />
        <el-table-column
          prop="phone"
          label="手机号"
          width="150"
          align="center"
        />
        <el-table-column
          prop="actionCode"
          label="行为标识"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <el-tag type="info">{{ row.actionCode }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="changeScore"
          label="变动积分"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <span
              :class="{
                'score-positive': row.changeScore > 0,
                'score-negative': row.changeScore < 0,
              }"
            >
              {{ row.changeScore > 0 ? '+' : '' }}{{ row.changeScore }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="afterScore"
          label="变动后余额"
          width="130"
          align="center"
        >
          <template #default="{ row }">
            <el-tag type="success">{{ row.afterScore || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="logType"
          label="流水类型"
          width="130"
          align="center"
        >
          <template #default="{ row }">
            <el-tag :type="getLogTypeTag(row.logType)">
              {{ getLogTypeLabel(row.logType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="relationId"
          label="关联业务ID"
          width="130"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="remark"
          label="备注"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="createTime"
          label="创建时间"
          width="180"
          align="center"
        />
      </el-table>

      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, RefreshRight } from '@element-plus/icons-vue'
import { usePermission } from '@/stores'
import { get as getScoreRuleApi } from '@/api/generated/后台积分获取配置管理/后台积分获取配置管理'
import { get as getScoreLogApi } from '@/api/generated/后台积分流水管理/后台积分流水管理'
import type {
  ScoreLogPageResponse,
  ScoreLogPagesRequest,
  ScoreRuleDictResponse,
} from '@/api/generated/.ts.schemas'

const { hasPermission } = usePermission()

// API 实例
const scoreRuleApi = getScoreRuleApi()
const scoreLogApi = getScoreLogApi()

// 路由
const route = useRoute()
const router = useRouter()

// 规则字典（用于下拉框）
const ruleDict = ref<ScoreRuleDictResponse[]>([])

// 搜索表单
const searchForm = reactive({
  realName: '',
  phone: '',
  actionCode: undefined as string | undefined,
  logType: undefined as number | undefined,
  timeRange: undefined as string[] | undefined,
  userId: undefined as number | undefined,
})

// 分页参数
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})

// 表格数据
const tableData = ref<ScoreLogPageResponse[]>([])
const loading = ref(false)

// 流水类型映射
const getLogTypeTag = (type?: number) => {
  const map: Record<number, 'success' | 'warning' | 'info' | 'danger'> = {
    1: 'success',
    2: 'warning',
    3: 'info',
  }
  return type ? map[type] || 'info' : 'info'
}

const getLogTypeLabel = (type?: number) => {
  const map: Record<number, string> = {
    1: '系统奖励',
    2: '积分消耗',
    3: '后台人工操作',
  }
  return type ? map[type] || '未知' : '-'
}

// 获取规则字典
const fetchRuleDict = async () => {
  try {
    const response = await scoreRuleApi.getManagerScoreRuleDict()
    if (response?.length) {
      ruleDict.value = response || []
    }
  } catch (error) {
    console.error('获取规则字典失败:', error)
  }
}

// 获取流水列表
const fetchLogList = async () => {
  loading.value = true
  try {
    const params: ScoreLogPagesRequest = {
      current: pagination.current,
      size: pagination.size,
      userId: searchForm.userId,
      realName: searchForm.realName || undefined,
      phone: searchForm.phone || undefined,
      actionCode: searchForm.actionCode,
      logType: searchForm.logType,
      startTime: searchForm.timeRange ? searchForm.timeRange[0] : undefined,
      endTime: searchForm.timeRange ? searchForm.timeRange[1] : undefined,
    }
    const response = await scoreLogApi.postManagerScoreLogPage(params)

    if (response?.records) {
      tableData.value = response.records || []
      pagination.total = response.total || 0
      pagination.current = response.current || 1
      pagination.size = response.size || 10
    } else {
      tableData.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取积分流水失败:', error)
    ElMessage.error('获取积分流水失败')
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchLogList()
}

// 重置
const handleReset = () => {
  searchForm.realName = ''
  searchForm.phone = ''
  searchForm.actionCode = undefined
  searchForm.logType = undefined
  searchForm.timeRange = undefined
  searchForm.userId = undefined
  router.replace({ query: {} })
  pagination.current = 1
  fetchLogList()
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  fetchLogList()
}

const handleCurrentChange = (page: number) => {
  pagination.current = page
  fetchLogList()
}

// 从路由参数读取 userId
const loadUserIdFromRoute = () => {
  const userId = route.query.userId
  if (userId) {
    searchForm.userId = Number(userId)
  } else {
    searchForm.userId = undefined
  }
}

// 初始化
onMounted(() => {
  if (hasPermission('score-log:page')) {
    loadUserIdFromRoute()
    fetchRuleDict()
    fetchLogList()
  } else {
    ElMessage.warning('您没有权限访问积分流水管理')
  }
})

// 监听路由参数变化
watch(
  () => route.query.userId,
  () => {
    loadUserIdFromRoute()
    handleSearch()
  },
)
</script>

<style scoped>
.score-log-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 0;
}

.table-card {
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.score-positive {
  color: #67c23a;
  font-weight: 600;
}

.score-negative {
  color: #f56c6c;
  font-weight: 600;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
