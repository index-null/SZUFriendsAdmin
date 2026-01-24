<template>
  <el-dialog
    :model-value="visible"
    :title="`管理选项 - ${field?.fieldName || ''}`"
    width="800px"
    @update:model-value="$emit('update:visible', $event)"
    @open="loadOptions"
  >
    <div class="option-dialog-content">
      <div class="option-header">
        <span class="option-hint">
          管理「{{ field?.fieldName }}」字段的下拉选项
        </span>
        <el-button type="primary" size="small" @click="handleAddOption">
          <el-icon><Plus /></el-icon>
          新增选项
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="options"
        stripe
        border
        class="option-table"
        :default-sort="{ prop: 'sortOrder', order: 'ascending' }"
      >
        <el-table-column prop="label" label="选项标签" min-width="120">
          <template #default="{ row }">
            <span v-if="editingId !== row.id">{{ row.label }}</span>
            <el-input
              v-else
              v-model="editForm.optionLabel"
              size="small"
              placeholder="选项标签"
            />
          </template>
        </el-table-column>
        <el-table-column prop="value" label="选项值" min-width="100">
          <template #default="{ row }">
            <span v-if="editingId !== row.id">{{ row.value }}</span>
            <el-input
              v-else
              v-model="editForm.optionValue"
              size="small"
              placeholder="选项值"
            />
          </template>
        </el-table-column>
        <el-table-column prop="icon" label="图标" width="100">
          <template #default="{ row }">
            <span v-if="editingId !== row.id">{{ row.icon || '-' }}</span>
            <el-input
              v-else
              v-model="editForm.optionIcon"
              size="small"
              placeholder="图标"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="sortOrder"
          label="排序"
          width="100"
          align="center"
          sortable
        >
          <template #default="{ row }">
            <span v-if="editingId !== row.id">{{ row.sortOrder }}</span>
            <el-input-number
              v-else
              v-model="editForm.sortOrder"
              size="small"
              :min="0"
              :max="9999"
              controls-position="right"
              style="width: 80px"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="isEnabled"
          label="状态"
          width="80"
          align="center"
        >
          <template #default="{ row }">
            <el-switch
              v-if="editingId !== row.id"
              :model-value="row.isEnabled"
              size="small"
              @change="(val: boolean) => handleToggleStatus(row, val)"
            />
            <el-switch v-else v-model="editForm.isEnabled" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <template v-if="editingId !== row.id">
              <el-button
                type="primary"
                link
                size="small"
                @click="handleEditOption(row)"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                link
                size="small"
                @click="handleDeleteOption(row)"
              >
                删除
              </el-button>
            </template>
            <template v-else>
              <el-button
                type="success"
                link
                size="small"
                :loading="saveLoading"
                @click="handleSaveOption"
              >
                保存
              </el-button>
              <el-button
                type="info"
                link
                size="small"
                @click="handleCancelEdit"
              >
                取消
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && options.length === 0"
        description="暂无选项，请点击上方按钮新增"
      />

      <!-- 新增选项表单 -->
      <el-collapse v-model="showAddForm" class="add-form-collapse">
        <el-collapse-item name="add">
          <template #title>
            <span class="add-form-title">新增选项</span>
          </template>
          <el-form
            ref="addFormRef"
            :model="addForm"
            :rules="addRules"
            label-width="80px"
            class="add-form"
          >
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="选项标签" prop="optionLabel">
                  <el-input
                    v-model="addForm.optionLabel"
                    placeholder="如：开心"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="选项值" prop="optionValue">
                  <el-input
                    v-model="addForm.optionValue"
                    placeholder="如：happy"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="图标" prop="optionIcon">
                  <el-input v-model="addForm.optionIcon" placeholder="可选" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="排序号" prop="sortOrder">
                  <el-input-number
                    v-model="addForm.sortOrder"
                    :min="0"
                    :max="9999"
                    controls-position="right"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="是否启用" prop="isEnabled">
                  <el-switch v-model="addForm.isEnabled" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item>
                  <el-button
                    type="primary"
                    :loading="addLoading"
                    @click="handleSubmitAdd"
                  >
                    添加
                  </el-button>
                  <el-button @click="handleResetAdd">重置</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </div>

    <template #footer>
      <el-button @click="$emit('update:visible', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
} from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { get as getTemplateApi } from '@/api/generated/帖子模板管理/帖子模板管理'
import type {
  TemplateFieldResponse,
  FieldOptionResponse,
  TemplateFieldOptionRequest,
} from '@/api/generated/.ts.schemas'

