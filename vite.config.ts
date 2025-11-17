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
      resolvers: [ElementPlusResolver()],
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // 把 @ 指向 src
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

    rollupOptions: {
      output: {
        // 手动分块策略 - 使用函数式配置（兼容 rolldown-vite）
        manualChunks: (id) => {
          // Vue 核心库
          if (
            id.includes('node_modules/vue') ||
            id.includes('node_modules/vue-router') ||
            id.includes('node_modules/pinia')
          ) {
            return 'vue-vendor'
          }

          // Element Plus 组件库
          if (
            id.includes('node_modules/element-plus') ||
            id.includes('node_modules/@element-plus')
          ) {
            return 'element-plus'
          }

          // 工具库
          if (
            id.includes('node_modules/axios') ||
            id.includes('node_modules/lodash') ||
            id.includes('node_modules/@vueuse')
          ) {
            return 'utils'
          }

          // 其他 node_modules 依赖
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },

        // 分块文件命名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },

    // 压缩优化 - rolldown 默认使用内置压缩器
    minify: true,

    // 启用 CSS 代码分割
    cssCodeSplit: true,
  },
})
