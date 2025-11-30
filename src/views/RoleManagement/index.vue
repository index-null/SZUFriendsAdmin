<template>
  <div class="role-management">
    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" :inline="true" label-width="80px">
        <el-form-item label="角色编码">
          <el-input
            v-model="searchForm.roleCode"
            placeholder="请输入角色编码"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="角色名称">
          <el-input
            v-model="searchForm.roleName"
            placeholder="请输入角色名称"
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
          <span>角色列表</span>
          <div class="actions">
            <el-button
              v-if="hasPermission('role:create')"
              type="primary"
              :icon="Plus"
              @click="handleAdd"
            >
              新增角色
            </el-button>
            <el-button
              v-if="hasPermission('role:delete')"
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
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="roleCode" label="角色编码" min-width="150" />
        <el-table-column prop="roleName" label="角色名称" min-width="150" />
        <el-table-column
          prop="description"
          label="角色描述"
          min-width="200"
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
        <el-table-column prop="createTime" label="创建时间" min-width="160">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="hasPermission('role:update')"
              type="primary"
              link
              size="small"
              :icon="Edit"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="hasPermission('role:permission:grant')"
              type="warning"
              link
              size="small"
              :icon="Key"
              @click="handleManagePermission(row)"
            >
              权限
            </el-button>
            <el-button
              v-if="hasPermission('role:delete')"
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

    <RoleFormDialog
      v-model:visible="formDialogVisible"
      :data="currentRow"
      @success="handleFormSuccess"
    />

    <RolePermissionDialog
      v-model:visible="permissionDialogVisible"
      :role="currentRow"
      @success="handlePermissionSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Edit,
  Delete,
  Key,
} from '@element-plus/icons-vue'
import {
  getRolePages,
  createRole,
  updateRole,
  deleteRole,
  grantPermissionsToRole,
  type RoleResponse,
  type RoleQueryRequest,
  type CreateRoleRequest,
  type UpdateRoleRequest,
} from '@/api/modules/role'
import { usePermission } from '@/stores'
import { useDict } from '@/stores/composables/useDict'
import { DICT_TYPE } from '@/utils/dict'
import RoleFormDialog from './components/RoleFormDialog.vue'
import RolePermissionDialog from './components/RolePermissionDialog.vue'

const { hasPermission } = usePermission()
const { getLabel, dictOptions: statusOptions } = useDict(DICT_TYPE.STATUS)

const loading = ref(false)
const formDialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const currentRow = ref<RoleResponse | null>(null)
const selectedIds = ref<number[]>([])

const searchForm = reactive<RoleQueryRequest>({
  current: 1,
  size: 10,
  roleCode: '',
  roleName: '',
  status: undefined,
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})

const tableData = ref<RoleResponse[]>([])

const formatDate = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const fetchData = async () => {
  loading.value = true
  try {
    const data = await getRolePages({
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
  searchForm.roleCode = ''
  searchForm.roleName = ''
  searchForm.status = undefined
  handleSearch()
}

const handleAdd = () => {
  currentRow.value = null
  formDialogVisible.value = true
}

const handleEdit = (row: RoleResponse) => {
  currentRow.value = { ...row }
  formDialogVisible.value = true
}

const handleManagePermission = (row: RoleResponse) => {
  currentRow.value = { ...row }
  permissionDialogVisible.value = true
}

const handleDelete = async (row: RoleResponse) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色 "${row.roleName}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    if (!row.id) return

    await deleteRole(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleBatchDelete = async () => {
  if (!selectedIds.value.length) {
    ElMessage.warning('请选择要删除的角色')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个角色吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    loading.value = true
    const deletePromises = selectedIds.value.map((id) => deleteRole(id))
    const results = await Promise.allSettled(deletePromises)

    const successCount = results.filter((r) => r.status === 'fulfilled').length
    const failCount = results.filter((r) => r.status === 'rejected').length

    if (failCount === 0) {
      ElMessage.success(`成功删除 ${successCount} 个角色`)
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

const handleSelectionChange = (selection: RoleResponse[]) => {
  selectedIds.value = selection.map((item) => item.id!).filter(Boolean)
}

const handleSizeChange = () => {
  fetchData()
}

const handlePageChange = () => {
  fetchData()
}

const handleFormSuccess = async (
  formData: CreateRoleRequest | UpdateRoleRequest,
) => {
  try {
    const isEdit = 'id' in formData && !!formData.id
    await (isEdit
      ? updateRole(formData as UpdateRoleRequest)
      : createRole(formData))

    ElMessage.success(isEdit ? '更新成功' : '创建成功')
    formDialogVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handlePermissionSuccess = async (
  roleId: number,
  permissionIds: number[],
) => {
  try {
    await grantPermissionsToRole({ roleId, permissionIds })
    ElMessage.success('权限分配成功')
    permissionDialogVisible.value = false
  } catch (error) {
    ElMessage.error('权限分配失败')
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.role-management {
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
  .role-management {
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
