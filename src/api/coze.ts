/**
 * Coze API 服务层
 * 封装 Coze Workflow 调用，用于帖子内容改写
 */
import axios from 'axios'
import type { ContentBlock } from './generated/.ts.schemas'

/**
 * Coze Workflow 响应中的输出结构
 */
export interface CozeWorkflowOutput {
  title: string
  cover: string
  postType: string
  tags: string[]
  contentBlocks: {
    content: string
    order: number
    type: string
  }[]
}

/**
 * Coze API 响应格式
 */
interface CozeApiResponse {
  code: number
  msg: string
  data: string // JSON string of { output: CozeWorkflowOutput }
  debug_url: string
  usage: {
    token_count: number
    output_count: number
    input_count: number
  }
  execute_id: string
}

/**
 * 解析后的改写结果
 */
export interface RewriteResult {
  title: string
  cover: string
  postType: string
  tags: string[]
  contentBlocks: ContentBlock[]
}

/**
 * 自定义错误：Coze 响应成功但解析失败
 * 携带原始响应数据，允许前端手动编辑后重新解析
 */
export class CozeParseError extends Error {
  /** Coze API 返回的原始 data 字符串 */
  rawData: string

  constructor(message: string, rawData: string) {
    super(message)
    this.name = 'CozeParseError'
    this.rawData = rawData
  }
}

/**
 * 从原始 JSON 字符串手动解析为 RewriteResult
 * 用于用户手动修正 JSON 后重新解析
 * 支持多种格式：
 *   - { output: { title, contentBlocks, ... } }
 *   - { title, contentBlocks, ... }
 */
export function parseRawDataToResult(jsonStr: string): RewriteResult {
  let parsed: any
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    throw new Error('JSON 格式无效，请检查语法')
  }

  // 尝试多种路径提取
  const output = parsed?.output ?? parsed

  if (!output || typeof output !== 'object') {
    throw new Error('无法从 JSON 中找到有效的帖子数据对象')
  }

  const contentBlocks = normalizeContentBlocks(
    output.contentBlocks,
    output.title || '',
  )

  if (contentBlocks.length === 0) {
    throw new Error('解析结果中没有有效的内容块（contentBlocks）')
  }

  const tags = Array.isArray(output.tags)
    ? output.tags.filter((t: any) => typeof t === 'string' && t.length > 0)
    : []

  return {
    title: String(output.title || '').trim(),
    cover: String(output.cover || '').trim(),
    postType: normalizePostType(output.postType),
    tags,
    contentBlocks,
  }
}

/**
 * 合法的帖子类型字典值
 */
const VALID_POST_TYPES = [
  'NORMAL',
  'INTERVIEW',
  'MARKET',
  'PARTNER',
  'LOST_FOUND',
  'RECRUIT',
]

/**
 * 将 Coze 返回的 postType 标准化为系统字典值
 * Coze 可能返回中文（如"面经分享"）、数字（如"1"）、或已是字典值
 */
function normalizePostType(raw: unknown): string {
  const str = String(raw || '').trim()

  // 已经是合法字典值，直接返回
  if (VALID_POST_TYPES.includes(str.toUpperCase())) {
    return str.toUpperCase()
  }

  // 中文映射
  const chineseMap: Record<string, string> = {
    普通帖子: 'NORMAL',
    普通: 'NORMAL',
    面经分享: 'INTERVIEW',
    面经: 'INTERVIEW',
    闲置集市: 'MARKET',
    闲置: 'MARKET',
    找搭子: 'PARTNER',
    搭子: 'PARTNER',
    失物招领: 'LOST_FOUND',
    招聘求职: 'RECRUIT',
    招聘: 'RECRUIT',
    求职: 'RECRUIT',
  }

  if (chineseMap[str]) {
    return chineseMap[str]
  }

  // 默认返回普通帖子
  return 'NORMAL'
}

// Coze API 配置（从环境变量读取）
const COZE_API_KEY = import.meta.env.VITE_COZE_API_KEY as string
const COZE_WORKFLOW_ID = import.meta.env.VITE_COZE_WORKFLOW_ID as string
const COZE_APP_ID = import.meta.env.VITE_COZE_APP_ID as string

