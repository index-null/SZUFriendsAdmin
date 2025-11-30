<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑角色' : '新增角色'"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      status-icon
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="角色编码" prop="roleCode">
            <el-input
              v-model="formData.roleCode"
              placeholder="请输入角色编码"
              :disabled="isEdit"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="角色名称" prop="roleName">
            <el-input
              v-model="formData.roleName"
              placeholder="请输入角色名称"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="排序顺序" prop="sortOrder">
            <el-input-number
              v-model="formData.sortOrder"
              :min="0"
              :max="9999"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio
                v-for="item in statusOptions"
                :key="item.value"
                :label="Number(item.value)"
              >
                {{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="角色描述" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="4"
              placeholder="请输入角色描述"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>
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
  RoleResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
} from '@/api/modules/role'
import { useDict } from '@/stores/composables/useDict'
import { DICT_TYPE } from '@/utils/dict'

const { dictOptions: statusOptions } = useDict(DICT_TYPE.STATUS)

interface Props {
  visible: boolean
  data?: RoleResponse | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success', data: CreateRoleRequest | UpdateRoleRequest): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  data: null,
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const submitLoading = ref(false)

// 使用一个更宽松的内部表单类型
interface FormData {
  id?: number
  roleCode: string
  roleName: string
  description?: string
  sortOrder?: number
  status?: number
}

const defaultFormData: FormData = {
  roleCode: '',
  roleName: '',
  description: '',
  sortOrder: 0,
  status: 1,
}

const formData = ref<FormData>({
  ...defaultFormData,
})

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const isEdit = computed(() => !!props.data?.id)

const rules: FormRules = {
  roleCode: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_-]+$/,
      message: '只能包含字母、数字、下划线和中划线',
      trigger: 'blur',
    },
  ],
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' },
  ],
  sortOrder: [
    { type: 'number', message: '排序顺序必须是数字', trigger: 'blur' },
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

watch(
  () => props.visible,
  (val) => {
    if (val && props.data) {
      formData.value = {
        id: props.data.id,
        roleCode: props.data.roleCode || '',
        roleName: props.data.roleName || '',
        description: props.data.description,
        sortOrder: props.data.sortOrder,
        status: props.data.status,
      }
    } else if (val) {
      formData.value = { ...defaultFormData }
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
          roleCode: formData.value.roleCode,
          roleName: formData.value.roleName,
          description: formData.value.description,
          sortOrder: formData.value.sortOrder,
          status: formData.value.status,
        } as UpdateRoleRequest)
      : ({
          roleCode: formData.value.roleCode,
          roleName: formData.value.roleName,
          description: formData.value.description,
          sortOrder: formData.value.sortOrder,
          status: formData.value.status,
        } as CreateRoleRequest)

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
.el-row {
  margin-bottom: 18px;
}

.el-row:last-child {
  margin-bottom: 0;
}

:deep(.el-form-item) {
  margin-bottom: 0;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-dialog__body) {
  max-height: 65vh;
  overflow-y: auto;
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
</style>
