import { Image_list as img_Image_list, XhsImage } from './note/Img'
import { Image_list as live_Image_list, XhsLive } from './note/live'
import { Image_list as video_Image_list, XhsVideo } from './note/video'
// 下载类型
export enum DownloadFormat {
  default,
  origin,
  jpg,
  live,
}

export type XhsNote = XhsVideo | XhsImage | XhsLive

export type ImageList = video_Image_list | live_Image_list | img_Image_list
