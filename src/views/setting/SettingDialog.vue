<!-- 
简单的拆分下组件
一方面可以避免一些无效的计算提升性能 因为我使用了destroy-on-close 如果直接放到该组件下 一些内容即是页面没有挂载也会导致计算
另一个方面代码结构更加清晰 各尽其责

但是 每次打开重新计算会有非常明显的卡顿！内存还是带代码为题呢？ Todo
-->

<template>
  <el-drawer
    v-model="isOpenSettingDialog"
    destroy-on-close
    class="xiaohongshu-download-script_dialog"
    title="设置"
  >
    <SettingDialogContent />
  </el-drawer>
</template>

<script setup lang="ts">
import SettingDialogContent from './SettingDialogContent.vue'

interface EmitsType {
  (e: 'update:modelValue', value: Boolean): void
}
const emit = defineEmits<EmitsType>()
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

// 计算属性 可以获取 可设置
const isOpenSettingDialog = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
  },
})
</script>

<style scoped lang="scss"></style>
