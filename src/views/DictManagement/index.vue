<template>
  <div class="dict-management">
    <div class="dict-header">
      <h2 class="dict-title">字典管理</h2>
      <div class="dict-actions">
        <el-input
          v-model="searchForm.query"
          placeholder="搜索字典名称/类型/描述"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleAdd">新增字典</el-button>
      </div>
    </div>

    <el-splitter class="dict-splitter">
      <el-splitter-panel :size="400" :min="300" :max="600">
        <div class="dict-master-panel">
          <div class="panel-header">
            <h3>字典列表</h3>
            <span class="panel-count">{{ pagination.total }} 项</span>
          </div>

          <el-scrollbar class="panel-content">
            <div v-loading="loading" class="dict-list">
              <div
                v-for="dict in tableData"
                :key="dict.id"
                :class="['dict-item', { active: selectedDict?.id === dict.id }]"
                @click="handleSelectDict(dict)"
              >
                <div class="dict-item-main">
                  <div class="dict-item-header">
                    <h4 class="dict-name">{{ dict.description }}</h4>
                    <div class="dict-actions-mini">
                      <el-button
                        type="primary"
                        link
                        size="small"
                        @click.stop="handleEdit(dict)"
                      >
                        <el-icon><Edit /></el-icon>
                      </el-button>
                      <el-button
                        type="danger"
                        link
                        size="small"
                        @click.stop="handleDelete(dict)"
                      >
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </div>
                  <div class="dict-item-meta">
                    <el-tag size="small" type="info">{{
                      dict.dictType
                    }}</el-tag>
                    <span class="dict-item-time">{{ dict.createTime }}</span>
                  </div>
                  <p v-if="dict.remarks" class="dict-item-desc">
                    {{ dict.remarks }}
                  </p>
                </div>
              </div>

              <el-empty
                v-if="!loading && tableData.length === 0"
                description="暂无数据"
              />
            </div>
          </el-scrollbar>

          <div class="panel-footer">
            <el-pagination
              v-model:current-page="pagination.current"
              v-model:page-size="pagination.size"
              :total="pagination.total"
              :page-sizes="[10, 20, 50]"
              small
              layout="prev, pager, next, sizes"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </el-splitter-panel>

      <el-splitter-panel>
        <div class="dict-detail-panel">
          <div v-if="selectedDict" class="detail-content">
            <div class="detail-header">
              <div class="detail-header-main">
                <h3>{{ selectedDict.description }}</h3>
                <el-tag type="success">{{ selectedDict.dictType }}</el-tag>
              </div>
              <el-button type="primary" @click="handleAddItem(selectedDict)">
                <el-icon><Plus /></el-icon>
                新增字典项
              </el-button>
            </div>

            <div class="detail-body">
              <el-table
                v-loading="itemsLoading"
                :data="dictItems"
                stripe
                class="dict-items-table"
                :default-sort="{ prop: 'sortOrder', order: 'ascending' }"
              >
                <el-table-column prop="label" label="名称" min-width="120" />
                <el-table-column prop="itemValue" label="值" min-width="100" />
                <el-table-column
                  prop="description"
                  label="描述"
                  min-width="150"
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
                  prop="createTime"
                  label="创建时间"
                  width="160"
                />
                <el-table-column
                  label="操作"
                  width="120"
                  fixed="right"
                  align="center"
                >
                  <template #default="{ row: item }">
                    <el-button
                      type="primary"
                      link
                      size="small"
                      @click="handleEditItem(selectedDict, item)"
                    >
                      编辑
                    </el-button>
                    <el-button
                      type="danger"
                      link
                      size="small"
                      @click="handleDeleteItem(item)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <el-empty
                v-if="!itemsLoading && dictItems.length === 0"
                description="暂无字典项"
                class="empty-state"
              />
            </div>
          </div>

          <div v-else class="detail-empty">
            <el-empty description="请从左侧选择一个字典查看详情" />
          </div>
        </div>
      </el-splitter-panel>
    </el-splitter>

    <!-- 字典编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="字典类型" prop="dictType">
          <el-input
            v-model="form.dictType"
            placeholder="请输入字典类型（如：class_type）"
            :disabled="isEdit"
            @blur="handleDictTypeBlur"
          />
        </el-form-item>
        <el-form-item label="字典名称" prop="description">
          <el-input
            v-model="form.description"
            placeholder="请输入字典名称描述"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="form.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 字典项编辑对话框 -->
    <el-dialog
      v-model="itemDialogVisible"
      :title="itemDialogTitle"
      width="600px"
      @close="handleItemDialogClose"
    >
      <el-form
        ref="itemFormRef"
        :model="itemForm"
        :rules="itemRules"
        label-width="100px"
      >
        <el-form-item label="字典项名称" prop="label">
          <el-input
            v-model="itemForm.label"
            placeholder="请输入字典项名称（如：本科）"
            @blur="handleDictItemLabelBlur"
          />
        </el-form-item>
        <el-form-item label="字典项值" prop="itemValue">
          <el-input
            v-model="itemForm.itemValue"
            placeholder="请输入字典项值（如：1）"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="itemForm.description"
            type="textarea"
            :rows="2"
            placeholder="请输入描述信息"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number
            v-model="itemForm.sortOrder"
            :min="0"
            :max="9999"
            controls-position="right"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="itemDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="itemSubmitLoading"
          @click="handleItemSubmit"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
} from 'element-plus'
import { Search, Edit, Delete, Plus } from '@element-plus/icons-vue'
import { get as getDictApi } from '@/api/generated/字典管理-字典/字典管理-字典'
import { get as getDictItemApi } from '@/api/generated/字典管理-字典项/字典管理-字典项'
import type {
  DictEntity,
  CreateDictRequest,
  UpdateDictRequest,
  DictItemEntity,
  CreateDictItemRequest,
  UpdateDictItemRequest,
} from '@/api/generated/.ts.schemas'

