export interface Interact_info {
  liked_count: string
  collected: boolean
  collected_count: string
  comment_count: string
  share_count: string
  followed: boolean
  relation: string
  liked: boolean
}

export interface Info_list {
  url: string
  image_scene: string
}

export interface H264 {
  master_url: string
  backup_urls: string[]
}

export interface Stream {
  h265: any[]
  h266: any[]
  av1: any[]
  h264: H264[]
}

export interface Image_list {
  height: number
  width: number
  trace_id: string
  info_list: Info_list[]
  url_default: string
  stream: Stream
  file_id: string
  url_pre: string
  live_photo: boolean
  url: string
  progress: string
}

export interface User {
  user_id: string
  nickname: string
  avatar: string
  xsec_token: string
}

export interface Tag_list {
  id: string
  name: string
  type: string
}

export interface Share_info {
  un_share: boolean
}

export interface XhsLive {
  xsec_token: string
  time: number
  ip_location: string
  desc: string
  interact_info: Interact_info
  image_list: Image_list[]
  user: User
  tag_list: Tag_list[]
  at_user_list: any[]
  last_update_time: number
  share_info: Share_info
  note_id: string
  type: 'normal'
  title: string
}
