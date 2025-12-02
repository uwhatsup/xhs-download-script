<template>
  <el-drawer
    v-model="isOpenDownloadDialog"
    :size="size"
    :title="appName"
    class="xiaohongshu-download-script_dialog"
    :class="{
      drag: isDragging,
    }"
  >
    <div class="tool-box">
      <!-- 显示尺寸 -->
      <div class="download-item-size">
        <div class="title">显示列数：</div>
        <el-input-number
          size="small"
          v-model="settingStorage.downloadContainerCol"
          :min="1"
          :max="10"
          style="width: 80px"
        />
      </div>
      <!-- 设置按钮 -->
      <div class="setting">
        <el-button size="small" type="info" @click="emit('settingClick')">
          设置
        </el-button>
      </div>
    </div>
    <!-- 容器 拖拽 -->
    <div
      class="drag-line"
      :class="{
        active: isDragging,
      }"
      @mousedown="handleMouseDown"
    ></div>
    <!-- 内容区域 -->
    <DownloadDilogContent :closeDialog="closeDialog" />
  </el-drawer>
</template>

<script setup lang="ts">
import { appName } from '@/constant'
import { useSettingStorageStore } from '@/store/storage/setting'
import DownloadDilogContent from './DownloadDilogContent.vue'

interface EmitsType {
  (e: 'update:modelValue', value: Boolean): void
  (e: 'settingClick'): void
}
// 自定义事件
const emit = defineEmits<EmitsType>()
// props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: '',
  },
})
// 是否显示dialog
const isOpenDownloadDialog = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
  },
})

function closeDialog() {
  isOpenDownloadDialog.value = false
}
// 容器大小
const settingStorage = useSettingStorageStore()
const isDragging = ref(false)
const size = ref('50%')
function handleMouseMove(e: MouseEvent) {
  // 计算鼠标的位置
  const x = (window.screen.availWidth - e.pageX) / window.screen.availWidth
  let w = +(x * 100).toFixed(2)
  if (w <= 50) w = 50
  size.value = w + '%'
}
function handleMouseDown() {
  isDragging.value = true
  document.body.style.cursor = 'w-resize'
  document.body.style.userSelect = 'none'
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', () => {
    isDragging.value = false
    settingStorage.downloadContainerSize = size.value
    document.body.style.cursor = 'auto'
    document.body.style.userSelect = 'auto'
    window.removeEventListener('mousemove', handleMouseMove)
  })
}

// 图片显示尺寸
onMounted(() => {
  size.value = settingStorage.downloadContainerSize
})
</script>

<style scoped lang="scss"></style>
