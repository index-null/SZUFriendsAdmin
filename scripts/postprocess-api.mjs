#!/usr/bin/env node
/**
 * API 代码后处理脚本
 * 在 Orval 生成的 TypeScript 文件中添加 @ts-nocheck 注释
 * 解决自动生成代码中未使用参数的 TypeScript 警告问题
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const generatedDir = path.resolve(__dirname, '../src/api/generated')

/**
 * 递归获取目录下所有 .ts 文件
 */
function getTsFiles(dir) {
  const files = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...getTsFiles(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * 在文件顶部添加 @ts-nocheck 注释（如果不存在）
 */
function addTsNoCheck(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')

  // 如果已经有 @ts-nocheck，跳过
  if (content.includes('@ts-nocheck')) {
    return false
  }

  // 在文件开头添加 @ts-nocheck
  const newContent = `// @ts-nocheck\n${content}`
  fs.writeFileSync(filePath, newContent, 'utf-8')
  return true
}

function main() {
  if (!fs.existsSync(generatedDir)) {
    console.log('生成目录不存在，跳过后处理')
    return
  }

  const tsFiles = getTsFiles(generatedDir)
  let processedCount = 0

  for (const file of tsFiles) {
    if (addTsNoCheck(file)) {
      processedCount++
    }
  }

  console.log(`已处理 ${processedCount} 个文件，添加 @ts-nocheck 注释`)
}

main()
