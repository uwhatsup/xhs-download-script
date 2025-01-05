import { defineStore } from 'pinia'
import { useStorageStore } from './storage'
import { Note_card } from '@/types'
// 定义 State 类型
interface MainState {
  note?: Note_card
  rpcSocket?: WebSocket
  isConnected: boolean
}
export const useMainStore = defineStore('main', {
  state: () =>
    ({
      note: undefined,
      rpcSocket: undefined,
      isConnected: false,
    } as MainState),
  actions: {
    setNote(note: Note_card) {
      this.note = note
    },
    initSocket() {
      ElMessage.info('远程下载：初始化连接')
      const storageStore = useStorageStore()
      this.rpcSocket?.close()
      this.rpcSocket = new WebSocket(storageStore.setting.jsonRpcUrl)
      this.rpcSocket.onerror = (_err: any) => {
        this.isConnected = false
        ElMessage.error({
          message: '远程下载：连接失败,请检查连接地址是否正确',
          duration: 8000,
        })
      }
      this.rpcSocket.onclose = (e) => {
        this.isConnected = false
        console.log(e)
        if (e.code != 1000) {
          ElMessage.error('远程下载：连接关闭')
        }
      }
      this.rpcSocket.onopen = () => {
        this.isConnected = true
        ElMessage.success('远程下载：连接打开')
      }
      this.rpcSocket.onmessage = ({ data }: { data: any }) => {
        data = JSON.parse(data)
        console.log('来消息啦', data)
        if (data.error) {
          ElMessage.error({
            message:
              '远程下载：连接失败，请检查连接地址、连接秘钥是否正确' +
              JSON.stringify(data.error),
            duration: 8000,
          })
          this.isConnected = false
        } else if (data.method == 'aria2.onDownloadStart') {
        } else if (data.method == 'aria2.onDownloadComplete') {
          const gid = data.params[0]?.gid
          this.rpcSocket?.send(
            JSON.stringify({
              id: '下载成功',
              // jsonrpc: '2.0',
              method: 'aria2.tellStatus',
              params: [`token:${storageStore.setting.jsonRpcToken}`, gid],
            })
          )
        } else if (data.method == 'aria2.onDownloadError') {
          ElMessage.error('远程下载：下载失败，请检查下载路径是否正确')
        } else if (
          data?.result[0] &&
          data?.result[0]?.message == 'Unauthorized'
        ) {
          ElMessage.error({
            message: '远程下载：批量下载失败，请检查秘钥是否正确',
            duration: 5000,
          })
          this.isConnected = false
        } else if (data.id == '批量下载') {
          ElMessage.success('远程下载：已添加到下载列表')
        } else if (data.id == '连接测试') {
          ElMessage.success('远程下载：连接成功')
        } else if (data.id == '下载成功') {
          const fileName = data.result.files[0].path.split('/').pop()
          ElMessage.success({
            message: '下载成功：' + fileName,
            duration: 8000,
          })
        }
      }
    },
    testSocket() {
      const storageStore = useStorageStore()
      this.initSocket()
      setTimeout(() => {
        const data = {
          id: '连接测试',
          // jsonrpc: '2.0',
          method: 'aria2.getVersion',
          params: [`token:${storageStore.setting.jsonRpcToken}`],
        }
        this.rpcSocket?.send(JSON.stringify(data))
      }, 3000)
    },
    download(list?: { name: string; url: string; dir: string }[]) {
      if (!list?.length) return
      const storageStore = useStorageStore()
      const token = storageStore.setting.jsonRpcToken
      const downloadLocation = storageStore.setting.downloadLocation
      const urlList = list.map((item) => {
        return {
          methodName: 'aria2.addUri',
          params: [
            `token:${token}`,
            [item.url],
            {
              dir:
                (downloadLocation ? downloadLocation + '/' : downloadLocation) +
                  item.dir || '',
              out: item.name,
            },
          ],
        }
      })
      console.log('下载列表', urlList)
      const data = {
        id: '批量下载',
        // jsonrpc: '2.0',
        method: 'system.multicall',
        params: [urlList],
      }
      this.rpcSocket?.send(JSON.stringify(data))
    },
  },
  persist: false,
})
