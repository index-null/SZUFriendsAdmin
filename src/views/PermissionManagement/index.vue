<template>
  <div class="permission-management">
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span>权限列表</span>
          <div class="actions">
            <el-button
              v-if="hasPermission('permission:create')"
              type="primary"
              :icon="Plus"
              @click="handleAdd()"
            >
              新增顶级权限
            </el-button>
            <el-button @click="toggleExpand">
              {{ isExpanded ? '折叠全部' : '展开全部' }}
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        row-key="id"
        :default-expand-all="isExpanded"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :row-class-name="getRowClassName"
        stripe
      >
        <el-table-column
          prop="permissionCode"
          label="权限编码"
          min-width="200"
        />
        <el-table-column
          prop="permissionName"
          label="权限名称"
          min-width="180"
        />
        <el-table-column label="权限类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getPermissionTypeTag(row.permissionType)"
              size="small"
            >
              {{ getLabel(DICT_TYPE.PERMISSION_TYPE, row.permissionType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 1 ? 'success' : 'danger'"
              size="small"
            >
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="url"
          label="URL/路径"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column
          prop="method"
          label="HTTP方法"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              v-if="row.method"
              :type="getMethodTag(row.method)"
              size="small"
            >
              {{ row.method }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="sortOrder"
          label="排序"
          width="80"
          align="center"
        />
        <el-table-column
          prop="createTime"
          label="创建时间"
          width="160"
          show-overflow-tooltip
        />
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="hasPermission('permission:create')"
              type="primary"
              link
              size="small"
              :icon="CirclePlus"
              @click="handleAdd(row)"
            >
              新增子权限
            </el-button>
            <el-button
              v-if="hasPermission('permission:update')"
              type="primary"
              link
              size="small"
              :icon="Edit"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="hasPermission('permission:delete')"
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
    </el-card>

    <!-- 权限表单对话框 -->
    <PermissionFormDialog
      v-model:visible="formDialogVisible"
      :data="currentPermission"
      :permission-tree="permissionTree"
      :parent-id="selectedParentId"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ElTable } from 'element-plus'
import { Plus, Edit, Delete, CirclePlus } from '@element-plus/icons-vue'
import { usePermission, useDicts } from '@/stores'
import { DICT_TYPE } from '@/utils/dict'
import PermissionFormDialog from './components/PermissionFormDialog.vue'
import type {
  PermissionTreeNodeResponse,
  CreatePermissionRequest,
  UpdatePermissionRequest,
} from '@/api/modules/permission'
import {
  getPermissionTree,
  createPermission,
  updatePermission,
  deletePermission,
} from '@/api/modules/permission'

const { hasPermission } = usePermission()

// 使用字典
const { getLabel } = useDicts([
  DICT_TYPE.PERMISSION_TYPE,
  DICT_TYPE.HTTP_METHOD,
])

const loading = ref(false)
const tableRef = ref<InstanceType<typeof ElTable>>()
const tableData = ref<PermissionTreeNodeResponse[]>([])
const permissionTree = ref<PermissionTreeNodeResponse[]>([])
const isExpanded = ref(false)

const formDialogVisible = ref(false)
const currentPermission = ref<PermissionTreeNodeResponse | null>(null)
const selectedParentId = ref(0)

// 获取权限类型标签颜色
const getPermissionTypeTag = (type?: number) => {
  switch (type) {
    case 1:
      return 'primary'
    case 2:
      return 'success'
    case 3:
      return 'warning'
    default:
      return 'info'
  }
}

// 获取HTTP方法标签颜色
const getMethodTag = (method?: string) => {
  switch (method?.toUpperCase()) {
    case 'GET':
      return 'success'
    case 'POST':
      return 'primary'
    case 'PUT':
      return 'warning'
    case 'DELETE':
      return 'danger'
    case 'PATCH':
      return 'info'
    default:
      return ''
  }
}

// 获取行样式类名
const getRowClassName = ({ row }: { row: PermissionTreeNodeResponse }) => {
  if (row.permissionType === 1) {
    return 'menu-row'
  } else if (row.permissionType === 3) {
    return 'api-row'
  }
  return ''
}

// 切换展开/折叠
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
  if (!tableRef.value) return

  const toggleTreeNode = (nodes: PermissionTreeNodeResponse[]) => {
    nodes.forEach((node) => {
      tableRef.value?.toggleRowExpansion(node, isExpanded.value)
      if (node.children && node.children.length > 0) {
        toggleTreeNode(node.children)
      }
    })
  }

  toggleTreeNode(tableData.value)
}

// 转换树节点为表格数据
const convertTreeToTableData = (
  nodes: PermissionTreeNodeResponse[],
): PermissionTreeNodeResponse[] => {
  return nodes.map((node) => ({
    ...node,
    children: node.children ? convertTreeToTableData(node.children) : undefined,
  }))
}

// 获取权限树数据
const fetchData = async () => {
  loading.value = true
  try {
    const data = await getPermissionTree()
    permissionTree.value = data
    tableData.value = convertTreeToTableData(data)
  } catch (error) {
    ElMessage.error('获取权限数据失败')
    tableData.value = []
  } finally {
    loading.value = false
  }
}

// 新增权限
const handleAdd = (row?: PermissionTreeNodeResponse) => {
  currentPermission.value = null
  selectedParentId.value = row?.id ?? 0
  formDialogVisible.value = true
}

// 编辑权限
const handleEdit = (row: PermissionTreeNodeResponse) => {
  currentPermission.value = { ...row }
  formDialogVisible.value = true
}

// 删除权限
const handleDelete = async (row: PermissionTreeNodeResponse) => {
  // 统计子权限数量
  const countChildren = (node: PermissionTreeNodeResponse): number => {
    if (!node.children || node.children.length === 0) return 0
    return (
      node.children.length +
      node.children.reduce(
        (sum: number, child: PermissionTreeNodeResponse) =>
          sum + countChildren(child),
        0,
      )
    )
  }

  const childrenCount = countChildren(row)
  const warningMessage =
    childrenCount > 0
      ? `确定要删除权限 "${row.permissionName}" 吗？\n此操作将同时删除其 ${childrenCount} 个子权限，且不可恢复！`
      : `确定要删除权限 "${row.permissionName}" 吗？`

  try {
    await ElMessageBox.confirm(warningMessage, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: true,
    })

    loading.value = true
    await deletePermission(row.id!)
    ElMessage.success('删除成功')
    await fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 表单提交成功
const handleFormSuccess = async (
  data: CreatePermissionRequest | UpdatePermissionRequest,
) => {
  loading.value = true
  try {
    if ('id' in data) {
      await updatePermission(data)
      ElMessage.success('更新成功')
    } else {
      await createPermission(data)
      ElMessage.success('创建成功')
    }
    formDialogVisible.value = false
    await fetchData()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.permission-management {
  padding: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions {
  display: flex;
  gap: 10px;
}

:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-card__body) {
  padding: 20px;
}

html.dark :deep(.el-card__header) {
  border-bottom-color: #4c4d4f;
}

:deep(.menu-row) {
  background-color: #f0f9ff;
}

:deep(.api-row) {
  background-color: #fefce8;
}

html.dark :deep(.menu-row) {
  background-color: rgba(59, 130, 246, 0.1);
}

html.dark :deep(.api-row) {
  background-color: rgba(234, 179, 8, 0.1);
}
</style>
