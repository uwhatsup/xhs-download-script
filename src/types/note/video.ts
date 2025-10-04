export interface Info_list {
  image_scene: string
  url: string
}

export interface Stream {}

export interface Image_list {
  height: number
  trace_id: string
  live_photo: boolean
  file_id: string
  width: number
  url: string
  info_list: Info_list[]
  url_pre: string
  url_default: string
  stream: Stream
  progress: string
}

export interface Interact_info {
  followed: boolean
  relation: string
  liked: boolean
  liked_count: string
  collected: boolean
  collected_count: string
  comment_count: string
  share_count: string
}

export interface Share_info {
  un_share: boolean
}

export interface User {
  user_id: string
  red_id?: string
  nickname: string
  avatar: string
  xsec_token: string
}

export interface Capa {
  duration: number
}

export interface Consumer {
  origin_video_key: string
}

export interface H265 {
  video_bitrate: number
  psnr: number
  rotate: number
  vmaf: number
  audio_bitrate: number
  ssim: number
  avg_bitrate: number
  audio_codec: string
  audio_channels: number
  fps: number
  duration: number
  video_duration: number
  hdr_type: number
  quality_type: string
  backup_urls: string[]
  stream_type: number
  stream_desc: string
  video_codec: string
  audio_duration: number
  weight: number
  format: string
  height: number
  master_url: string
  default_stream: number
  width: number
  size: number
  volume: number
}

export interface H264 {
  fps: number
  video_codec: string
  stream_type: number
  width: number
  video_bitrate: number
  rotate: number
  master_url: string
  weight: number
  default_stream: number
  audio_bitrate: number
  stream_desc: string
  avg_bitrate: number
  audio_duration: number
  audio_channels: number
  vmaf: number
  psnr: number
  format: string
  duration: number
  backup_urls: string[]
  ssim: number
  quality_type: string
  height: number
  volume: number
  video_duration: number
  audio_codec: string
  hdr_type: number
  size: number
}

export interface Stream {
  h265: H265[]
  h266: any[]
  av1: any[]
  h264: H264[]
}

export interface Video {
  drm_type: number
  stream_types: number[]
  biz_name: number
  biz_id: string
  duration: number
  md5: string
  hdr_type: number
}

export interface Media {
  stream: Stream
  video_id: number
  video: Video
}

export interface Image {
  thumbnail_fileid: string
}

export interface Video {
  capa: Capa
  consumer: Consumer
  media: Media
  image: Image
}

export interface XhsVideo {
  xsec_token: string
  last_update_time: number
  image_list: Image_list[]
  tag_list: any[]
  interact_info: Interact_info
  time: number
  note_id: string
  title: string
  ip_location: string
  share_info: Share_info
  user: User
  video: Video
  at_user_list: any[]
  type: 'video'
  desc: string
}
