/**
 * 学院映射 Composable
 * 用于管理学院 ID 到名称的映射
 */

import { ref, onMounted } from 'vue'
import { get as getCollegeApi } from '@/api/generated/学院信息控制器/学院信息控制器'

const collegeApi = getCollegeApi()

/**
 * 学院映射 Hook
 * @returns 学院映射数据和方法
 */
export const useCollegeMap = () => {
  // 学院映射：ID -> 名称
  const collegeMap = ref<Record<string, string>>({})

  // 加载状态
  const loading = ref(false)

  // 是否已加载
  const loaded = ref(false)

  /**
   * 加载学院字典
   */
  const loadCollegeMap = async () => {
    if (loaded.value) return

    loading.value = true
    try {
      const response = (await collegeApi.getManagerCollegeDict()) as any
      // API 返回格式可能已经解包
      collegeMap.value = response?.collegeDict || response || {}
      loaded.value = true
    } catch (error) {
      console.error('加载学院字典失败:', error)
      collegeMap.value = {}
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新学院字典
   */
  const refreshCollegeMap = async () => {
    loaded.value = false
    await loadCollegeMap()
  }

  /**
   * 根据学院 ID 获取学院名称
   * @param collegeId 学院 ID
   * @returns 学院名称
   */
  const getCollegeName = (collegeId?: number | string | null): string => {
    if (collegeId === undefined || collegeId === null) return '未知'

    // 特殊值处理
    if (collegeId === 0 || collegeId === '0') return '全部学院'
    if (collegeId === -1 || collegeId === '-1') return '无权限'

    // 从映射中查找
    const name = collegeMap.value[String(collegeId)]
    return name || `映射失败，原始学院ID: ${collegeId}`
  }

  // 组件挂载时自动加载
  onMounted(() => {
    loadCollegeMap()
  })

  return {
    collegeMap,
    loading,
    loaded,
    loadCollegeMap,
    refreshCollegeMap,
    getCollegeName,
  }
}
