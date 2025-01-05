import { useMainStore } from '@/store/main'
import { useStorageStore } from '@/store/storage'
import { getFileName } from '@/utils'

export function useFileName(state: any) {
  const fileNameExample = ref('')
  const mainStore = useMainStore()
  const storageStore = useStorageStore()
  const fileName = (
    title: string,
    index = 1,
    width = 900,
    height = 1600,
    noSequence = false
  ) => {
    const note = mainStore.note
    const { nameRule, timeFormatRule, timezone } = storageStore.setting
    // 生成文件名
    return getFileName(
      {
        title: title,
        nickname: note?.user.nickname,
        publishTime: note?.time,
        userId: note?.user.user_id,
        noteId: note?.note_id,
        ipLocation: note?.ip_location || '未知',
        index,
        height,
        width,
        nameRule,
        timeFormatRule,
        timezone,
      },
      noSequence
    )
  }
  watch(
    [
      () => state?.title,
      () => storageStore.setting.nameRule,
      () => mainStore.note?.title,
      () => storageStore.setting.timeFormatRule,
    ],
    () => {
      // console.log('获取文件名示例', state)
      fileNameExample.value = fileName(
        state.title || mainStore.note?.title || mainStore.note?.desc.slice(20)
      )
    },
    { immediate: true }
  )
  return {
    fileNameExample,
    getFileName: fileName,
  }
}
