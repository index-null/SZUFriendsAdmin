import { get as getDictApi } from '@/api/generated/字典管理-字典/字典管理-字典'
import { get as getDictItemApi } from '@/api/generated/字典管理-字典项/字典管理-字典项'
import type {
  DictEntity,
  DictPagesRequest,
  CreateDictRequest,
  UpdateDictRequest,
  PageResultDictEntity,
  DictItemEntity,
  DictItemPagesRequest,
  CreateDictItemRequest,
  UpdateDictItemRequest,
  PageResultDictItemEntity,
  GetManagerDictItemCheckParams,
} from '@/api/generated/.ts.schemas'

const dictApi = getDictApi()
const dictItemApi = getDictItemApi()

/**
 * 字典管理API
 * 注意：响应拦截器已经处理了数据解包（从 Result 中提取 data）
 */

// ==================== 字典管理 ====================

export const getDictPages = async (
  params: DictPagesRequest,
): Promise<PageResultDictEntity> => {
  return (await dictApi.postManagerDictPage(params)) as any
}

export const createDict = async (data: CreateDictRequest): Promise<any> => {
  return await dictApi.postManagerDict(data)
}

export const updateDict = async (data: UpdateDictRequest): Promise<any> => {
  return await dictApi.putManagerDict(data)
}

export const deleteDict = async (id: number): Promise<any> => {
  return await dictApi.deleteManagerDictId(id)
}

export const getDictDetails = async (id: number): Promise<DictEntity> => {
  return (await dictApi.getManagerDictDetailsId(id)) as any
}

/**
 * 检查字典类型是否已存在
 * @param dictType 字典类型
 * @returns true: 不存在可用, false: 已存在
 */
export const checkDictType = async (dictType: string): Promise<boolean> => {
  return (await dictApi.getManagerDictCheck({ dictType })) as any
}

// ==================== 字典项管理 ====================

export const getDictItemPages = async (
  params: DictItemPagesRequest,
): Promise<PageResultDictItemEntity> => {
  return (await dictItemApi.postManagerDictItemPage(params)) as any
}

export const getDictItemsByType = async (
  dictType: string,
): Promise<DictItemEntity[]> => {
  return (await dictItemApi.getManagerDictTypeDictType(dictType)) as any
}

export const createDictItem = async (
  data: CreateDictItemRequest,
): Promise<any> => {
  return await dictItemApi.postManagerDictItem(data)
}

export const updateDictItem = async (
  data: UpdateDictItemRequest,
): Promise<any> => {
  return await dictItemApi.putManagerDictItem(data)
}

export const deleteDictItem = async (id: number): Promise<any> => {
  return await dictItemApi.deleteManagerDictItemId(id)
}

export const getDictItemDetails = async (
  id: number,
): Promise<DictItemEntity> => {
  return (await dictItemApi.getManagerDictItemDetailsId(id)) as any
}

/**
 * 检查字典项是否已存在
 * @param params 包含 dictType 和 label
 * @returns true: 不存在可用, false: 已存在
 */
export const checkDictItem = async (
  params: GetManagerDictItemCheckParams,
): Promise<boolean> => {
  return (await dictItemApi.getManagerDictItemCheck(params)) as any
}

// 直接导出后端类型，不做冗余扩展
export type {
  DictEntity,
  DictPagesRequest,
  CreateDictRequest,
  UpdateDictRequest,
  DictItemEntity,
  DictItemPagesRequest,
  CreateDictItemRequest,
  UpdateDictItemRequest,
}
