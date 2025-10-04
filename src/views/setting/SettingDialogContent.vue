<template>
  <el-form label-width="6rem">
    <el-divider>
      <div class="form-title">文件命名设置</div>
    </el-divider>
    <el-form-item label="命名规则">
      <el-input
        v-model="settingStorageStore.nameRule"
        type="textarea"
        :rows="6"
      />
      <div class="form-example">全局变量：{{ varListStr }}</div>
      <div class="form-example important">示例：{{ exampleName }}</div>
    </el-form-item>
    <el-form-item label="时间格式">
      <el-input v-model="settingStorageStore.timeFormatRule"></el-input>
      <div class="form-example important">
        <a
          href="https://dayjs.fenxianglu.cn/category/display.html#%E6%A0%BC%E5%BC%8F%E5%8C%96"
          target="_blank"
        >
          格式参考
        </a>
      </div>
    </el-form-item>
    <el-divider>
      <div class="title">远程下载设置</div>
    </el-divider>
    <el-form-item label="请求地址">
      <el-input v-model="settingStorageStore.jsonRpcUrl">
        <template #append>
          <el-button @click="testRpcConnection">测试连接</el-button>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item label="rpc秘钥">
      <el-input v-model="settingStorageStore.jsonRpcToken" />
    </el-form-item>
    <el-form-item label="下载位置">
      <el-input v-model="settingStorageStore.downloadLocation" />
      <div class="example">
        示例：F:\xiaohongshu 或 /home/download/xiaohongshu
      </div>
    </el-form-item>
    <el-form-item label="文件分类">
      <el-checkbox v-model="settingStorageStore.useNameAsDir">
        <div class="flex-center">按作者昵称分类</div>
      </el-checkbox>
      <el-checkbox v-model="settingStorageStore.useTitleAsDir">
        <div class="flex-center">按笔记标题分类</div>
      </el-checkbox>
    </el-form-item>
    <el-form-item>
      <el-button type="warning" @click="reset"> 重置设置 </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import {
  getFileNameByNamingRule,
  getRedId,
  globalFileNameVarMap,
} from '@/utils/fileName'
import { reqAria2Version } from '@/api/jsonrpc'
import { useNoteStore } from '@/store/note'
import { useSettingStorageStore } from '@/store/storage/setting'
import { formatTime } from '@/utils'

// 全局变量列表
const varListStr = computed(() => {
  return Object.entries(globalFileNameVarMap)
    .map(([key, label]) => key)
    .join(',')
})
// 设置
const settingStorageStore = useSettingStorageStore()

// 重置设置
function reset() {
  settingStorageStore.reset()
}

// 测试连接
function testRpcConnection() {
  ElMessage.info('请求已发送')
  reqAria2Version()
}
const noteStore = useNoteStore()
// 文件名示例
const exampleName = ref('')
watch(
  [
    () => settingStorageStore.nameRule,
    () => settingStorageStore.timeFormatRule,
  ],
  async () => {
    console.log('执行了')
    exampleName.value = getFileNameByNamingRule(
      {
        index: 1,
        title: noteStore.title,
        ipLocation: noteStore.ip_location,
        nickname: noteStore.user.nickname,
        noteId: noteStore.note_id,
        publishTime: formatTime(
          noteStore.time,
          settingStorageStore.timeFormatRule
        ),
        userId: noteStore.user.user_id,
        redId: await getRedId(),
      },
      settingStorageStore.nameRule
    )
  },
  { immediate: true }
)
</script>

<style scoped lang="scss"></style>
