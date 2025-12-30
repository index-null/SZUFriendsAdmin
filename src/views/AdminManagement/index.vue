<template>
  <div class="admin-management">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch"
            >搜索</el-button
          >
          <el-button :icon="RefreshRight" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="用户ID" width="80" align="center" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column label="头像" width="80" align="center">
          <template #default="{ row }">
            <el-avatar v-if="row.avatar" :src="row.avatar" :size="40" />
            <el-avatar v-else :size="40">
              <el-icon><User /></el-icon>
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="用户类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getUserTypeTag(row.userType)">
              {{ getUserTypeLabel(row.userType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="管理学院" width="150" align="center">
          <template #default="{ row }">
            <el-tag :type="getCollegeTag(row.collegeLeaderId)">
              {{ getCollegeName(row.collegeLeaderId) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="角色" min-width="200">
          <template #default="{ row }">
            <el-tag
              v-for="role in row.roles"
              :key="role.id"
              type="info"
              size="small"
              style="margin-right: 4px"
            >
              {{ role.roleName }}
            </el-tag>
            <el-text v-if="!row.roles || row.roles.length === 0" type="info"
              >暂无角色</el-text
            >
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="hasPermission('admin-user:details')"
              type="primary"
              size="small"
              :icon="View"
              link
              @click="handleView(row)"
              >查看</el-button
            >
            <el-button
              v-if="hasPermission('admin-user:update')"
              type="warning"
              size="small"
              :icon="Edit"
              link
              @click="handleEdit(row)"
              >编辑</el-button
            >
            <el-button
              v-if="hasPermission('admin-user:reset-password')"
              type="danger"
              size="small"
              :icon="Lock"
              link
              @click="handleResetPassword(row)"
              >重置密码</el-button
            >
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
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 管理员详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="管理员详情"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-descriptions v-if="currentAdmin" :column="2" border>
        <el-descriptions-item label="用户ID">{{
          currentAdmin.username
        }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{
          currentAdmin.nickname || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="真实姓名">{{
          currentAdmin.realName || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="用户类型">
          <el-tag :type="getUserTypeTag(currentAdmin.userType)">
            {{
              currentAdmin.userType !== undefined
                ? getUserTypeLabel(currentAdmin.userType)
                : '未知'
            }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">{{
          currentAdmin.email || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{
          currentAdmin.phone || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentAdmin.status === 1 ? 'success' : 'danger'">
            {{ currentAdmin.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="管理学院">
          <el-tag :type="getCollegeTag(currentAdmin.collegeLeaderId)">
            {{ getCollegeName(currentAdmin.collegeLeaderId) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="个人简介" :span="2">{{
          currentAdmin.bio || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="QQ号">{{
          currentAdmin.qq || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="微信号">{{
          currentAdmin.wechat || '-'
        }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 编辑管理员对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑管理员"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="100px"
      >
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="editForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="editForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="editForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="个人简介" prop="bio">
          <el-input
            v-model="editForm.bio"
            type="textarea"
            :rows="3"
            placeholder="请输入个人简介"
          />
        </el-form-item>
        <el-form-item label="QQ号" prop="qq">
          <el-input v-model="editForm.qq" placeholder="请输入QQ号" />
        </el-form-item>
        <el-form-item label="微信号" prop="wechat">
          <el-input v-model="editForm.wechat" placeholder="请输入微信号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSaveEdit"
          >确定</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import {
  Search,
  RefreshRight,
  View,
  Edit,
  Lock,
  User,
} from '@element-plus/icons-vue'
import { usePermission, useDict } from '@/stores'
import { DICT_TYPE } from '@/utils/dict'
import { useCollegeMap } from '@/composables/useCollegeMap'
import { get as getAdminApi } from '@/api/generated/管理员管理/管理员管理'
import type {
  AdminUserPageResponse,
  AdminUserDetailsResponse,
  AdminUserUpdateRequest,
} from '@/api/generated/.ts.schemas'

const adminApi = getAdminApi()

const { hasPermission } = usePermission()

// 使用字典
const { getLabel: getUserTypeLabel } = useDict(DICT_TYPE.USER_TYPE)

// 使用学院映射
const { getCollegeName } = useCollegeMap()

// 搜索表单
const searchForm = reactive({
  username: '',
})

// 分页参数
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})

// 表格数据
const tableData = ref<AdminUserPageResponse[]>([])
const loading = ref(false)

// 管理员详情
const detailDialogVisible = ref(false)
const currentAdmin = ref<AdminUserDetailsResponse | null>(null)

// 编辑管理员
const editDialogVisible = ref(false)
const editFormRef = ref<FormInstance>()
const editForm = reactive<AdminUserUpdateRequest>({
  id: 0,
  nickname: '',
  realName: '',
  email: '',
  phone: '',
  status: 1,
  bio: '',
  qq: '',
  wechat: '',
})

const editFormRules = {
  email: [
    {
      type: 'email',
      message: '请输入正确的邮箱格式',
      trigger: 'blur',
    },
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号格式',
      trigger: 'blur',
    },
  ],
}

const submitting = ref(false)

// 获取管理员列表
const fetchAdminList = async () => {
  loading.value = true
  try {
    const response = await adminApi.postManagerAdminUserPage({
      current: pagination.current,
      size: pagination.size,
      username: searchForm.username || undefined,
    })

    if (response) {
      tableData.value = response.records || []
      pagination.total = response.total || 0
      pagination.current = response.current || 1
      pagination.size = response.size || 10
    } else {
      tableData.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取管理员列表失败:', error)
    ElMessage.error('获取管理员列表失败')
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchAdminList()
}

// 重置
const handleReset = () => {
  searchForm.username = ''
  pagination.current = 1
  fetchAdminList()
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  fetchAdminList()
}

const handleCurrentChange = (page: number) => {
  pagination.current = page
  fetchAdminList()
}

// 查看管理员详情
const handleView = async (row: AdminUserPageResponse) => {
  if (!row.id) return
  try {
    const response = await adminApi.getManagerAdminUserUserIdDetails(row.id)
    if (response) {
      currentAdmin.value = response as AdminUserDetailsResponse
      detailDialogVisible.value = true
    } else {
      ElMessage.error('获取管理员详情失败')
    }
  } catch (error) {
    console.error('获取管理员详情失败:', error)
    ElMessage.error('获取管理员详情失败')
  }
}

// 编辑管理员
const handleEdit = async (row: AdminUserPageResponse) => {
  if (!row.id) return
  try {
    const response = await adminApi.getManagerAdminUserUserIdDetails(row.id)
    if (response) {
      const admin = response as AdminUserDetailsResponse
      editForm.id = row.id
      editForm.nickname = admin.nickname || ''
      editForm.realName = admin.realName || ''
      editForm.email = admin.email || ''
      editForm.phone = admin.phone || ''
      editForm.status = admin.status || 1
      editForm.bio = admin.bio || ''
      editForm.qq = admin.qq || ''
      editForm.wechat = admin.wechat || ''
      editDialogVisible.value = true
    } else {
      ElMessage.error('获取管理员详情失败')
    }
  } catch (error) {
    console.error('获取管理员详情失败:', error)
    ElMessage.error('获取管理员详情失败')
  }
}

// 保存编辑
const handleSaveEdit = async () => {
  if (!editFormRef.value) return

  await editFormRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      await adminApi.putManagerAdminUser(editForm)
      ElMessage.success('更新管理员信息成功')
      editDialogVisible.value = false
      fetchAdminList()
    } catch (error) {
      console.error('更新管理员信息失败:', error)
      ElMessage.error('更新管理员信息失败')
    } finally {
      submitting.value = false
    }
  })
}

// 重置密码
const handleResetPassword = async (row: AdminUserPageResponse) => {
  if (!row.id) return
  try {
    await ElMessageBox.confirm(
      `确定要重置管理员 "${row.username}" 的密码吗？密码将被重置为默认密码。`,
      '重置密码',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    await adminApi.putManagerAdminUserUserIdResetPassword(row.id)
    ElMessage.success('密码重置成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('密码重置失败:', error)
      ElMessage.error('密码重置失败')
    }
  }
}

// 用户类型标签颜色映射
const getUserTypeTag = (type?: number) => {
  const map: Record<number, 'success' | 'warning' | 'info' | 'danger'> = {
    1: 'success',
    2: 'warning',
    3: 'info',
    4: 'info',
    5: 'danger',
  }
  return type ? map[type] || 'info' : 'info'
}

// 学院标签颜色映射
const getCollegeTag = (collegeId?: number) => {
  if (collegeId === 0) return 'success'
  if (collegeId === -1) return 'danger'
  return 'info'
}

// 初始化
onMounted(() => {
  if (hasPermission('admin-user:page')) {
    fetchAdminList()
  } else {
    ElMessage.warning('您没有权限访问管理员管理')
  }
})
</script>

<style scoped>
.admin-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 0;
}

.table-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-descriptions__label) {
  font-weight: 600;
  width: 120px;
}
</style>
