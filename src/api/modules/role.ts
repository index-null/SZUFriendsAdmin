import { get as getRoleApi } from '@/api/generated/用户认证控制器-角色管理/用户认证控制器-角色管理'
import { get as getUserApi } from '@/api/generated/用户认证控制器-用户管理/用户认证控制器-用户管理'
import type {
  RoleResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleQueryRequest,
  PageResultRoleResponse,
  GrantPermissionsRequest,
  PermissionTreeNodeResponse,
  UpdateUserRolesRequest,
} from '@/api/generated/.ts.schemas'

const roleApi = getRoleApi()
const userApi = getUserApi()

/**
 * 角色管理 API
 * 完全使用生成的接口定义，无需手动维护类型
 */

// ============ 导出生成的类型 ============
export type {
  RoleResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleQueryRequest,
  PageResultRoleResponse,
  GrantPermissionsRequest,
  PermissionTreeNodeResponse,
  UpdateUserRolesRequest,
}

// ============ 角色 CRUD API 方法 ============

/**
 * 分页查询角色列表
 */
export const getRolePages = async (
  params: RoleQueryRequest,
): Promise<PageResultRoleResponse> => {
  return (await roleApi.postAuthRoleQuery(params)) as any
}

/**
 * 查询所有角色列表（不分页）
 */
export const getAllRoles = async (): Promise<RoleResponse[]> => {
  return (await roleApi.getAuthRoleList()) as any
}

/**
 * 根据ID查询角色详情
 */
export const getRoleById = async (roleId: number): Promise<RoleResponse> => {
  return (await roleApi.getAuthRoleRoleId(roleId)) as any
}

/**
 * 创建角色
 */
export const createRole = async (
  data: CreateRoleRequest,
): Promise<RoleResponse> => {
  return (await roleApi.postAuthRole(data)) as any
}

/**
 * 更新角色
 */
export const updateRole = async (
  data: UpdateRoleRequest,
): Promise<RoleResponse> => {
  return (await roleApi.putAuthRole(data)) as any
}

/**
 * 删除角色
 */
export const deleteRole = async (roleId: number): Promise<boolean> => {
  return (await roleApi.deleteAuthRoleRoleId(roleId)) as any
}

// ============ 角色权限管理 API 方法 ============

/**
 * 查询角色权限树
 */
export const getRolePermissions = async (
  roleId: number,
): Promise<PermissionTreeNodeResponse[]> => {
  return (await roleApi.getAuthRoleRoleIdPermissions(roleId)) as any
}

/**
 * 给角色授权
 */
export const grantPermissionsToRole = async (
  data: GrantPermissionsRequest,
): Promise<boolean> => {
  return (await roleApi.postAuthRolePermissionGrant(data)) as any
}

// ============ 用户角色管理 API 方法 ============

/**
 * 查询用户角色列表
 */
export const getUserRoles = async (userId: number): Promise<RoleResponse[]> => {
  return (await userApi.getAuthUserUserIdRoles(userId)) as any
}

/**
 * 更新用户角色（覆盖式更新）
 */
export const updateUserRoles = async (
  data: UpdateUserRolesRequest,
): Promise<boolean> => {
  return (await userApi.putAuthUserUpdateRoles(data)) as any
}
