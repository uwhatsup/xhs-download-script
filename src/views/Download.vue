<template>
  <el-drawer
    v-model="isOpenDownload"
    :size="size"
    destroy-on-close
    :class="{
      'xhs-download-container': isDragging,
      xhs: true,
      download: true,
    }"
  >
    <template #header>
      <div class="xhs-modal-header">
        <div class="title">小红书下载助手 v{{ GM.info.script.version }}</div>
        <div class="flex-center">
          <el-space :size="20">
            <span class="flex-center">
              显示列数：<el-input-number
                size="small"
                v-model="col"
                :min="1"
                :max="18"
                @change="handleColChange"
                class="col"
              />
            </span>
            <el-button size="small" type="info" @click="emit('settingClick')">
              设置
            </el-button>
          </el-space>
        </div>
      </div>
    </template>
    <template #default>
      <div
        :class="{
          line: true,
          active: isDragging,
        }"
        @mousedown="handleMouseDown"
      ></div>
      <!-- 图片选择列表 -->
      <el-checkbox-group
        v-model="state.checkList"
        v-if="store.note?.image_list.length"
      >
        <div
          class="download-list"
          :style="`grid-template-columns: repeat(${col}, 1fr)`"
        >
          <el-checkbox
            :value="index"
            size="large"
            v-for="(item, index) in store.note?.image_list"
            :key="index"
          >
            <div class="item">
              <img :src="item.url_default" />
              <div class="progress">{{ item.progress || '0%' }}</div>
              <div v-if="item.live_photo" class="tag">实况</div>
              <div v-else-if="store.note.type == 'video'" class="tag">视频</div>
            </div>
          </el-checkbox>
        </div>
      </el-checkbox-group>
      <div v-else>
        <el-empty />
      </div>
    </template>
    <template #footer v-if="store.note">
      <el-form>
        <el-form-item label="标题" label-width="6rem" class="xhs-form-item">
          <el-input v-model="state.title" autocomplete="off"></el-input>
          <div class="example red">
            文件名示例： {{ fileNameExample || '-' }}
          </div>
        </el-form-item>
        <el-form-item label="下载类型" label-width="6rem" class="xhs-form-item">
          <el-radio-group
            :model-value="
              store.note?.type
                ? storageStore.setting.downLoadTypeObj[store.note?.type]
                : downLoadType.default
            "
            @change="handleDownloadTypeChnage"
          >
            <el-radio :value="downLoadType.default">普通</el-radio>
            <el-radio :value="downLoadType.origin"> 高清 </el-radio>
            <el-radio
              :value="downLoadType.jpg"
              v-if="store.note?.type == 'normal'"
              class="xhs-form-item"
            >
              jpg格式
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="实况"
          label-width="6rem"
          v-if="store.note?.type == 'normal'"
          class="xhs-form-item"
        >
          <el-checkbox
            :model-value="storageStore.setting.preferLive"
            @change="storageStore.setPreferLive"
          >
            <div class="flex-center">
              <!-- 如果文件类型为实况，那么优先下载实况视频，否则按照所选的下载类型进行下载 -->
              实况优先
            </div>
          </el-checkbox>
        </el-form-item>
      </el-form>
      <!-- 下载按钮 -->
      <div class="btns">
        <el-button type="default" @click="isOpenDownload = false">
          返回
        </el-button>
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
          v-if="storageStore.setting.openRpcDownload"
          color="#3f85ff"
          @click="downLoad(true)"
          :disabled="state.checkList.length == 0 || !store.isConnected"
        >
          aria2下载
        </el-button>
        <el-button
          type="info"
          v-if="!store.isConnected && storageStore.setting.openRpcDownload"
          @click="store.testSocket"
        >
          重新连接aria2
        </el-button>
        <el-button
          type="warning"
          @click="copyLink"
          :disabled="state.checkList.length == 0"
        >
          复制下载链接
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { GM } from '$'
import { imageServer, jpgParams, keyReg, videoServer } from '@/constant'
import { useFileName } from '@/hooks'
import { useMainStore } from '@/store/main'
import { useStorageStore } from '@/store/storage'
import { downLoadType, ImageList } from '@/types'
import { copyToClipboard, getRandomItemFromArray } from '@/utils'
import {
  downloadLargeFile,
  getFileExtensionFromPartialContent,
} from '@/utils/download'
import { CheckboxValueType } from 'element-plus'
const store = useMainStore()
const storageStore = useStorageStore()
// 是否显示
interface EmitsType {
  (e: 'update:modelValue', value: Boolean): void
  (e: 'loginClick'): void
  (e: 'settingClick'): void
  (e: 'activeClick'): void
}

