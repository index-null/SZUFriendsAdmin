<template>
  <div class="class-management">
    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="班级名称">
              <el-input
                v-model="searchForm.className"
                placeholder="请输入班级名称"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>
          </el-col>
          <el-col v-if="collegeLeaderId === 0" :span="6">
            <el-form-item label="学院">
              <el-select
                v-model="searchForm.collegeId"
                placeholder="全部"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="college in collegeList"
                  :key="college.id"
                  :label="college.collegeName"
                  :value="college.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="专业">
              <el-input
                v-model="searchForm.major"
                placeholder="请输入专业"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="班级类型">
              <el-select
                v-model="searchForm.classType"
                placeholder="全部"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in allDictOptions[DICT_TYPE.CLASS_TYPE]"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="年级">
              <el-input-number
                v-model="searchForm.grade"
                placeholder="年级"
                :min="2000"
                :max="2100"
                :controls="false"
                style="width: 100%"
                @keyup.enter="handleSearch"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="状态">
              <el-select
                v-model="searchForm.status"
                placeholder="全部"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in allDictOptions[DICT_TYPE.STATUS]"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label-width="0" class="search-buttons">
              <el-button type="primary" :icon="Search" @click="handleSearch">
                搜索
              </el-button>
              <el-button :icon="Refresh" @click="handleReset">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span>班级列表</span>
          <div class="actions">
            <el-button
              v-if="hasPermission('class:create')"
              type="primary"
              :icon="Plus"
              @click="handleAdd"
            >
              新增班级
            </el-button>
            <el-button
              v-if="hasPermission('class:delete')"
              type="danger"
              :icon="Delete"
              :disabled="!selectedIds.length"
              @click="handleBatchDelete"
            >
              批量删除
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column
          type="index"
          label="序号"
          width="80"
          :index="
            (index: number) =>
              (pagination.current - 1) * pagination.size + index + 1
          "
        />
        <el-table-column label="所属学院" min-width="150">
          <template #default="{ row }">
            {{ getCollegeName(row.collegeId) }}
          </template>
        </el-table-column>
        <el-table-column prop="className" label="班级名称" min-width="150" />
        <el-table-column prop="major" label="专业" min-width="120" />
        <el-table-column
          prop="classType"
          label="班级类型"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            {{ getLabel(DICT_TYPE.CLASS_TYPE, row.classType) }}
          </template>
        </el-table-column>
        <el-table-column prop="grade" label="年级" width="80" align="center" />
        <el-table-column
          prop="memberCount"
          label="成员数量"
          width="100"
          align="center"
        />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 1 ? 'success' : 'danger'"
              size="small"
            >
              {{ getLabel(DICT_TYPE.STATUS, row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="hasPermission('class:update')"
              type="primary"
              link
              size="small"
              :icon="Edit"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="hasPermission('class:delete')"
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

      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>

    <ClassFormDialog
      v-model:visible="dialogVisible"
      :data="currentRow"
      :college-leader-id="collegeLeaderId"
      :is-admin="isAdmin"
      :college-list="collegeList"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { get as getClassApi } from '@/api/generated/班级相关信息-班级控制器/班级相关信息-班级控制器'
import { get as getCollegeApi } from '@/api/generated/学院信息控制器/学院信息控制器'
import type {
  ClassEntity,
  ClassPagesRequest,
  CollegeEntity,
} from '@/api/generated/.ts.schemas'

const classApi = getClassApi()
const collegeApi = getCollegeApi()
import { useUserStore } from '@/stores/modules/user'
import { usePermission, useDicts } from '@/stores'
import { DICT_TYPE } from '@/utils/dict'
import { useCollegeMap } from '@/composables/useCollegeMap'
import ClassFormDialog from './components/ClassFormDialog.vue'

const userStore = useUserStore()
const { hasPermission } = usePermission()

// 使用字典
const { allDictOptions, getLabel } = useDicts([
  DICT_TYPE.CLASS_TYPE,
  DICT_TYPE.STATUS,
])

// 使用学院映射
const { getCollegeName } = useCollegeMap()

const loading = ref(false)
const dialogVisible = ref(false)
const currentRow = ref<ClassEntity | null>(null)
const selectedIds = ref<number[]>([])
const collegeList = ref<CollegeEntity[]>([])

// 获取用户信息中的 collegeLeaderId
const collegeLeaderId = ref<number>(userStore.userInfo.collegeLeaderId ?? -1)
const isAdmin = ref<boolean>(userStore.isAdmin)

const searchForm = reactive<ClassPagesRequest>({
  className: '',
  collegeId: undefined,
  status: undefined,
  grade: undefined,
  classType: undefined,
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})

const tableData = ref<ClassEntity[]>([])

// 获取学院列表（保留用于下拉选择）
const fetchCollegeList = async () => {
  try {
    const data = await collegeApi.postManagerCollegePages({
      current: 1,
      size: 1000, // 获取所有学院
      status: 1, // 只获取启用的学院
    })
    collegeList.value = data.records || []
  } catch (error) {
    ElMessage.error('获取学院列表失败')
  }
}

// 获取班级列表
const fetchData = async () => {
  loading.value = true
  try {
    // 构建查询参数
    const params: ClassPagesRequest = {
      current: pagination.current,
      size: pagination.size,
      ...searchForm,
    }

    // 权限控制：
    // 1. 超管(collegeLeaderId=0): 可以选择学院筛选，未选择时传0表示查看全部
    // 2. 学院管理员(collegeLeaderId>0): 只能查看自己学院，强制使用 collegeLeaderId
    if (collegeLeaderId.value > 0) {
      // 非超管：强制使用自己的学院ID
      params.collegeId = collegeLeaderId.value
    } else if (collegeLeaderId.value === 0) {
      // 超管：使用用户选择的学院ID，未选择时传0表示全部
      params.collegeId = searchForm.collegeId ?? 0
    }

    const data = (await classApi.postManagerClassPages(params)) as any
    tableData.value = data.records || []
    pagination.total = data.total || 0
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

const handleReset = () => {
  searchForm.className = ''
  searchForm.major = ''
  searchForm.status = undefined
  searchForm.grade = undefined
  searchForm.classType = undefined
  // 重置时保持 collegeId (会在 fetchData 时从 userInfo 获取)
  searchForm.collegeId = undefined

  handleSearch()
}

const handleAdd = () => {
  currentRow.value = null
  dialogVisible.value = true
}

const handleEdit = (row: ClassEntity) => {
  currentRow.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = async (row: ClassEntity) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除班级 "${row.className}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    if (!row.id) return

    await classApi.deleteManagerClassId(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    // 用户取消操作或删除失败
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleBatchDelete = async () => {
  if (!selectedIds.value.length) {
    ElMessage.warning('请选择要删除的班级')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个班级吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    loading.value = true
    const deletePromises = selectedIds.value.map((id) =>
      classApi.deleteManagerClassId(id),
    )
    const results = await Promise.allSettled(deletePromises)

    const successCount = results.filter((r) => r.status === 'fulfilled').length
    const failCount = results.filter((r) => r.status === 'rejected').length

    if (failCount === 0) {
      ElMessage.success(`成功删除 ${successCount} 个班级`)
    } else {
      ElMessage.warning(`成功删除 ${successCount} 个，失败 ${failCount} 个`)
    }

    fetchData()
  } catch (error) {
    // 用户取消操作
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (selection: ClassEntity[]) => {
  selectedIds.value = selection.map((item) => item.id!).filter(Boolean)
}

const handleSizeChange = () => {
  fetchData()
}

const handlePageChange = () => {
  fetchData()
}

const handleFormSuccess = async (formData: ClassEntity) => {
  try {
    const isEdit = !!formData.id
    await (isEdit
      ? classApi.putManagerClass(formData)
      : classApi.postManagerClass(formData))

    ElMessage.success(isEdit ? '更新成功' : '创建成功')
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  fetchCollegeList().then(() => {
    fetchData()
  })
})
</script>

<style scoped>
.class-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  min-height: 600px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.actions {
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 0;
}

.search-card .el-row {
  margin-bottom: 18px;
}

.search-card .el-row:last-child {
  margin-bottom: 0;
}

.search-buttons {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.search-buttons :deep(.el-form-item__content) {
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .class-management {
    padding: 10px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .actions {
    width: 100%;
    flex-direction: column;
  }

  .actions .el-button {
    width: 100%;
  }
}
</style>
