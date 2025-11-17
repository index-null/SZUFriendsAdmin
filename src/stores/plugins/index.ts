/**
 * Pinia 插件
 * 用于扩展 Pinia 功能，如持久化、日志记录等
 */

import type { PiniaPluginContext } from 'pinia'

/**
 * 日志插件 - 记录所有 state 变化和 action 调用
 */
export const createLoggerPlugin = () => {
  return (context: PiniaPluginContext) => {
    const { store } = context

    // 记录初始状态
    console.log(`[Pinia] Store "${store.$id}" initialized`, store.$state)

    // 监听状态变化
    store.$subscribe((mutation, state) => {
      console.log(`[Pinia] ${store.$id} state changed:`, mutation, state)
    })

    // 监听 action 调用
    store.$onAction(({ name, args, after, onError }) => {
      console.log(`[Pinia] Action "${name}" called with args:`, args)

      after(() => {
        console.log(`[Pinia] Action "${name}" completed`)
      })

      onError((error) => {
        console.error(`[Pinia] Action "${name}" failed:`, error)
      })
    })
  }
}

/**
 * 持久化插件 - 自动保存和恢复状态
 */
export const createPersistPlugin = (
  options: {
    key?: string
    paths?: string[]
    storage?: Storage
  } = {},
) => {
  const { key = 'pinia-state', paths = [], storage = localStorage } = options

  return (context: PiniaPluginContext) => {
    const { store } = context

    // 从存储中恢复状态
    const saved = storage.getItem(`${key}-${store.$id}`)
    if (saved) {
      try {
        const state = JSON.parse(saved)
        store.$patch(state)
      } catch (error) {
        console.error(`Failed to restore state for ${store.$id}:`, error)
      }
    }

    // 监听状态变化并保存
    store.$subscribe((_mutation, state) => {
      try {
        const toSave =
          paths.length > 0
            ? Object.fromEntries(
                paths.map((path) => [path, (state as any)[path]]),
              )
            : state

        storage.setItem(`${key}-${store.$id}`, JSON.stringify(toSave))
      } catch (error) {
        console.error(`Failed to persist state for ${store.$id}:`, error)
      }
    })
  }
}

/**
 * 重置插件 - 添加重置功能
 */
export const createResetPlugin = () => {
  return (context: PiniaPluginContext) => {
    const { store } = context
    const initialState = JSON.parse(JSON.stringify(store.$state))

    store.$reset = function () {
      store.$patch(JSON.parse(JSON.stringify(initialState)))
    }
  }
}
