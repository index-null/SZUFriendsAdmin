<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑权限' : '新增权限'"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-form-item label="父权限" prop="parentId">
        <el-tree-select
          v-model="formData.parentId"
          :data="permissionTreeData"
          :props="treeProps"
          placeholder="选择父权限（留空表示顶级权限）"
          clearable
          check-strictly
          :render-after-expand="false"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="权限编码" prop="permissionCode">
        <el-input
          v-model="formData.permissionCode"
          placeholder="如：user:create、role:page"
          :disabled="isEdit"
        />
      </el-form-item>

      <el-form-item label="权限名称" prop="permissionName">
        <el-input
          v-model="formData.permissionName"
          placeholder="请输入权限名称"
        />
      </el-form-item>

      <el-form-item label="权限类型" prop="permissionType">
        <el-select
          v-model="formData.permissionType"
          placeholder="请选择权限类型"
          style="width: 100%"
        >
          <el-option label="菜单" :value="1" />
          <el-option label="按钮" :value="2" />
          <el-option label="接口" :value="3" />
        </el-select>
      </el-form-item>

      <el-form-item label="URL/路径" prop="url">
        <el-input
          v-model="formData.url"
          placeholder="如：/auth/user、/user-management"
        />
      </el-form-item>

      <el-form-item label="HTTP方法" prop="method">
        <el-select
          v-model="formData.method"
          placeholder="请选择HTTP方法"
          clearable
          style="width: 100%"
        >
          <el-option label="GET" value="GET" />
          <el-option label="POST" value="POST" />
          <el-option label="PUT" value="PUT" />
          <el-option label="DELETE" value="DELETE" />
          <el-option label="PATCH" value="PATCH" />
        </el-select>
      </el-form-item>

      <el-form-item label="权限描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入权限描述"
        />
      </el-form-item>

      <el-form-item label="排序顺序" prop="sortOrder">
        <el-input-number
          v-model="formData.sortOrder"
          :min="0"
          :max="9999"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

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
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type {
  CreatePermissionRequest,
  UpdatePermissionRequest,
  PermissionTreeNodeResponse,
} from '@/api/modules/permission'

interface Props {
  visible: boolean
  data?: PermissionTreeNodeResponse | null
  permissionTree?: PermissionTreeNodeResponse[]
  parentId?: number
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success', data: CreatePermissionRequest | UpdatePermissionRequest): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  data: null,
  permissionTree: () => [],
  parentId: 0,
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const submitLoading = ref(false)

// 使用宽松的内部表单类型
interface FormData {
  id?: number
  parentId: number
  permissionCode: string
  permissionName: string
  permissionType: number
  url?: string
  method?: string
  description?: string
  sortOrder?: number
  status?: number
}

const defaultFormData: FormData = {
  parentId: 0,
  permissionCode: '',
  permissionName: '',
  permissionType: 1,
  url: '',
  method: '',
  description: '',
  sortOrder: 0,
  status: 1,
}

const formData = ref<FormData>({ ...defaultFormData })

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const isEdit = computed(() => !!props.data?.id)

// 树形选择器配置
const treeProps = {
  children: 'children',
  label: 'permissionName',
  value: 'id',
}

// 将权限树转换为树形选择器数据格式
const permissionTreeData = computed(() => {
  const buildTreeData = (
    nodes: PermissionTreeNodeResponse[],
  ): PermissionTreeNodeResponse[] => {
    return nodes.map((node) => ({
      ...node,
      disabled: isEdit.value && node.id === formData.value.id, // 编辑时禁止选择自己
      children: node.children ? buildTreeData(node.children) : [],
    }))
  }

  // 添加顶级选项
  const topOption: PermissionTreeNodeResponse = {
    id: 0,
    permissionName: '顶级权限',
    children: buildTreeData(props.permissionTree || []),
  }

  return [topOption]
})

const rules: FormRules = {
  permissionCode: [
    { required: true, message: '请输入权限编码', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9:_-]+$/,
      message: '只能包含字母、数字、冒号、下划线和中划线',
      trigger: 'blur',
    },
  ],
  permissionName: [
    { required: true, message: '请输入权限名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' },
  ],
  permissionType: [
    { required: true, message: '请选择权限类型', trigger: 'change' },
  ],
  method: [
    {
      pattern: /^(GET|POST|PUT|DELETE|PATCH)?$/,
      message: '请输入有效的HTTP方法',
      trigger: 'blur',
    },
  ],
}

watch(
  () => props.visible,
  (val) => {
    if (val && props.data) {
      // 编辑模式
      formData.value = {
        id: props.data.id,
        parentId: props.data.parentId ?? 0,
        permissionCode: props.data.permissionCode || '',
        permissionName: props.data.permissionName || '',
        permissionType: props.data.permissionType ?? 1,
        url: props.data.url,
        method: props.data.method,
        description: props.data.description,
        sortOrder: props.data.sortOrder,
        status: 1, // 权限树节点没有status字段，默认启用
      }
    } else if (val) {
      // 新增模式
      formData.value = {
        ...defaultFormData,
        parentId: props.parentId ?? 0,
      }
    }
  },
)

const handleClose = () => {
  formRef.value?.resetFields()
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    // 根据是否有 id 构造正确的请求类型
    const submitData = isEdit.value
      ? ({
          id: formData.value.id!,
          parentId: formData.value.parentId,
          permissionCode: formData.value.permissionCode,
          permissionName: formData.value.permissionName,
          permissionType: formData.value.permissionType,
          url: formData.value.url,
          method: formData.value.method,
          description: formData.value.description,
          sortOrder: formData.value.sortOrder,
          status: formData.value.status,
        } as UpdatePermissionRequest)
      : ({
          parentId: formData.value.parentId,
          permissionCode: formData.value.permissionCode,
          permissionName: formData.value.permissionName,
          permissionType: formData.value.permissionType,
          url: formData.value.url,
          method: formData.value.method,
          description: formData.value.description,
          sortOrder: formData.value.sortOrder,
          status: formData.value.status,
        } as CreatePermissionRequest)

    emit('success', submitData)
  } catch (error) {
    ElMessage.warning('请完善表单信息')
  } finally {
    submitLoading.value = false
  }
}

defineExpose({
  formData,
})
</script>

<style scoped>
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

html.dark :deep(.el-dialog__header),
html.dark :deep(.el-dialog__footer) {
  border-color: #4c4d4f;
}
</style>
