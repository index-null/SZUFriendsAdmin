<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑字段' : '新增字段'"
    width="600px"
    @update:model-value="$emit('update:visible', $event)"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="字段编码" prop="fieldCode">
        <el-input
          v-model="form.fieldCode"
          placeholder="请输入字段编码（如：mood）"
          :disabled="isEdit"
        />
        <div class="form-tip">编码用于系统标识，创建后不可修改</div>
      </el-form-item>
      <el-form-item label="字段名称" prop="fieldName">
        <el-input
          v-model="form.fieldName"
          placeholder="请输入字段名称（如：心情）"
        />
      </el-form-item>
      <el-form-item label="字段类型" prop="fieldType">
        <el-radio-group v-model="form.fieldType" :disabled="isEdit">
          <el-radio value="TEXT">文本输入</el-radio>
          <el-radio value="SELECT">下拉选择</el-radio>
        </el-radio-group>
        <div class="form-tip">
          文本输入：用户自由输入文字；下拉选择：用户从预设选项中选择
        </div>
      </el-form-item>
      <el-form-item label="是否必填" prop="isRequired">
        <el-switch v-model="form.isRequired" />
      </el-form-item>
      <el-form-item label="默认值" prop="defaultValue">
        <el-input
          v-model="form.defaultValue"
          placeholder="请输入默认值（可选）"
        />
      </el-form-item>
      <el-form-item label="提示文本" prop="placeholder">
        <el-input v-model="form.placeholder" placeholder="请输入占位提示文本" />
        <div class="form-tip">输入框为空时显示的提示文字</div>
      </el-form-item>
      <el-form-item label="排序号" prop="sortOrder">
        <el-input-number
          v-model="form.sortOrder"
          :min="0"
          :max="9999"
          controls-position="right"
        />
        <div class="form-tip">数值越小越靠前</div>
      </el-form-item>
      <el-form-item label="是否启用" prop="isEnabled">
        <el-switch v-model="form.isEnabled" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { get as getTemplateApi } from '@/api/generated/帖子模板管理/帖子模板管理'
import type {
  TemplateFieldResponse,
  TemplateFieldRequest,
  TemplateFieldRequestFieldType,
} from '@/api/generated/.ts.schemas'

interface Props {
  visible: boolean
  isEdit: boolean
  fieldData?: TemplateFieldResponse
  templateCode: string
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const templateApi = getTemplateApi()

const formRef = ref<FormInstance>()
const submitLoading = ref(false)

const form = reactive<{
  fieldCode: string
  fieldName: string
  fieldType: TemplateFieldRequestFieldType
  isRequired: boolean
  defaultValue: string
  placeholder: string
  sortOrder: number
  isEnabled: boolean
}>({
  fieldCode: '',
  fieldName: '',
  fieldType: 'TEXT',
  isRequired: false,
  defaultValue: '',
  placeholder: '',
  sortOrder: 0,
  isEnabled: true,
})

const rules: FormRules = {
  fieldCode: [
    { required: true, message: '请输入字段编码', trigger: 'blur' },
    {
      pattern: /^[a-z_]+$/,
      message: '只能包含小写字母和下划线',
      trigger: 'blur',
    },
  ],
  fieldName: [{ required: true, message: '请输入字段名称', trigger: 'blur' }],
  fieldType: [{ required: true, message: '请选择字段类型', trigger: 'change' }],
  sortOrder: [{ required: true, message: '请输入排序号', trigger: 'blur' }],
}

// 监听打开对话框，初始化表单
watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.isEdit && props.fieldData) {
        Object.assign(form, {
          fieldCode: props.fieldData.fieldCode || '',
          fieldName: props.fieldData.fieldName || '',
          fieldType: props.fieldData.fieldType || 'TEXT',
          isRequired: props.fieldData.isRequired ?? false,
          defaultValue: props.fieldData.defaultValue || '',
          placeholder: props.fieldData.placeholder || '',
          sortOrder: props.fieldData.sortOrder || 0,
          isEnabled: props.fieldData.isEnabled ?? true,
        })
      } else {
        Object.assign(form, {
          fieldCode: '',
          fieldName: '',
          fieldType: 'TEXT',
          isRequired: false,
          defaultValue: '',
          placeholder: '',
          sortOrder: 0,
          isEnabled: true,
        })
      }
    }
  },
)

const handleClose = () => {
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  if (!props.templateCode) {
    ElMessage.error('模板编码不能为空')
    return
  }

  try {
    await formRef.value.validate()
    submitLoading.value = true

    const requestData: TemplateFieldRequest = {
      templateCode: props.templateCode,
      fieldCode: form.fieldCode,
      fieldName: form.fieldName,
      fieldType: form.fieldType,
      isRequired: form.isRequired,
      defaultValue: form.defaultValue || undefined,
      placeholder: form.placeholder || undefined,
      sortOrder: form.sortOrder,
      isEnabled: form.isEnabled,
    }

    if (props.isEdit && props.fieldData?.id) {
      await templateApi.putManagerTemplatesFieldsId(
        props.fieldData.id,
        requestData,
      )
      ElMessage.success('修改成功')
    } else {
      await templateApi.postManagerTemplatesFields(requestData)
      ElMessage.success('新增成功')
    }

    emit('update:visible', false)
    emit('success')
  } catch (error) {
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}
</script>

<style scoped>
.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  margin-top: 4px;
}
</style>
