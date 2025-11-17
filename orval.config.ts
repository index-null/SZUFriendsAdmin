// orval.config.ts
import { defineConfig } from 'orval'

export default defineConfig({
  alumniApi: {
    input: {
      target: './openapi.json',
      validation: false, // 忽略 OpenAPI schema 警告
    },
    output: {
      target: './src/api/generated',
      client: 'axios',
      mode: 'tags-split', // 按 tag 分割成多个文件
      clean: true, // 每次生成前清理旧文件
      prettier: true,
      
      override: {
        mutator: {
          path: './src/api/mutator.ts', // 使用独立的 mutator 文件
          name: 'customInstance',
        },
      },
    },
  },
})
