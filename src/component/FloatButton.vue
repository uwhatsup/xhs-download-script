<!-- 
1. 可拖拽 可点击
2. 可半透明 可自动吸附 有过度效果 
-->
<template>
  <div
    ref="btnRef"
    :title="appName"
    class="xiaohongshu-download-script_float-btn"
    :style="{
      left: floatButtonStorageStore.left,
      top: floatButtonStorageStore.top,
    }"
    :class="{
      right: floatButtonStorageStore.left != '0px',
      active: isDragging,
    }"
    @mousedown="handleBtnMousedown"
    @mouseup="handleBtnMouseUp"
    @click="handleBtnClick"
  >
    <div class="icon">
      <FolderDown :size="20" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFloatButtonStorageStore } from '@/store/storage/floatbtn'
import { FolderDown } from 'lucide-vue-next'
import { appName } from '@/constant'
const emit = defineEmits(['click'])
const btnRef = ref<HTMLMapElement>()

const floatButtonStorageStore = useFloatButtonStorageStore()
let isDragging = false

// 限制
let maxTop: number
let maxLeft: number

// btn的点击位置与最终位置的差值
let innerTop: number
let innerLeft: number

// 是否是 移动
let time = 0
let duration = 0

function initState() {
  maxTop = window.innerHeight - btnRef.value?.clientHeight!
  maxLeft = window.innerWidth - btnRef.value?.clientWidth!
  if (floatButtonStorageStore.left != '0px') {
    floatButtonStorageStore.left = maxLeft + 'px'
  }
}

// 基本的监听
function handleBtnMousedown(event: MouseEvent) {
  duration = 0
  time = Date.now()
  isDragging = true
  // 获取距离差值
  innerTop = event.pageY - btnRef.value?.offsetTop!
  innerLeft = event.pageX - btnRef.value?.offsetLeft!
}
function handleBtnMouseUp() {
  duration = Date.now() - time
  isDragging = false
}
// 全局监听
function handleWindowMouseMove(event: MouseEvent) {
  if (!isDragging) return
  // 处理差值
  let top = event.pageY - innerTop
  let left = event.pageX - innerLeft
  // 判断y轴临界值
  if (top < 0) {
    top = 0
  } else if (top > maxTop) {
    top = maxTop
  }
  if (left < 0) {
    left = 0
  } else if (left > maxLeft) {
    left = maxLeft
  }
  setPosition(left, top)
}
function handleWindowMouseUp() {
  const left = btnRef.value?.offsetLeft!
  if (left > maxLeft / 2) {
    setPosition(maxLeft)
  } else {
    setPosition(0)
  }
}
function setPosition(left?: number, top?: number) {
  if (left != undefined) {
    floatButtonStorageStore.left = left + 'px'
  }
  if (top != undefined) {
    floatButtonStorageStore.top = top + 'px'
  }
}

function handleBtnClick() {
  setTimeout(() => {
    if (duration <= 250) {
      emit('click')
    }
  }, 250)
}
onMounted(() => {
  // 初始化数据
  initState()
  // 鼠标移动
  window.onmousemove = handleWindowMouseMove
  // 鼠标抬起
  window.onmouseup = handleWindowMouseUp
  window.onresize = initState
})
onUnmounted(() => {
  // 鼠标移动
  window.onmousemove = null
  // 鼠标抬起
  window.onmouseup = null
  window.onresize = null
})
</script>

<style scoped lang="scss"></style>
