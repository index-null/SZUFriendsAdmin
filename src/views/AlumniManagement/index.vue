<template>
  <div class="app-container">
    <el-card class="search-wrapper" shadow="hover">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="姓名" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入姓名"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="学号" prop="number">
          <el-input
            v-model="queryParams.number"
            placeholder="请输入学号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="身份" prop="identity">
          <el-select
            v-model="queryParams.identity"
            placeholder="请选择身份"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="dict in identityOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择状态"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="dict in statusOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery"
            >搜索</el-button
          >
          <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-wrapper" shadow="hover">
      <template #header>
        <div class="toolbar">
          <div class="left">
            <el-button
              v-if="hasPermission('alumni:add')"
              type="primary"
              :icon="Plus"
              @click="handleAdd"
              >新增</el-button
            >
            <el-button
              v-if="hasPermission('alumni:import')"
              type="success"
              :icon="Upload"
              @click="handleImport"
              >批量导入</el-button
            >
          </div>
          <div class="right">
            <el-tooltip content="刷新" placement="top">
              <el-button circle :icon="Refresh" @click="getList" />
            </el-tooltip>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="dataList"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column
          label="姓名"
          prop="name"
          min-width="100"
          show-overflow-tooltip
        />
        <el-table-column
          label="学号"
          prop="number"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          label="身份"
          prop="identity"
          min-width="100"
          align="center"
        >
          <template #default="scope">
            <el-tag :type="getIdentityTag(scope.row.identity)">{{
              getIdentityLabel(scope.row.identity)
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="入学年份"
          prop="grade"
          min-width="100"
          align="center"
        />
        <el-table-column
          label="学历"
          prop="alumniType"
          min-width="100"
          align="center"
        >
          <template #default="scope">
            {{ getAlumniTypeLabel(scope.row.alumniType) }}
          </template>
        </el-table-column>
        <el-table-column
          label="学院"
          prop="collegeName"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column
          label="班级"
          prop="className"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column
          label="专业"
          prop="major"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column
          label="认证状态"
          prop="status"
          min-width="100"
          align="center"
        >
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">{{
              getStatusLabel(scope.row.status)
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="scope">
            <el-button
              v-if="hasPermission('alumni:edit')"
              link
              type="primary"
              :icon="Edit"
              @click="handleEdit(scope.row)"
              >修改</el-button
            >
            <el-button
              v-if="hasPermission('alumni:remove')"
              link
              type="danger"
              :icon="Delete"
              @click="handleDelete(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryParams.current"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/修改对话框 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="600px"
      append-to-body
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学号" prop="number">
              <el-input v-model="form.number" placeholder="请输入学号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="身份" prop="identity">
              <el-select
                v-model="form.identity"
                placeholder="请选择身份"
                style="width: 100%"
              >
                <el-option
                  v-for="dict in identityOptions"
                  :key="dict.value"
                  :label="dict.label"
                  :value="Number(dict.value)"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入学年份" prop="grade">
              <el-input-number
                v-model="form.grade"
                :min="1900"
                :max="2100"
                style="width: 100%"
                placeholder="例如: 2020"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学历" prop="alumniType">
              <el-select
                v-model="form.alumniType"
                placeholder="请选择学历"
                style="width: 100%"
              >
                <el-option
                  v-for="dict in alumniTypeOptions"
                  :key="dict.value"
                  :label="dict.label"
                  :value="Number(dict.value)"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="专业" prop="major">
              <el-input v-model="form.major" placeholder="请输入专业" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学院" prop="collegeId">
              <el-select
                v-model="form.collegeId"
                placeholder="请选择学院"
                style="width: 100%"
                filterable
                clearable
                @change="handleCollegeChange"
              >
                <el-option
                  v-for="item in collegeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="班级" prop="classId">
              <el-select
                v-model="form.classId"
                placeholder="请先选择学院"
                style="width: 100%"
                filterable
                clearable
                :loading="classLoading"
                :disabled="!form.collegeId"
              >
                <el-option
                  v-for="item in classOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialog.visible = false">取 消</el-button>
          <el-button
            type="primary"
            :loading="dialog.loading"
            @click="submitForm"
            >确 定</el-button
          >
        </div>
      </template>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog
      v-model="importDialog.visible"
      title="批量导入校友信息"
      width="400px"
      append-to-body
    >
      <el-upload
        ref="uploadRef"
        class="upload-demo"
        drag
        action="#"
        :on-change="handleFileChange"
        :limit="1"
        :show-file-list="true"
        :on-exceed="handleExceed"
        accept=".xlsx,.xls"
        :auto-upload="false"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或 <em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">
            只能上传 xls/xlsx 文件
            <el-link
              type="primary"
              :underline="false"
              style="font-size: 12px; vertical-align: baseline"
              @click="downloadTemplate"
              >下载模板</el-link
            >
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="importDialog.visible = false">取 消</el-button>
          <el-button
            type="primary"
            :loading="importDialog.loading"
            @click="submitImport"
            >确 定</el-button
          >
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  Search,
  Refresh,
  Plus,
  Edit,
  Delete,
  Upload,
  UploadFilled,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, UploadInstance, UploadFile } from 'element-plus'
import { get } from '@/api/generated/校友档案信息控制器/校友档案信息控制器'
import { get as getFileApi } from '@/api/generated/文件管理/文件管理'
import { get as getCollegeApi } from '@/api/generated/学院信息控制器/学院信息控制器'
import { get as getClassApi } from '@/api/generated/班级相关信息-班级控制器/班级相关信息-班级控制器'
import type {
  AlumniPageRequest,
  AlumniPageResponse,
  CreateAlumniRequest,
  UpdateAlumniRequest,
  ClassEntity,
} from '@/api/generated/.ts.schemas'
import { DICT_TYPE, getDictOptions } from '@/utils/dict'
import { usePermission } from '@/stores'
import { downloadFromResponse } from '@/utils/download'
import type { DownloadResponse } from '@/utils/download'

const { hasPermission } = usePermission()

const {
  postManagerAlumniPage,
  postManagerAlumni,
  putManagerAlumni,
  deleteManagerAlumniId,
  postManagerAlumniBatch,
} = get()

const { getManagerFileDownloadFileKey } = getFileApi()
const { getManagerCollegeDict } = getCollegeApi()
const { postManagerClassList } = getClassApi()

// 字典选项
const identityOptions = ref<any[]>([])
const statusOptions = ref<any[]>([])
const alumniTypeOptions = ref<any[]>([])

// 学院和班级选项
const collegeOptions = ref<{ label: string; value: number }[]>([])
const classOptions = ref<{ label: string; value: number }[]>([])
const classLoading = ref(false)

// 加载字典
const loadDicts = async () => {
  identityOptions.value = await getDictOptions(DICT_TYPE.IDENTITY)
  statusOptions.value = await getDictOptions(DICT_TYPE.ALUMNI_STATUS)
  alumniTypeOptions.value = await getDictOptions(DICT_TYPE.ALUMNI_TYPE)
}

// 加载学院列表
const loadCollegeOptions = async () => {
  try {
    const res = await getManagerCollegeDict()
    if (res && res.collegeDict) {
      collegeOptions.value = Object.entries(res.collegeDict).map(
        ([id, name]) => ({
          label: name as string,
          value: Number(id),
        }),
      )
    }
  } catch (error) {
    console.error('获取学院列表失败', error)
  }
}

// 加载班级列表（根据学院ID筛选）
const loadClassOptions = async (collegeId?: number) => {
  classLoading.value = true
  try {
    const res = await postManagerClassList({ collegeId })
    if (res && Array.isArray(res)) {
      classOptions.value = res.map((item: ClassEntity) => ({
        label: item.className || '',
        value: item.id as number,
      }))
    } else {
      classOptions.value = []
    }
  } catch (error) {
    console.error('获取班级列表失败', error)
    classOptions.value = []
  } finally {
    classLoading.value = false
  }
}

// 辅助函数：获取标签
const getIdentityLabel = (value?: number) => {
  const dict = identityOptions.value.find(
    (item) => Number(item.value) === value,
  )
  return dict ? dict.label : '未知'
}
const getIdentityTag = (value?: number) => {
  // 简单映射，可根据实际需求调整
  if (value === 1) return 'info' // 学生
  if (value === 2) return 'warning' // 教师
  if (value === 3) return 'success' // 校友
  return ''
}
const getStatusLabel = (value?: number) => {
  const dict = statusOptions.value.find((item) => Number(item.value) === value)
  return dict ? dict.label : value === 1 ? '已认证' : '未认证'
}
const getAlumniTypeLabel = (value?: number) => {
  const dict = alumniTypeOptions.value.find(
    (item) => Number(item.value) === value,
  )
  return dict ? dict.label : '无'
}

// 查询参数
const queryFormRef = ref<FormInstance>()
const queryParams = reactive<AlumniPageRequest>({
  current: 1,
  size: 10,
  name: undefined,
  number: undefined,
  identity: undefined,
  status: undefined,
})

const loading = ref(false)
const total = ref(0)
const dataList = ref<AlumniPageResponse[]>([])

// 获取列表
const getList = async () => {
  loading.value = true
  try {
    const res = await postManagerAlumniPage(queryParams)
    if (res && res.records) {
      dataList.value = res.records
      total.value = res.total || 0
    } else {
      dataList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取校友列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleQuery = () => {
  queryParams.current = 1
  getList()
}

// 重置
const resetQuery = () => {
  if (!queryFormRef.value) return
  queryFormRef.value.resetFields()
  handleQuery()
}

// 分页
const handleSizeChange = (val: number) => {
  queryParams.size = val
  getList()
}
const handleCurrentChange = (val: number) => {
  queryParams.current = val
  getList()
}

// 新增/修改 Dialog
const dialog = reactive({
  visible: false,
  title: '',
  loading: false,
})
const formRef = ref<FormInstance>()
const form = reactive<UpdateAlumniRequest>({
  // 复用 UpdateAlumniRequest 因为它包含 Create 的字段
  id: undefined,
  name: '',
  number: '',
  identity: undefined,
  grade: undefined,
  alumniType: undefined,
  collegeId: undefined,
  classId: undefined,
  major: '',
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  number: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  identity: [{ required: true, message: '请选择身份', trigger: 'change' }],
  grade: [{ required: true, message: '请输入入学年份', trigger: 'blur' }],
  alumniType: [{ required: true, message: '请选择学历', trigger: 'change' }],
  collegeId: [{ required: true, message: '请选择学院', trigger: 'change' }],
}

// 学院变化时清空班级并重新加载班级列表
const handleCollegeChange = (collegeId: number | undefined) => {
  form.classId = undefined
  if (collegeId) {
    loadClassOptions(collegeId)
  } else {
    classOptions.value = []
  }
}

// 新增
const handleAdd = () => {
  dialog.title = '新增校友'
  dialog.visible = true
  // 重置表单
  form.id = undefined
  form.name = ''
  form.number = ''
  form.identity = undefined
  form.grade = undefined
  form.alumniType = undefined
  form.collegeId = undefined
  form.classId = undefined
  form.major = ''

  // 清除校验
  if (formRef.value) formRef.value.clearValidate()
}

// 修改
const handleEdit = (row: AlumniPageResponse) => {
  dialog.title = '修改校友'
  dialog.visible = true
  Object.assign(form, row) // 复制数据
  // 如果有学院ID，加载该学院的班级列表
  if (row.collegeId) {
    loadClassOptions(row.collegeId)
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      dialog.loading = true
      try {
        if (form.id) {
          // 修改
          await putManagerAlumni(form as UpdateAlumniRequest)
          ElMessage.success('修改成功')
        } else {
          // 新增
          // CreateAlumniRequest 不需要 id
          const { id, ...createData } = form
          await postManagerAlumni(createData as CreateAlumniRequest)
          ElMessage.success('新增成功')
        }
        dialog.visible = false
        getList()
      } catch (error) {
        console.error(error)
        // 错误信息由拦截器处理
      } finally {
        dialog.loading = false
      }
    }
  })
}

// 删除
const handleDelete = (row: AlumniPageResponse) => {
  ElMessageBox.confirm(`确认要删除校友 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      if (row.id) {
        await deleteManagerAlumniId(row.id)
        ElMessage.success('删除成功')
        getList()
      }
    } catch (error) {
      console.error(error)
    }
  })
}

// 批量导入 Dialog
const importDialog = reactive({
  visible: false,
  loading: false,
})
const uploadRef = ref<UploadInstance>()
const fileToUpload = ref<File | null>(null)

const handleImport = () => {
  importDialog.visible = true
  fileToUpload.value = null
  if (uploadRef.value) uploadRef.value.clearFiles()
}

const downloadTemplate = async () => {
  try {
    const response = (await getManagerFileDownloadFileKey(
      'alumni-template',
    )) as unknown as DownloadResponse
    downloadFromResponse(response, 'alumni-template.xlsx')
  } catch (error) {
    ElMessage.error('下载模板失败')
  }
}

const handleFileChange = (uploadFile: UploadFile) => {
  if (uploadFile.raw) {
    fileToUpload.value = uploadFile.raw
  }
}

const handleExceed = (files: File[]) => {
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
    const file = files[0] as any
    file.uid = Date.now()
    uploadRef.value.handleStart(file)
  }
}

const submitImport = async () => {
  if (!fileToUpload.value) {
    ElMessage.warning('请选择文件')
    return
  }

  importDialog.loading = true
  try {
    const res = await postManagerAlumniBatch({ file: fileToUpload.value })
    if (res.hasError) {
      const messageHtml = (res.errorMessages || [])
        .map((msg) => `<div style="margin-bottom: 4px;">${msg}</div>`)
        .join('')
      ElMessageBox.alert(messageHtml, '导入失败详情', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定',
        type: 'error',
        customStyle: { maxWidth: '500px' },
      })
    } else {
      ElMessage.success('导入成功')
      importDialog.visible = false
      getList()
    }
  } catch (error) {
    console.error(error)
  } finally {
    importDialog.loading = false
  }
}

onMounted(() => {
  loadDicts()
  loadCollegeOptions()
  getList()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}
.search-wrapper {
  margin-bottom: 20px;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
