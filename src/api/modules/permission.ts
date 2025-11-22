/**
 * 权限管理 API 模块
 */

import { get } from '@/api/generated/用户认证控制器-权限管理/用户认证控制器-权限管理'
import type {
  CreatePermissionRequest,
  UpdatePermissionRequest,
  PermissionQueryRequest,
  PermissionResponse,
  PermissionTreeNodeResponse,
  PageResultPermissionResponse,
} from '@/api/generated/.ts.schemas'

const api = get()

// 导出类型
export type {
  CreatePermissionRequest,
  UpdatePermissionRequest,
  PermissionQueryRequest,
  PermissionResponse,
  PermissionTreeNodeResponse,
  PageResultPermissionResponse,
}

/**
 * 分页查询权限列表
 */
export const getPermissionPages = async (
  params: PermissionQueryRequest,
): Promise<PageResultPermissionResponse> => {
  return (await api.postAuthPermissionQuery(params)) as any
}

/**
 * 查询所有权限列表（不分页）
 */
export const getAllPermissions = async (): Promise<PermissionResponse[]> => {
  return (await api.getAuthPermissionList()) as any
}

/**
 * 查询权限树（树形结构）
 */
export const getPermissionTree = async (): Promise<
  PermissionTreeNodeResponse[]
> => {
  return (await api.getAuthPermissionTreeAll()) as any
}

/**
 * 查询权限详情
 */
export const getPermissionDetail = async (
  id: number,
): Promise<PermissionResponse> => {
  return (await api.getAuthPermissionPermissionId(id)) as any
}

/**
 * 创建权限
 */
export const createPermission = async (
  data: CreatePermissionRequest,
): Promise<PermissionResponse> => {
  return (await api.postAuthPermission(data)) as any
}

/**
 * 更新权限
 */
export const updatePermission = async (
  data: UpdatePermissionRequest,
): Promise<PermissionResponse> => {
  return (await api.putAuthPermission(data)) as any
}

/**
 * 删除权限（会级联删除所有子权限）
 */
export const deletePermission = async (id: number): Promise<boolean> => {
  return (await api.deleteAuthPermissionPermissionId(id)) as any
}
