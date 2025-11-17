import { get, post, put } from '../request'
import type { PageParams, PageData } from '../types'

/**
 * 用户相关接口
 */

// 用户信息
export interface UserInfo {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  phone?: string
  createdAt?: string
  updatedAt?: string
}

// 更新用户信息参数
export interface UpdateUserParams {
  name?: string
  avatar?: string
  phone?: string
}

// 修改密码参数
export interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

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
