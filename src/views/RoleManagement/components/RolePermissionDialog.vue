<template>
  <el-dialog
    v-model="dialogVisible"
    title="角色权限管理"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="permission-dialog-content">
      <el-alert
        v-if="currentRole"
        :title="`为角色 '${currentRole.roleName}' 分配权限`"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
      />

      <el-input
        v-model="filterText"
        placeholder="搜索权限"
        clearable
        prefix-icon="Search"
        style="margin-bottom: 20px"
      />

      <div v-loading="loading" class="tree-container">
        <el-tree
          ref="treeRef"
          :data="permissionTree"
          :props="treeProps"
          :filter-node-method="filterNode"
          node-key="id"
          show-checkbox
          default-expand-all
          :default-checked-keys="defaultCheckedKeys"
          @check="handleCheckChange"
        >
          <template #default="{ node, data }">
            <span class="tree-node-label">
              <span>{{ node.label }}</span>
              <el-tag
                v-if="data.permissionType"
                :type="getPermissionTypeTag(data.permissionType)"
                size="small"
                style="margin-left: 8px"
              >
                {{ getPermissionTypeText(data.permissionType) }}
              </el-tag>
            </span>
          </template>
        </el-tree>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElTree } from 'element-plus'
import type {
  RoleResponse,
  PermissionTreeNodeResponse,
} from '@/api/modules/role'
import { getRolePermissions } from '@/api/modules/role'

interface Props {
  visible: boolean
  role?: RoleResponse | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success', roleId: number, permissionIds: number[]): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  role: null,
})

const emit = defineEmits<Emits>()

const treeRef = ref<InstanceType<typeof ElTree>>()
const loading = ref(false)
const submitLoading = ref(false)
const filterText = ref('')
const permissionTree = ref<PermissionTreeNodeResponse[]>([])
const defaultCheckedKeys = ref<number[]>([])
const currentRole = ref<RoleResponse | null>(null)

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const treeProps = {
  children: 'children',
  label: 'permissionName',
}

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

// 获取权限类型文本
const getPermissionTypeText = (type?: number) => {
  switch (type) {
    case 1:
      return '菜单'
    case 2:
      return '按钮'
    case 3:
      return '接口'
    default:
      return '未知'
  }
}

// 树节点过滤方法
const filterNode = (value: string, data: PermissionTreeNodeResponse) => {
  if (!value) return true
  return (
    data.permissionName?.toLowerCase().includes(value.toLowerCase()) || false
  )
}

// 监听过滤文本变化
watch(filterText, (val) => {
  treeRef.value?.filter(val)
})

// 监听对话框显示状态
watch(
  () => props.visible,
  async (val) => {
    if (val && props.role?.id) {
      currentRole.value = props.role
      await fetchRolePermissions(props.role.id)
    }
  },
)

// 获取角色权限树
const fetchRolePermissions = async (roleId: number) => {
  loading.value = true
  try {
    const data = await getRolePermissions(roleId)
    permissionTree.value = data || []

    // 提取已选中的权限ID（只提取叶子节点）
    defaultCheckedKeys.value = extractCheckedLeafKeys(permissionTree.value)
  } catch (error) {
    ElMessage.error('获取权限数据失败')
    permissionTree.value = []
    defaultCheckedKeys.value = []
  } finally {
    loading.value = false
  }
}

// 提取已选中的叶子节点权限ID
const extractCheckedLeafKeys = (
  nodes: PermissionTreeNodeResponse[],
): number[] => {
  const keys: number[] = []

  const traverse = (node: PermissionTreeNodeResponse) => {
    if (node.hasPermission) {
      // 如果是叶子节点（没有子节点或子节点为空）
      if (!node.children || node.children.length === 0) {
        if (node.id) {
          keys.push(node.id)
        }
      } else {
        // 如果有子节点，继续遍历
        node.children.forEach(traverse)
      }
    }
  }

  nodes.forEach(traverse)
  return keys
}

// 树节点选中状态变化
const handleCheckChange = () => {
  // 可以在这里添加额外的逻辑
}

const handleClose = () => {
  filterText.value = ''
  permissionTree.value = []
  defaultCheckedKeys.value = []
  currentRole.value = null
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (!currentRole.value?.id) {
    ElMessage.warning('角色信息错误')
    return
  }

  try {
    submitLoading.value = true

    // 获取所有选中的节点（包括半选中的父节点）
    const checkedKeys = treeRef.value?.getCheckedKeys() || []
    const halfCheckedKeys = treeRef.value?.getHalfCheckedKeys() || []
    const allPermissionIds = [...checkedKeys, ...halfCheckedKeys] as number[]

    emit('success', currentRole.value.id, allPermissionIds)
  } catch (error) {
    ElMessage.error('提交失败')
  } finally {
    submitLoading.value = false
  }
}

defineExpose({
  fetchRolePermissions,
})
</script>

<style scoped>
.permission-dialog-content {
  min-height: 400px;
}

.tree-container {
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 12px;
}

.tree-node-label {
  display: flex;
  align-items: center;
  flex: 1;
}

:deep(.el-tree-node__content) {
  height: 36px;
}

:deep(.el-dialog__body) {
  padding: 20px 24px;
}

:deep(.el-dialog__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
}

html.dark .tree-container {
  border-color: #4c4d4f;
  background-color: #1a1a1a;
}
</style>
