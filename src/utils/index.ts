import filetypeinfo from 'magic-bytes.js'
import timezones from 'google-timezones-json'

import dayjs from 'dayjs'
import dayjs_plugin_utc from 'dayjs/plugin/utc'
import dayjs_plugin_timezone from 'dayjs/plugin/timezone'
import { Setting } from '@/store/storage'
import { Note_card } from '@/types'
dayjs.extend(dayjs_plugin_utc)
dayjs.extend(dayjs_plugin_timezone)

// 使用前提
// 1. 同源
// 2. 文件名主要是后端控制，后端的优先级是大于前端的download
// 3. 如果后端没有指定Content-Disposition 在谷歌中测试，是不生效的
// 在处理文件下载时，Content-Disposition 头部中的 filename 属性和前端 <a> 标签的 download 属性之间的优先级如下：
// Content-Disposition 的 filename 属性：服务器返回的 Content-Disposition 头部中的 filename 属性通常会优先于前端的 download 属性。如果服务器指定了一个文件名，浏览器一般会使用这个文件名来保存下载的文件。

// download 属性：如果没有设置 Content-Disposition 头部，或者在某些情况下，download 属性会生效，并使用其指定的文件名。但如果同时存在并且冲突，浏览器大多数情况下会优先使用服务器返回的 filename。

// 总结
// 优先级：Content-Disposition > download
// 建议：为了确保一致性，建议在服务器端通过 Content-Disposition 指定文件名，尤其是在需要提供下载功能的情况下。这样可以避免由于浏览器差异导致的意外行为。
// export function downloadFileWithLink(url: string, fileName: string) {
//   console.log('链接点击下载', url, fileName);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = fileName;
//   a.title = fileName;
//   a.target = '_blank';
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);
// }
// xhr下载
export function downloadFileWithXhr(url: string, fileName: string) {
  console.log(url)
  console.log(fileName)
  const xhr = new XMLHttpRequest()
  xhr.open('GET', url, true)
  xhr.responseType = 'blob'
  xhr.onload = async function () {
    if (xhr.status === 200) {
      const blob = xhr.response as Blob
      let sub
      const buffer = await blob.arrayBuffer()
      const fileType = filetypeinfo(new Uint8Array(buffer))
      sub = '.' + fileType[0].extension

      fileName += sub
      // 获取响应的类型
      console.log('推断的文件类型', fileType)
      console.log('文件名:', fileName)
      const link = document.createElement('a')
      const href = URL.createObjectURL(blob)
      link.href = href
      link.download = fileName
      link.click()
      URL.revokeObjectURL(href)
    }
  }
  xhr.onerror = (error) => {
    console.log('下载出错', error)
  }
  xhr.send()
  return xhr
}
// 驼峰转蛇形
export function camelToSnake(obj: Record<string, any>): Record<string, any> {
  function toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (match) => '_' + match.toLowerCase())
  }

  function convertKeys(obj: Record<string, any>): Record<string, any> {
    const converted: Record<string, any> = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const snakeCaseKey = toSnakeCase(key)
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          converted[snakeCaseKey] = convertKeys(obj[key])
        } else if (Array.isArray(obj[key])) {
          converted[snakeCaseKey] = obj[key].map((item: any) => {
            if (typeof item === 'object' && !Array.isArray(item)) {
              return convertKeys(item)
            } else {
              return item
            }
          })
        } else {
          converted[snakeCaseKey] = obj[key]
        }
      }
    }
    return converted
  }

  return convertKeys(obj)
}
// 随机获取数组中的某一项
export function getRandomItemFromArray(array: string[]) {
  const randomIndex = Math.floor(Math.random() * array.length)
  return array[randomIndex]
}

// 时间格式化
export function formatTimeWithTimezone(
  timestamp: string | number,
  format: string,
  timezone: string = 'Asia/Shanghai'
) {
  const res = dayjs(timestamp).tz(timezone).format(format)
  return res
}
// 文件名相关
export const fileNameMap = {
  index: '序号',
  title: '标题',
  nickname: '发布者昵称',
  publishTime: '发布时间',
  ipLocation: 'ip归属地',
  userId: '发布者id',
  noteId: '笔记id',
  width: '宽度',
  height: '高度',
}
function formatFileSequence(num: string, length: number = 2) {
  return num?.toString().padStart(length, '0')
}
type fileNameKey = keyof typeof fileNameMap
interface fileDetail {
  index?: number
  title?: string
  nickname?: string
  publishTime?: number
  ipLocation?: string
  userId?: string
  noteId?: string
  width?: number
  height?: number
  nameRule?: string
  timeFormatRule?: string
  timezone?: string
}

export function getFileName(fileInfo: fileDetail, noSequence = false) {
  if (!fileInfo.title) return ''
  let rule = fileInfo.nameRule?.replaceAll('\n', '')!
  for (const key in fileNameMap) {
    const keyName = key as fileNameKey
    const value = fileNameMap[keyName]
    let regexp = new RegExp(`<${value}>`, 'g')
    // 先处理特殊的
    rule = rule.replaceAll(/\$.*?\$/g, (val) => {
      // console.log(val)
      if (val.includes('序号')) {
        if (noSequence) val = ''
      } else if (val.includes('宽度') || val.includes('高度')) {
        if (fileInfo.width == 0) val = ''
      }
      const res = val.replaceAll('$', '')
      return res
    })
    if (key == 'publishTime') {
      rule = rule.replace(
        regexp,
        formatTimeWithTimezone(
          fileInfo[key]!,
          fileInfo.timeFormatRule || 'YYYY年MM月DD日HH时mm分ss秒',
          fileInfo.timezone
        )
      )
    } else {
      rule = rule.replace(regexp, fileInfo[keyName] + '')
    }
  }
  return rule
}
// 时区数据
export const timezoneList = Object.entries(timezones).map(([key, value]) => {
  return {
    label: value,
    value: key,
  }
})

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed' // Avoid scrolling to the bottom
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    return true
  } catch (error) {
    console.error('Failed to copy text:', error)
    return false
  }
}
