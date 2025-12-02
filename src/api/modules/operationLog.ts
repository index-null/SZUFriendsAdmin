import { get as getOperationLogApi } from '@/api/generated/操作日志管理/操作日志管理'
import type {
  OperationLogEntity,
  OperationLogQueryRequest,
  PageResultOperationLogResponse,
} from '@/api/generated/.ts.schemas'

const operationLogApi = getOperationLogApi()

/**
 * 操作日志管理API
 */

/**
 * 分页查询操作日志
 */
export const getOperationLogPages = async (
  params: OperationLogQueryRequest,
): Promise<PageResultOperationLogResponse> => {
  return (await operationLogApi.postManagerOperationLogPages(params)) as any
}

/**
 * 获取操作日志详情
 */
export const getOperationLogDetail = async (
  id: number,
): Promise<OperationLogEntity> => {
  return (await operationLogApi.getManagerOperationLogId(id)) as any
}

// 导出类型
export type { OperationLogEntity, OperationLogQueryRequest }
