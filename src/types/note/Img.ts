export interface Share_info {
  un_share: boolean
}

export interface Tag_list {
  id: string
  name: string
  type: string
}

export interface User {
  user_id: string
  red_id?: string
  nickname: string
  avatar: string
  xsec_token: string
}

export interface Interact_info {
  relation: string
  liked: boolean
  liked_count: string
  collected: boolean
  collected_count: string
  comment_count: string
  share_count: string
  followed: boolean
}

export interface Info_list {
  image_scene: string
  url: string
}

export interface Stream {
  h265: any[]
  h266: any[]
  av1: any[]
  h264: H264[]
}
export interface H264 {
  master_url: string
  backup_urls: string[]
}

export interface Image_list {
  file_id: string
  height: number
  width: number
  info_list: Info_list[]
  stream: Stream
  url: string
  trace_id: string
  url_pre: string
  url_default: string
  live_photo: boolean
}

export interface XhsImage {
  share_info: Share_info
  note_id: string
  type: 'normal'
  title: string
  last_update_time: number
  tag_list: Tag_list[]
  at_user_list: any[]
  time: number
  ip_location: string
  desc: string
  user: User
  interact_info: Interact_info
  image_list: Image_list[]
  video: null
}
