/**
 * 字典工具函数
 * 提供便捷的字典操作方法
 */

import { useDictStore } from '@/stores/modules/dict'
import type { DictItemEntity } from '@/api/modules/dict'

/**
 * 字典选项接口（用于下拉框等组件）
 */
export interface DictOption {
  label: string
  value: string | number
  disabled?: boolean
  [key: string]: any
}

/**
 * 将字典项转换为选项格式
 * @param items 字典项数组
 * @returns 选项数组
 */
export const dictItemsToOptions = (items: DictItemEntity[]): DictOption[] => {
  return items.map((item) => ({
    label: item.label || '',
    value: item.itemValue || '',
    disabled: false,
    ...item,
  }))
}

/**
 * 获取字典选项（异步）
 * @param dictType 字典类型
 * @returns 选项数组
 */
export const getDictOptions = async (
  dictType: string,
): Promise<DictOption[]> => {
  const dictStore = useDictStore()
  const items = await dictStore.loadDictItems(dictType)
  return dictItemsToOptions(items)
}

/**
 * 获取字典选项（同步）
 * 注意：需要先确保字典已加载
 * @param dictType 字典类型
 * @returns 选项数组
 */
export const getDictOptionsSync = (dictType: string): DictOption[] => {
  const dictStore = useDictStore()
  const items = dictStore.getDictItems(dictType)
  return dictItemsToOptions(items)
}

/**
 * 字典值转标签
 * @param dictType 字典类型
 * @param value 字典值
 * @returns 标签文本
 */
export const dictLabel = (
  dictType: string,
  value: string | number | undefined,
): string => {
  const dictStore = useDictStore()
  return dictStore.getDictLabel(dictType, value)
}

/**
 * 字典标签转值
 * @param dictType 字典类型
 * @param label 标签文本
 * @returns 字典值
 */
export const dictValue = (dictType: string, label: string): string => {
  const dictStore = useDictStore()
  return dictStore.getDictValue(dictType, label)
}

/**
 * 批量字典值转标签
 * @param dictType 字典类型
 * @param values 字典值数组
 * @returns 标签数组
 */
export const dictLabels = (
  dictType: string,
  values: (string | number | undefined)[],
): string[] => {
  const dictStore = useDictStore()
  return dictStore.getDictLabels(dictType, values)
}

/**
 * 创建字典格式化器（用于表格列）
 * @param dictType 字典类型
 * @returns 格式化函数
 */
export const createDictFormatter = (dictType: string) => {
  return (_row: any, _column: any, cellValue: any) => {
    return dictLabel(dictType, cellValue)
  }
}

/**
 * 字典常量定义
 * 集中管理所有字典类型，避免硬编码
 */
export const DICT_TYPE = {
  /** 用户类型 */
  USER_TYPE: 'user_type',
  /** 班级类型 */
  CLASS_TYPE: 'class_type',
  /** 权限类型 */
  PERMISSION_TYPE: 'permission_type',
  /** HTTP方法 */
  HTTP_METHOD: 'http_method',
  /** 性别 */
  GENDER: 'gender',
  /** 状态 */
  STATUS: 'status',
} as const

/**
 * 字典类型的 TypeScript 类型
 */
export type DictType = (typeof DICT_TYPE)[keyof typeof DICT_TYPE]

/**
 * 常用字典类型数组（用于批量预加载）
 */
export const COMMON_DICT_TYPES: DictType[] = [
  DICT_TYPE.USER_TYPE,
  DICT_TYPE.CLASS_TYPE,
  DICT_TYPE.PERMISSION_TYPE,
  DICT_TYPE.HTTP_METHOD,
  DICT_TYPE.GENDER,
  DICT_TYPE.STATUS,
]

/**
 * 预加载常用字典
 */
export const preloadCommonDicts = async () => {
  const dictStore = useDictStore()
  await dictStore.loadMultipleDictItems(COMMON_DICT_TYPES)
}