const dictApi = getDictApi()
const dictItemApi = getDictItemApi()
import { useDictStore } from '@/stores'

const dictStore = useDictStore()

// 查询表单
const searchForm = reactive({
  query: '',
})

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})

// 表格数据
const tableData = ref<DictEntity[]>([])
const loading = ref(false)

// 选中的字典和字典项
const selectedDict = ref<DictEntity>()
const dictItems = ref<DictItemEntity[]>([])
const itemsLoading = ref(false)

// 字典表单
const dialogVisible = ref(false)
const dialogTitle = ref('新增字典')
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const form = reactive<Partial<CreateDictRequest & UpdateDictRequest>>({
  dictType: '',
  description: '',
  remarks: '',
})

// 字典项表单
const itemDialogVisible = ref(false)
const itemDialogTitle = ref('新增字典项')
const isItemEdit = ref(false)
const itemSubmitLoading = ref(false)
const itemFormRef = ref<FormInstance>()
const currentDict = ref<DictEntity>()
const itemForm = reactive<
  Partial<CreateDictItemRequest & UpdateDictItemRequest>
>({
  label: '',
  itemValue: '',
  description: '',
  sortOrder: 0,
})

// 表单验证规则
const rules: FormRules = {
  dictType: [
    { required: true, message: '请输入字典类型', trigger: 'blur' },
    {
      pattern: /^[a-z_]+$/,
      message: '只能包含小写字母和下划线',
      trigger: 'blur',
    },
  ],
  description: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
}

const itemRules: FormRules = {
  label: [{ required: true, message: '请输入字典项名称', trigger: 'blur' }],
  itemValue: [{ required: true, message: '请输入字典项值', trigger: 'blur' }],
}

