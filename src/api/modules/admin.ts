import { get as getAdminApi } from '@/api/generated/管理员管理/管理员管理'
import type {
  AdminUserPagesRequest,
  AdminUserUpdateRequest,
  AdminUserDetailsResponse,
  AdminUserPageResponse,
  PageResultAdminUserPageResponse,
} from '@/api/generated/.ts.schemas'

const adminApi = getAdminApi()

/**
 * 管理员管理 API
 * 完全使用生成的接口定义，无需手动维护类型
 */

// ============ 导出生成的类型 ============
export type {
  AdminUserPagesRequest,
  AdminUserUpdateRequest,
  AdminUserDetailsResponse,
  AdminUserPageResponse,
  PageResultAdminUserPageResponse,
}

// ============ 管理员 CRUD API 方法 ============

/**
 * 分页查询管理员列表
 */
export const getAdminUserPages = async (
  params: AdminUserPagesRequest,
): Promise<PageResultAdminUserPageResponse> => {
  return await adminApi.postManagerAdminUserPage(params)
}

/**
 * 根据ID查询管理员详情
 */
export const getAdminUserById = async (
  userId: number,
): Promise<AdminUserDetailsResponse> => {
  return await adminApi.getManagerAdminUserUserIdDetails(userId)
}

/**
 * 更新管理员信息
 */
export const updateAdminUser = async (
  data: AdminUserUpdateRequest,
): Promise<boolean> => {
  return await adminApi.putManagerAdminUser(data)
}

/**
 * 重置管理员密码
 */
export const resetAdminUserPassword = async (
  userId: number,
): Promise<boolean> => {
  return await adminApi.putManagerAdminUserUserIdResetPassword(userId)
}
