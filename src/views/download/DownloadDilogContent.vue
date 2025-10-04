<template>
  <div class="download-container">
    <div class="download-container_top">
      <!-- 图片列表 -->
      <el-checkbox-group
        v-model="state.checkList"
        v-if="noteStore?.image_list?.length"
      >
        <div
          class="file-list"
          :style="`grid-template-columns: repeat(${settingStorageStore.col}, 1fr)`"
        >
          <el-checkbox
            :value="index"
            size="large"
            v-for="(item, index) in noteStore?.image_list"
            :key="index"
          >
            <div class="item">
              <img :src="item.url_default" />
              <div class="progress">{{ item.progress || '0%' }}</div>
              <div v-if="item.live_photo" class="tag">实况</div>
              <div v-else-if="noteStore.type == 'video'" class="tag">视频</div>
            </div>
          </el-checkbox>
        </div>
      </el-checkbox-group>
      <div v-else>
        <el-empty />
      </div>
    </div>

    <!-- 下载选项 -->
    <div v-if="noteStore?.note_id" class="custom-download">
      <!-- 下载设置 -->
      <el-form label-width="6rem">
        <el-form-item label="标题">
          <el-input v-model="state.title" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="下载格式">
          <el-radio-group
            :model-value="
              noteStore?.type
                ? settingStorageStore.DownloadFormatObj[noteStore?.type]
                : DownloadFormat.default
            "
            @change="handleDownloadFormatChnage"
          >
            <el-radio :value="DownloadFormat.default">普通</el-radio>
            <el-radio :value="DownloadFormat.origin"> 高清 </el-radio>
            <el-radio
              :value="DownloadFormat.jpg"
              v-if="noteStore?.type == 'normal'"
            >
              jpg格式
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="实况" v-if="noteStore?.type == 'normal'">
          <el-checkbox v-model="settingStorageStore.preferLive">
            <div class="flex-center">优先下载实况</div>
          </el-checkbox>
        </el-form-item>
      </el-form>
      <!-- 下载按钮 -->
      <div class="flex-center">
        <el-checkbox
          border
          @change="handleCheckAllChange"
          v-model="checkAll"
          :indeterminate="checkAllIndeterminate"
          style="margin: 0 10px"
        >
          全选({{ state.checkList.length }})
        </el-checkbox>
        <el-button
          type="primary"
          @click="downLoad()"
          :disabled="state.checkList.length == 0"
        >
          浏览器下载
        </el-button>
        <el-button
          color="#3f85ff"
          @click="downLoad(true)"
          :disabled="state.checkList.length == 0"
        >
          aria2下载
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckboxValueType } from 'element-plus'
import { useNoteStore } from '@/store/note'
import { useSettingStorageStore } from '@/store/storage/setting'
import { formatTime, getRandomItemFromArray } from '@/utils'
import {
  downloadLargeFile,
  getFileExtensionFromPartialContent,
} from '@/utils/download'
import { getFileNameByNamingRule, getRedId } from '@/utils/fileName'
import { DownloadFormat, ImageList } from '@/types'

import {
  fileKeyReg,
  imageRequestBaseUrl,
  jpgQueryParams,
  videoRequestBaseUrl,
} from '@/constant'
import { reqAria2Download } from '@/api/jsonrpc'

// 数据
const settingStorageStore = useSettingStorageStore()
const noteStore = useNoteStore()
const state = reactive<{
  title: string
  checkList: number[]
}>({
  checkList: [],
  title: '',
})
/* ========== 列表 ========== */
// 全选
const checkAll = computed(() => {
  if (noteStore.note_id) {
    return state.checkList.length == noteStore.image_list.length
  }
})
// 选择部分
const checkAllIndeterminate = computed(() => {
  const listLength = noteStore.image_list.length || 0
  return state.checkList.length < listLength && state.checkList.length > 0
})

// 处理全选
function handleCheckAllChange(val: CheckboxValueType) {
  if (noteStore.note_id) {
    if (val) {
      state.checkList = noteStore?.image_list.map((item: any, index: any) => {
        return index
      })
    } else {
      state.checkList = []
    }
  }
}
// 获取下载列表
function getDonwloadItemList() {
  const list = noteStore?.image_list.filter((_: any, index: number) => {
    return state.checkList.includes(index)
  })
  return list
}

