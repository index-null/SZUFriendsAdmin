/**
 * 权限工具函数
 * 统一的权限判断逻辑
 */

/**
 * 从学院管理员ID判断权限级别
 * @param collegeLeaderId 学院管理员ID
 * @returns 权限级别描述
 */
export const getPermissionLevel = (
  collegeLeaderId?: number,
): 'super-admin' | 'college-admin' | 'user' | 'none' => {
  if (collegeLeaderId === undefined || collegeLeaderId === null) {
    return 'none'
  }

  if (collegeLeaderId === 0) {
    return 'super-admin' // 全部学院权限
  }

  if (collegeLeaderId > 0) {
    return 'college-admin' // 特定学院权限
  }

  return 'none' // -1 或其他负数表示无权限
}

/**
 * 判断是否有管理权限
 * @param collegeLeaderId 学院管理员ID
 * @returns 是否有管理权限
 */
export const hasAdminPermission = (collegeLeaderId?: number): boolean => {
  const level = getPermissionLevel(collegeLeaderId)
  return level === 'super-admin' || level === 'college-admin'
}

/**
 * 判断是否为超级管理员
 * @param collegeLeaderId 学院管理员ID
 * @returns 是否为超级管理员
 */
export const isSuperAdmin = (collegeLeaderId?: number): boolean => {
  return getPermissionLevel(collegeLeaderId) === 'super-admin'
}

/**
 * 检查是否拥有特定权限码
 * @param permissions 用户权限列表
 * @param permissionCode 需要检查的权限码
 * @returns 是否拥有权限
 */
export const hasPermissionCode = (
  permissions: string[] | undefined,
  permissionCode: string,
): boolean => {
  if (!permissions || permissions.length === 0) {
    return false
  }
  return permissions.includes(permissionCode)
}

/**
 * 检查是否拥有任意一个权限
 * @param permissions 用户权限列表
 * @param permissionCodes 需要检查的权限码列表
 * @returns 是否拥有任意权限
 */
export const hasAnyPermission = (
  permissions: string[] | undefined,
  permissionCodes: string[],
): boolean => {
  if (!permissions || permissions.length === 0) {
    return false
  }
  return permissionCodes.some((code) => permissions.includes(code))
}

/**
 * 检查是否拥有所有权限
 * @param permissions 用户权限列表
 * @param permissionCodes 需要检查的权限码列表
 * @returns 是否拥有所有权限
 */
export const hasAllPermissions = (
  permissions: string[] | undefined,
  permissionCodes: string[],
): boolean => {
  if (!permissions || permissions.length === 0) {
    return false
  }
  return permissionCodes.every((code) => permissions.includes(code))
}
