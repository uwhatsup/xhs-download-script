import { GM } from '$'

// 应用名称
export const appName = '小红书下载助手 v' + GM.info.script.version

// 图片请求路径
export const imageRequestBaseUrl = [
  'https://sns-img-hw.xhscdn.net/',
  'https://sns-img-bd.xhscdn.com/',
  'https://sns-img-qc.xhscdn.com/',
  'https://ci.xiaohongshu.com/',
]
// 视频请求路径
export const videoRequestBaseUrl = [
  'https://sns-video-hw.xhscdn.com/',
  'https://sns-video-bd.xhscdn.com/',
  'https://sns-video-al.xhscdn.com/',
]
// jpg格式请求参数
export const jpgQueryParams = '?imageView2/2/w/format/jpg'

// 文件id匹配正则
export const fileKeyReg =
  /(?<=\/)(spectrum\/)?((note_pre_post_uhdr|notes_pre_post|notes_uhdr)\/)?[a-z0-9A-Z\-]+(?=!)/

// 默认文件名规则
export const defaultFileNameRule = `$<序号>.$
[<发布者昵称>]
<标题>
(<发布时间>)
`

// 获取文件名的方法 主要是获取前面的
