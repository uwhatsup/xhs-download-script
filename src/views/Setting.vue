<template>
  <el-drawer v-model="isOpenSetting" destroy-on-close class="xhs">
    <template #header>
      <div class="xhs-modal-header">
        <div class="title">小红书下载助手 设置</div>
        <div class="flex-center">
          <el-space :size="20">
            <el-button size="small" type="warning" @click="reset">
              重置设置
            </el-button>
          </el-space>
        </div>
      </div>
    </template>
    <el-form>
      <el-divider>
        <div class="title">文件命名设置</div>
      </el-divider>
      <el-form-item label="命名规则" label-width="6rem">
        <el-input v-model="form.nameRule" type="textarea" :rows="6" />
        <div class="example red">示例：{{ fileNameExample || '-' }}</div>
        <div class="example">
          全局变量：{{
            Object.entries(fileNameMap)
              .map(([key, label]) => label)
              .join(',')
          }}
        </div>
      </el-form-item>
      <el-form-item label="时间格式" label-width="6rem">
        <el-input v-model="form.timeFormatRule"></el-input>
        <div class="example red">
          <a
            href="https://dayjs.fenxianglu.cn/category/display.html#%E6%A0%BC%E5%BC%8F%E5%8C%96"
            target="_blank"
          >
            格式参考
          </a>
        </div>
      </el-form-item>
      <el-form-item label="时区" label-width="6rem">
        <el-select v-model="form.timezone">
          <el-option
            v-for="item in timezoneList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-divider>
        <div class="title">远程下载设置</div>
      </el-divider>
      <el-form-item label="请求地址" label-width="6rem">
        <el-input v-model="form.jsonRpcUrl">
          <template #append>
            <el-button @click="test">测试连接</el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="rpc秘钥" label-width="6rem">
        <el-input v-model="form.jsonRpcToken"> </el-input>
      </el-form-item>
      <el-form-item label="下载位置" label-width="6rem">
        <el-input v-model="form.downloadLocation" />
        <div class="example">示例：F:\test</div>
      </el-form-item>
      <el-form-item label="文件分类" label-width="6rem">
        <el-checkbox v-model="form.useNameAsDir">
          <div class="flex-center">按作者昵称分类</div>
        </el-checkbox>
        <el-checkbox v-model="form.useTitleAsDir">
          <div class="flex-center">按笔记标题分类</div>
        </el-checkbox>
      </el-form-item>
      <el-form-item label="远程下载" label-width="6rem">
        <el-switch
          v-model="form.openRpcDownload"
          active-text="开"
          inactive-text="关"
          inline-prompt
          @change="handleOpenRpcDownload"
        />
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script setup lang="ts">
import { useFileName } from '@/hooks'
import { useMainStore } from '@/store/main'
import { useStorageStore } from '@/store/storage'
import { fileNameMap, timezoneList } from '@/utils'

interface EmitsType {
  (e: 'update:modelValue', value: Boolean): void
}
const emit = defineEmits<EmitsType>()
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const isOpenSetting = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
  },
})
const storageStore = useStorageStore()
const mainStore = useMainStore()
const form = reactive({
  nameRule: '',
  timeFormatRule: '',
  timezone: '',
  jsonRpcUrl: '',
  downloadLocation: '',
  jsonRpcToken: '',
  useNameAsDir: true,
  useTitleAsDir: true,
  openRpcDownload: false,
})
function handleOpenRpcDownload(val: any) {
  if (val) {
    test()
  }
}
// 自动保存
watch(
  [() => form],
  ([val]) => {
    storageStore.setSetting({
      ...val,
      jsonRpcUrl: form.jsonRpcUrl.replace('http://', ''),
    })
  },
  { deep: true }
)
// 文件名
const { fileNameExample } = useFileName('')

// 自动赋值
onMounted(() => {
  init()
})
function init() {
  Object.assign(form, JSON.parse(JSON.stringify(storageStore.setting)))
}
// 测试连接
function test() {
  mainStore.testSocket()
}
// 重置
function reset() {
  storageStore.reset()
  init()
}
</script>

<style scoped lang="scss">
.title {
  font-weight: bold;
}
</style>
