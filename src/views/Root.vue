<template>
  <div class="xiaohongshu_script">
    <!-- 下载按钮 -->
    <FloatButton @click="handleFloatBtnClick" />
    <!-- 下载 -->
    <Download v-model="isOpenDownload" @setting-click="isOpenSetting = true" />
    <!-- 设置 -->
    <Setting v-model="isOpenSetting" />
  </div>
</template>

<script setup lang="ts">
import FloatButton from '@/component/FloatButton.vue'
import { unsafeWindow } from '$'
import { camelToSnake } from '@/utils'
import { useMainStore } from '@/store/main'
import Setting from './Setting.vue'
import Download from './Download.vue'
import { useStorageStore } from '@/store/storage'
import { Note_card } from '@/types'

const isOpenDownload = ref(false)
const isOpenSetting = ref(false)
// 下载
function handleFloatBtnClick() {
  isOpenDownload.value = true
}
const mainStore = useMainStore()
const storageStore = useStorageStore()

onMounted(() => {
  // 监听网络请求
  initEventListener()
  if (storageStore.setting.openRpcDownload) {
    mainStore.testSocket()
  }
  // 适配处理
  storageStore.compatible()
})
// 事件初始化
async function initEventListener() {
  // 拦截网络请求
  const originalXhrSend = window.XMLHttpRequest.prototype.send
  window.XMLHttpRequest.prototype.send = function () {
    this.addEventListener('load', function () {
      // 请求拦截
      if (this.responseURL.includes('/api/sns/web/v1/feed')) {
        // 在此处处理你想要拦截的响应
        const resData = JSON.parse(this.responseText)
        // 获取数据
        const note: Note_card = resData.data?.items[0]?.note_card
        store.setNote(note)
      }
    })
    return originalXhrSend.apply(this, arguments as any)
  }
  // 直接解析html
  const { href, pathname } = window.location
  if (href.startsWith('https://www.xiaohongshu.com/explore/')) {
    const id = pathname.split('/').at(-1)!
    // console.log("数据", unsafeWindow.__INITIAL_STATE__);
    const note = unsafeWindow.__INITIAL_STATE__.note.noteDetailMap[id].note
    const res = camelToSnake(note) as any
    store.setNote(res)
  }
}
// 初始化用户信息
const store = useMainStore()
</script>

<style scoped lang="scss">
.xiaohongshu_script {
  position: relative;
}
</style>
