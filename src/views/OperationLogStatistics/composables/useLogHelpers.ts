/**
 * 操作日志辅助函数
 */
export function useLogHelpers() {
  /**
   * 格式化JSON字符串
   */
  const formatJson = (jsonStr?: string): string => {
    if (!jsonStr) return '-'
    try {
      const obj = JSON.parse(jsonStr)
      return JSON.stringify(obj, null, 2)
    } catch {
      return jsonStr
    }
  }

  /**
   * 获取操作类型标签颜色
   */
  const getActionTagType = (action?: string) => {
    const actionMap: Record<string, 'success' | 'warning' | 'danger' | 'info'> =
      {
        新增: 'success',
        修改: 'warning',
        删除: 'danger',
        登录: 'info',
        导出: 'info',
        审核: 'warning',
      }
    return action ? actionMap[action] || 'info' : 'info'
  }

  /**
   * 获取请求方法标签颜色
   */
  const getMethodTagType = (method?: string) => {
    const methodMap: Record<
      string,
      'success' | 'primary' | 'warning' | 'danger'
    > = {
      GET: 'success',
      POST: 'primary',
      PUT: 'warning',
      DELETE: 'danger',
    }
    return method ? methodMap[method] || 'info' : 'info'
  }

  /**
   * 获取耗时标签颜色
   */
  const getCostTimeTagType = (costTime?: number) => {
    if (!costTime) return 'success'
    if (costTime < 100) return 'success'
    if (costTime < 500) return 'warning'
    return 'danger'
  }

  /**
   * 获取状态标签颜色
   */
  const getStatusTagType = (status?: string) => {
    // status: 'SUCCESS'-成功，'FAILURE'-失败，undefined-未知
    if (status === 'SUCCESS') return 'success'
    if (status === 'FAILURE') return 'danger'
    return 'info'
  }

  /**
   * 获取状态文本
   */
  const getStatusText = (status?: string) => {
    if (status === 'SUCCESS') return '成功'
    if (status === 'FAILURE') return '失败'
    return '未知'
  }

  return {
    formatJson,
    getActionTagType,
    getMethodTagType,
    getCostTimeTagType,
    getStatusTagType,
    getStatusText,
  }
}
