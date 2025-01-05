<template>
  <el-config-provider :locale="zhCn">
    <Root />
  </el-config-provider>
</template>

<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import Root from './views/Root.vue'
</script>

<style scoped></style>
