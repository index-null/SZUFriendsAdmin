<template>
  <el-radio-group v-model="model" size="small">
    <el-radio-button value="table">
      <el-icon><Grid /></el-icon>
    </el-radio-button>
    <el-radio-button value="card">
      <el-icon><Menu /></el-icon>
    </el-radio-button>
  </el-radio-group>
</template>

<script setup lang="ts">
import { Grid, Menu } from '@element-plus/icons-vue'

const model = defineModel<'table' | 'card'>({ default: 'table' })
</script>

<style lang="scss" scoped>
:deep(.el-radio-button__inner) {
  padding: 6px 10px;
  display: flex;
  align-items: center;
}
</style>
