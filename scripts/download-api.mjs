#!/usr/bin/env node
/**
 * 从 Apifox 开放 API 下载 OpenAPI 规范
 * 使用方法: node scripts/download-api.mjs
 *
 * 环境变量配置 (可在 .env 文件中设置):
 * - APIFOX_ACCESS_TOKEN: Apifox 访问令牌 (必填)
 * - APIFOX_PROJECT_ID: 项目 ID (必填)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

// 配置项 - 请根据实际情况修改
const CONFIG = {
  // Apifox 访问令牌，从 Apifox 个人设置 -> API 访问令牌 获取
  accessToken: process.env.APIFOX_ACCESS_TOKEN || '',
  // 项目 ID，从 Apifox 项目设置中获取
  projectId: process.env.APIFOX_PROJECT_ID || '',
  // 输出文件路径
  outputPath: path.join(rootDir, 'openapi.json'),
  // API 版本
  apiVersion: '2024-03-28',
  // OpenAPI 版本: '2.0' | '3.0' | '3.1'
  oasVersion: '3.1',
  // 导出格式: 'JSON' | 'YAML'
  exportFormat: 'JSON',
}

// 尝试从 .env 文件加载配置
function loadEnvFile() {
  const envPath = path.join(rootDir, '.env')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    envContent.split('\n').forEach((line) => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts
          .join('=')
          .trim()
          .replace(/^["']|["']$/g, '')
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value
        }
      }
    })
    // 重新读取环境变量
    CONFIG.accessToken = process.env.APIFOX_ACCESS_TOKEN || CONFIG.accessToken
    CONFIG.projectId = process.env.APIFOX_PROJECT_ID || CONFIG.projectId
  }
}

async function downloadOpenAPI() {
  loadEnvFile()

  // 验证配置
  if (!CONFIG.accessToken) {
    console.error(
      '错误: 请设置 APIFOX_ACCESS_TOKEN 环境变量或在 .env 文件中配置',
    )
    console.error('获取方式: Apifox -> 个人设置 -> API 访问令牌')
    process.exit(1)
  }

  if (!CONFIG.projectId) {
    console.error('错误: 请设置 APIFOX_PROJECT_ID 环境变量或在 .env 文件中配置')
    console.error('获取方式: Apifox -> 项目设置 -> 基本设置 -> 项目 ID')
    process.exit(1)
  }

  const url = `https://api.apifox.com/v1/projects/${CONFIG.projectId}/export-openapi`

  console.log(`正在从 Apifox 下载 OpenAPI 规范...`)
  console.log(`项目 ID: ${CONFIG.projectId}`)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Apifox-Api-Version': CONFIG.apiVersion,
        Authorization: `Bearer ${CONFIG.accessToken}`,
      },
      body: JSON.stringify({
        scope: {
          type: 'ALL',
        },
        options: {
          includeApifoxExtensionProperties: false,
          addFoldersToTags: true, // 将 Apifox 目录名添加到 tags，用于 orval 按模块拆分
        },
        oasVersion: CONFIG.oasVersion,
        exportFormat: CONFIG.exportFormat,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()

    // 写入文件
    fs.writeFileSync(CONFIG.outputPath, JSON.stringify(data, null, 2), 'utf-8')

    console.log(`OpenAPI 规范已保存到: ${CONFIG.outputPath}`)
    console.log('下载完成!')
  } catch (error) {
    console.error('下载失败:', error.message)
    process.exit(1)
  }
}

downloadOpenAPI()
