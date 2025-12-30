import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { get as getDictItemApi } from '@/api/generated/字典管理-字典项/字典管理-字典项'
import type { DictItemEntity } from '@/api/generated/.ts.schemas'

const dictItemApi = getDictItemApi()

/**
 * 字典项缓存映射
 * 格式：{ dictType: DictItemEntity[] }
 */
type DictCache = Record<string, DictItemEntity[]>

/**
 * 字典标签映射
 * 格式：{ dictType: { itemValue: label } }
 */
type DictLabelMap = Record<string, Record<string, string>>

/**
 * 字典 Store
 * 提供字典项的缓存、查询和转换功能
 */
export const useDictStore = defineStore('dict', () => {
  // ============ 状态定义 ============

  /**
   * 字典项缓存
   */
  const dictCache = ref<DictCache>({})

  /**
   * 加载状态映射
   * 格式：{ dictType: boolean }
   */
  const loadingMap = ref<Record<string, boolean>>({})

  // ============ 计算属性 ============

  /**
   * 字典标签映射（用于快速查找值对应的标签）
   */
  const dictLabelMap = computed<DictLabelMap>(() => {
    const map: DictLabelMap = {}
    Object.keys(dictCache.value).forEach((dictType) => {
      const items = dictCache.value[dictType]
      if (items && items.length > 0) {
        map[dictType] = {}
        items.forEach((item) => {
          if (item.itemValue && item.label && map[dictType]) {
            map[dictType][item.itemValue] = item.label
          }
        })
      }
    })
    return map
  })

  // ============ Actions ============

  /**
   * 加载字典项
   * @param dictType 字典类型
   * @param force 是否强制重新加载（忽略缓存）
   * @returns 字典项数组
   */
  const loadDictItems = async (
    dictType: string,
    force = false,
  ): Promise<DictItemEntity[]> => {
    // 如果已缓存且不强制刷新，直接返回缓存
    if (!force && dictCache.value[dictType]) {
      return dictCache.value[dictType]
    }

    // 如果正在加载中，等待加载完成
    if (loadingMap.value[dictType]) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!loadingMap.value[dictType]) {
            clearInterval(checkInterval)
            resolve(dictCache.value[dictType] || [])
          }
        }, 100)
      })
    }

    // 开始加载
    loadingMap.value[dictType] = true

    try {
      const items = await dictItemApi.getManagerDictTypeDictType(dictType)
      // 按 sortOrder 排序
      const sortedItems = items.sort(
        (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
      )
      dictCache.value[dictType] = sortedItems
      return sortedItems
    } catch (error) {
      console.error(`加载字典项失败: ${dictType}`, error)
      return []
    } finally {
      loadingMap.value[dictType] = false
    }
  }

  /**
   * 批量加载多个字典类型
   * @param dictTypes 字典类型数组
   */
  const loadMultipleDictItems = async (dictTypes: string[]) => {
    await Promise.all(dictTypes.map((type) => loadDictItems(type)))
  }

  /**
   * 获取字典项（同步方法）
   * @param dictType 字典类型
   * @returns 字典项数组，如果未加载则返回空数组
   */
  const getDictItems = (dictType: string): DictItemEntity[] => {
    return dictCache.value[dictType] || []
  }

  /**
   * 根据字典值获取标签
   * @param dictType 字典类型
   * @param value 字典值
   * @returns 标签文本，未找到返回原值
   */
  const getDictLabel = (
    dictType: string,
    value: string | number | undefined,
  ): string => {
    if (value === undefined || value === null) return ''
    const valueStr = String(value)
    return dictLabelMap.value[dictType]?.[valueStr] || valueStr
  }

  /**
   * 批量获取字典标签
   * @param dictType 字典类型
   * @param values 字典值数组
   * @returns 标签数组
   */
  const getDictLabels = (
    dictType: string,
    values: (string | number | undefined)[],
  ): string[] => {
    return values.map((value) => getDictLabel(dictType, value))
  }

  /**
   * 根据标签获取字典值
   * @param dictType 字典类型
   * @param label 标签文本
   * @returns 字典值，未找到返回空字符串
   */
  const getDictValue = (dictType: string, label: string): string => {
    const items = getDictItems(dictType)
    const item = items.find((i) => i.label === label)
    return item?.itemValue || ''
  }

  /**
   * 检查字典是否已加载
   * @param dictType 字典类型
   * @returns 是否已加载
   */
  const isDictLoaded = (dictType: string): boolean => {
    return !!dictCache.value[dictType]
  }

  /**
   * 检查字典是否正在加载
   * @param dictType 字典类型
   * @returns 是否正在加载
   */
  const isDictLoading = (dictType: string): boolean => {
    return !!loadingMap.value[dictType]
  }

  /**
   * 清除字典缓存
   * @param dictType 字典类型，不传则清除所有缓存
   */
  const clearDictCache = (dictType?: string) => {
    if (dictType) {
      delete dictCache.value[dictType]
    } else {
      dictCache.value = {}
    }
  }

  /**
   * 刷新字典项
   * @param dictType 字典类型
   */
  const refreshDictItems = async (dictType: string) => {
    return loadDictItems(dictType, true)
  }

  // ============ 导出 ============

  return {
    // 状态
    dictCache,
    loadingMap,

    // 计算属性
    dictLabelMap,

    // 方法
    loadDictItems,
    loadMultipleDictItems,
    getDictItems,
    getDictLabel,
    getDictLabels,
    getDictValue,
    isDictLoaded,
    isDictLoading,
    clearDictCache,
    refreshDictItems,
  }
})
