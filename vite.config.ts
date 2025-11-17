import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers:[ElementPlusResolver()]
    }),
    AutoImport({
      resolvers:[ElementPlusResolver()]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),  // 把 @ 指向 src
    },
  },
  // 基础路径 - 根据你的部署位置调整
  base: '/',
  
  build: {
    // 输出目录
    outDir: 'dist',
    // 生成 source map（生产环境建议关闭）
    sourcemap: false,
    
    // chunk 文件大小警告限制
    chunkSizeWarningLimit: 1000,
  },
})