const emit = defineEmits<EmitsType>()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: '',
  },
})

const isOpenDownload = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
  },
})
// 初始化状态
watch(
  () => isOpenDownload.value,
  (val) => {
    if (val) {
      initState()
    }
  }
)
// 状态
interface Istate {
  title: string
  checkList: number[]
}
const state = reactive<Istate>({
  checkList: [],
  title: '',
})

async function initState() {
  state.title =
    store.note?.title.slice(0, 80) || store.note?.desc.slice(0, 80) || ''
  size.value = storageStore.setting.downloadSize
  col.value = storageStore.setting.col
  handleCheckAllChange(true)
}
const col = ref(4)
const { fileNameExample, getFileName } = useFileName(state)

function handleDownloadTypeChnage(e: any) {
  storageStore.setDownloadType(store.note?.type!, e)
  store.note?.image_list.forEach((item: { progress: string }) => {
    item.progress = '0%'
  })
}
const checkAll = computed(() => {
  if (store.note) {
    return state.checkList.length == store.note.image_list.length
  }
})

const checkAllIndeterminate = computed(() => {
  const listLength = store.note?.image_list.length || 0
  return state.checkList.length < listLength && state.checkList.length > 0
})

// 全选
function handleCheckAllChange(val: CheckboxValueType) {
  if (store.note) {
    if (val) {
      state.checkList = store.note?.image_list.map((item: any, index: any) => {
        return index
      })
    } else {
      state.checkList = []
    }
  }
}

function getDonwloadItemList() {
  const note = store.note
  const list = note?.image_list.filter((_: any, index: number) => {
    return state.checkList.includes(index)
  })
  return list
}
async function getDownloadUrlList(isCopy = false) {
  // 生成要下载的文件列表
  const list = getDonwloadItemList()
  const note = store.note
  // 下载
  // 获取文件名
  // 获取文件后缀
  // 获取下载地址
  const { useNameAsDir, useTitleAsDir } = storageStore.setting
  if (!list?.length) return []
  const resList = []
  for (let index = 0; index < list.length; index++) {
    const item = list[index]
    // 获取后缀
    let sub = ''
    let dir = ''
    let url = getDownloadUrl(item)!
    let name = ''
    let height = item.height
    let width = item.width
    /* 路径拼接 */
    if (useNameAsDir && note?.user.nickname) {
      dir += note?.user.nickname + '/'
    }
    if (useTitleAsDir && state.title) {
      dir += state.title + '/'
    }
    let urlDefault = ''
    if (isCopy) {
      // 添加复制链接的路径
      if (note?.type == 'video') {
        // 视频
        urlDefault = note.video?.media?.stream?.h265[0]?.master_url
      } else if (item.live_photo && storageStore.setting.preferLive) {
        // 实况
        urlDefault = item.stream?.h264[0]?.master_url
      } else {
        // 普通图片
        urlDefault = item.url_default
      }
    } else {
      /* ===文件名推断=== */
      try {
        sub = await getFileExtensionFromPartialContent(url)
        // console.log(sub)
      } catch (error) {
        console.log('文件名推断出错了')
        try {
          // url =
          //   'https://sns-img-hw.xhscdn.net/1040g3k831bjb4qqqgc705n2dbekk2fjdbvnitio?imageView2/2/w/format/jpg'
          console.log('再次推断')
          const urlArr = url.split('/')
          urlArr[2] += '/notes_pre_post'
          url = urlArr.join('\/')
          console.log(url)
          sub = await getFileExtensionFromPartialContent(url)
        } catch (error) {
          console.log('推断再次出错')
        }
      }
      /* ===获取文件名=== */
      if (
        note?.type == 'video' ||
        item.live_photo ||
        storageStore.setting.downLoadTypeObj[store.note?.type!] ==
          downLoadType.default
      ) {
        // 视频
        width = 0
      }
      name =
        getFileName(state.title, index + 1, width, height, list.length <= 1) +
        sub
    }
    resList.push({
      name,
      url,
      dir,
      file: item,
      urlDefault,
    })
  }
  return resList
}

