import { GM_xmlhttpRequest } from '$'
import { useStorageStore } from '@/store/storage'

const request = (url: string, data?: any, method: string = 'POST') => {
  const store = useStorageStore()
  return new Promise<any>((resolve, reject) => {
    GM_xmlhttpRequest({
      method,
      url: 'http://' + store.setting.jsonRpcUrl + url,
      data: data ? JSON.stringify(data) : '',
      nocache: true,
      timeout: 20000,
      headers: {
        'Content-Type': 'application/json',
      },
      onload: function (response) {
        try {
          const contentType = response.responseHeaders
            ?.toLowerCase()
            .includes('application/json')
          // 如果响应头中有 JSON 标志，则解析为对象
          const data = contentType
            ? JSON.parse(response.responseText)
            : response.responseText
          resolve(data)
          if (data.error) {
            ElMessage.error('aria2:' + data.error.message)
          }
          console.log('响应的原始数据', data)
        } catch (error: any) {
          console.log('失败', error)
          reject(
            new Error('Failed to parse response as JSON: ' + error.message)
          )
        }
      },
      onerror: function (err) {
        reject(err)
      },
      ontimeout: function () {
        reject('timeout')
      },
    })
  })
}

export const reqAria2Version = async () => {
  const store = useStorageStore()
  try {
    const res = await request('', {
      id: '小红书下载助手_版本检查',
      // jsonrpc: '2.0',
      method: 'aria2.getVersion',
      params: [`token:${store.setting.jsonRpcToken}`],
    })
    if (res.error?.message == 'Unauthorized') {
      ElMessage.error('连接失败，请检查秘钥是否正确')
    } else {
      ElMessage.success('连接测试成功，可以使用aria2远程下载')
    }
  } catch (error) {
    ElMessage.error('连接失败，请检查地址、秘钥是否正确或服务是否启动')
  }
  return 'ok'
}
export const reqAria2Download = async (
  list?: { name: string; url: string; dir: string }[]
) => {
  if (!list?.length) return
  const store = useStorageStore()
  const token = store.setting.jsonRpcToken
  const downloadLocation = store.setting.downloadLocation
  const urlList = list.map((item) => {
    const urlItem: {
      dir?: string
      out: string
    } = {
      out: item.name,
      dir:
        (downloadLocation ? downloadLocation + '/' : downloadLocation) +
          item.dir || '',
    }
    if (urlItem.dir == '') {
      delete urlItem.dir
    }
    const res = {
      methodName: 'aria2.addUri',
      params: [`token:${token}`, [item.url], urlItem],
    }
    return res
  })
  console.log('下载列表', urlList)
  try {
    const res = await request('', {
      id: '小红书下载助手_下载',
      // jsonrpc: '2.0',
      method: 'system.multicall',
      params: [urlList],
    })
    console.log('下载列表', res.result)
    if (
      res.error?.message == 'Unauthorized' ||
      res.result[0]?.message == 'Unauthorized'
    ) {
      ElMessage.error('连接失败，请检查秘钥是否正确')
    } else {
      ElMessage.success('已添加到下载列表')
    }
  } catch (error) {
    ElMessage.error('连接失败，请检查远程下载配置是否正确')
  }
  return 'ok'
}