// 加载表格数据
const loadData = async () => {
  loading.value = true
  try {
    const response = (await dictApi.postManagerDictPage({
      current: pagination.current,
      size: pagination.size,
      query: searchForm.query || undefined,
    })) as any

    tableData.value = response.records || []
    pagination.total = response.total || 0
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 加载字典项数据
const loadDictItems = async (dict: DictEntity) => {
  if (!dict.dictType) return

  itemsLoading.value = true
  try {
    const response = (await dictItemApi.getManagerDictTypeDictType(
      dict.dictType,
    )) as any
    dictItems.value = response || []
  } catch (error) {
    ElMessage.error('加载字典项失败')
    console.error(error)
  } finally {
    itemsLoading.value = false
  }
}

// 选择字典
const handleSelectDict = (dict: DictEntity) => {
  selectedDict.value = dict
  loadDictItems(dict)
}

// 查询
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 分页变化
const handleSizeChange = () => {
  loadData()
}

const handleCurrentChange = () => {
  loadData()
}

// 新增字典
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增字典'
  Object.assign(form, {
    dictType: '',
    description: '',
    remarks: '',
  })
  dialogVisible.value = true
}

// 编辑字典
const handleEdit = (row: DictEntity) => {
  isEdit.value = true
  dialogTitle.value = '编辑字典'
  Object.assign(form, {
    id: row.id,
    dictType: row.dictType,
    description: row.description,
    remarks: row.remarks,
  })
  dialogVisible.value = true
}

// 删除字典
const handleDelete = async (row: DictEntity) => {
  try {
    await ElMessageBox.confirm(
      '删除字典将同时删除所有字典项，是否确认删除？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    await dictApi.deleteManagerDictId(row.id!)
    ElMessage.success('删除成功')

    // 清除字典缓存
    if (row.dictType) {
      dictStore.clearDictCache(row.dictType)
    }

    // 如果删除的是当前选中的字典，清空选中状态
    if (selectedDict.value?.id === row.id) {
      selectedDict.value = undefined
      dictItems.value = []
    }

    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

// 提交字典表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    // 提交前再次查重（新增时）
    if (!isEdit.value) {
      const dictType = form.dictType?.trim()
      if (dictType) {
        const isAvailable = await dictApi.getManagerDictCheck({ dictType })
        if (!isAvailable) {
          ElMessage.error(`字典类型 "${dictType}" 已存在，无法创建`)
          return
        }
      }
    }

    submitLoading.value = true

    if (isEdit.value) {
      await dictApi.putManagerDict({
        id: form.id!,
        description: form.description,
        remarks: form.remarks,
      } as UpdateDictRequest)
      ElMessage.success('修改成功')
    } else {
      await dictApi.postManagerDict({
        dictType: form.dictType!,
        description: form.description!,
        remarks: form.remarks,
      } as CreateDictRequest)
      ElMessage.success('新增成功')
    }

    dialogVisible.value = false
    await loadData()

    // 如果编辑的是当前选中的字典，刷新字典项
    if (isEdit.value && selectedDict.value?.id === form.id) {
      const updatedDict = tableData.value.find((d) => d.id === form.id)
      if (updatedDict) {
        selectedDict.value = updatedDict
      }
    }
  } catch (error) {
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 字典类型失焦查重
const handleDictTypeBlur = async () => {
  // 编辑模式不检查
  if (isEdit.value) return

  const dictType = form.dictType?.trim()
  if (!dictType) return

  try {
    const isAvailable = await dictApi.getManagerDictCheck({ dictType })
    if (!isAvailable) {
      ElMessage.warning(`字典类型 "${dictType}" 已存在，请使用其他类型`)
      // 清空字段让用户重新输入
      form.dictType = ''
    }
  } catch (error) {
    console.error('查重失败:', error)
  }
}

// 新增字典项
const handleAddItem = (dict: DictEntity) => {
  isItemEdit.value = false
  itemDialogTitle.value = '新增字典项'
  currentDict.value = dict
  Object.assign(itemForm, {
    label: '',
    itemValue: '',
    description: '',
    sortOrder: 0,
  })
  itemDialogVisible.value = true
}

// 编辑字典项
const handleEditItem = (dict: DictEntity, item: DictItemEntity) => {
  isItemEdit.value = true
  itemDialogTitle.value = '编辑字典项'
  currentDict.value = dict
  Object.assign(itemForm, {
    id: item.id,
    label: item.label,
    itemValue: item.itemValue,
    description: item.description,
    sortOrder: item.sortOrder,
  })
  itemDialogVisible.value = true
}

// 删除字典项
const handleDeleteItem = async (item: DictItemEntity) => {
  try {
    await ElMessageBox.confirm('是否确认删除该字典项？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await dictItemApi.deleteManagerDictItemId(item.id!)
    ElMessage.success('删除成功')

    // 清除字典缓存
    if (item.dictType) {
      dictStore.clearDictCache(item.dictType)
    }

    // 重新加载当前字典的字典项
    if (selectedDict.value) {
      loadDictItems(selectedDict.value)
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

// 提交字典项表单
const handleItemSubmit = async () => {
  if (!itemFormRef.value) return

  try {
    await itemFormRef.value.validate()

    // 提交前再次查重（新增时）
    if (!isItemEdit.value) {
      const label = itemForm.label?.trim()
      if (label && currentDict.value?.dictType) {
        const isAvailable = await dictItemApi.getManagerDictItemCheck({
          dictType: currentDict.value.dictType,
          label: label,
        })
        if (!isAvailable) {
          ElMessage.error(`字典项 "${label}" 已存在，无法创建`)
          return
        }
      }
    }

    itemSubmitLoading.value = true

    if (isItemEdit.value) {
      await dictItemApi.putManagerDictItem({
        id: itemForm.id!,
        label: itemForm.label!,
        itemValue: itemForm.itemValue!,
        description: itemForm.description,
        sortOrder: itemForm.sortOrder,
      } as UpdateDictItemRequest)
      ElMessage.success('修改成功')
    } else {
      if (!currentDict.value?.id || !currentDict.value?.dictType) {
        ElMessage.error('字典信息不完整')
        return
      }
      await dictItemApi.postManagerDictItem({
        dictId: currentDict.value.id,
        dictType: currentDict.value.dictType,
        label: itemForm.label!,
        itemValue: itemForm.itemValue!,
        description: itemForm.description,
        sortOrder: itemForm.sortOrder,
      } as CreateDictItemRequest)
      ElMessage.success('新增成功')
    }

    itemDialogVisible.value = false

    // 清除字典缓存
    if (currentDict.value?.dictType) {
      dictStore.clearDictCache(currentDict.value.dictType)
    }

    // 重新加载当前字典的字典项
    if (selectedDict.value) {
      loadDictItems(selectedDict.value)
    }
  } catch (error) {
    console.error(error)
  } finally {
    itemSubmitLoading.value = false
  }
}

// 字典项对话框关闭
const handleItemDialogClose = () => {
  itemFormRef.value?.resetFields()
  currentDict.value = undefined
}

// 字典项名称失焦查重
const handleDictItemLabelBlur = async () => {
  // 编辑模式不检查
  if (isItemEdit.value) return

  const label = itemForm.label?.trim()
  if (!label || !currentDict.value?.dictType) return

  try {
    const isAvailable = await dictItemApi.getManagerDictItemCheck({
      dictType: currentDict.value.dictType,
      label: label,
    })
    if (!isAvailable) {
      ElMessage.warning(`字典项 "${label}" 已存在，请使用其他名称`)
      // 清空字段让用户重新输入
      itemForm.label = ''
    }
  } catch (error) {
    console.error('查重失败:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.dict-management {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f7fa;
}

.dict-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.dict-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.dict-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  width: 300px;
}

.dict-splitter {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* Master Panel - 左侧字典列表 */
.dict-master-panel {
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

.dict-list {
  padding: 8px;
  min-height: 100%;
}

.dict-item {
  padding: 16px;
  margin-bottom: 8px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dict-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.dict-item.active {
  background-color: #ecf5ff;
  border-color: #409eff;
}

.dict-item-main {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dict-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.dict-name {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  line-height: 1.4;
}

.dict-actions-mini {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.dict-item:hover .dict-actions-mini {
  opacity: 1;
}

.dict-item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dict-item-time {
  font-size: 12px;
  color: #909399;
}

.dict-item-desc {
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

.panel-footer {
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
  background-color: #fff;
}

.panel-footer :deep(.el-pagination) {
  justify-content: center;
}

/* Detail Panel - 右侧字典项详情 */
.dict-detail-panel {
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

.dict-items-table {
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
html.dark .dict-management {
  background-color: #0a0a0a;
}

html.dark .dict-header {
  background-color: #1a1a1a;
  border-bottom-color: #333;
}

html.dark .dict-title {
  color: #fff;
}

html.dark .dict-master-panel {
  background-color: #1a1a1a;
  border-right-color: #333;
}

html.dark .panel-header {
  border-bottom-color: #333;
}

html.dark .panel-header h3 {
  color: #fff;
}

html.dark .dict-item {
  background-color: #1a1a1a;
  border-color: #333;
}

html.dark .dict-item:hover {
  border-color: #409eff;
}

html.dark .dict-item.active {
  background-color: rgba(64, 158, 255, 0.15);
  border-color: #409eff;
}

html.dark .dict-name {
  color: #fff;
}

html.dark .dict-item-desc {
  color: #909399;
}

html.dark .panel-footer {
  background-color: #1a1a1a;
  border-top-color: #333;
}

html.dark .dict-detail-panel {
  background-color: #1a1a1a;
}

html.dark .detail-header {
  background-color: #1a1a1a;
  border-bottom-color: #333;
}

html.dark .detail-header h3 {
  color: #fff;
}
</style>
