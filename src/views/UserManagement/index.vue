<template>
  <div class="user-management">
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
              {{ getUserTypeText(row.userType) }}
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
              v-if="hasPermission('user:view')"
              type="primary"
              size="small"
              :icon="View"
              link
              @click="handleView(row)"
              >查看</el-button
            >
            <el-button
              v-if="hasPermission('user:assign-role')"
              type="warning"
              size="small"
              :icon="Setting"
              link
              @click="handleAssignRole(row)"
              >分配角色</el-button
            >
            <el-button
              v-if="hasPermission('user:reset-password')"
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

    <!-- 用户详情抽屉 -->
    <UserDetailDrawer
      v-model:visible="detailDrawerVisible"
      :user-detail="currentUser"
    />

    <!-- 分配角色对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      title="分配角色"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="roleForm" label-width="80px">
        <el-form-item label="用户名">
          <el-text>{{ roleForm.username }}</el-text>
        </el-form-item>
        <el-form-item label="选择角色">
          <el-checkbox-group v-model="roleForm.roleIds">
            <el-checkbox
              v-for="role in allRoles"
              :key="role.id"
              :label="role.id"
              :value="role.id"
            >
              {{ role.roleName }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSaveRoles"
          >确定</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  RefreshRight,
  View,
  Setting,
  Lock,
  User,
} from '@element-plus/icons-vue'
import { usePermission } from '@/stores'
import { get as getUserApi } from '@/api/generated/用户管理/用户管理'
import { get as getRoleApi } from '@/api/generated/用户认证控制器-角色管理/用户认证控制器-角色管理'
import UserDetailDrawer from './components/UserDetailDrawer.vue'
import type {
  UserPageVo,
  UserEntity,
  RoleResponse,
  UpdateUserRolesRequest,
} from '@/api/generated/.ts.schemas'

const { hasPermission } = usePermission()

// API 实例
const userApi = getUserApi()
const roleApi = getRoleApi()

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
const tableData = ref<UserPageVo[]>([])
const loading = ref(false)

// 用户详情
const detailDrawerVisible = ref(false)
const currentUser = ref<UserEntity | null>(null)

// 角色分配
const roleDialogVisible = ref(false)
const roleForm = reactive({
  userId: 0,
  username: '',
  roleIds: [] as number[],
})
const allRoles = ref<RoleResponse[]>([])
const submitting = ref(false)

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    const response = await userApi.postAuthUserPages({
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
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 获取所有角色
const fetchAllRoles = async () => {
  try {
    const response = await roleApi.getAuthRoleList()
    if (response && Array.isArray(response)) {
      allRoles.value = response.sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      )
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchUserList()
}

// 重置
const handleReset = () => {
  searchForm.username = ''
  pagination.current = 1
  fetchUserList()
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  fetchUserList()
}

const handleCurrentChange = (page: number) => {
  pagination.current = page
  fetchUserList()
}

// 查看用户详情
const handleView = async (row: UserPageVo) => {
  if (!row.id) return
  try {
    // UnwrapResult 自动解包: ResultUserEntity -> UserEntity
    const response = await userApi.getAuthUserUserId(row.id)
    if (response) {
      currentUser.value = response
      detailDrawerVisible.value = true
    } else {
      ElMessage.error('获取用户详情失败')
    }
  } catch (error) {
    console.error('获取用户详情失败:', error)
    ElMessage.error('获取用户详情失败')
  }
}

// 分配角色
const handleAssignRole = async (row: UserPageVo) => {
  if (!row.id) return
  try {
    // UnwrapResult 自动解包: ResultListRoleResponse -> RoleResponse[]
    const response = await userApi.getAuthUserUserIdRoles(row.id)
    if (response && Array.isArray(response)) {
      roleForm.userId = row.id
      roleForm.username = row.username || ''
      roleForm.roleIds = response
        .map((role) => role.id)
        .filter((id): id is number => id !== undefined)
      roleDialogVisible.value = true
    } else {
      ElMessage.error('获取用户角色失败')
    }
  } catch (error) {
    console.error('获取用户角色失败:', error)
    ElMessage.error('获取用户角色失败')
  }
}

// 保存角色
const handleSaveRoles = async () => {
  submitting.value = true
  try {
    const request: UpdateUserRolesRequest = {
      userId: roleForm.userId,
      roleIds: roleForm.roleIds,
    }
    await userApi.putAuthUserUpdateRoles(request)
    // 更新成功
    ElMessage.success('角色分配成功')
    roleDialogVisible.value = false
    fetchUserList()
  } catch (error) {
    console.error('角色分配失败:', error)
    ElMessage.error('角色分配失败')
  } finally {
    submitting.value = false
  }
}

// 重置密码
const handleResetPassword = async (row: UserPageVo) => {
  if (!row.id) return
  try {
    await ElMessageBox.confirm(
      `确定要重置用户 "${row.username}" 的密码吗？密码将被重置为默认密码。`,
      '重置密码',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    await userApi.putAuthUserUserIdResetPassword(row.id)
    ElMessage.success('密码重置成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('密码重置失败:', error)
      ElMessage.error('密码重置失败')
    }
  }
}

// 用户类型映射
const getUserTypeText = (type?: number) => {
  const map: Record<number, string> = {
    1: '学生',
    2: '教师',
    3: '校友',
  }
  return type ? map[type] || '未知' : '未知'
}

const getUserTypeTag = (type?: number) => {
  const map: Record<number, 'success' | 'warning' | 'info'> = {
    1: 'success',
    2: 'warning',
    3: 'info',
  }
  return type ? map[type] || 'info' : 'info'
}

// 初始化
onMounted(() => {
  if (hasPermission('user:page')) {
    fetchUserList()
    fetchAllRoles()
  } else {
    ElMessage.warning('您没有权限访问用户管理')
  }
})
</script>

<style scoped>
.user-management {
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
</style>
