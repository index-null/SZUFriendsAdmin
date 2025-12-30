import { saveAs } from 'file-saver'
import { ElMessage } from 'element-plus'

/**
 * 文件下载响应类型
 */
export interface DownloadResponse {
  blob: Blob
  filename?: string
}

/**
 * 从 Content-Disposition 头中提取文件名
 * @param contentDisposition Content-Disposition 头的值
 * @returns 文件名或 undefined
 */
export function parseFilenameFromHeader(
  contentDisposition?: string | null,
): string | undefined {
  if (!contentDisposition) return undefined

  // 尝试匹配 filename*=UTF-8''xxx 格式（RFC 5987）
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;\s]+)/i)
  if (utf8Match && utf8Match[1]) {
    try {
      return decodeURIComponent(utf8Match[1])
    } catch {
      // 解码失败，继续尝试其他格式
    }
  }

  // 尝试匹配 filename="xxx" 或 filename=xxx 格式
  const filenameMatch = contentDisposition.match(
    /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i,
  )
  if (filenameMatch && filenameMatch[1]) {
    let filename: string = filenameMatch[1]
    // 移除引号
    filename = filename.replace(/['"]/g, '')
    // 尝试 URL 解码
    try {
      return decodeURIComponent(filename)
    } catch {
      return filename
    }
  }

  return undefined
}

/**
 * 下载文件
 * @param blob Blob 数据
 * @param filename 文件名（可选，优先使用此参数）
 * @param defaultFilename 默认文件名（当无法获取文件名时使用）
 */
export function downloadFile(
  blob: Blob,
  filename?: string,
  defaultFilename = 'download',
): void {
  const finalFilename = filename || defaultFilename
  saveAs(blob, finalFilename)
}

/**
 * 下载文件（带响应头解析）
 * @param response 下载响应对象
 * @param fallbackFilename 备选文件名
 */
export function downloadFromResponse(
  response: DownloadResponse,
  fallbackFilename?: string,
): void {
  const filename = response.filename || fallbackFilename || 'download'
  saveAs(response.blob, filename)
}

/**
 * 下载模板文件
 * @param downloadFn 下载 API 函数
 * @param templateKey 模板 key
 * @param fallbackFilename 备选文件名
 */
export async function downloadTemplate(
  downloadFn: (key: string) => Promise<DownloadResponse>,
  templateKey: string,
  fallbackFilename: string,
): Promise<void> {
  try {
    const response = await downloadFn(templateKey)
    downloadFromResponse(response, fallbackFilename)
  } catch (error) {
    console.error('下载模板失败:', error)
    ElMessage.error('下载模板失败')
    throw error
  }
}
