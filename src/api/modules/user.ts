import { get, post, put } from '../request'
import type { PageParams, PageData } from '../types'
import type { TbUser } from '../generated/.ts.schemas'

/**
 * 用户相关接口
 * 基础类型使用生成的 TbUser，自定义扩展类型手动维护
 */

// ============ 导出生成的类型 ============
export type { TbUser }

// ============ 扩展类型（手动维护） ============

/**
 * 用户信息扩展（用于前端展示）
 * 基于 TbUser，去除敏感字段
 */
export type UserInfo = Omit<TbUser, 'password'> & {
  role?: string // 前端展示用的角色名称
}

/**
 * 更新用户信息参数
 */
export interface UpdateUserParams {
  nickname?: string
  avatar?: string
  phone?: string
  email?: string
  gender?: number
  realName?: string
}

/**
 * 修改密码参数
 */
export interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

// ============ API 方法 ============

/**
 * 获取当前用户信息
 */
export const getUserInfo = () => {
  return get<UserInfo>('/user/info')
}

/**
 * 更新用户信息
 */
export const updateUserInfo = (params: UpdateUserParams) => {
  return put<UserInfo>('/user/info', params)
}

/**
 * 修改密码
 */
export const changePassword = (params: ChangePasswordParams) => {
  return post('/user/change-password', params)
}

/**
 * 获取用户列表（分页）
 */
export const getUserList = (params: PageParams & { keyword?: string }) => {
  return get<PageData<UserInfo>>('/user/list', params)
}

/**
 * 上传头像
 */
export const uploadAvatar = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  return post<{ url: string }>('/user/upload-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