// 创建独立的 axios 实例用于 Coze API
const cozeClient = axios.create({
  baseURL: '/coze-api',
  timeout: 120000, // Coze workflow 可能耗时较长，设置 2 分钟超时
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * 从 Coze 响应中安全提取 output 对象
 * Coze workflow 返回的 data 是 JSON 字符串，结构可能有差异
 */
function parseCozeOutput(dataStr: string): CozeWorkflowOutput {
  let parsed: any

  try {
    parsed = JSON.parse(dataStr)
  } catch {
    throw new Error(`Coze 返回数据不是有效 JSON: ${dataStr.slice(0, 200)}`)
  }

  // 尝试多种路径提取 output
  const output = parsed?.output ?? parsed

  if (!output || typeof output !== 'object') {
    throw new Error(
      `Coze 返回数据结构异常，无法找到 output: ${JSON.stringify(parsed).slice(0, 300)}`,
    )
  }

  return output as CozeWorkflowOutput
}

/**
 * 将 Coze 返回的 contentBlocks 安全转换为系统标准格式
 * 防御 contentBlocks 为 undefined / null / 非数组的情况
 */
function normalizeContentBlocks(
  rawBlocks: unknown,
  fallbackText?: string,
): ContentBlock[] {
  // 如果是有效数组，逐个转换
  if (Array.isArray(rawBlocks) && rawBlocks.length > 0) {
    return rawBlocks
      .filter((block) => block && typeof block === 'object')
      .map((block: any, index: number) => ({
        type: String(
          block.type || 'text',
        ).toLowerCase() as ContentBlock['type'],
        order: block.order ?? index + 1,
        content: block.content || block.text || '',
        url: block.url || undefined,
      }))
  }

  // fallback：如果 contentBlocks 缺失，用标题或原文兜底生成一个文本块
  if (fallbackText) {
    return [
      {
        type: 'text' as ContentBlock['type'],
        order: 1,
        content: fallbackText,
      },
    ]
  }

  return []
}

/**
 * 延迟指定毫秒
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 调用 Coze Workflow 改写帖子内容（带自动重试）
 * @param rawText 原始帖子文本
 * @param maxRetries 最大重试次数，默认 2
 * @returns 改写后的帖子结构化数据
 */
export async function rewritePost(
  rawText: string,
  maxRetries = 2,
): Promise<RewriteResult> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // 重试时等待一段时间（指数退避）
      if (attempt > 0) {
        const waitMs = Math.min(1000 * Math.pow(2, attempt - 1), 8000)
        console.warn(`[Coze] 第 ${attempt} 次重试，等待 ${waitMs}ms...`)
        await delay(waitMs)
      }

      const response = await cozeClient.post<CozeApiResponse>(
        '/v1/workflow/run',
        {
          workflow_id: COZE_WORKFLOW_ID,
          app_id: COZE_APP_ID,
          parameters: {
            input: rawText,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${COZE_API_KEY}`,
          },
        },
      )

      // 检查 HTTP 层错误
      if (!response.data) {
        throw new Error('Coze API 返回空响应')
      }

      if (response.data.code !== 0) {
        throw new Error(
          `Coze API 错误 (code=${response.data.code}): ${response.data.msg || '未知错误'}`,
        )
      }

      if (!response.data.data) {
        throw new Error('Coze API 返回 data 字段为空')
      }

      // 保留原始数据，解析失败时可用于手动修正
      const rawDataStr = response.data.data

      try {
        // 安全解析 output
        const output = parseCozeOutput(rawDataStr)

        // 安全转换 contentBlocks
        const contentBlocks = normalizeContentBlocks(
          output.contentBlocks,
          output.title || rawText.slice(0, 200),
        )

        if (contentBlocks.length === 0) {
          throw new Error('Coze 改写结果中没有有效的内容块')
        }

        // 安全提取 tags
        const tags = Array.isArray(output.tags)
          ? output.tags.filter((t) => typeof t === 'string' && t.length > 0)
          : []

        return {
          title: String(output.title || '').trim(),
          cover: String(output.cover || '').trim(),
          postType: normalizePostType(output.postType),
          tags,
          contentBlocks,
        }
      } catch (parseErr) {
        // API 调用成功但解析失败 → 抛出 CozeParseError 携带原始数据
        const msg =
          parseErr instanceof Error ? parseErr.message : '响应数据解析失败'
        throw new CozeParseError(msg, rawDataStr)
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(
        `[Coze] 改写失败 (attempt ${attempt + 1}/${maxRetries + 1}):`,
        lastError.message,
      )

      // 如果是网络超时或 5xx，可以重试；其他错误也重试以提高稳定性
    }
  }

  throw lastError || new Error('改写失败，已达最大重试次数')
}

/**
 * 批量调用 Coze 改写
 * 使用并发控制避免 Coze API 限流
 * @param texts 原始文本数组
 * @param concurrency 并发数量，默认 2
 * @param onProgress 进度回调
 */
export async function batchRewritePosts(
  texts: string[],
  concurrency = 2,
  onProgress?: (completed: number, total: number, index: number) => void,
): Promise<
  { index: number; result?: RewriteResult; error?: string; rawData?: string }[]
> {
  const results: {
    index: number
    result?: RewriteResult
    error?: string
    rawData?: string
  }[] = []
  const queue = texts.map((text, index) => ({ text, index }))
  let completed = 0

  const worker = async () => {
    while (queue.length > 0) {
      const item = queue.shift()
      if (!item) break

      try {
        const result = await rewritePost(item.text)
        results.push({ index: item.index, result })
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : '改写失败'
        const rawData =
          error instanceof CozeParseError ? error.rawData : undefined
        results.push({
          index: item.index,
          error: errorMsg,
          rawData,
        })
      }

      completed++
      onProgress?.(completed, texts.length, item.index)
    }
  }

  // 启动并发 worker
  const workers = Array.from(
    { length: Math.min(concurrency, texts.length) },
    () => worker(),
  )
  await Promise.all(workers)

  // 按原始顺序排序
  return results.sort((a, b) => a.index - b.index)
}
