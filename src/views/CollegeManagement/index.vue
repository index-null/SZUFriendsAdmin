<template>
  <div class="college-management">
    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" :inline="true" label-width="80px">
        <el-form-item label="学院名称">
          <el-input
            v-model="searchForm.collegeName"
            placeholder="请输入学院名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="Number(item.value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span>学院列表</span>
          <div class="actions">
            <el-button
              v-if="hasPermission('college:create')"
              type="primary"
              :icon="Plus"
              @click="handleAdd"
            >
              新增学院
            </el-button>
            <el-button
              v-if="hasPermission('college:delete')"
              type="danger"
              :icon="Delete"
              :disabled="!selectedIds.length"
              @click="handleBatchDelete"
            >
              批量删除
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column
          type="index"
          label="序号"
          width="80"
          :index="
            (index: number) =>
              (pagination.current - 1) * pagination.size + index + 1
          "
        />
        <el-table-column
          prop="collegeName"
          label="学院名称"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="adminAccount"
          label="学院管理员"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column prop="contactPhone" label="联系电话" min-width="120" />
        <el-table-column
          prop="email"
          label="邮箱"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="sortOrder"
          label="排序"
          width="80"
          align="center"
        />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 1 ? 'success' : 'danger'"
              size="small"
            >
              {{ getLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="hasPermission('college:update')"
              type="primary"
              link
              size="small"
              :icon="Edit"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="hasPermission('college:delete')"
              type="danger"
              link
              size="small"
              :icon="Delete"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
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
        @current-change="handlePageChange"
      />
    </el-card>

    <CollegeFormDialog
      v-model:visible="dialogVisible"
      :data="currentRow"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue'
import {
  getCollegePages,
  createCollege,
  updateCollege,
  deleteCollege,
  type CollegeEntity,
  type CollegePagesRequest,
} from '@/api/modules/college'
import { usePermission } from '@/stores'
import { useDict } from '@/stores/composables/useDict'
import { DICT_TYPE } from '@/utils/dict'
import CollegeFormDialog from './components/CollegeFormDialog.vue'

const { hasPermission } = usePermission()
const { getLabel, dictOptions: statusOptions } = useDict(DICT_TYPE.STATUS)

const loading = ref(false)
const dialogVisible = ref(false)
const currentRow = ref<CollegeEntity | null>(null)
const selectedIds = ref<number[]>([])

const searchForm = reactive<CollegePagesRequest>({
  current: 1,
  size: 10,
  collegeName: '',
  status: undefined,
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})

const tableData = ref<CollegeEntity[]>([])

const fetchData = async () => {
  loading.value = true
  try {
    const data = await getCollegePages({
      ...searchForm,
      current: pagination.current,
      size: pagination.size,
    })

    tableData.value = data.records || []
    pagination.total = data.total || 0
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

const handleReset = () => {
  searchForm.collegeName = ''
  searchForm.status = undefined
  handleSearch()
}

const handleAdd = () => {
  currentRow.value = null
  dialogVisible.value = true
}

const handleEdit = (row: CollegeEntity) => {
  currentRow.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = async (row: CollegeEntity) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除学院 "${row.collegeName}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    if (!row.id) return

    await deleteCollege(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    // 用户取消操作或删除失败
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleBatchDelete = async () => {
  if (!selectedIds.value.length) {
    ElMessage.warning('请选择要删除的学院')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个学院吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    loading.value = true
    const deletePromises = selectedIds.value.map((id) => deleteCollege(id))
    const results = await Promise.allSettled(deletePromises)

    const successCount = results.filter((r) => r.status === 'fulfilled').length
    const failCount = results.filter((r) => r.status === 'rejected').length

    if (failCount === 0) {
      ElMessage.success(`成功删除 ${successCount} 个学院`)
    } else {
      ElMessage.warning(`成功删除 ${successCount} 个，失败 ${failCount} 个`)
    }

    fetchData()
  } catch (error) {
    // 用户取消操作
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (selection: CollegeEntity[]) => {
  selectedIds.value = selection.map((item) => item.id!).filter(Boolean)
}

const handleSizeChange = () => {
  fetchData()
}

const handlePageChange = () => {
  fetchData()
}

const handleFormSuccess = async (formData: CollegeEntity) => {
  try {
    const isEdit = !!formData.id
    await (isEdit ? updateCollege(formData) : createCollege(formData))

    ElMessage.success(isEdit ? '更新成功' : '创建成功')
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.college-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  min-height: 600px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.actions {
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .college-management {
    padding: 10px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .actions {
    width: 100%;
    flex-direction: column;
  }

  .actions .el-button {
    width: 100%;
  }
}
</style>
