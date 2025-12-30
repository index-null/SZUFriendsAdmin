/**
 * 字典 Composable
 * 提供在组件中使用字典的便捷方法
 */

import { ref, computed, onMounted, type Ref } from 'vue'
import { useDictStore } from '../modules/dict'
import type { DictItemEntity } from '@/api/generated/.ts.schemas'
import { dictItemsToOptions, type DictOption } from '@/utils/dict'

/**
 * 使用字典 Hook
 * @param dictType 字典类型
 * @param autoLoad 是否自动加载（默认 true）
 * @returns 字典相关的响应式数据和方法
 */
export const useDict = (dictType: string | Ref<string>, autoLoad = true) => {
  const dictStore = useDictStore()
  const dictTypeRef = ref(dictType)

  // 字典项
  const dictItems = computed<DictItemEntity[]>(() =>
    dictStore.getDictItems(dictTypeRef.value),
  )

  // 字典选项
  const dictOptions = computed<DictOption[]>(() =>
    dictItemsToOptions(dictItems.value),
  )

  // 加载状态
  const loading = computed(() => dictStore.isDictLoading(dictTypeRef.value))

  // 是否已加载
  const loaded = computed(() => dictStore.isDictLoaded(dictTypeRef.value))

  // 加载字典
  const loadDict = async (force = false) => {
    return dictStore.loadDictItems(dictTypeRef.value, force)
  }

  // 刷新字典
  const refreshDict = async () => {
    return loadDict(true)
  }

  // 获取标签
  const getLabel = (value?: string | number | null) => {
    if (value === undefined || value === null) return ''
    return dictStore.getDictLabel(dictTypeRef.value, value)
  }

  // 获取值
  const getValue = (label: string) => {
    return dictStore.getDictValue(dictTypeRef.value, label)
  }

  // 自动加载
  if (autoLoad) {
    onMounted(() => {
      loadDict()
    })
  }

  return {
    dictItems,
    dictOptions,
    loading,
    loaded,
    loadDict,
    refreshDict,
    getLabel,
    getValue,
  }
}

/**
 * 使用多个字典 Hook
 * @param dictTypes 字典类型数组
 * @param autoLoad 是否自动加载（默认 true）
 * @returns 多个字典相关的响应式数据和方法
 */
export const useDicts = (dictTypes: string[], autoLoad = true) => {
  const dictStore = useDictStore()

  // 所有字典项
  const allDictItems = computed(() => {
    const result: Record<string, DictItemEntity[]> = {}
    dictTypes.forEach((type) => {
      result[type] = dictStore.getDictItems(type)
    })
    return result
  })

  // 所有字典选项
  const allDictOptions = computed(() => {
    const result: Record<string, DictOption[]> = {}
    dictTypes.forEach((type) => {
      result[type] = dictItemsToOptions(dictStore.getDictItems(type))
    })
    return result
  })

  // 整体加载状态
  const loading = computed(() =>
    dictTypes.some((type) => dictStore.isDictLoading(type)),
  )

  // 是否全部已加载
  const allLoaded = computed(() =>
    dictTypes.every((type) => dictStore.isDictLoaded(type)),
  )

  // 加载所有字典
  const loadDicts = async (force = false) => {
    await Promise.all(
      dictTypes.map((type) => dictStore.loadDictItems(type, force)),
    )
  }

  // 刷新所有字典
  const refreshDicts = async () => {
    return loadDicts(true)
  }

  // 获取标签
  const getLabel = (dictType: string, value: string | number) => {
    return dictStore.getDictLabel(dictType, value)
  }

  // 获取值
  const getValue = (dictType: string, label: string) => {
    return dictStore.getDictValue(dictType, label)
  }

  // 自动加载
  if (autoLoad) {
    onMounted(() => {
      loadDicts()
    })
  }

  return {
    allDictItems,
    allDictOptions,
    loading,
    allLoaded,
    loadDicts,
    refreshDicts,
    getLabel,
    getValue,
  }
}
