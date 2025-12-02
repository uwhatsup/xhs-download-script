<template>
  <div class="xiaohongshu-download-script">
    <!-- 下载按钮 -->
    <FloatButton @click="handleFloatBtnClick" />
    <!-- 下载界面 -->
    <DownloadDialog
      v-model="isOpenDownloadDialog"
      @setting-click="isOpenSettingDialog = true"
    />
    <!-- 设置界面 -->
    <SettingDialog v-model="isOpenSettingDialog" />
  </div>
</template>

<script setup lang="ts">
import { unsafeWindow } from '$'
import { camelToSnake } from '@/utils'

import { XhsNote } from '@/types'
import { useNoteStore } from '@/store/note'

import SettingDialog from './setting/SettingDialog.vue'
import DownloadDialog from './download/DownloadDilog.vue'
import FloatButton from '@/component/FloatButton.vue'

// 组件是否打开
const isOpenDownloadDialog = ref(false)
const isOpenSettingDialog = ref(false)
// 处理浮动按钮点击
function handleFloatBtnClick() {
  isOpenDownloadDialog.value = true
}
const noteStore = useNoteStore()
onMounted(() => {
  // 监听网络请求
  initEventListener()
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
        console.log(resData)
        // 获取数据
        const note: XhsNote = resData.data?.items[0]?.note_card
        console.log('数据', note)
        noteStore.setNote(note)
      }
    })
    return originalXhrSend.apply(this, arguments as any)
  }
  // 直接解析html
  const { pathname } = window.location
  console.log({ pathname })
  /* 
  可能的值
  用户中 新标签页面打开
  https://www.xiaohongshu.com/user/profile/5d306b6100000000160077d8/68e41a090000000003035156?xsec_token=ABiVLRKZyMQRmgsw5IpR2CKFXx03fMcjZBl1ixGSUMLfI=&xsec_source=pc_user
  直接刷新访问
  https://www.xiaohongshu.com/explore/6929b49b000000001b0238db?xsec_token=ABxLdaQDpIT7bwg8Xn_1ZfbGYuCr58d5DPE5kcjAP4CAo=&xsec_source=pc_user"
  */
  const notePageReg = /(\/user\/profile\/.*\/.*)|(\/explore\/.*)/
  if (notePageReg.test(pathname)) {
    const id = pathname.split('/').at(-1)!
    console.log('初始化数据', id, unsafeWindow.__INITIAL_STATE__)
    // 查看源代码(全局搜索笔记id)的时候会发现数据放在哪儿
    const noteRes = unsafeWindow.__INITIAL_STATE__.note.noteDetailMap[id].note
    const note = camelToSnake(noteRes) as any
    noteStore.setNote(note)
  }
}
</script>

<style scoped lang="scss"></style>