/* ========== 初始化数据 ========== */
async function initState() {
  state.title =
    noteStore?.title?.slice(0, 80) || noteStore?.desc?.slice(0, 80) || ''
  handleCheckAllChange(true)
}
onMounted(() => {
  initState()
})
/* ========== 底部 ========== */
// 处理下载格式变化
function handleDownloadFormatChnage(e: any) {
  // 修改类型
  settingStorageStore.DownloadFormatObj[noteStore?.type!] = e
  // 重置进度
  noteStore?.image_list.forEach((item: { progress: string }) => {
    item.progress = '0%'
  })
}
// 生成要下载的文件列表
async function getDownloadUrlList() {
  /*
  下载
  1. 获取文件名
  2. 获取文件后缀
  3. 获取下载地址
  */
  const list = getDonwloadItemList()
  if (!list?.length) return []
  const { useNameAsDir, useTitleAsDir } = settingStorageStore
  const resList = []
  const notePublishTime = formatTime(
    noteStore.time,
    settingStorageStore.timeFormatRule
  )
  let redId = await getRedId()

  for (let index = 0; index < list.length; index++) {
    const item = list[index]
    let url = getDownloadUrl(item)!
    let sub = '' // 后缀
    let dir = '' // 目录
    let name = '' // 文件名
    /* 路径处理 */
    if (useNameAsDir && noteStore.user.nickname) {
      dir += noteStore?.user.nickname + '/'
    }
    if (useTitleAsDir && state.title) {
      dir += state.title + '/'
    }
    /* 文件类型推断 */
    try {
      sub = await getFileExtensionFromPartialContent(url)
    } catch (error) {
      console.log('文件名推断出错了')
      try {
        // 处理下特殊情况
        // url =
        //   'https://sns-img-hw.xhscdn.net/1040g3k831bjb4qqqgc705n2dbekk2fjdbvnitio?imageView2/2/w/format/jpg'
        console.log('再次推断')
        const urlArr = url.split('/')
        urlArr[2] += '/notes_pre_post'
        url = urlArr.join('\/')
        sub = await getFileExtensionFromPartialContent(url)
      } catch (error) {
        console.log('推断再次出错')
      }
    }
    /* 最终的文件名 */
    name =
      getFileNameByNamingRule(
        {
          index: index + 1,
          title: state.title,
          ipLocation: noteStore.ip_location,
          nickname: noteStore.user.nickname,
          noteId: noteStore.note_id,
          publishTime: notePublishTime,
          userId: noteStore.user.user_id,
          redId,
        },
        settingStorageStore.nameRule,
        list.length <= 1
      ) + sub
    resList.push({
      name,
      url,
      dir,
      file: item,
    })
  }

  return resList
}

// 获取单个文件的下载路径
function getDownloadUrl(file: ImageList) {
  if (!noteStore.note_id) return

  const noteType = noteStore.type // 笔记类型
  const downloadFormat = settingStorageStore.DownloadFormatObj[noteType] // 下载类型
  const preferLive = settingStorageStore.preferLive // live偏好
  let url = ''
  let data = null // 下载地址数据
  if (noteType == 'normal') {
    const url = file.url_default
    const key = url.match(fileKeyReg)![0]
    data = {
      url,
      originUrl: getRandomItemFromArray(imageRequestBaseUrl) + key,
      liveUrl: file?.live_photo ? file.stream?.h264[0]?.master_url : '',
    }
  } else {
    data = {
      url: noteStore.video?.media?.stream?.h265[0]?.master_url,
      originUrl:
        getRandomItemFromArray(videoRequestBaseUrl) +
        noteStore.video?.consumer?.origin_video_key,
    }
  }
  // 处理下类型
  if (downloadFormat == DownloadFormat.default) {
    url = data.url
  } else if (downloadFormat == DownloadFormat.origin) {
    url = data.originUrl
  } else if (downloadFormat == DownloadFormat.jpg) {
    url = data.originUrl + jpgQueryParams
  }
  if (file.live_photo && preferLive) {
    url = data.liveUrl || data.originUrl
  }
  return url
}

// 下载
async function downLoad(useAria2: boolean = false) {
  const list = await getDownloadUrlList()
  ElMessage.info('开始下载')
  // 开始下载
  if (!useAria2) {
    // 浏览器下载
    list?.forEach((item) => {
      downloadLargeFile(item.url, item.name, (loaded, total) => {
        if (total) {
          item.file.progress = ((loaded / total) * 100).toFixed(2) + '%'
        } else {
          item.file.progress =
            '已下载' + (loaded / 1024 / 1024).toFixed(2) + 'M'
        }
      })
    })
  } else if (useAria2) {
    // aria2下载
    reqAria2Download(list)
  }
}
</script>

<style scoped lang="scss"></style>
