<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑学院' : '新增学院'"
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
          <el-form-item label="学院编码" prop="collegeCode">
            <el-input
              v-model="formData.collegeCode"
              placeholder="请输入学院编码"
              :disabled="isEdit"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="学院名称" prop="collegeName">
            <el-input
              v-model="formData.collegeName"
              placeholder="请输入学院名称"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="院长姓名" prop="dean">
            <el-input
              v-model="formData.dean"
              placeholder="请输入院长姓名"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" prop="contactPhone">
            <el-input
              v-model="formData.contactPhone"
              placeholder="请输入联系电话"
              maxlength="20"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="联系邮箱" prop="email">
            <el-input
              v-model="formData.email"
              placeholder="请输入联系邮箱"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
        </el-col>
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
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="学院地址" prop="address">
            <el-input
              v-model="formData.address"
              type="textarea"
              :rows="2"
              placeholder="请输入学院地址"
              maxlength="255"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="学院简介" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入学院简介"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio :label="1">启用</el-radio>
              <el-radio :label="0">禁用</el-radio>
            </el-radio-group>
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
import type { CollegeEntity } from '@/api/modules/college'

interface Props {
  visible: boolean
  data?: CollegeEntity | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success', data: CollegeEntity): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  data: null,
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const submitLoading = ref(false)

const defaultFormData: CollegeEntity = {
  collegeCode: '',
  collegeName: '',
  dean: '',
  contactPhone: '',
  email: '',
  address: '',
  description: '',
  sortOrder: 0,
  status: 1,
}

const formData = ref<CollegeEntity>({ ...defaultFormData })

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const isEdit = computed(() => !!props.data?.id)

const rules: FormRules = {
  collegeCode: [
    { required: true, message: '请输入学院编码', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  collegeName: [
    { required: true, message: '请输入学院名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' },
  ],
  dean: [{ max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }],
  contactPhone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur',
    },
  ],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }],
  sortOrder: [
    { type: 'number', message: '排序顺序必须是数字', trigger: 'blur' },
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

watch(
  () => props.visible,
  (val) => {
    if (val && props.data) {
      formData.value = { ...props.data }
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
    emit('success', formData.value)
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
/* 增加表单行间距 */
.el-row {
  margin-bottom: 18px;
}

/* 最后一行不需要底部间距 */
.el-row:last-child {
  margin-bottom: 0;
}

/* 确保表单项内部间距正常 */
:deep(.el-form-item) {
  margin-bottom: 0;
}

/* 数字输入框宽度100% */
:deep(.el-input-number) {
  width: 100%;
}

/* 对话框内容区域滚动 */
:deep(.el-dialog__body) {
  max-height: 65vh;
  overflow-y: auto;
  padding: 20px 24px;
}

/* 对话框头部样式 */
:deep(.el-dialog__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

/* 对话框底部样式 */
:deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
}
</style>
