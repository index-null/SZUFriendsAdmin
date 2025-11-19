import { get as getCollegeApi } from '@/api/generated/学院信息控制器/学院信息控制器'
import type {
  CollegeEntity,
  CollegePagesRequest,
  PageResultCollegeEntity,
} from '@/api/generated/.ts.schemas'

const collegeApi = getCollegeApi()

/**
 * 学院管理 API
 * 完全使用生成的接口定义，无需手动维护类型
 */

// ============ 导出生成的类型 ============
export type { CollegeEntity, CollegePagesRequest, PageResultCollegeEntity }

// ============ API 方法 ============

/**
 * 分页查询学院列表
 * @param params 查询参数（CollegePagesRequest 已包含所有搜索字段）
 */
export const getCollegePages = async (
  params: CollegePagesRequest,
): Promise<PageResultCollegeEntity> => {
  return (await collegeApi.postCommunityCollegePages(params)) as any
}

/**
 * 创建学院
 */
export const createCollege = async (data: CollegeEntity): Promise<boolean> => {
  return (await collegeApi.postCommunityCollege(data)) as any
}

/**
 * 更新学院
 */
export const updateCollege = async (data: CollegeEntity): Promise<boolean> => {
  return (await collegeApi.putCommunityCollege(data)) as any
}

/**
 * 删除学院
 */
export const deleteCollege = async (id: number): Promise<boolean> => {
  return (await collegeApi.deleteCommunityCollegeId(id)) as any
}
