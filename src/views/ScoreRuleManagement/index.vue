<template>
  <div class="score-rule-management">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="行为名称">
          <el-input
            v-model="searchForm.actionName"
            placeholder="请输入行为名称"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="限制类型">
          <el-select
            v-model="searchForm.limitType"
            placeholder="请选择限制类型"
            clearable
            @change="handleSearch"
          >
            <el-option label="无限制" :value="0" />
            <el-option label="每天一次" :value="1" />
            <el-option label="每天限次" :value="2" />
            <el-option label="终身一次" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            @change="handleSearch"
          >
            <el-option label="启用" :value="1" />
            <el-option label="关闭" :value="0" />
          </el-select>
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
        <h3>积分规则列表</h3>
        <el-button
          v-if="hasPermission('score-rule:create')"
          type="primary"
          :icon="Plus"
          @click="handleAdd"
          >新增规则</el-button
        >
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
          prop="actionCode"
          label="行为标识"
          width="120"
          align="center"
        />
        <el-table-column
          prop="actionName"
          label="行为名称"
          width="150"
          align="center"
        />
        <el-table-column
          prop="score"
          label="单次积分"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag type="success">+{{ row.score }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="limitType"
          label="限制类型"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <el-tag :type="getLimitTypeTag(row.limitType)">
              {{ getLimitTypeLabel(row.limitType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="dailyMaxTimes"
          label="每日上限"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            {{ row.limitType === 2 ? row.dailyMaxTimes || '不限' : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-if="hasPermission('score-rule:update')"
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
            <el-tag
              v-else
              :type="row.status === 1 ? 'success' : 'danger'"
              size="small"
            >
              {{ row.status === 1 ? '启用' : '关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column
          prop="remark"
          label="备注"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="updateTime"
          label="更新时间"
          width="180"
          align="center"
        />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="hasPermission('score-rule:update')"
              type="primary"
              size="small"
              :icon="Edit"
              link
              @click="handleEdit(row)"
              >编辑</el-button
            >
            <el-button
              v-if="hasPermission('score-rule:delete')"
              type="danger"
              size="small"
              :icon="Delete"
              link
              @click="handleDelete(row)"
              >删除</el-button
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="行为标识" prop="actionCode">
          <el-input
            v-model="form.actionCode"
            placeholder="请输入行为标识，如：post、share"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item label="行为名称" prop="actionName">
          <el-input
            v-model="form.actionName"
            placeholder="请输入行为名称，如：发帖奖励"
          />
        </el-form-item>
        <el-form-item label="单次积分" prop="score">
          <el-input-number
            v-model="form.score"
            :min="1"
            :max="9999"
            placeholder="请输入单次积分"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="限制类型" prop="limitType">
          <el-select
            v-model="form.limitType"
            placeholder="请选择限制类型"
            style="width: 100%"
          >
            <el-option label="无限制" :value="0" />
            <el-option label="每天一次" :value="1" />
            <el-option label="每天限次" :value="2" />
            <el-option label="终身一次" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="form.limitType === 2"
          label="每日上限"
          prop="dailyMaxTimes"
        >
          <el-input-number
            v-model="form.dailyMaxTimes"
            :min="1"
            :max="9999"
            placeholder="请输入每日上限次数"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="关闭"
          />
        </el-form-item>
        <el-form-item label="排序序号" prop="sort">
          <el-input-number
            v-model="form.sort"
            :min="0"
            :max="9999"
            placeholder="请输入排序序号"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入备注"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit"
          >确定</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  RefreshRight,
  Plus,
  Edit,
  Delete,
} from '@element-plus/icons-vue'
import { usePermission } from '@/stores'
import { get as getScoreRuleApi } from '@/api/generated/后台积分获取配置管理/后台积分获取配置管理'
import type {
  ScoreRulePageResponse,
  CreateScoreRuleRequest,
  UpdateScoreRuleRequest,
  ScoreRulePagesRequest,
} from '@/api/generated/.ts.schemas'

const { hasPermission } = usePermission()

// API 实例
const scoreRuleApi = getScoreRuleApi()

// 搜索表单
const searchForm = reactive({
  actionName: '',
  limitType: undefined as number | undefined,
  status: undefined as number | undefined,
})

// 分页参数
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})

// 表格数据
const tableData = ref<ScoreRulePageResponse[]>([])
const loading = ref(false)

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新增积分规则')
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref()

// 表单数据
const form = reactive<CreateScoreRuleRequest & { id?: number }>({
  id: undefined,
  actionCode: '',
  actionName: '',
  score: 1,
  limitType: 0,
  dailyMaxTimes: 0,
  status: 1,
  sort: 0,
  remark: '',
})

// 表单验证规则
const rules = {
  actionCode: [{ required: true, message: '请输入行为标识', trigger: 'blur' }],
  actionName: [{ required: true, message: '请输入行为名称', trigger: 'blur' }],
  score: [{ required: true, message: '请输入单次积分', trigger: 'blur' }],
  limitType: [{ required: true, message: '请选择限制类型', trigger: 'change' }],
}

// 限制类型映射
const getLimitTypeTag = (type?: number) => {
  const map: Record<number, 'info' | 'success' | 'warning' | 'danger'> = {
    0: 'info',
    1: 'success',
    2: 'warning',
    3: 'danger',
  }
  return type !== undefined ? map[type] || 'info' : 'info'
}

const getLimitTypeLabel = (type?: number) => {
  const map: Record<number, string> = {
    0: '无限制',
    1: '每天一次',
    2: '每天限次',
    3: '终身一次',
  }
  return type !== undefined ? map[type] || '未知' : '-'
}

// 获取规则列表
const fetchRuleList = async () => {
  loading.value = true
  try {
    const params: ScoreRulePagesRequest = {
      current: pagination.current,
      size: pagination.size,
      actionName: searchForm.actionName || undefined,
      limitType: searchForm.limitType,
      status: searchForm.status,
    }
    const response = await scoreRuleApi.postManagerScoreRulePage(params)

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
    console.error('获取积分规则列表失败:', error)
    ElMessage.error('获取积分规则列表失败')
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchRuleList()
}

// 重置
const handleReset = () => {
  searchForm.actionName = ''
  searchForm.limitType = undefined
  searchForm.status = undefined
  pagination.current = 1
  fetchRuleList()
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  fetchRuleList()
}

const handleCurrentChange = (page: number) => {
  pagination.current = page
  fetchRuleList()
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增积分规则'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: ScoreRulePageResponse) => {
  isEdit.value = true
  dialogTitle.value = '编辑积分规则'
  resetForm()
  form.id = row.id
  form.actionCode = row.actionCode || ''
  form.actionName = row.actionName || ''
  form.score = row.score || 1
  form.limitType = row.limitType || 0
  form.dailyMaxTimes = row.dailyMaxTimes || 0
  form.status = row.status || 1
  form.sort = row.sort || 0
  form.remark = row.remark || ''
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: ScoreRulePageResponse) => {
  if (!row.id) return
  try {
    await ElMessageBox.confirm(
      `确定要删除规则 "${row.actionName}" 吗？删除后不可恢复。`,
      '删除规则',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
    await scoreRuleApi.deleteManagerScoreRuleId(row.id)
    ElMessage.success('删除成功')
    fetchRuleList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除规则失败:', error)
      ElMessage.error('删除规则失败')
    }
  }
}

// 状态变更
const handleStatusChange = async (row: ScoreRulePageResponse) => {
  if (!row.id) return
  try {
    const updateData: UpdateScoreRuleRequest = {
      id: row.id,
      actionCode: row.actionCode || '',
      actionName: row.actionName || '',
      score: row.score || 1,
      limitType: row.limitType || 0,
      dailyMaxTimes: row.dailyMaxTimes || 0,
      status: row.status || 0,
      sort: row.sort || 0,
      remark: row.remark || '',
    }
    await scoreRuleApi.putManagerScoreRule(updateData)
    ElMessage.success(`${row.status === 1 ? '启用' : '关闭'}成功`)
    fetchRuleList()
  } catch (error) {
    console.error('状态变更失败:', error)
    ElMessage.error('状态变更失败')
    // 回滚状态
    row.status = row.status === 1 ? 0 : 1
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    submitLoading.value = true

    if (isEdit.value && form.id) {
      // 编辑
      const updateData: UpdateScoreRuleRequest = {
        id: form.id,
        actionCode: form.actionCode,
        actionName: form.actionName,
        score: form.score,
        limitType: form.limitType,
        dailyMaxTimes: form.limitType === 2 ? form.dailyMaxTimes : 0,
        status: form.status,
        sort: form.sort,
        remark: form.remark,
      }
      await scoreRuleApi.putManagerScoreRule(updateData)
      ElMessage.success('编辑成功')
    } else {
      // 新增
      const createData: CreateScoreRuleRequest = {
        actionCode: form.actionCode,
        actionName: form.actionName,
        score: form.score,
        limitType: form.limitType,
        dailyMaxTimes: form.limitType === 2 ? form.dailyMaxTimes : 0,
        status: form.status,
        sort: form.sort,
        remark: form.remark,
      }
      await scoreRuleApi.postManagerScoreRule(createData)
      ElMessage.success('新增成功')
    }

    dialogVisible.value = false
    fetchRuleList()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败')
  } finally {
    submitLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  form.id = undefined
  form.actionCode = ''
  form.actionName = ''
  form.score = 1
  form.limitType = 0
  form.dailyMaxTimes = 0
  form.status = 1
  form.sort = 0
  form.remark = ''
}

// 对话框关闭
const handleDialogClose = () => {
  resetForm()
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 初始化
onMounted(() => {
  if (hasPermission('score-rule:page')) {
    fetchRuleList()
  } else {
    ElMessage.warning('您没有权限访问积分规则管理')
  }
})
</script>

<style scoped>
.score-rule-management {
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
