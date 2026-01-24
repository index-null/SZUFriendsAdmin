<template>
  <div class="template-management">
    <div class="template-header">
      <h2 class="template-title">帖子模板管理</h2>
      <div class="template-actions">
        <el-input
          v-model="searchQuery"
          placeholder="搜索模板名称/编码"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleAddTemplate">
          <el-icon><Plus /></el-icon>
          新增模板
        </el-button>
      </div>
    </div>

    <el-splitter class="template-splitter">
      <el-splitter-panel :size="400" :min="300" :max="600">
        <div class="template-master-panel">
          <div class="panel-header">
            <h3>模板列表</h3>
            <span class="panel-count">{{ filteredTemplates.length }} 项</span>
          </div>

          <el-scrollbar class="panel-content">
            <div v-loading="loading" class="template-list">
              <div
                v-for="template in filteredTemplates"
                :key="template.id"
                :class="[
                  'template-item',
                  { active: selectedTemplate?.id === template.id },
                ]"
                @click="handleSelectTemplate(template)"
              >
                <div class="template-item-main">
                  <div class="template-item-header">
                    <div class="template-name-row">
                      <span v-if="template.templateIcon" class="template-icon">
                        {{ template.templateIcon }}
                      </span>
                      <h4 class="template-name">{{ template.templateName }}</h4>
                    </div>
                    <div class="template-actions-mini">
                      <el-switch
                        :model-value="template.isEnabled"
                        size="small"
                        @click.stop
                        @change="
                          (val: boolean) => handleToggleStatus(template, val)
                        "
                      />
                      <el-button
                        type="primary"
                        link
                        size="small"
                        @click.stop="handleEditTemplate(template)"
                      >
                        <el-icon><Edit /></el-icon>
                      </el-button>
                      <el-button
                        type="danger"
                        link
                        size="small"
                        @click.stop="handleDeleteTemplate(template)"
                      >
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </div>
                  <div class="template-item-meta">
                    <el-tag size="small" type="info">{{
                      template.templateCode
                    }}</el-tag>
                    <el-tag
                      size="small"
                      :type="template.isEnabled ? 'success' : 'danger'"
                    >
                      {{ template.isEnabled ? '启用' : '禁用' }}
                    </el-tag>
                    <span class="template-sort"
                      >排序: {{ template.sortOrder }}</span
                    >
                  </div>
                  <p v-if="template.templateDesc" class="template-item-desc">
                    {{ template.templateDesc }}
                  </p>
                </div>
              </div>

              <el-empty
                v-if="!loading && filteredTemplates.length === 0"
                description="暂无模板数据"
              />
            </div>
          </el-scrollbar>
        </div>
      </el-splitter-panel>

      <el-splitter-panel>
        <div class="template-detail-panel">
          <div v-if="selectedTemplate && templateDetail" class="detail-content">
            <div class="detail-header">
              <div class="detail-header-main">
                <span v-if="templateDetail.templateIcon" class="detail-icon">
                  {{ templateDetail.templateIcon }}
                </span>
                <h3>{{ templateDetail.templateName }}</h3>
                <el-tag type="success">{{
                  templateDetail.templateCode
                }}</el-tag>
              </div>
              <el-button type="primary" @click="handleAddField">
                <el-icon><Plus /></el-icon>
                新增字段
              </el-button>
            </div>

            <div class="detail-body">
              <el-table
                v-loading="fieldsLoading"
                :data="templateDetail.fields || []"
                stripe
                class="fields-table"
                :default-sort="{ prop: 'sortOrder', order: 'ascending' }"
              >
                <el-table-column
                  prop="fieldName"
                  label="字段名称"
                  min-width="120"
                />
                <el-table-column
                  prop="fieldCode"
                  label="字段编码"
                  min-width="100"
                />
                <el-table-column
                  prop="fieldType"
                  label="类型"
                  width="100"
                  align="center"
                >
                  <template #default="{ row }">
                    <el-tag
                      :type="row.fieldType === 'SELECT' ? 'warning' : 'info'"
                      size="small"
                    >
                      {{ row.fieldType === 'SELECT' ? '下拉选择' : '文本输入' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="isRequired"
                  label="必填"
                  width="80"
                  align="center"
                >
                  <template #default="{ row }">
                    <el-tag
                      :type="row.isRequired ? 'danger' : 'info'"
                      size="small"
                    >
                      {{ row.isRequired ? '是' : '否' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="placeholder"
                  label="提示文本"
                  min-width="120"
                  show-overflow-tooltip
                />
                <el-table-column
                  prop="sortOrder"
                  label="排序"
                  width="80"
                  align="center"
                  sortable
                />
                <el-table-column
                  prop="isEnabled"
                  label="状态"
                  width="80"
                  align="center"
                >
                  <template #default="{ row }">
                    <el-switch
                      :model-value="row.isEnabled"
                      size="small"
                      @change="
                        (val: boolean) => handleToggleFieldStatus(row, val)
                      "
                    />
                  </template>
                </el-table-column>
                <el-table-column
                  label="操作"
                  width="150"
                  fixed="right"
                  align="center"
                >
                  <template #default="{ row }">
                    <el-button
                      v-if="row.fieldType === 'SELECT'"
                      type="warning"
                      link
                      size="small"
                      @click="handleManageOptions(row)"
                    >
                      选项
                    </el-button>
                    <el-button
                      type="primary"
                      link
                      size="small"
                      @click="handleEditField(row)"
                    >
                      编辑
                    </el-button>
                    <el-button
                      type="danger"
                      link
                      size="small"
                      @click="handleDeleteField(row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <el-empty
                v-if="
                  !fieldsLoading &&
                  (!templateDetail.fields || templateDetail.fields.length === 0)
                "
                description="暂无字段配置，点击上方按钮新增"
                class="empty-state"
              />
            </div>
          </div>

          <div v-else class="detail-empty">
            <el-empty description="请从左侧选择一个模板查看详情" />
          </div>
        </div>
      </el-splitter-panel>
    </el-splitter>

    <!-- 模板表单对话框 -->
    <TemplateFormDialog
      v-model:visible="templateDialogVisible"
      :is-edit="isTemplateEdit"
      :template-data="editingTemplate"
      @success="handleTemplateSuccess"
    />

    <!-- 字段表单对话框 -->
    <FieldFormDialog
      v-model:visible="fieldDialogVisible"
      :is-edit="isFieldEdit"
      :field-data="editingField"
      :template-code="selectedTemplate?.templateCode || ''"
      @success="handleFieldSuccess"
    />

    <!-- 选项管理对话框 -->
    <OptionDialog
      v-model:visible="optionDialogVisible"
      :field="selectedField"
      @success="handleOptionSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { get as getTemplateApi } from '@/api/generated/帖子模板管理/帖子模板管理'
import type {
  TemplateListResponse,
  TemplateConfigResponse,
  TemplateFieldResponse,
} from '@/api/generated/.ts.schemas'
import TemplateFormDialog from './components/TemplateFormDialog.vue'
import FieldFormDialog from './components/FieldFormDialog.vue'
import OptionDialog from './components/OptionDialog.vue'

const templateApi = getTemplateApi()

// 搜索
const searchQuery = ref('')

// 模板列表
const templates = ref<TemplateListResponse[]>([])
const loading = ref(false)

// 选中的模板和详情
const selectedTemplate = ref<TemplateListResponse>()
const templateDetail = ref<TemplateConfigResponse>()
const fieldsLoading = ref(false)

// 模板对话框
const templateDialogVisible = ref(false)
const isTemplateEdit = ref(false)
const editingTemplate = ref<TemplateListResponse>()

// 字段对话框
const fieldDialogVisible = ref(false)
const isFieldEdit = ref(false)
const editingField = ref<TemplateFieldResponse>()

// 选项对话框
const optionDialogVisible = ref(false)
const selectedField = ref<TemplateFieldResponse>()

// 过滤后的模板列表
const filteredTemplates = computed(() => {
  if (!searchQuery.value) return templates.value
  const query = searchQuery.value.toLowerCase()
  return templates.value.filter(
    (t) =>
      t.templateName?.toLowerCase().includes(query) ||
      t.templateCode?.toLowerCase().includes(query),
  )
})

// 加载模板列表
const loadTemplates = async () => {
  loading.value = true
  try {
    const response = (await templateApi.getManagerTemplates()) as any
    templates.value = response || []
  } catch (error) {
    ElMessage.error('加载模板列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 加载模板详情
const loadTemplateDetail = async (templateCode: string) => {
  fieldsLoading.value = true
  try {
    const response = (await templateApi.getManagerTemplatesTemplateCode(
      templateCode,
    )) as any
    templateDetail.value = response
  } catch (error) {
    ElMessage.error('加载模板详情失败')
    console.error(error)
  } finally {
    fieldsLoading.value = false
  }
}

// 选择模板
const handleSelectTemplate = (template: TemplateListResponse) => {
  selectedTemplate.value = template
  if (template.templateCode) {
    loadTemplateDetail(template.templateCode)
  }
}

// 搜索
const handleSearch = () => {
  // 搜索是客户端过滤，由computed处理
}

// 新增模板
const handleAddTemplate = () => {
  isTemplateEdit.value = false
  editingTemplate.value = undefined
  templateDialogVisible.value = true
}

// 编辑模板
const handleEditTemplate = (template: TemplateListResponse) => {
  isTemplateEdit.value = true
  editingTemplate.value = template
  templateDialogVisible.value = true
}

// 删除模板
const handleDeleteTemplate = async (template: TemplateListResponse) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除模板「${template.templateName}」吗？删除后将同时删除所有字段配置。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    await templateApi.deleteManagerTemplatesId(template.id!)
    ElMessage.success('删除成功')

    // 如果删除的是当前选中的模板，清空选中状态
    if (selectedTemplate.value?.id === template.id) {
      selectedTemplate.value = undefined
      templateDetail.value = undefined
    }

    loadTemplates()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

// 切换模板状态
const handleToggleStatus = async (
  template: TemplateListResponse,
  enabled: boolean,
) => {
  try {
    await templateApi.putManagerTemplatesIdStatus(template.id!, { enabled })
    ElMessage.success(enabled ? '已启用' : '已禁用')
    // 更新本地状态
    template.isEnabled = enabled
    if (templateDetail.value && templateDetail.value.id === template.id) {
      templateDetail.value.isEnabled = enabled
    }
  } catch (error) {
    ElMessage.error('状态更新失败')
    console.error(error)
  }
}

// 模板操作成功回调
const handleTemplateSuccess = () => {
  loadTemplates()
  // 如果是编辑当前选中的模板，刷新详情
  if (isTemplateEdit.value && selectedTemplate.value?.templateCode) {
    loadTemplateDetail(selectedTemplate.value.templateCode)
  }
}

// 新增字段
const handleAddField = () => {
  isFieldEdit.value = false
  editingField.value = undefined
  fieldDialogVisible.value = true
}

// 编辑字段
const handleEditField = (field: TemplateFieldResponse) => {
  isFieldEdit.value = true
  editingField.value = field
  fieldDialogVisible.value = true
}

// 删除字段
const handleDeleteField = async (field: TemplateFieldResponse) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除字段「${field.fieldName}」吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    await templateApi.deleteManagerTemplatesFieldsId(field.id!)
    ElMessage.success('删除成功')

    // 刷新模板详情
    if (selectedTemplate.value?.templateCode) {
      loadTemplateDetail(selectedTemplate.value.templateCode)
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

// 切换字段状态
const handleToggleFieldStatus = async (
  field: TemplateFieldResponse,
  enabled: boolean,
) => {
  try {
    await templateApi.putManagerTemplatesFieldsIdStatus(field.id!, { enabled })
    ElMessage.success(enabled ? '已启用' : '已禁用')
    // 更新本地状态
    field.isEnabled = enabled
  } catch (error) {
    ElMessage.error('状态更新失败')
    console.error(error)
  }
}

// 字段操作成功回调
const handleFieldSuccess = () => {
  if (selectedTemplate.value?.templateCode) {
    loadTemplateDetail(selectedTemplate.value.templateCode)
  }
}

// 管理选项
const handleManageOptions = (field: TemplateFieldResponse) => {
  selectedField.value = field
  optionDialogVisible.value = true
}

// 选项操作成功回调
const handleOptionSuccess = () => {
  if (selectedTemplate.value?.templateCode) {
    loadTemplateDetail(selectedTemplate.value.templateCode)
  }
}

onMounted(() => {
  loadTemplates()
})
</script>

<style scoped>
.template-management {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f7fa;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.template-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.template-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  width: 280px;
}

.template-splitter {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* Master Panel - 左侧模板列表 */
.template-master-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
  border-right: 1px solid #e4e7ed;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.panel-count {
  font-size: 14px;
  color: #909399;
}

.panel-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.template-list {
  padding: 8px;
  min-height: 100%;
}

.template-item {
  padding: 16px;
  margin-bottom: 8px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.template-item.active {
  background-color: #ecf5ff;
  border-color: #409eff;
}

.template-item-main {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.template-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.template-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.template-icon {
  font-size: 20px;
}

.template-name {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  line-height: 1.4;
}

.template-actions-mini {
  display: flex;
  gap: 8px;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.template-item:hover .template-actions-mini {
  opacity: 1;
}

.template-item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.template-sort {
  font-size: 12px;
  color: #909399;
}

.template-item-desc {
  margin: 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Detail Panel - 右侧详情 */
.template-detail-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
}

.detail-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #fff;
}

.detail-header-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-icon {
  font-size: 28px;
}

.detail-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.detail-body {
  flex: 1;
  padding: 20px;
  overflow: auto;
}

.fields-table {
  width: 100%;
}

.empty-state {
  margin-top: 60px;
}

.detail-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

/* Dark mode */
html.dark .template-management {
  background-color: #0a0a0a;
}

html.dark .template-header {
  background-color: #1a1a1a;
  border-bottom-color: #333;
}

html.dark .template-title {
  color: #fff;
}

html.dark .template-master-panel {
  background-color: #1a1a1a;
  border-right-color: #333;
}

html.dark .panel-header {
  border-bottom-color: #333;
}

html.dark .panel-header h3 {
  color: #fff;
}

html.dark .template-item {
  background-color: #1a1a1a;
  border-color: #333;
}

html.dark .template-item:hover {
  border-color: #409eff;
}

html.dark .template-item.active {
  background-color: rgba(64, 158, 255, 0.15);
  border-color: #409eff;
}

html.dark .template-name {
  color: #fff;
}

html.dark .template-item-desc {
  color: #909399;
}

html.dark .template-detail-panel {
  background-color: #1a1a1a;
}

html.dark .detail-header {
  border-bottom-color: #333;
}

html.dark .detail-header h3 {
  color: #fff;
}
</style>
