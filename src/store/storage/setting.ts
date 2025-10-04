import { defineStore } from 'pinia'
import { defaultFileNameRule } from '@/constant'
import { DownloadFormat } from '@/types'

// 相关类型
export interface Setting {
  nameRule: string
  timeFormatRule: string
  timezone: string
  jsonRpcUrl: string
  downloadLocation: string
  DownloadFormatObj: DownloadFormatObj
  preferLive: boolean
  jsonRpcToken: string
  useNameAsDir: boolean
  useTitleAsDir: boolean
  openRpcDownload: boolean
  downloadSize: string
  col: number
  version: string
}
interface DownloadFormatObj {
  video: DownloadFormat
  normal: DownloadFormat
}

function getDefaultSetting() {
  return {
    nameRule: defaultFileNameRule,
    timeFormatRule: 'YYYY年MM月DD日HH时mm分ss秒',
    timezone: 'Asia/Shanghai',
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
    downloadSize: '50%',
    col: 4,
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
