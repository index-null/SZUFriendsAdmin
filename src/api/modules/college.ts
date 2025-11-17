import { get as getCollegeApi } from '@/api/generated/学院信息控制器/学院信息控制器'
import type {
  CollegeEntity,
  CollegePagesRequest,
} from '@/api/generated/.ts.schemas'

const collegeApi = getCollegeApi()

/**
 * 学院管理API
 * 注意：响应拦截器已经处理了数据解包（从 Result 中提取 data）
 */

interface PageResult {
  records?: CollegeEntity[]
  total?: number
  current?: number
  size?: number
  pages?: number
}

// 扩展的搜索参数接口
export interface CollegeSearchParams extends CollegePagesRequest {
  collegeCode?: string
  collegeName?: string
  dean?: string
  status?: number
}

export const getCollegePages = async (
  params: CollegeSearchParams,
): Promise<PageResult> => {
  return (await collegeApi.postCommunityCollegePages(params as any)) as any
}

export const createCollege = async (data: CollegeEntity): Promise<any> => {
  return await collegeApi.postCommunityCollege(data)
}

export const updateCollege = async (data: CollegeEntity): Promise<any> => {
  return await collegeApi.putCommunityCollege(data)
}

export const deleteCollege = async (id: number): Promise<any> => {
  return await collegeApi.deleteCommunityCollegeId(id)
}

export type { CollegeEntity, CollegePagesRequest }
