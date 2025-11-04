import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // State
  const count = ref(0)
  const history = ref<number[]>([])

  // Computed
  const doubled = computed(() => count.value * 2)
  const isEven = computed(() => count.value % 2 === 0)
  const historyLength = computed(() => history.value.length)

  // Actions
  const increment = () => {
    count.value++
    history.value.push(count.value)
  }

  const decrement = () => {
    count.value--
    history.value.push(count.value)
  }

  const reset = () => {
    count.value = 0
    history.value = []
  }

  const setCount = (value: number) => {
    count.value = value
    history.value.push(value)
  }

  const clearHistory = () => {
    history.value = []
  }

  return {
    // State
    count,
    history,
    // Computed
    doubled,
    isEven,
    historyLength,
    // Actions
    increment,
    decrement,
    reset,
    setCount,
    clearHistory
  }
})
