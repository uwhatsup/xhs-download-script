import { GM } from '$'
import { nameRule } from '@/constant'
import { downLoadType } from '@/types'
import { defineStore } from 'pinia'
export interface Setting {
  nameRule: string
  timeFormatRule: string
  timezone: string
  jsonRpcUrl: string
  downloadLocation: string
  downLoadTypeObj: DownLoadTypeObj
  preferLive: boolean
  jsonRpcToken: string
  useNameAsDir: boolean
  useTitleAsDir: boolean
  openRpcDownload: boolean
  downloadSize: string
  col: number
  version: string
}
interface DownLoadTypeObj {
  video: downLoadType
  normal: downLoadType
}
export interface FloatBtnPosition {
  left: string
  top: string
}
// 定义 State 类型
interface MainState {
  setting: Setting
  floatBtnPosition: FloatBtnPosition
}

function getDefaultSetting() {
  return {
    nameRule,
    timeFormatRule: 'YYYY年MM月DD日HH时mm分ss秒',
    timezone: 'Asia/Shanghai',
    jsonRpcUrl: 'ws://localhost:16800/jsonrpc',
    jsonRpcToken: '',
    downloadLocation: '',
    useNameAsDir: true,
    useTitleAsDir: true,
    downLoadTypeObj: {
      video: downLoadType.default,
      normal: downLoadType.default,
    },
    preferLive: true,
    openRpcDownload: false,
    downloadSize: '50%',
    col: 4,
    version: GM.info.version,
  }
}
export const useStorageStore = defineStore('xhs-script-storage', {
  state: () =>
    ({
      setting: getDefaultSetting(),
      floatBtnPosition: {
        left: '0px',
        top: '45%',
        isInLeft: true,
      },
    } as MainState),
  actions: {
    setSetting(setting: any) {
      this.setting = setting
    },
    setDownloadType(type: 'video' | 'normal', value: any) {
      this.setting.downLoadTypeObj[type] = value
    },
    setPreferLive(e: any) {
      this.setting.preferLive = e
    },
    reset() {
      this.setting = getDefaultSetting()
    },

    compatible() {
      const v = GM.info.script.version
      this.setting.version = v
    },
  },
  persist: true,
})
