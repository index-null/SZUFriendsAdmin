import { get as getClassApi } from '@/api/generated/班级相关信息-班级控制器/班级相关信息-班级控制器'
import type {
  ClassEntity,
  ClassPagesRequest,
  PostCommunityClassBody,
  PageResultClassEntity,
} from '@/api/generated/.ts.schemas'

const classApi = getClassApi()

/**
 * 班级管理API
 * 注意：响应拦截器已经处理了数据解包（从 Result 中提取 data）
 */

export const getClassPages = async (
  params: ClassPagesRequest,
): Promise<PageResultClassEntity> => {
  return (await classApi.postCommunityClassPages(params)) as any
}

export const createClass = async (
  data: PostCommunityClassBody,
): Promise<any> => {
  return await classApi.postCommunityClass(data)
}

export const updateClass = async (data: ClassEntity): Promise<any> => {
  return await classApi.putCommunityClass(data)
}

export const deleteClass = async (id: number): Promise<any> => {
  return await classApi.deleteCommunityClassId(id)
}

// 直接导出后端类型，不做冗余扩展
export type { ClassEntity, ClassPagesRequest, PostCommunityClassBody }