async function downLoad(useAria2: boolean = false) {
  const list = await getDownloadUrlList()
  // 开始下载 浏览器
  if (!useAria2) {
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
  } else if (useAria2 && list?.length) {
    store.download(list)
  }
}

// 获取单个文件的下载路径
function getDownloadUrl(file: ImageList) {
  if (!store.note) return
  const note = store.note
  const setting = storageStore.setting

  const noteType = note.type // 笔记类型
  const downloadType = setting.downLoadTypeObj[noteType] // 下载类型
  const preferLive = setting.preferLive
  let url = ''
  // 处理下数据
  let data = null
  if (noteType == 'normal') {
    const url = file.url_default
    const key = url.match(keyReg)![0]
    data = {
      url,
      originUrl: getRandomItemFromArray(imageServer) + key,
      liveUrl: file?.live_photo ? file.stream?.h264[0]?.master_url : '',
    }
  } else {
    data = {
      url: note.video?.media?.stream?.h265[0]?.master_url,
      originUrl:
        getRandomItemFromArray(videoServer) +
        note.video?.consumer?.origin_video_key,
    }
  }
  // 处理下类型
  if (downloadType == downLoadType.default) {
    url = data.url
  } else if (downloadType == downLoadType.origin) {
    url = data.originUrl
  } else if (downloadType == downLoadType.jpg) {
    url = data.originUrl + '?' + jpgParams
  }
  if (file.live_photo && preferLive) {
    url = data.liveUrl || data.originUrl
  }
  return url
}

// 容器大小
const isDragging = ref(false)
const size = ref('50%')
function handleMouseMove(e: MouseEvent) {
  // 计算鼠标的位置
  const x = (window.screen.availWidth - e.pageX) / window.screen.availWidth
  let w = +(x * 100).toFixed(2)
  if (w <= 50) w = 50
  size.value = w + '%'
}
function handleMouseDown() {
  isDragging.value = true
  document.body.style.cursor = 'w-resize'
  document.body.style.userSelect = 'none'
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', () => {
    isDragging.value = false
    storageStore.setting.downloadSize = size.value
    document.body.style.cursor = 'auto'
    document.body.style.userSelect = 'auto'
    window.removeEventListener('mousemove', handleMouseMove)
  })
}
function handleColChange(val: any) {
  storageStore.setting.col = val
}
async function copyLink() {
  const list = await getDownloadUrlList(true)
  const urlList = list
    ?.map((item) => {
      return item.urlDefault
    })
    .join('\n')
  if (urlList) {
    try {
      await copyToClipboard(urlList)
      ElMessage.success('复制成功')
    } catch (error) {
      console.log('复制失败', error)
      ElMessage.error('复制失败')
    }
  }
}
</script>

<style scoped lang="scss">
.download-list {
  display: grid;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  background-color: #eee;
  :deep(.el-checkbox) {
    position: relative;
    width: 100%;
    height: 100%;
    .el-checkbox__input {
      position: absolute;
      top: 0px;
      left: 0;
    }
    .el-checkbox__label {
      height: 100%;
      padding: 0;
      margin: 0;
    }
  }
  .item {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    .progress,
    .tag {
      position: absolute;
      background-color: rgba(#000, 0.5);
      color: white;
      padding: 5px 10px;
    }
    .tag {
      right: 0;
      bottom: 0;
      border-top-left-radius: 10px;
    }
    .progress {
      top: 0;
      right: 0;
      border-bottom-left-radius: 10px;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}
.btns {
  display: flex;
  justify-content: center;
}
:deep(.el-radio__label) {
  display: flex;
  align-items: center;
}

.line {
  width: 5px;
  background-color: #eee;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  cursor: w-resize;
  &:hover {
    background-color: #aaa;
  }
  &.active {
    background-color: #aaa;
    cursor: w-resize;
  }
}
.xhs-form-item {
  margin-bottom: 0;
}
.col {
  width: 100px;
}
</style>
<style>
.xhs-download-container {
  transition: none !important;
}
.download {
  .el-drawer__body {
    padding: 0 10px;
  }
  .el-drawer__header {
    margin-bottom: 16px;
  }
}
</style>
