import { defineStore } from 'pinia'
import { defaultFileNameRule } from '@/constant'
import { DownloadFormat } from '@/types'

// 相关类型
export interface Setting {
  [key: string]: any
  nameRule: string
  timeFormatRule: string
  jsonRpcUrl: string
  downloadLocation: string
  DownloadFormatObj: DownloadFormatObj
  preferLive: boolean
  jsonRpcToken: string
  useNameAsDir: boolean
  useTitleAsDir: boolean
  openRpcDownload: boolean
  downloadContainerSize: string
  downloadContainerCol: number
}
interface DownloadFormatObj {
  [key: string]: any
  video: DownloadFormat
  normal: DownloadFormat
}

function getDefaultSetting(): Setting {
  return {
    nameRule: defaultFileNameRule,
    timeFormatRule: 'YYYY年MM月DD日HH时mm分ss秒',
    jsonRpcUrl: 'http://localhost:16800/jsonrpc',
    jsonRpcToken: '',
    downloadLocation: '',
    useNameAsDir: true,
    useTitleAsDir: true,
    DownloadFormatObj: {
      video: DownloadFormat.default,
      normal: DownloadFormat.default,
    },
    preferLive: true,
    openRpcDownload: false,
    downloadContainerSize: '50%',
    downloadContainerCol: 4,
  }
}

// 设置存储
export const useSettingStorageStore = defineStore(
  'xhs-download-script-setting-storage',
  {
    state: () => getDefaultSetting() as Setting,
    actions: {
      reset() {
        this.$reset()
      },
    },
    persist: true,
  }
)
