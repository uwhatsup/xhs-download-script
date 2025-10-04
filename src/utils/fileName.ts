// 获取文件名

import { useSettingStorageStore } from '@/store/storage/setting'
import { extractHtmlContent } from './html'

// 全局变量  序号=>data["index"]
export const globalFileNameVarMap = {
  序号: 'index',

  笔记id: 'noteId',
  标题: 'title',
  发布时间: 'publishTime',
  ip归属地: 'ipLocation',

  发布者昵称: 'nickname',
  小红书号: 'redId',
  发布者id: 'userId',
}

interface NameData {
  [key: string]: any // 添加索引签名

  index?: number

  noteId?: string
  title?: string
  publishTime?: string
  ipLocation?: string

  userId?: string
  nickname?: string
  redId?: string
}

// 根据命名规则nameRule和命名数据nameData获取文件名name
// 依次替换命名规则中的特殊字符
export function getFileNameByNamingRule(
  nameData: NameData,
  nameRule: string,
  noSequence = false
) {
  // 1. 把换行符给替换掉
  let res = nameRule.replaceAll('\n', '')!
  // 2. 替换
  Object.entries(globalFileNameVarMap).forEach(([key, value]) => {
    let globalKeyRegExp = new RegExp(`<${key}>`, 'g')
    // 替换变量组
    res = res.replaceAll(/\$.*?\$/g, (val: string) => {
      if (val.includes('序号') && noSequence) {
        val = ''
      }
      return val.replaceAll('$', '')
    })
    // 替换普通变量
    res = res.replace(globalKeyRegExp, nameData[value] + '')
  })
  return res
}

export async function getRedId() {
  console.log('获取小红书号')
  let id = ''
  const settingStore = useSettingStorageStore()
  if (settingStore.nameRule.includes('<小红书号>')) {
    console.log('真的去获取小红书号')
    const link = document
      .querySelector('.author-wrapper .info a')
      ?.getAttribute('href')
    if (link?.length) {
      const content = await extractHtmlContent(link, '.user-redId')
      id = content.replace('小红书号：', '')
    }
  }
  return id
}
