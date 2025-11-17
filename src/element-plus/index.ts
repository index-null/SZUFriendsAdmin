/**
 * Element Plus 主题配置
 * 使用 @vueuse/core 的 useDark 实现暗色主题切换
 */
import { useDark, useToggle } from '@vueuse/core'

/**
 * 暗色模式状态
 * useDark 会自动：
 * 1. 读取 localStorage
 * 2. 在 <html> 标签上添加/移除 'dark' class
 * 3. 响应式更新
 */
export const isDark = useDark()

/**
 * 切换暗色模式
 */
export const toggleDark = useToggle(isDark)

/**
 * 初始化主题
 * 在应用启动时调用，确保主题正确应用
 */
export function initTheme() {
  // useDark 会自动从 localStorage 恢复状态
}
