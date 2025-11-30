import { get as getCollegeApi } from '@/api/generated/学院信息控制器/学院信息控制器'
import type {
  CollegeEntity,
  CollegePagesRequest,
  PageResultCollegeEntity,
  CollegeDictResponse,
} from '@/api/generated/.ts.schemas'

const collegeApi = getCollegeApi()

/**
 * 学院管理 API
 * 完全使用生成的接口定义，无需手动维护类型
 */

// ============ 导出生成的类型 ============
export type {
  CollegeEntity,
  CollegePagesRequest,
  PageResultCollegeEntity,
  CollegeDictResponse,
}

// ============ API 方法 ============

/**
 * 分页查询学院列表
 * @param params 查询参数（CollegePagesRequest 已包含所有搜索字段）
 */
export const getCollegePages = async (
  params: CollegePagesRequest,
): Promise<PageResultCollegeEntity> => {
  return (await collegeApi.postManagerCollegePages(params)) as any
}

/**
 * 获取学院字典（ID -> 名称映射）
 */
export const getCollegeDict = async (): Promise<Record<string, string>> => {
  const response = (await collegeApi.getManagerCollegeDict()) as any
  // API 返回格式: { data: { collegeDict: {...} } }
  // 但 orval 生成的接口可能已经解包，所以尝试两种路径
  return response?.collegeDict || {}
}

/**
 * 创建学院
 */
export const createCollege = async (data: CollegeEntity): Promise<boolean> => {
  return (await collegeApi.postManagerCollege(data)) as any
}

/**
 * 更新学院
 */
export const updateCollege = async (data: CollegeEntity): Promise<boolean> => {
  return (await collegeApi.putManagerCollege(data)) as any
}

/**
 * 删除学院
 */
export const deleteCollege = async (id: number): Promise<boolean> => {
  return (await collegeApi.deleteManagerCollegeId(id)) as any
}
