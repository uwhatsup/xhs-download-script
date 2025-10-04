import { defineStore } from 'pinia'

// 浮动按钮的本地存储 直接修改即可
export const useFloatButtonStorageStore = defineStore(
  'xhs-download-script-float-btn-storage',
  {
    state: () => ({
      left: '0px',
      top: '45%',
    }),
    persist: true,
  }
)
