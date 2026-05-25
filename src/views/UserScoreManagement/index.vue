<template>
  <div class="user-score-management">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="真实姓名">
          <el-input
            v-model="searchForm.realName"
            placeholder="请输入真实姓名"
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
        <h3>用户积分管理</h3>
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
          label="真实姓名"
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
          prop="availableScore"
          label="可用积分"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <el-tag type="success">{{ row.availableScore || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="totalIncome"
          label="累计收入"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <span class="score-income">{{ row.totalIncome || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="totalExpend"
          label="累计支出"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <span class="score-expend">{{ row.totalExpend || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
          width="180"
          align="center"
        />
        <el-table-column
          prop="updateTime"
          label="更新时间"
          width="180"
          align="center"
        />
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleViewDetail(row)"
              >查看明细</el-button
            >
          </template>
        </el-table-column>
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, RefreshRight } from '@element-plus/icons-vue'
import { usePermission } from '@/stores'
import { get as getUserScoreApi } from '@/api/generated/后台用户积分明细管理/后台用户积分明细管理'
import type {
  UserScorePageResponse,
  UserScorePagesRequest,
} from '@/api/generated/.ts.schemas'

const router = useRouter()
const { hasPermission } = usePermission()

// API 实例
const userScoreApi = getUserScoreApi()

// 搜索表单
const searchForm = reactive({
  realName: '',
  phone: '',
})

// 分页参数
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})

// 表格数据
const tableData = ref<UserScorePageResponse[]>([])
const loading = ref(false)

// 查看积分明细
const handleViewDetail = (row: UserScorePageResponse) => {
  router.push({
    path: '/score-log-management',
    query: { userId: row.userId?.toString() },
  })
}

// 获取用户积分列表
const fetchUserScoreList = async () => {
  loading.value = true
  try {
    const params: UserScorePagesRequest = {
      current: pagination.current,
      size: pagination.size,
      realName: searchForm.realName || undefined,
      phone: searchForm.phone || undefined,
    }
    const response = await userScoreApi.postManagerScoreUserPage(params)

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
    console.error('获取用户积分列表失败:', error)
    ElMessage.error('获取用户积分列表失败')
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchUserScoreList()
}

// 重置
const handleReset = () => {
  searchForm.realName = ''
  searchForm.phone = ''
  pagination.current = 1
  fetchUserScoreList()
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  fetchUserScoreList()
}

const handleCurrentChange = (page: number) => {
  pagination.current = page
  fetchUserScoreList()
}

// 初始化
onMounted(() => {
  if (hasPermission('score-user:page')) {
    fetchUserScoreList()
  } else {
    ElMessage.warning('您没有权限访问用户积分管理')
  }
})
</script>

<style scoped>
.user-score-management {
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

.score-income {
  color: #67c23a;
  font-weight: 600;
}

.score-expend {
  color: #f56c6c;
  font-weight: 600;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
