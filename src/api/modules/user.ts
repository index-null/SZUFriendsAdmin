import { get, post } from '../request'
import type { PageParams, PageData } from '../types'
import type {
  UserInfoResponse,
  ProfileResponse,
  UpdateProfileRequest,
} from '../generated/.ts.schemas'
import { get as getProfileApi } from '../generated/个人资料管理/个人资料管理'

/**
 * 用户相关接口
 * 使用生成的 UserInfoResponse 类型，自定义扩展类型手动维护
 */

// ============ 导出生成的类型 ============
export type { UserInfoResponse, ProfileResponse, UpdateProfileRequest }

// ============ 扩展类型（手动维护） ============

/**
 * 用户信息扩展（用于前端展示）
 * 基于 UserInfoResponse
 */
export type UserInfo = UserInfoResponse & {
  role?: string // 前端展示用的角色名称
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

// 初始化 Profile API
const profileApi = getProfileApi()

/**
 * 获取当前用户个人资料（推荐使用）
 * 返回用户信息 + 校友档案信息
 */
export const getProfile = async (): Promise<ProfileResponse> => {
  const response = await profileApi.getAuthProfile()
  return response as any
}

/**
 * 更新个人资料（推荐使用）
 */
export const updateProfile = async (
  data: UpdateProfileRequest,
): Promise<boolean> => {
  const response = await profileApi.postAuthProfile(data)
  return response as any
}

/**
 * 获取当前用户信息（兼容旧接口）
 * @deprecated 建议使用 getProfile() 获取完整的用户信息和校友档案
 */
export const getUserInfo = async (): Promise<UserInfo> => {
  const profile = await getProfile()
  return profile.userInfo || {}
}

/**
 * 更新用户信息（兼容旧接口）
 * @deprecated 建议使用 updateProfile() 更新个人资料
 */
export const updateUserInfo = async (
  params: Partial<UserInfoResponse>,
): Promise<UserInfo> => {
  await updateProfile(params as UpdateProfileRequest)
  return params as UserInfo
}

/**
 * 修改密码
 */
export const changePassword = (params: ChangePasswordParams) => {
  return post('/user/change-password', params)
}

/**
 * 获取用户列表（分页）
 * @deprecated 建议使用生成的 API: userApi.postAuthUserPages()
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
