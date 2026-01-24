<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑模板' : '新增模板'"
    width="600px"
    @update:model-value="$emit('update:visible', $event)"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="模板编码" prop="templateCode">
        <el-input
          v-model="form.templateCode"
          placeholder="请输入模板编码（如：NORMAL）"
          :disabled="isEdit"
        />
        <div class="form-tip">编码用于系统标识，创建后不可修改</div>
      </el-form-item>
      <el-form-item label="模板名称" prop="templateName">
        <el-input
          v-model="form.templateName"
          placeholder="请输入模板名称（如：普通动态）"
        />
      </el-form-item>
      <el-form-item label="模板图标" prop="templateIcon">
        <el-input
          v-model="form.templateIcon"
          placeholder="请输入图标（可选，支持 emoji）"
        />
        <div class="form-tip">可以使用 emoji 作为图标，如：📝、📢、🎉</div>
      </el-form-item>
      <el-form-item label="模板描述" prop="templateDesc">
        <el-input
          v-model="form.templateDesc"
          type="textarea"
          :rows="3"
          placeholder="请输入模板描述"
        />
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
  TemplateListResponse,
  TemplateConfigRequest,
} from '@/api/generated/.ts.schemas'

interface Props {
  visible: boolean
  isEdit: boolean
  templateData?: TemplateListResponse
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

const form = reactive<TemplateConfigRequest>({
  templateCode: '',
  templateName: '',
  templateIcon: '',
  templateDesc: '',
  sortOrder: 0,
  isEnabled: true,
})

const rules: FormRules = {
  templateCode: [
    { required: true, message: '请输入模板编码', trigger: 'blur' },
    {
      pattern: /^[A-Z_]+$/,
      message: '只能包含大写字母和下划线',
      trigger: 'blur',
    },
  ],
  templateName: [
    { required: true, message: '请输入模板名称', trigger: 'blur' },
  ],
  sortOrder: [{ required: true, message: '请输入排序号', trigger: 'blur' }],
}

// 监听打开对话框，初始化表单
watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.isEdit && props.templateData) {
        Object.assign(form, {
          templateCode: props.templateData.templateCode || '',
          templateName: props.templateData.templateName || '',
          templateIcon: props.templateData.templateIcon || '',
          templateDesc: props.templateData.templateDesc || '',
          sortOrder: props.templateData.sortOrder || 0,
          isEnabled: props.templateData.isEnabled ?? true,
        })
      } else {
        Object.assign(form, {
          templateCode: '',
          templateName: '',
          templateIcon: '',
          templateDesc: '',
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

  try {
    await formRef.value.validate()
    submitLoading.value = true

    const requestData: TemplateConfigRequest = {
      templateCode: form.templateCode,
      templateName: form.templateName,
      templateIcon: form.templateIcon || undefined,
      templateDesc: form.templateDesc || undefined,
      sortOrder: form.sortOrder,
      isEnabled: form.isEnabled,
    }

    if (props.isEdit && props.templateData?.id) {
      await templateApi.putManagerTemplatesId(
        props.templateData.id,
        requestData,
      )
      ElMessage.success('修改成功')
    } else {
      await templateApi.postManagerTemplates(requestData)
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