interface Props {
  visible: boolean
  field?: TemplateFieldResponse
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const templateApi = getTemplateApi()

// 选项分组（使用字段编码作为分组标识）
const optionGroup = computed(() => props.field?.fieldCode || '')

// 选项列表
const options = ref<FieldOptionResponse[]>([])
const loading = ref(false)

// 编辑状态
const editingId = ref<number | null>(null)
const editForm = reactive<TemplateFieldOptionRequest>({
  optionGroup: '',
  optionValue: '',
  optionLabel: '',
  optionIcon: '',
  sortOrder: 0,
  isEnabled: true,
})
const saveLoading = ref(false)

// 新增表单
const showAddForm = ref<string[]>([])
const addFormRef = ref<FormInstance>()
const addForm = reactive<TemplateFieldOptionRequest>({
  optionGroup: '',
  optionValue: '',
  optionLabel: '',
  optionIcon: '',
  sortOrder: 0,
  isEnabled: true,
})
const addLoading = ref(false)

const addRules: FormRules = {
  optionLabel: [{ required: true, message: '请输入选项标签', trigger: 'blur' }],
  optionValue: [
    { required: true, message: '请输入选项值', trigger: 'blur' },
    {
      pattern: /^[a-z_0-9]+$/,
      message: '只能包含小写字母、数字和下划线',
      trigger: 'blur',
    },
  ],
  sortOrder: [{ required: true, message: '请输入排序号', trigger: 'blur' }],
}

// 加载选项列表
const loadOptions = async () => {
  if (!optionGroup.value) return

  loading.value = true
  try {
    const response = (await templateApi.getManagerTemplatesOptionsOptionGroup(
      optionGroup.value,
    )) as any
    options.value = response || []
  } catch (error) {
    console.error(error)
    // 如果是404或空数据，设置为空数组
    options.value = []
  } finally {
    loading.value = false
  }
}

// 新增选项按钮
const handleAddOption = () => {
  showAddForm.value = ['add']
  handleResetAdd()
}

// 编辑选项
const handleEditOption = (row: FieldOptionResponse) => {
  editingId.value = row.id!
  Object.assign(editForm, {
    id: row.id,
    optionGroup: optionGroup.value,
    optionValue: row.value || '',
    optionLabel: row.label || '',
    optionIcon: row.icon || '',
    sortOrder: row.sortOrder || 0,
    isEnabled: row.isEnabled ?? true,
  })
}

// 取消编辑
const handleCancelEdit = () => {
  editingId.value = null
}

// 保存编辑
const handleSaveOption = async () => {
  if (!editingId.value) return

  saveLoading.value = true
  try {
    await templateApi.putManagerTemplatesOptionsId(editingId.value, {
      ...editForm,
      optionGroup: optionGroup.value,
    })
    ElMessage.success('保存成功')
    editingId.value = null
    loadOptions()
    emit('success')
  } catch (error) {
    ElMessage.error('保存失败')
    console.error(error)
  } finally {
    saveLoading.value = false
  }
}

// 删除选项
const handleDeleteOption = async (row: FieldOptionResponse) => {
  try {
    await ElMessageBox.confirm(`确定要删除选项「${row.label}」吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await templateApi.deleteManagerTemplatesOptionsId(row.id!)
    ElMessage.success('删除成功')
    loadOptions()
    emit('success')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

// 切换状态
const handleToggleStatus = async (
  row: FieldOptionResponse,
  enabled: boolean,
) => {
  try {
    await templateApi.putManagerTemplatesOptionsIdStatus(row.id!, { enabled })
    ElMessage.success(enabled ? '已启用' : '已禁用')
    row.isEnabled = enabled
  } catch (error) {
    ElMessage.error('状态更新失败')
    console.error(error)
  }
}

// 提交新增
const handleSubmitAdd = async () => {
  if (!addFormRef.value) return

  try {
    await addFormRef.value.validate()
    addLoading.value = true

    await templateApi.postManagerTemplatesOptions({
      ...addForm,
      optionGroup: optionGroup.value,
    })
    ElMessage.success('添加成功')
    handleResetAdd()
    loadOptions()
    emit('success')
  } catch (error) {
    console.error(error)
  } finally {
    addLoading.value = false
  }
}

// 重置新增表单
const handleResetAdd = () => {
  Object.assign(addForm, {
    optionGroup: '',
    optionValue: '',
    optionLabel: '',
    optionIcon: '',
    sortOrder: options.value.length * 10,
    isEnabled: true,
  })
  addFormRef.value?.resetFields()
}
</script>

<style scoped>
.option-dialog-content {
  min-height: 300px;
}

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.option-hint {
  font-size: 14px;
  color: #606266;
}

.option-table {
  margin-bottom: 16px;
}

.add-form-collapse {
  margin-top: 16px;
}

.add-form-title {
  font-weight: 500;
  color: #409eff;
}

.add-form {
  padding: 16px 0;
}
</style>
