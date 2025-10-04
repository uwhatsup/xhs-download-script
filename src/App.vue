<template>
  <el-config-provider :locale="zhCn">
    <Index />
  </el-config-provider>
</template>

<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import Index from './views/Index.vue'
</script>

<style scoped></style>
