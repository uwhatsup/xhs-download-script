import { Image_list as img_Image_list, XhsImage } from './Img'
import { XhsLive, Image_list as live_Image_list } from './live'
import { Image_list as video_Image_list, XhsVideo } from './video'
// 下载类型
export enum downLoadType {
  default,
  origin,
  jpg,
  live,
}

export type Note_card = XhsVideo | XhsImage | XhsLive

export type ImageList = video_Image_list | live_Image_list | img_Image_list
